const test = require("node:test");
const assert = require("node:assert/strict");

const visore = require("../src/admin/registroVisore");

const INDIRIZZO = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

// Un pool finto: registra cio' che gli viene chiesto e restituisce cio' che
// gli si e' messo in bocca. Serve a provare le interrogazioni e il
// trattamento delle righe senza un database, che nelle prove non c'e'.
const finge = (risposte = []) => {
  const chieste = [];
  const coda = [...risposte];
  global.connection = {
    query(sql, parametri, richiamo) {
      chieste.push({ sql, parametri });
      const prossima = coda.length ? coda.shift() : [];
      setImmediate(() => richiamo(null, prossima));
    },
  };
  return chieste;
};

const riga = (modifiche = {}) => ({
  id: 7,
  log_type: "API_REQUEST",
  action: `GET /api/transactions/${INDIRIZZO}`,
  details: JSON.stringify({ address: INDIRIZZO, responseStatus: 200 }),
  status: "INFO",
  duration_ms: 12,
  created_at: new Date("2026-11-09T09:00:00Z"),
  ...modifiche,
});

test.afterEach(() => {
  delete global.connection;
  visore.azzeraCache();
});

test("defaults to the last 24 hours when no window is asked for", () => {
  const dove = visore.condizioni({});

  assert.equal(dove.finestra, "24h");
  assert.match(dove.sql, /created_at >= NOW\(\) - INTERVAL \? SECOND/);
  assert.deepEqual(dove.parametri, [24 * 60 * 60]);
});

test("falls back to the default window instead of trusting an unknown one", () => {
  // Una finestra inventata non deve diventare "tutto il registro" per caso.
  assert.equal(visore.condizioni({ finestra: "mille anni" }).finestra, "24h");
  assert.equal(visore.condizioni({ finestra: "tutto" }).finestra, "tutto");
  assert.equal(visore.condizioni({ finestra: "tutto" }).sql, "");
});

test("an explicit start date wins over the window", () => {
  const dove = visore.condizioni({ finestra: "1h", da: "2026-11-01T00:00:00Z" });

  assert.match(dove.sql, /created_at >= \?/);
  assert.ok(dove.parametri[0] instanceof Date);
  assert.doesNotMatch(dove.sql, /INTERVAL/);
});

test("ignores a date that is not a date", () => {
  const dove = visore.condizioni({ da: "non una data" });

  // Si torna alla finestra, invece di passare al database una condizione
  // costruita su un valore che non si e' capito.
  assert.match(dove.sql, /INTERVAL/);
});

test("every filter value travels as a placeholder", () => {
  const dove = visore.condizioni({
    tipo: "API_REQUEST,SYSTEM_ERROR",
    stato: ["error"],
    azione: "/api/deviceLogin",
    testo: "qualcosa",
    durataMinMs: "50",
  });

  // Nessun valore cucito nel testo: nel SQL ci sono solo nomi di colonna,
  // operatori e punti di domanda.
  assert.match(dove.sql, /log_type IN \(\?,\?\)/);
  assert.match(dove.sql, /status IN \(\?\)/);
  assert.match(dove.sql, /action LIKE \?/);
  assert.match(dove.sql, /details LIKE \?/);
  assert.match(dove.sql, /duration_ms >= \?/);
  assert.ok(dove.parametri.includes("API_REQUEST"));
  // Scritto minuscolo, cercato maiuscolo: i valori del registro sono tutti
  // maiuscoli, e un filtro che non trova niente sembra un registro vuoto.
  assert.ok(dove.parametri.includes("ERROR"));
  assert.ok(dove.parametri.includes(50));
});

test("drops values that cannot be a type and caps how many there can be", () => {
  assert.deepEqual(visore.elencoValori("API_REQUEST, , api_request"), ["API_REQUEST"]);
  assert.deepEqual(visore.elencoValori("drop table; --"), []);
  assert.deepEqual(visore.elencoValori([]), []);

  const molti = Array.from({ length: 50 }, (v, i) => `TIPO_${i}`);
  assert.equal(visore.elencoValori(molti).length, 12);
});

test("a per cent typed in the search box searches for a per cent", () => {
  assert.equal(visore.perLike("100%"), "100\\%");
  assert.equal(visore.perLike("a_b"), "a\\_b");
  assert.equal(visore.perLike("c:\\temp"), "c:\\\\temp");
});

test("says when the query is a scan, instead of letting it look free", () => {
  assert.equal(visore.condizioni({ azione: "/api" }).lenta, false);
  assert.equal(visore.condizioni({ testo: "qualcosa" }).lenta, true);
});

test("orders by id, not by a timestamp that only knows seconds", async () => {
  const chieste = finge([[riga()], [{ quante: 1 }]]);

  await visore.cerca({});

  // Piu' righe dello stesso secondo tornerebbero in ordine arbitrario, e due
  // pagine di seguito potrebbero ripetere una riga e perderne un'altra.
  assert.match(chieste[0].sql, /ORDER BY id DESC/);
  assert.doesNotMatch(chieste[0].sql, /ORDER BY created_at/);
});

test("clamps the page size and the page number", async () => {
  const chieste = finge([[], [{ quante: 0 }]]);

  const fuori = await visore.cerca({ limite: "100000", pagina: "-3" });

  assert.equal(fuori.limite, visore.LIMITE_MASSIMO);
  assert.equal(fuori.pagina, 1);
  assert.deepEqual(chieste[0].parametri.slice(-2), [visore.LIMITE_MASSIMO, 0]);
});

