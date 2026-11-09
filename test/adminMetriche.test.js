const test = require("node:test");
const assert = require("node:assert/strict");

const metricheSistema = require("../src/admin/metricheSistema");
const metricheDatabase = require("../src/admin/metricheDatabase");

// --------------------------------------------------------------------------
// sistema
// --------------------------------------------------------------------------

test.beforeEach(() => {
  metricheSistema.azzeraCampione();
  metricheDatabase.azzeraCache();
  delete global.connection;
});

test.afterEach(() => {
  delete global.connection;
});

test("says it does not know the cpu share on the first read", () => {
  // I tempi di `os.cpus()` sono cumulativi dall'avvio della macchina: la
  // percentuale si ottiene confrontando due letture, e la prima non ha niente
  // con cui confrontarsi. Un numero inventato li' sarebbe peggio di un trattino.
  const prima = metricheSistema.percentualiCpu();

  assert.equal(prima.media, null);
  assert.equal(prima.perNucleo, null);
  assert.equal(prima.finestraMs, null);
});

test("gives a cpu share once it has two reads to compare", () => {
  metricheSistema.percentualiCpu();

  // Un po' di lavoro, cosi' la finestra non e' vuota.
  const fine = Date.now() + 30;
  while (Date.now() < fine) { Math.sqrt(Math.random()); }

  const seconda = metricheSistema.percentualiCpu();

  assert.ok(Array.isArray(seconda.perNucleo));
  assert.ok(seconda.media >= 0 && seconda.media <= 100, `media fuori scala: ${seconda.media}`);
  assert.ok(seconda.finestraMs >= 0);
  seconda.perNucleo.forEach((v) => {
    if (v !== null) assert.ok(v >= 0 && v <= 100, `nucleo fuori scala: ${v}`);
  });
});

test("says it does not know the event loop lag before the first sample", () => {
  // Nei primi millisecondi di vita del processo l'istogramma e' vuoto, e la
  // sua media e' NaN. Un NaN attraversa JSON diventando null senza che nessuno
  // lo abbia deciso: meglio dirlo.
  const r = metricheSistema.ritardoCicloEventi();

  if (r.campioni === 0) {
    assert.equal(r.mediaMs, null);
    assert.equal(r.massimoMs, null);
    assert.equal(r.p99Ms, null);
  }
});

test("subtracts the resolution, so an idle loop reads no lag", () => {
  // `monitorEventLoopDelay` campiona ogni `resolution` millisecondi e registra
  // quando il campione e' arrivato: su un ciclo libero il valore registrato e'
  // circa la risoluzione stessa. Senza sottrarla, un server inattivo
  // mostrerebbe un ritardo che non esiste e le soglie misurerebbero quel fondo.
  //
  // Si prova con valori noti e non sull'istogramma vero: la' il risultato
  // dipende da quanto e' carica la macchina in quel momento, e una prova che
  // dipende da quello non prova il codice. (Succede davvero: `node --test`
  // esegue i file in parallelo, e questa prova con una soglia sul valore vero
  // passava da sola e cadeva nella serie completa.)
  const { inMillisecondi, RISOLUZIONE_MS } = metricheSistema;
  const ns = (ms) => ms * 1e6;

  assert.equal(inMillisecondi(ns(RISOLUZIONE_MS)), 0, "il fondo e' ritardo zero");
  assert.equal(inMillisecondi(ns(RISOLUZIONE_MS + 5)), 5);
  assert.equal(inMillisecondi(ns(RISOLUZIONE_MS + 1000)), 1000);
  assert.equal(inMillisecondi(ns(1234.567 + RISOLUZIONE_MS)), 1234.57, "arrotonda ai centesimi");
});

test("never reports a negative lag", () => {
  const { inMillisecondi, RISOLUZIONE_MS } = metricheSistema;

  // Un campione arrivato prima della risoluzione non e' un ritardo negativo.
  assert.equal(inMillisecondi(0), 0);
  assert.equal(inMillisecondi(RISOLUZIONE_MS * 1e6 - 1), 0);
  assert.equal(inMillisecondi(1e6), 0);

  const r = metricheSistema.ritardoCicloEventi();
  for (const campo of ["mediaMs", "massimoMs", "p99Ms"]) {
    if (r[campo] !== null) assert.ok(r[campo] >= 0, `${campo} negativo: ${r[campo]}`);
  }
});

