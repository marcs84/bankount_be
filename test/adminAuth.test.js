const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const auth = require("../src/auth");
const { generaImpronta } = require("../src/admin/password");
const {
  verificaCredenziali,
  generaToken,
  verificaToken,
  soloBearer,
  DESTINATARIO,
} = require("../src/admin/adminAuth");
const revoche = require("../src/admin/revoche");

const SEGRETO_PANNELLO = "segreto-del-pannello-lungo-almeno-trentadue";
const SEGRETO_DISPOSITIVI = "segreto-dei-dispositivi-del-tutto-diverso";

const configurazione = async (modifiche = {}) => ({
  attivo: true,
  utente: "marco",
  impronta: await generaImpronta("password-di-prova-123"),
  segreto: SEGRETO_PANNELLO,
  ttlSessione: "30m",
  distruttivoAmmesso: false,
  ...modifiche,
});

test.beforeEach(() => revoche.svuota());

// --------------------------------------------------------------------------
// credenziali
// --------------------------------------------------------------------------

test("lets the right pair through", async () => {
  const c = await configurazione();

  assert.equal(await verificaCredenziali(c, "marco", "password-di-prova-123"), true);
});

test("refuses a wrong name even with the right password", async () => {
  const c = await configurazione();

  assert.equal(await verificaCredenziali(c, "qualcunaltro", "password-di-prova-123"), false);
});

test("refuses a wrong password even with the right name", async () => {
  const c = await configurazione();

  assert.equal(await verificaCredenziali(c, "marco", "sbagliata"), false);
});

test("refuses a missing name or password without blowing up", async () => {
  const c = await configurazione();

  assert.equal(await verificaCredenziali(c, undefined, undefined), false);
  assert.equal(await verificaCredenziali(c, null, null), false);
  assert.equal(await verificaCredenziali(c, "", ""), false);
  assert.equal(await verificaCredenziali(c, { toString: () => "marco" }, "password-di-prova-123"), false);
});

test("spends the same work on a wrong name as on the right one", async () => {
  // Uscire prima sul nome sbagliato farebbe rispondere molto piu' in fretta,
  // e quella differenza direbbe a chi prova che il nome esiste. Qui si misura
  // solo che la derivazione venga fatta in entrambi i casi: il margine e'
  // larghissimo perche' la prova non deve diventare capricciosa.
  const c = await configurazione();

  const cronometra = async (utente) => {
    const avvio = process.hrtime.bigint();
    await verificaCredenziali(c, utente, "password-di-prova-123");
    return Number(process.hrtime.bigint() - avvio) / 1e6;
  };

  const giusto = await cronometra("marco");
  const sbagliato = await cronometra("ignoto");

  assert.ok(
    sbagliato > giusto / 4,
    `il nome sbagliato ha risposto troppo in fretta: ${sbagliato.toFixed(1)}ms contro ${giusto.toFixed(1)}ms`
  );
});

// --------------------------------------------------------------------------
// token: la separazione dalle due autenticazioni
// --------------------------------------------------------------------------

test("accepts its own token", async () => {
  const c = await configurazione();
  const dati = verificaToken(c, generaToken(c, "marco"));

  assert.ok(dati);
  assert.equal(dati.sub, "marco");
  assert.equal(dati.role, "admin");
  assert.equal(dati.aud, DESTINATARIO);
  assert.ok(dati.jti, "senza jti la sessione non si potrebbe ritirare");
});

test("refuses a device token, which is the whole point of the separation", async () => {
  // `auth.generateToken` firma con JWT_SECRET e non dichiara nessun ruolo:
  // e' il token che ogni dispositivo riceve al login. Non deve aprire nulla
  // del pannello.
  const c = await configurazione();
  process.env.JWT_SECRET = SEGRETO_DISPOSITIVI;
  const tokenDispositivo = auth.generateToken({ identifier: "dispositivo-42" });

  assert.equal(
    verificaToken(c, tokenDispositivo),
    null,
    "un token di dispositivo non deve entrare nel pannello"
  );
});

test("refuses a device token even if the two secrets were the same", async () => {
  // La separazione non deve poggiare solo sul segreto: se un giorno le due
  // variabili finissero per coincidere, il destinatario e il ruolo reggono.
  const c = await configurazione({ segreto: SEGRETO_DISPOSITIVI });
  process.env.JWT_SECRET = SEGRETO_DISPOSITIVI;
  const tokenDispositivo = auth.generateToken({ identifier: "dispositivo-42" });

  assert.equal(verificaToken(c, tokenDispositivo), null);
});

