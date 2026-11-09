const http = require("http");
const https = require("https");

// La sonda: la consolle di prova che manda una richiesta vera all'API.
//
// Tre regole la tengono dentro i suoi confini, e sono tre regole separate
// perche' ognuna copre cio' che le altre non coprono.
//
// 1. La destinazione non si scrive. Si manda sempre a `127.0.0.1` sulla porta
//    da cui e' arrivata la richiesta dell'amministratore: la consolle prova
//    *questo* server e non puo' essere usata per fare una richiesta a un
//    indirizzo qualunque che il server riesca a raggiungere. Chi la usa
//    sceglie il percorso, mai l'ospite.
//
// 2. I metodi che modificano dati vogliono una conferma battuta a mano, e
//    `DELETE` vuole in piu' che `ADMIN_PROBE_DESTRUCTIVE` sia acceso. Due
//    interruttori indipendenti: uno sta nell'ambiente del server e lo si
//    cambia con un riavvio, l'altro si batte ogni volta.
//
// 3. `/admin` non si prova da dentro `/admin`. Non servirebbe a niente e
//    farebbe girare il pannello su se stesso.
const METODI_AMMESSI = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"];
const METODI_CHE_SCRIVONO = ["POST", "PUT", "PATCH", "DELETE"];
const METODI_DISTRUTTIVI = ["DELETE"];

// Le intestazioni che la pagina puo' mandare. `host` no: cambierebbe la
// destinazione per vie traverse. `content-length`, `connection` e
// `transfer-encoding` no: le calcola node, e una copia sbagliata rompe la
// richiesta in modi che sembrano un guasto del server.
const INTESTAZIONI_AMMESSE = [
  "authorization",
  "content-type",
  "accept",
  "accept-language",
  "user-agent",
];

const MASSIMO_INTESTAZIONI = 20;
const MASSIMO_VALORE_INTESTAZIONE = 1024;
const MASSIMO_PERCORSO = 2000;
const MASSIMO_CORPO = 64 * 1024;
const MASSIMO_RISPOSTA = 256 * 1024;
const ATTESA_MS = 10000;

const rifiuto = (motivo) => ({ ok: false, motivo });

const intestazioneAmmessa = (nome) =>
  INTESTAZIONI_AMMESSE.includes(nome) || nome.startsWith("x-");

// Il percorso: deve essere un percorso di questo server e nient'altro. Si
// controlla la forma prima di costruire l'URL, perche' `new URL` accetta
// volentieri cose che non sono percorsi.
const percorsoValido = (grezzo) => {
  if (typeof grezzo !== "string" || grezzo === "") {
    return rifiuto("percorso assente");
  }
  if (grezzo.length > MASSIMO_PERCORSO) {
    return rifiuto("percorso troppo lungo");
  }
  if (!grezzo.startsWith("/")) {
    return rifiuto("il percorso deve cominciare con /");
  }
  // `//ospite/percorso` e' un indirizzo senza protocollo: sembra un percorso
  // e non lo e'.
  if (grezzo.startsWith("//")) {
    return rifiuto("il percorso non puo' cominciare con //");
  }
  if (grezzo.includes("://") || grezzo.includes("\\")) {
    return rifiuto("il percorso non puo' contenere un indirizzo");
  }
  if (/[\r\n\0]/.test(grezzo)) {
    return rifiuto("il percorso contiene caratteri non ammessi");
  }
  if (grezzo.includes("{") || grezzo.includes("}")) {
    return rifiuto("i segnaposti fra graffe vanno sostituiti con un valore");
  }

  let url;
  try {
    url = new URL(grezzo, "http://127.0.0.1");
  } catch (e) {
    return rifiuto("percorso non interpretabile");
  }

  const percorso = url.pathname + url.search;

  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    return rifiuto("la consolle non prova le rotte del pannello");
  }

  return { ok: true, percorso };
};