test("reads the real histogram in milliseconds, not nanoseconds", async () => {
  await new Promise((fatto) => setTimeout(fatto, 120));

  const r = metricheSistema.ritardoCicloEventi();

  assert.ok(r.campioni > 0, "dopo 120ms con risoluzione 10 ci devono essere campioni");
  assert.equal(r.risoluzioneMs, metricheSistema.RISOLUZIONE_MS);

  for (const campo of ["mediaMs", "massimoMs", "p99Ms"]) {
    assert.ok(Number.isFinite(r[campo]), `${campo} non e' un numero: ${r[campo]}`);
    // Senza la conversione questi sarebbero milioni: un limite larghissimo
    // basta a distinguere millisecondi da nanosecondi, e non dipende dal
    // carico della macchina.
    assert.ok(r[campo] < 60000, `${campo} sembra nanosecondi: ${r[campo]}`);
  }
});

test("reports the disk, or says why it cannot", async () => {
  const buono = await metricheSistema.spazioDisco(process.cwd());

  assert.equal(buono.errore, undefined);
  assert.ok(buono.totale > 0);
  assert.ok(buono.disponibile >= 0);
  assert.ok(buono.percentualeUsata >= 0 && buono.percentualeUsata <= 100);

  const inesistente = await metricheSistema.spazioDisco("/percorso/che/non/esiste/davvero");
  assert.ok(inesistente.errore, "un disco illeggibile deve dire perche', non far cadere la vista");
  assert.equal(inesistente.totale, undefined);
});

test("reports memory for the machine and for the process", () => {
  const m = metricheSistema.memoria();

  assert.ok(m.macchina.totale > 0);
  assert.equal(m.macchina.usata, m.macchina.totale - m.macchina.libera);
  assert.ok(m.macchina.percentualeUsata > 0 && m.macchina.percentualeUsata <= 100);
  assert.ok(m.processo.rss > 0);
  assert.ok(m.processo.heapUsato <= m.processo.heapTotale + m.processo.esterna);
});

test("collects everything without a database", async () => {
  // La vista di sistema non interroga il database: deve funzionare anche
  // quando e' proprio il database il problema.
  const tutto = await metricheSistema.raccogli();

  assert.ok(tutto.macchina.nome);
  assert.ok(tutto.processo.pid > 0);
  assert.ok(tutto.cpu.nuclei > 0);
  assert.ok(tutto.memoria.macchina.totale > 0);
  assert.ok(tutto.cicloEventi);
  assert.ok(tutto.istante);
});

// --------------------------------------------------------------------------
// database
// --------------------------------------------------------------------------

// Finto pool: risponde con righe preparate, o fallisce.
const fintoPool = (risposte, errore = null) => ({
  config: { connectionLimit: 10 },
  _allConnections: [1, 2, 3],
  _freeConnections: [1],
  _acquiringConnections: [],
  _connectionQueue: [],
  _closed: false,
  query(sql, parametri, fine) {
    const chiamata = typeof parametri === "function" ? parametri : fine;
    if (errore) return chiamata(errore);
    for (const [frammento, righe] of risposte) {
      if (sql.includes(frammento)) return chiamata(null, righe);
    }
    return chiamata(null, []);
  },
});

test("measures the ping and calls it answered", async () => {
  global.connection = fintoPool([["SELECT 1", [{ "1": 1 }]]]);

  const r = await metricheDatabase.ping();

  assert.equal(r.risponde, true);
  assert.ok(Number.isFinite(r.latenzaMs));
  assert.ok(r.latenzaMs >= 0);
});

test("reports a database that refuses the connection", async () => {
  global.connection = fintoPool([], new Error("ECONNREFUSED"));

  const r = await metricheDatabase.ping();

  assert.equal(r.risponde, false);
  assert.equal(r.errore, "ECONNREFUSED");
});

test("says the pool is unavailable instead of throwing", async () => {
  const r = await metricheDatabase.ping();

  assert.equal(r.risponde, false);
  assert.match(r.errore, /pool non disponibile/);
  assert.equal(metricheDatabase.statoPool(), null);
});

test("derives the busy connections from the pool's own counters", () => {
  global.connection = fintoPool([]);

  const p = metricheDatabase.statoPool();

  assert.equal(p.aperte, 3);
  assert.equal(p.libere, 1);
  assert.equal(p.occupate, 2);
  assert.equal(p.limite, 10);
  assert.equal(p.chiuso, false);
});

