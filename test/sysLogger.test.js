const test = require("node:test");
const assert = require("node:assert/strict");

const { logToDb, reimpostaColonnaDurata } = require("../src/sysLogger");

// Finta connessione: raccoglie le query invece di eseguirle, e puo' far
// fallire la prima con un errore scelto.
const fintaConnessione = (errorePrimaQuery = null) => {
  const eseguite = [];
  let prima = true;

  return {
    eseguite,
    query(sql, valori, fine) {
      eseguite.push({ sql, valori });
      const errore = prima ? errorePrimaQuery : null;
      prima = false;
      if (fine) fine(errore);
    },
  };
};

const colonnaAssente = () => {
  const e = new Error("Unknown column 'duration_ms' in 'field list'");
  e.code = "ER_BAD_FIELD_ERROR";
  return e;
};

test.beforeEach(() => {
  reimpostaColonnaDurata();
  delete global.connection;
});

test.afterEach(() => {
  delete global.connection;
});

test("writes the duration into its own column", () => {
  const conn = fintaConnessione();
  global.connection = conn;

  logToDb("API_REQUEST", "GET /api/assets", { url: "/api/assets" }, "INFO", 137);

  assert.equal(conn.eseguite.length, 1);
  assert.match(conn.eseguite[0].sql, /duration_ms/);
  assert.equal(conn.eseguite[0].valori.length, 5);
  assert.equal(conn.eseguite[0].valori[4], 137);
});

test("leaves the duration null for an event that is not a request", () => {
  const conn = fintaConnessione();
  global.connection = conn;

  logToDb("SYSTEM_EVENT", "server.start.http", { port: 3001 }, "INFO");

  assert.equal(conn.eseguite[0].valori[4], null, "un evento non ha una durata");
});

test("rounds a fractional duration and refuses anything that is not a number", () => {
  const conn = fintaConnessione();
  global.connection = conn;

  logToDb("API_REQUEST", "a", {}, "INFO", 12.6);
  logToDb("API_REQUEST", "b", {}, "INFO", "137ms");
  logToDb("API_REQUEST", "c", {}, "INFO", NaN);

  assert.equal(conn.eseguite[0].valori[4], 13);
  assert.equal(
    conn.eseguite[1].valori[4],
    null,
    "la stringa con l'unita' e' quella dentro details, non un numero"
  );
  assert.equal(conn.eseguite[2].valori[4], null);
});

test("falls back to the old insert when the column is not there yet", () => {
  // La migrazione 008 si lancia a mano, quindi questo codice puo' trovarsi in
  // servizio prima. Senza questa rete ogni riga di registro andrebbe perduta,
  // tutte in una volta e proprio mentre si mette mano al server.
  const conn = fintaConnessione(colonnaAssente());
  global.connection = conn;

  logToDb("API_REQUEST", "GET /api/assets", { url: "/x" }, "INFO", 137);

  assert.equal(conn.eseguite.length, 2, "deve riprovare, non arrendersi");
  assert.match(conn.eseguite[0].sql, /duration_ms/);
  assert.doesNotMatch(conn.eseguite[1].sql, /duration_ms/);
  assert.equal(conn.eseguite[1].valori.length, 4);
  assert.deepEqual(conn.eseguite[1].valori.slice(0, 2), [
    "API_REQUEST",
    "GET /api/assets",
  ]);
});

test("does not keep probing the missing column on every later row", () => {
  const conn = fintaConnessione(colonnaAssente());
  global.connection = conn;

  logToDb("API_REQUEST", "prima", {}, "INFO", 10);
  logToDb("API_REQUEST", "seconda", {}, "INFO", 20);
  logToDb("API_REQUEST", "terza", {}, "INFO", 30);

  // 2 per la prima riga (tentativo e ripiego), 1 per ciascuna delle altre.
  assert.equal(conn.eseguite.length, 4);
  assert.doesNotMatch(conn.eseguite[2].sql, /duration_ms/);
  assert.doesNotMatch(conn.eseguite[3].sql, /duration_ms/);
});

test("serialises an object detail and leaves a string alone", () => {
  const conn = fintaConnessione();
  global.connection = conn;

  logToDb("SYSTEM_EVENT", "x", { a: 1, b: "due" }, "INFO");
  logToDb("SYSTEM_EVENT", "y", "testo semplice", "INFO");

  assert.equal(conn.eseguite[0].valori[2], '{"a":1,"b":"due"}');
  assert.equal(conn.eseguite[1].valori[2], "testo semplice");
});

// ---------------------------------------------------------------------------
// La forma che si puo' aspettare.
//
// Serve dove il processo esce subito dopo: `process.exit` non svuota cio' che
// e' in volo verso il database, e l'ultima riga di una corsa e' proprio quella
// che dice com'e' andata.
// ---------------------------------------------------------------------------

const { registraEAttendi } = require("../src/sysLogger");

test("la forma attendibile si risolve quando la riga e' scritta", async () => {
  const conn = fintaConnessione();
  global.connection = conn;

  const esito = await registraEAttendi("SYSTEM_EVENT", "manualSync.completed", { a: 1 }, "INFO", 1200);

  assert.equal(esito, true, "true vuol dire che la riga e' nel database");
  assert.equal(conn.eseguite.length, 1);
  assert.equal(conn.eseguite[0].valori[1], "manualSync.completed");
  assert.equal(conn.eseguite[0].valori[4], 1200);
});

test("la forma attendibile si risolve anche quando la riga non si scrive", async () => {
  // Non rifiuta mai: una riga di registro che non si scrive non deve poter
  // interrompere cio' che la stava scrivendo -- qui, l'uscita del comando.
  const conn = fintaConnessione(new Error("ER_LOCK_WAIT_TIMEOUT"));
  global.connection = conn;

  const esito = await registraEAttendi("SYSTEM_ERROR", "manualSync.failed", { b: 2 }, "ERROR");

  assert.equal(esito, false, "false vuol dire finita nel file di scorta");
});

test("senza connessione si risolve subito, senza restare appesa", async () => {
  delete global.connection;

  assert.equal(await registraEAttendi("SYSTEM_EVENT", "x", {}, "INFO"), false);
});

test("anche la forma attendibile ripiega quando la colonna della durata manca", async () => {
  const conn = fintaConnessione(colonnaAssente());
  global.connection = conn;

  assert.equal(await registraEAttendi("API_REQUEST", "y", {}, "INFO", 10), true);
  assert.equal(conn.eseguite.length, 2);
  assert.doesNotMatch(conn.eseguite[1].sql, /duration_ms/);
});
