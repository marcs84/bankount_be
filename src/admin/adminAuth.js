const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { verificaPassword } = require("./password");
const { revocato } = require("./revoche");

// Autenticazione del pannello, tenuta separata da quella dei dispositivi.
//
// Il server ha gia' un'autenticazione a token (`src/auth.js`), e la tentazione
// sarebbe riusarla. Non si puo': `authenticateToken` accetta *qualunque* token
// firmato con `JWT_SECRET`, senza guardare chi sia. Con lo stesso segreto un
// token del pannello passerebbe per un dispositivo - e potrebbe chiamare le
// rotte dell'applicazione a nome di nessuno - mentre un token di dispositivo
// aprirebbe il pannello.
//
// La separazione sta su tre cose, e ognuna basterebbe da sola:
//
//   1. un segreto diverso (`ADMIN_JWT_SECRET`), che `adminConfig` rifiuta di
//      accettare se uguale a `JWT_SECRET`;
//   2. un destinatario dichiarato e verificato (`aud`), cosi' la separazione
//      tiene anche se un giorno i due segreti finissero per coincidere;
//   3. un ruolo dichiarato e verificato (`role`).
const ALGORITMO = "HS256";
const DESTINATARIO = "bankount-admin";
const RUOLO = "admin";

// Da dove viene l'amministratore. Non e' un'etichetta descrittiva: decide
// come si verifica il token.
//
//   ambiente - e' quello scritto in `.env`. Il nome deve combaciare con la
//              configurazione, e nient'altro va controllato: e' la via
//              d'ingresso che deve funzionare anche quando il database non
//              risponde.
//   tabella  - e' una riga di `admin_users`. Il nome non deve combaciare con
//              niente qui, perche' chi lo controlla e' `utenti.stato`, che
//              guarda anche se quell'accesso e' ancora abilitato.
const FONTI = { AMBIENTE: "ambiente", TABELLA: "tabella" };

// I due ruoli. `proprietario` gestisce gli accessi, `operatore` guarda il
// pannello e cambia la propria password. Quello dell'ambiente e' sempre
// proprietario, e nessuno puo' togliergli il ruolo perche' non ha una riga da
// modificare.
const RUOLI = { PROPRIETARIO: "proprietario", OPERATORE: "operatore" };

// Confronto a tempo costante fra stringhe di lunghezza qualunque. Si passa per
// l'impronta perche' `timingSafeEqual` pretende lunghezze uguali, e la
// lunghezza del nome utente non e' un segreto che valga la pena di proteggere
// con un ramo in piu'.
const ugualiATempoCostante = (a, b) => {
  const da = crypto.createHash("sha256").update(String(a)).digest();
  const db = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(da, db);
};

// Verifica nome e password insieme.
//
// La password viene verificata **sempre**, anche quando il nome utente e'
// sbagliato. Uscire prima farebbe rispondere molto piu' in fretta al nome
// sbagliato che a quello giusto - `scrypt` costa qualche decina di
// millisecondi - e quella differenza dice a chi prova che il nome esiste.
// Il nome deve essere una stringa, non qualcosa che diventa quella stringa:
// `String()` chiama `toString`, e un oggetto che lo definisce passerebbe il
// confronto senza essere il nome giusto. Dal corpo di una richiesta JSON
// arriva quello che il chiamante ha scritto, non quello che ci si aspetta.
const verificaCredenziali = async (configurazione, utente, password) => {
  const passwordGiusta = await verificaPassword(password, configurazione.impronta);
  const utenteGiusto =
    typeof utente === "string" &&
    ugualiATempoCostante(utente, configurazione.utente);

  return passwordGiusta && utenteGiusto;
};

// Ogni token porta un identificativo proprio (`jti`), che e' cio' che rende
// possibile ritirarlo: vedi `revoche.js`.
//
// Porta anche la fonte, il ruolo e - per gli amministratori della tabella -
// l'istante in cui la loro password e' stata cambiata l'ultima volta. Il
// cancello confronta quell'istante con quello che legge dal database: cambiare
// la password chiude le sessioni aperte con la precedente, invece di
// lasciarle valide fino alla scadenza.
const generaToken = (configurazione, utente, dettagli = {}) => {
  const carico = {
    role: RUOLO,
    fonte: dettagli.fonte || FONTI.AMBIENTE,
    ruolo: dettagli.ruolo || RUOLI.PROPRIETARIO,
  };

  if (typeof dettagli.passwordCambiataIl === "number") {
    carico.pwd = dettagli.passwordCambiataIl;
  }

  return jwt.sign(carico, configurazione.segreto, {
    algorithm: ALGORITMO,
    audience: DESTINATARIO,
    subject: String(utente),
    expiresIn: configurazione.ttlSessione,
    jwtid: crypto.randomUUID(),
  });
};

// Restituisce il contenuto del token, oppure null. Non solleva e non
// distingue i motivi: a chi chiama serve sapere se puo' entrare, e a chi prova
// non serve sapere perche' non e' entrato.
const verificaToken = (configurazione, token) => {
  if (typeof token !== "string" || token === "") return null;

  let dati;
  try {
    dati = jwt.verify(token, configurazione.segreto, {
      algorithms: [ALGORITMO],
      audience: DESTINATARIO,
    });
  } catch (e) {
    return null;
  }

  if (!dati || dati.role !== RUOLO) return null;
  if (typeof dati.sub !== "string" || dati.sub === "") return null;

  // Una fonte o un ruolo che non si riconoscono non si interpretano: un token
  // nato da un accesso li porta sempre, e li porta fra questi.
  //
  // Il ripiego vale solo per la claim **assente**, che e' la forma che il
  // pannello firmava prima della tabella. Con un `||` un ruolo presente e
  // vuoto sarebbe diventato proprietario, cioe' il valore piu' alto per il
  // valore meno significativo.
  const fonte = dati.fonte === undefined ? FONTI.AMBIENTE : dati.fonte;
  const ruolo = dati.ruolo === undefined ? RUOLI.PROPRIETARIO : dati.ruolo;
  if (fonte !== FONTI.AMBIENTE && fonte !== FONTI.TABELLA) return null;
  if (ruolo !== RUOLI.PROPRIETARIO && ruolo !== RUOLI.OPERATORE) return null;

  if (fonte === FONTI.AMBIENTE) {
    // Se il nome dell'amministratore cambia in `.env`, le sessioni aperte con
    // quello di prima cadono: cambiare le credenziali deve avere effetto
    // subito, non alla scadenza del token.
    if (!ugualiATempoCostante(dati.sub, configurazione.utente)) return null;
  } else {
    // Un amministratore della tabella non puo' portare il nome di quello
    // dell'ambiente - `utenti.crea` lo rifiuta - quindi un token che lo porta
    // non e' nato da un accesso.
    if (ugualiATempoCostante(dati.sub, configurazione.utente)) return null;
  }

  // Una sessione chiusa con "esci" non vale piu', anche se il token non e'
  // ancora scaduto.
  if (revocato(dati.jti)) return null;

  return { ...dati, fonte, ruolo };
};

const soloBearer = (intestazione) => {
  if (typeof intestazione !== "string") return null;
  const atteso = "Bearer ";
  if (!intestazione.startsWith(atteso)) return null;
  const token = intestazione.slice(atteso.length).trim();
  return token === "" ? null : token;
};

module.exports = {
  verificaCredenziali,
  generaToken,
  verificaToken,
  soloBearer,
  ugualiATempoCostante,
  ALGORITMO,
  DESTINATARIO,
  RUOLO,
  FONTI,
  RUOLI,
};