test("shows nulls rather than falling over if the pool renames its fields", () => {
  // Quei campi sono interni a `mysql` v2: una versione futura potrebbe
  // rinominarli, e il pannello deve perdere un dato, non una schermata.
  global.connection = { config: {}, query: () => {} };

  const p = metricheDatabase.statoPool();

  assert.equal(p.aperte, null);
  assert.equal(p.libere, null);
  assert.equal(p.occupate, null);
  assert.equal(p.limite, null);
});

test("turns the status variables into numbers", async () => {
  global.connection = fintoPool([
    ["SHOW GLOBAL STATUS", [
      { Variable_name: "Threads_connected", Value: "5" },
      { Variable_name: "Uptime", Value: "2149199" },
      { Variable_name: "Slow_queries", Value: "241" },
      { Variable_name: "Queries", Value: "non-un-numero" },
    ]],
  ]);

  const s = await metricheDatabase.statoServer();

  assert.equal(s.Threads_connected, 5);
  assert.equal(s.Uptime, 2149199);
  assert.equal(s.Slow_queries, 241);
  assert.equal(s.Queries, null, "un valore illeggibile diventa null, non NaN");
});

test("adds data and index size into one total", async () => {
  global.connection = fintoPool([
    ["information_schema.tables", [
      { tabella: "system_logs", righe: 19215, byteDati: 8000000, byteIndici: 4000000, engine: "InnoDB" },
      { tabella: "device", righe: 188, byteDati: 60000, byteIndici: 20000, engine: "InnoDB" },
    ]],
  ]);

  const t = await metricheDatabase.tabelle("prova");

  assert.equal(t.quante, 2);
  assert.equal(t.elenco[0].nome, "system_logs");
  assert.equal(t.elenco[0].byte, 12000000);
  assert.equal(t.totaleByte, 12080000);
  assert.equal(t.dallaCache, false);
});

test("keeps the table sizes for a while, because the panel asks often", async () => {
  let interrogazioni = 0;
  global.connection = {
    config: {},
    query(sql, parametri, fine) {
      const chiamata = typeof parametri === "function" ? parametri : fine;
      if (sql.includes("information_schema.tables")) interrogazioni += 1;
      chiamata(null, []);
    },
  };

  await metricheDatabase.tabelle("prova");
  const seconda = await metricheDatabase.tabelle("prova");

  assert.equal(interrogazioni, 1, "la seconda lettura deve venire dalla cache");
  assert.equal(seconda.dallaCache, true);
});

test("labels a calendar day with the day the database grouped by", () => {
  // Il driver restituisce `DATE(created_at)` come mezzanotte LOCALE.
  // `toISOString()` la riporta a UTC: a est di Greenwich il giorno slitta
  // indietro di uno, e l'istogramma mostrava le righe di oggi sotto ieri.
  // Succedeva davvero, visto sul server.
  const { soloData } = metricheDatabase;
  const mezzanotteLocale = new Date(2026, 10, 9, 0, 0, 0, 0); // 9 novembre

  assert.equal(soloData(mezzanotteLocale), "2026-11-09");

  // La prova vale solo dove il fuso rende diverse le due strade; dove
  // coincidono (UTC o a ovest) non dimostra niente, e va detto invece di
  // sembrare una prova che passa.
  const viaUtc = mezzanotteLocale.toISOString().slice(0, 10);
  if (mezzanotteLocale.getTimezoneOffset() < 0) {
    assert.notEqual(viaUtc, "2026-11-09", "qui toISOString deve sbagliare");
  }

  // Mezzogiorno dello stesso giorno deve dare lo stesso giorno: non e' l'ora
  // che conta.
  assert.equal(soloData(new Date(2026, 10, 9, 12, 30)), "2026-11-09");
  assert.equal(soloData(new Date(2026, 0, 1, 23, 59)), "2026-01-01", "mese e giorno a due cifre");

  assert.equal(soloData(null), null);
  assert.equal(soloData(undefined), null);
  assert.equal(soloData("non una data"), null);
});

test("answers with what it knows when the database is down", async () => {
  // Il pannello serve soprattutto quando qualcosa non va: una vista che si
  // svuota proprio allora non serve a niente.
  global.connection = fintoPool([], new Error("ECONNREFUSED"));

  const d = await metricheDatabase.raccogli("prova");

  assert.equal(d.ping.risponde, false);
  assert.ok(d.pool, "lo stato del pool si sa comunque");
  assert.equal(d.tabelle, undefined);
});