test("its own token does not pass the device authentication", async () => {
  // Il verso opposto: il token del pannello non deve poter chiamare l'API
  // dell'applicazione a nome di nessuno.
  const c = await configurazione();
  process.env.JWT_SECRET = SEGRETO_DISPOSITIVI;
  const tokenPannello = generaToken(c, "marco");

  assert.throws(
    () => jwt.verify(tokenPannello, process.env.JWT_SECRET, { algorithms: ["HS256"] }),
    "il token del pannello non deve verificarsi col segreto dei dispositivi"
  );
});

test("refuses a token that declares no role", async () => {
  const c = await configurazione();
  const senzaRuolo = jwt.sign({}, c.segreto, {
    algorithm: "HS256",
    audience: DESTINATARIO,
    subject: "marco",
    expiresIn: "30m",
  });

  assert.equal(verificaToken(c, senzaRuolo), null);
});

test("refuses a token meant for someone else", async () => {
  const c = await configurazione();
  const altroDestinatario = jwt.sign({ role: "admin" }, c.segreto, {
    algorithm: "HS256",
    audience: "qualcun-altro",
    subject: "marco",
    expiresIn: "30m",
  });

  assert.equal(verificaToken(c, altroDestinatario), null);
});

test("refuses a token signed with none, which is the classic way in", async () => {
  const c = await configurazione();
  const senzaFirma = jwt.sign({ role: "admin", sub: "marco", aud: DESTINATARIO }, "", {
    algorithm: "none",
  });

  assert.equal(verificaToken(c, senzaFirma), null);
});

test("drops the open sessions when the admin name changes", async () => {
  const c = await configurazione();
  const token = generaToken(c, "marco");

  const rinominato = { ...c, utente: "un-altro-nome" };
  assert.equal(
    verificaToken(rinominato, token),
    null,
    "cambiare le credenziali deve avere effetto subito, non alla scadenza"
  );
});

test("refuses an expired token", async () => {
  const c = await configurazione({ ttlSessione: "-1s" });

  assert.equal(verificaToken(c, generaToken(c, "marco")), null);
});

test("refuses rubbish instead of a token", async () => {
  const c = await configurazione();

  for (const spazzatura of [undefined, null, "", "non-un-token", "a.b.c"]) {
    assert.equal(verificaToken(c, spazzatura), null);
  }
});

// --------------------------------------------------------------------------
// uscita
// --------------------------------------------------------------------------

test("a session that logged out stops working before it expires", async () => {
  const c = await configurazione();
  const token = generaToken(c, "marco");
  const dati = verificaToken(c, token);

  assert.ok(dati, "prima dell'uscita deve valere");

  revoche.revoca(dati.jti, dati.exp);

  assert.equal(
    verificaToken(c, token),
    null,
    "un esci che non invalida nulla sarebbe una bugia"
  );
});

test("logging out of one session leaves the other alone", async () => {
  const c = await configurazione();
  const primo = verificaToken(c, generaToken(c, "marco"));
  const secondoToken = generaToken(c, "marco");

  revoche.revoca(primo.jti, primo.exp);

  assert.ok(verificaToken(c, secondoToken), "le sessioni sono indipendenti");
});

test("does not remember a revocation past the token's own expiry", () => {
  const scaduto = Math.floor(Date.now() / 1000) - 10;

  assert.equal(revoche.revoca("vecchia", scaduto), false);
  assert.equal(revoche.revocato("vecchia"), false);
  assert.equal(revoche.quante(), 0, "l'elenco non deve crescere senza limite");
});

// --------------------------------------------------------------------------
// intestazione
// --------------------------------------------------------------------------

test("reads the token only from a Bearer header", () => {
  assert.equal(soloBearer("Bearer abc.def.ghi"), "abc.def.ghi");
  assert.equal(soloBearer("Bearer   abc  "), "abc");

  assert.equal(soloBearer("bearer abc"), null, "lo schema e' sensibile alle maiuscole");
  assert.equal(soloBearer("Basic abc"), null);
  assert.equal(soloBearer("abc"), null);
  assert.equal(soloBearer("Bearer "), null);
  assert.equal(soloBearer(undefined), null);
  assert.equal(soloBearer(null), null);
});