test("asks for the right slice on a later page", async () => {
  const chieste = finge([[], [{ quante: 0 }]]);

  await visore.cerca({ limite: "25", pagina: "4" });

  assert.deepEqual(chieste[0].parametri.slice(-2), [25, 75]);
});

test("counts exactly up to the ceiling and says so beyond it", async () => {
  finge([[riga()], [{ quante: visore.TETTO_CONTEGGIO + 1 }]]);
  const oltre = await visore.cerca({});

  assert.equal(oltre.totale, visore.TETTO_CONTEGGIO);
  assert.equal(oltre.totaleEsatto, false);

  finge([[riga()], [{ quante: 41 }]]);
  const sotto = await visore.cerca({});

  assert.equal(sotto.totale, 41);
  assert.equal(sotto.totaleEsatto, true);
});

test("the count stops the database as soon as it has seen enough", async () => {
  const chieste = finge([[], [{ quante: 0 }]]);

  await visore.cerca({});

  assert.match(chieste[1].sql, new RegExp(`LIMIT ${visore.TETTO_CONTEGGIO + 1}`));
});

test("the count uses the same conditions as the rows", async () => {
  const chieste = finge([[], [{ quante: 0 }]]);

  await visore.cerca({ tipo: "SYSTEM_ERROR", finestra: "1h" });

  // Un totale calcolato con un filtro diverso da quello delle righe non si
  // potrebbe smentire guardando lo schermo.
  const condizioniRighe = chieste[0].sql.split("WHERE")[1].split("ORDER BY")[0].trim();
  assert.ok(chieste[1].sql.includes(condizioniRighe));
  assert.deepEqual(chieste[1].parametri, chieste[0].parametri.slice(0, -2));
});

test("masks the rows unless asked not to", async () => {
  finge([[riga()], [{ quante: 1 }]]);
  const mascherate = await visore.cerca({});

  assert.equal(mascherate.mascherato, true);
  assert.equal(mascherate.righe[0].azione, "GET /api/transactions/1A1zP1…vfNa");
  assert.equal(mascherate.righe[0].dettagli.address, "1A1zP1…vfNa");
  assert.equal(mascherate.righe[0].dettagli.responseStatus, 200);

  // "false" arriva come stringa dalla barra degli indirizzi, non come
  // booleano: contano entrambi.
  finge([[riga()], [{ quante: 1 }]]);
  const chiare = await visore.cerca({ maschera: "false" });

  assert.equal(chiare.mascherato, false);
  assert.equal(chiare.righe[0].dettagli.address, INDIRIZZO);
});

test("hands back details that are not JSON as they are", async () => {
  finge([[riga({ details: "un errore scritto a mano" })], [{ quante: 1 }]]);

  const fuori = await visore.cerca({});

  assert.equal(fuori.righe[0].dettagli, "un errore scritto a mano");
});

test("keeps a missing duration missing", async () => {
  finge([[riga({ duration_ms: null })], [{ quante: 1 }]]);

  const fuori = await visore.cerca({});

  // Zero vorrebbe dire "istantanea", che e' un'altra cosa da "non misurata".
  assert.equal(fuori.righe[0].durataMs, null);
});

test("a single row refuses an id that is not a number without asking the database", async () => {
  const chieste = finge([]);

  assert.equal(await visore.unaRiga("pippo"), null);
  assert.equal(chieste.length, 0);
});

test("the slowest actions only look where a duration exists", async () => {
  const chieste = finge([[], [], [], []]);

  await visore.statistiche({ finestra: "1h" });

  const lente = chieste[3].sql;
  assert.match(lente, /duration_ms IS NOT NULL/);
  // Con un filtro attivo la condizione si aggiunge con AND, non con un
  // secondo WHERE che non sarebbe nemmeno SQL valido.
  assert.match(lente, /WHERE .* AND duration_ms IS NOT NULL/s);
});

test("the slowest actions still work with no filter at all", async () => {
  const chieste = finge([[], [], [], []]);

  await visore.statistiche({ finestra: "tutto" });

  assert.match(chieste[3].sql, /WHERE duration_ms IS NOT NULL/);
});

test("the hourly histogram comes back oldest first", async () => {
  finge([
    [],
    [
      { ora: "2026-11-09 10:00", righe: 5, errori: 1 },
      { ora: "2026-11-09 09:00", righe: 3, errori: 0 },
    ],
    [],
    [],
  ]);

  const s = await visore.statistiche({});

  // Il database le da' dalla piu' recente perche' il LIMIT prenda le ultime;
  // un istogramma si legge da sinistra a destra nel tempo.
  assert.deepEqual(s.perOra.map((o) => o.ora), ["2026-11-09 09:00", "2026-11-09 10:00"]);
});

test("the facet lists come from the log and are kept for a minute", async () => {
  const chieste = finge([
    [{ valore: "API_REQUEST", righe: 12582 }],
    [{ valore: "INFO", righe: 13285 }],
  ]);

  const prima = await visore.voci();
  assert.equal(prima.dallaCache, false);
  assert.deepEqual(prima.tipi, [{ valore: "API_REQUEST", righe: 12582 }]);
  assert.equal(chieste.length, 2);

  const dopo = await visore.voci();
  assert.equal(dopo.dallaCache, true);
  assert.equal(chieste.length, 2);
});
