// Un lucchetto fra processi, tenuto dal database.
//
// Serve perche' la sincronizzazione del catalogo si lancia anche a mano,
// mentre la cron la lancia a mezzanotte, e le due corse non sono
// sovrapponibili: la tabella di scorta ha un nome fisso e la prima cosa che
// ciascuna fa e' buttarla giu'. Due corse insieme vuol dire che una svuota la
// tabella che l'altra sta riempiendo, oppure che il suo scambio finale non
// trova piu' niente da scambiare, e l'esito e' un catalogo mescolato.
//
// `GET_LOCK` e non una riga in una tabella: non chiede una migrazione, e
// soprattutto si rilascia da se' se il processo muore. Un lucchetto scritto in
// una riga, dopo un processo ucciso, resta chiuso e bisogna aprirlo a mano.
//
// Due trappole, che sono il motivo per cui questo sta in un file suo:
//
// 1. `GET_LOCK` appartiene alla **connessione**, non al database. Passando
//    dalla riserva ogni query puo' prendere una connessione diversa, e il
//    lucchetto resterebbe appeso a una qualunque, da nessuno sorvegliata.
//    Quindi qui una connessione si prende e si tiene ferma per tutta la
//    durata del lavoro.
//
// 2. Una connessione ferma e muta viene chiusa dal server dopo il suo
//    `wait_timeout`, e chiudendosi **rilascia il lucchetto**. La fase delle
//    immagini dura molto piu' di qualunque wait_timeout ragionevole, percio'
//    la connessione del lucchetto viene toccata ogni minuto. Senza quel
//    battito il lucchetto si aprirebbe da solo a meta' del lavoro, che e'
//    peggio del non averlo: si crederebbe protetti.

const BATTITO_MS = 60000;

class LucchettoOccupato extends Error {
  constructor(nome) {
    super(`lucchetto "${nome}" occupato: un'altra corsa e' in corso`);
    this.name = "LucchettoOccupato";
    this.nome = nome;
  }
}

const prendiConnessione = (pool) =>
  new Promise((risolvi, rifiuta) =>
    pool.getConnection((errore, connessione) => (errore ? rifiuta(errore) : risolvi(connessione)))
  );

const interroga = (connessione, sql, parametri) =>
  new Promise((risolvi, rifiuta) =>
    connessione.query(sql, parametri, (errore, righe) => (errore ? rifiuta(errore) : risolvi(righe)))
  );

/// Esegue `lavoro` con il lucchetto `nome` in mano, e lo rilascia comunque.
///
/// Solleva `LucchettoOccupato` se il lucchetto e' di qualcun altro: chi chiama
/// decide se e' un guasto o un semplice "ripasso domani". `attesaSecondi` a
/// zero vuol dire che non si fa la coda -- due sincronizzazioni in fila non
/// servono a niente, la seconda rifarebbe il lavoro appena fatto.
const conLucchetto = async (nome, lavoro, opzioni = {}) => {
  const pool = opzioni.pool || global.connection;
  const attesaSecondi = Number.isFinite(opzioni.attesaSecondi) ? opzioni.attesaSecondi : 0;

  if (!pool || typeof pool.getConnection !== "function") {
    throw new Error("lucchetto: serve una riserva di connessioni");
  }

  const connessione = await prendiConnessione(pool);
  let preso = false;

  try {
    const righe = await interroga(connessione, "SELECT GET_LOCK(?, ?) AS preso", [nome, attesaSecondi]);
    // `GET_LOCK` da' 1 se l'ha dato, 0 se e' scaduta l'attesa, NULL in caso di
    // errore. Tutto cio' che non e' 1 vuol dire "non ce l'hai".
    preso = righe && righe[0] && Number(righe[0].preso) === 1;
    if (!preso) throw new LucchettoOccupato(nome);

    const battito = setInterval(() => {
      interroga(connessione, "SELECT 1").catch(() => {});
    }, BATTITO_MS);
    // Il battito non deve essere lui a tenere vivo il processo: senza questo,
    // un comando che ha finito resterebbe in attesa del prossimo minuto.
    if (typeof battito.unref === "function") battito.unref();

    try {
      return await lavoro();
    } finally {
      clearInterval(battito);
    }
  } finally {
    if (preso) {
      await interroga(connessione, "SELECT RELEASE_LOCK(?) AS liberato", [nome]).catch(() => {});
    }
    connessione.release();
  }
};

module.exports = { conLucchetto, LucchettoOccupato, BATTITO_MS };