// Tutta la validazione in una funzione pura: si puo' provare senza aprire una
// presa di rete, ed e' la stessa che la rotta usa per rispondere 400.
const valida = (richiesta = {}, opzioni = {}) => {
  const metodo = String(richiesta.metodo || "GET").toUpperCase();

  if (!METODI_AMMESSI.includes(metodo)) {
    return rifiuto(`metodo non ammesso: ${metodo}`);
  }

  const percorso = percorsoValido(richiesta.percorso);
  if (!percorso.ok) return percorso;

  const scrive = METODI_CHE_SCRIVONO.includes(metodo);
  const distruttivo = METODI_DISTRUTTIVI.includes(metodo);

  if (distruttivo && !opzioni.distruttivoAmmesso) {
    return rifiuto(
      "i metodi distruttivi sono spenti: ADMIN_PROBE_DESTRUCTIVE=true e un riavvio"
    );
  }

  // La conferma e' il metodo stesso, battuto per intero. Non e' una formalita':
  // obbliga a leggere che cosa si sta mandando prima di mandarlo, mentre un
  // bottone "sei sicuro?" si clicca senza guardare.
  if (scrive && String(richiesta.conferma || "") !== metodo) {
    return rifiuto(`per ${metodo} serve la conferma: battere ${metodo}`);
  }

  const intestazioni = {};
  const grezze = richiesta.intestazioni || {};
  if (typeof grezze !== "object" || Array.isArray(grezze)) {
    return rifiuto("le intestazioni devono essere un oggetto");
  }
  const nomi = Object.keys(grezze);
  if (nomi.length > MASSIMO_INTESTAZIONI) {
    return rifiuto("troppe intestazioni");
  }
  for (const nome of nomi) {
    const chiave = String(nome).toLowerCase().trim();
    if (!/^[a-z0-9-]+$/.test(chiave)) {
      return rifiuto(`nome di intestazione non ammesso: ${nome}`);
    }
    if (!intestazioneAmmessa(chiave)) {
      return rifiuto(`intestazione non ammessa: ${chiave}`);
    }
    const valore = String(grezze[nome] === undefined ? "" : grezze[nome]);
    if (valore.length > MASSIMO_VALORE_INTESTAZIONE) {
      return rifiuto(`valore troppo lungo per ${chiave}`);
    }
    if (/[\r\n]/.test(valore)) {
      return rifiuto(`valore non ammesso per ${chiave}`);
    }
    intestazioni[chiave] = valore;
  }

  let corpo = null;
  if (richiesta.corpo !== undefined && richiesta.corpo !== null && richiesta.corpo !== "") {
    if (metodo === "GET" || metodo === "HEAD") {
      return rifiuto(`${metodo} non porta un corpo`);
    }
    corpo = typeof richiesta.corpo === "string"
      ? richiesta.corpo
      : JSON.stringify(richiesta.corpo);
    if (corpo.length > MASSIMO_CORPO) {
      return rifiuto("corpo troppo grande");
    }
    if (!intestazioni["content-type"]) {
      intestazioni["content-type"] = "application/json";
    }
  }

  return {
    ok: true,
    richiesta: { metodo, percorso: percorso.percorso, intestazioni, corpo, scrive, distruttivo },
  };
};

// L'esecuzione. La destinazione la decide questa funzione, non chi chiama la
// rotta: `porta` e `protocollo` arrivano dalla presa su cui e' entrata la
// richiesta dell'amministratore.
const esegui = (preparata, destinazione = {}) =>
  new Promise((risolvi) => {
    const sicuro = destinazione.protocollo === "https";
    const modulo = sicuro ? https : http;
    const porta = Number(destinazione.porta) || (sicuro ? 443 : 80);
    const avvio = process.hrtime.bigint();

    const opzioni = {
      host: "127.0.0.1",
      port: porta,
      method: preparata.metodo,
      path: preparata.percorso,
      headers: {
        ...preparata.intestazioni,
        // Lascia una firma nel registro: la riga di `API_REQUEST` che nascera'
        // da questa chiamata e' indistinguibile da una vera, e distinguerle
        // conta quando si guarda il registro dopo aver provato qualcosa.
        "x-admin-probe": "1",
        host: `127.0.0.1:${porta}`,
      },
      // Si parla con noi stessi su un indirizzo di anello: il certificato e'
      // emesso per il nome pubblico del server e qui non combacerebbe mai.
      // Verificarlo non aggiungerebbe niente, perche' l'altro capo e' questo
      // stesso processo.
      rejectUnauthorized: false,
    };

    if (preparata.corpo !== null) {
      opzioni.headers["content-length"] = Buffer.byteLength(preparata.corpo);
    }

    const chiamata = modulo.request(opzioni, (risposta) => {
      const pezzi = [];
      let quanti = 0;
      let troncata = false;

      risposta.on("data", (pezzo) => {
        quanti += pezzo.length;
        if (quanti <= MASSIMO_RISPOSTA) {
          pezzi.push(pezzo);
        } else if (!troncata) {
          troncata = true;
          // Non si chiude la connessione: il server sta ancora servendo la
          // richiesta, e tagliargliela sotto genererebbe un errore suo che
          // non ha niente a che vedere con cio' che si stava provando.
        }
      });

      risposta.on("end", () => {
        risolvi({
          ok: true,
          stato: risposta.statusCode,
          messaggioStato: risposta.statusMessage || null,
          intestazioni: risposta.headers,
          corpo: Buffer.concat(pezzi).toString("utf8"),
          byte: quanti,
          troncata,
          durataMs: Math.round(Number(process.hrtime.bigint() - avvio) / 1e4) / 100,
        });
      });
    });

    chiamata.setTimeout(ATTESA_MS, () => {
      chiamata.destroy(new Error(`nessuna risposta entro ${ATTESA_MS} ms`));
    });

    chiamata.on("error", (errore) => {
      risolvi({
        ok: false,
        motivo: errore && errore.message ? errore.message : String(errore),
        durataMs: Math.round(Number(process.hrtime.bigint() - avvio) / 1e4) / 100,
      });
    });

    if (preparata.corpo !== null) chiamata.write(preparata.corpo);
    chiamata.end();
  });

module.exports = {
  valida,
  esegui,
  percorsoValido,
  METODI_AMMESSI,
  METODI_CHE_SCRIVONO,
  METODI_DISTRUTTIVI,
  INTESTAZIONI_AMMESSE,
  MASSIMO_CORPO,
  MASSIMO_RISPOSTA,
  ATTESA_MS,
};
