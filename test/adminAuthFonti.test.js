const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const {
  generaToken,
  verificaToken,
  FONTI,
  RUOLI,
  ALGORITMO,
  DESTINATARIO,
  RUOLO,
} = require("../src/admin/adminAuth");

const CONFIGURAZIONE = {
  utente: "marco",
  segreto: "un-segreto-del-pannello-lungo-abbastanza-per-passare",
  ttlSessione: "30m",
};

// Un token confezionato a mano, per provare le combinazioni che `generaToken`
// non produce: sono quelle che contano, perche' arrivano da chi le costruisce
// apposta.
const aMano = (carico, soggetto) =>
  jwt.sign(carico, CONFIGURAZIONE.segreto, {
    algorithm: ALGORITMO,
    audience: DESTINATARIO,
    subject: soggetto,
    expiresIn: "5m",
    jwtid: "prova-" + Math.random().toString(36).slice(2),
  });

test("the administrator from the environment is an owner by default", () => {
  const token = generaToken(CONFIGURAZIONE, "marco");
  const dati = verificaToken(CONFIGURAZIONE, token);

  assert.equal(dati.sub, "marco");
  assert.equal(dati.fonte, FONTI.AMBIENTE);
  assert.equal(dati.ruolo, RUOLI.PROPRIETARIO);
});

test("a token from the table keeps its name and its role", () => {
  const token = generaToken(CONFIGURAZIONE, "silvia", {
    fonte: FONTI.TABELLA,
    ruolo: RUOLI.OPERATORE,
    passwordCambiataIl: 1762000000,
  });

  const dati = verificaToken(CONFIGURAZIONE, token);

  assert.equal(dati.sub, "silvia");
  assert.equal(dati.fonte, FONTI.TABELLA);
  assert.equal(dati.ruolo, RUOLI.OPERATORE);
  // E' l'istante che il cancello confronta con quello letto dal database:
  // cambiare la password chiude le sessioni aperte con la precedente.
  assert.equal(dati.pwd, 1762000000);
});

test("a name from the environment must still match the environment", () => {
  // Cambiare `ADMIN_USERNAME` deve far cadere le sessioni aperte con quello
  // di prima, non alla scadenza del token.
  const token = generaToken(CONFIGURAZIONE, "marco");

  assert.equal(verificaToken({ ...CONFIGURAZIONE, utente: "un-altro" }, token), null);
});

test("a token from the table cannot carry the name of the one in .env", () => {
  // `utenti.crea` rifiuta quel nome, quindi un token che lo porta con fonte
  // tabella non e' nato da un accesso.
  const token = aMano(
    { role: RUOLO, fonte: FONTI.TABELLA, ruolo: RUOLI.PROPRIETARIO },
    "marco"
  );

  assert.equal(verificaToken(CONFIGURAZIONE, token), null);
});

test("a source or a role that is not one of ours is refused", () => {
  for (const carico of [
    { role: RUOLO, fonte: "altrove", ruolo: RUOLI.PROPRIETARIO },
    { role: RUOLO, fonte: FONTI.TABELLA, ruolo: "amministratore" },
    { role: RUOLO, fonte: FONTI.TABELLA, ruolo: "" },
    { role: RUOLO, fonte: 7, ruolo: RUOLI.OPERATORE },
  ]) {
    assert.equal(
      verificaToken(CONFIGURAZIONE, aMano(carico, "silvia")),
      null,
      JSON.stringify(carico)
    );
  }
});

test("a token without a source is read as the one from the environment", () => {
  // E' la forma che il pannello firmava prima della tabella: deve valere
  // ancora, e valere con le regole dell'ambiente, cioe' col nome che combacia.
  assert.equal(verificaToken(CONFIGURAZIONE, aMano({ role: RUOLO }, "marco")).fonte, FONTI.AMBIENTE);
  assert.equal(verificaToken(CONFIGURAZIONE, aMano({ role: RUOLO }, "silvia")), null);
});

test("an empty subject is nobody", () => {
  assert.equal(verificaToken(CONFIGURAZIONE, aMano({ role: RUOLO, fonte: FONTI.TABELLA }, "")), null);
});

test("the role in the token is not a way in on its own", () => {
  // Il ruolo dichiarato apre al massimo le rotte di gestione; chi e' entrato
  // lo dice `role: "admin"`, che resta obbligatorio.
  const token = aMano({ role: "superuser", fonte: FONTI.TABELLA, ruolo: RUOLI.PROPRIETARIO }, "silvia");

  assert.equal(verificaToken(CONFIGURAZIONE, token), null);
});
