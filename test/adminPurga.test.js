const test = require("node:test");
const assert = require("node:assert/strict");

const purga = require("../src/admin/purga");
const sysLogger = require("../src/sysLogger");

const ORA = 60 * 60 * 1000;
const GIORNO = 24 * ORA;

// Il pool finto conta le cancellazioni invece di farle: le prove non hanno un
// database, e una prova che cancella davvero non la si lancia due volte.
const finge = (quante) => {
  const chieste = [];
  let restanti = quante;

  global.connection = {
    query(sql, parametri, richiamo) {
      chieste.push({ sql, parametri });

      if (/^\s*SELECT/i.test(sql)) {
        const risposta = /COUNT\(\*\) AS quante, MIN/i.test(sql)
          ? [{ quante: restanti, prima: new Date("2026-01-01"), ultima: new Date("2026-02-01") }]
          : [{ quante: restanti }];
        return setImmediate(() => richiamo(null, risposta));
      }

      const lotto = parametri[parametri.length - 1];
      const andati = Math.min(lotto, restanti);
      restanti -= andati;
      setImmediate(() => richiamo(null, { affectedRows: andati }));
    },
  };

  return chieste;
};

const vecchia = () => new Date(Date.now() - 30 * GIORNO);

test.afterEach(() => {
  delete global.connection;
});

test("protects the administration trail unless it is named", () => {
  const predefinito = purga.condizioni(vecchia(), null);

  // Senza tipi scelti, la traccia del pannello resta fuori: e' l'unica
  // memoria di chi e' entrato e cosa ha fatto, e una purga generica non deve
  // portarsela via senza che nessuno l'abbia chiesto.
  assert.match(predefinito.sql, /log_type NOT IN \(\?,\?\)/);
  assert.ok(predefinito.parametri.includes("ADMIN_AUTH"));
  assert.ok(predefinito.parametri.includes("ADMIN_ACTION"));
  assert.equal(predefinito.tipi, null);
});

test("lets the trail be purged only by naming those types", () => {
  const scelto = purga.condizioni(vecchia(), ["ADMIN_AUTH"]);

  assert.match(scelto.sql, /log_type IN \(\?\)/);
  assert.deepEqual(scelto.tipi, ["ADMIN_AUTH"]);
  assert.deepEqual(scelto.protettiInclusi, ["ADMIN_AUTH"]);
});

test("refuses a date that is not a date", async () => {
  await assert.rejects(() => purga.anteprima({ primaDi: "pippo" }), /data non valida/);
  await assert.rejects(() => purga.purga({ primaDi: undefined }), /data non valida/);
});

test("refuses to purge up to now", async () => {
  // Una purga fino a adesso cancellerebbe anche le righe di cio' che sta
  // succedendo mentre si guarda, compresa quella che racconta la purga.
  await assert.rejects(() => purga.purga({ primaDi: new Date() }), /almeno un'ora nel passato/);
  await assert.rejects(
    () => purga.purga({ primaDi: new Date(Date.now() - 59 * 60 * 1000) }),
    /almeno un'ora nel passato/
  );
  await assert.rejects(
    () => purga.purga({ primaDi: new Date(Date.now() + GIORNO) }),
    /almeno un'ora nel passato/
  );
});

test("refuses a retention of zero days or less", () => {
  assert.throws(() => purga.primaDiGiorni(0), /almeno 1/);
  assert.throws(() => purga.primaDiGiorni(-5), /almeno 1/);
  assert.throws(() => purga.primaDiGiorni("pippo"), /almeno 1/);
});

test("turns days of retention into the date before which rows go", () => {
  const data = purga.primaDiGiorni(90);
  const atteso = Date.now() - 90 * GIORNO;

  assert.ok(Math.abs(data.getTime() - atteso) < 5000);
});

test("counts before deleting, and counts the whole table too", async () => {
  finge(1234);

  const a = await purga.anteprima({ primaDi: vecchia() });

  assert.equal(a.righe, 1234);
  assert.equal(a.righeTotali, 1234);
  assert.deepEqual(a.tipiProtetti, purga.TIPI_PROTETTI);
  assert.equal(typeof a.prima, "string");
});

test("deletes in batches instead of locking the table in one go", async () => {
  const chieste = finge(purga.LOTTO * 2 + 7);

  const esito = await purga.purga({ primaDi: vecchia() });

  assert.equal(esito.righe, purga.LOTTO * 2 + 7);
  // Tre giri: due pieni e uno parziale, che e' quello che dice "ho finito".
  assert.equal(esito.lotti, 3);
  assert.equal(esito.incompleta, false);
  // Si contano solo le cancellazioni: l'ultima interrogazione e' la riga di
  // esito, che `logToDb` scrive attraverso lo stesso pool.
  assert.equal(chieste.filter((c) => /^\s*DELETE/i.test(c.sql)).length, 3);
  assert.match(chieste[0].sql, /DELETE FROM system_logs WHERE .* ORDER BY id LIMIT \?/);
});

test("stops at a single batch when there is little to remove", async () => {
  finge(10);

  const esito = await purga.purga({ primaDi: vecchia() });

  assert.equal(esito.righe, 10);
  assert.equal(esito.lotti, 1);
});

test("says it stopped short instead of looking finished", async () => {
  // Un registro enorme: la purga si ferma al tetto dei lotti. Una purga che
  // gira senza fine e una bloccata si assomigliano troppo.
  const chieste = finge(purga.LOTTO * (purga.LOTTI_MASSIMI + 10));

  const esito = await purga.purga({ primaDi: vecchia() });

  assert.equal(esito.incompleta, true);
  assert.equal(esito.lotti, purga.LOTTI_MASSIMI);
  assert.equal(
    chieste.filter((c) => /^\s*DELETE/i.test(c.sql)).length,
    purga.LOTTI_MASSIMI
  );
});

test("writes the outcome after deleting, never before", async (t) => {
  const scritte = [];
  t.mock.method(sysLogger, "logToDb", (tipo, azione, dettagli, stato) => {
    scritte.push({ tipo, azione, dettagli, stato });
  });

  const chieste = finge(5);
  await purga.purga({ primaDi: vecchia(), origine: "prova" });

  // Scritta prima, una riga dentro l'intervallo della purga se la sarebbe
  // portata via la purga stessa.
  assert.equal(chieste.filter((c) => /^\s*DELETE/i.test(c.sql)).length, 1);
  assert.equal(scritte.length, 1);
  assert.equal(scritte[0].tipo, "SYSTEM_EVENT");
  assert.equal(scritte[0].azione, "logPurge.eseguita");
  assert.equal(scritte[0].dettagli.righe, 5);
  assert.equal(scritte[0].dettagli.origine, "prova");
  assert.equal(scritte[0].stato, "INFO");
});

test("marks an unfinished purge as something to look at", async (t) => {
  const scritte = [];
  t.mock.method(sysLogger, "logToDb", (tipo, azione, dettagli, stato) => {
    scritte.push({ stato, dettagli });
  });

  finge(purga.LOTTO * (purga.LOTTI_MASSIMI + 1));
  await purga.purga({ primaDi: vecchia() });

  assert.equal(scritte[0].stato, "WARN");
  assert.equal(scritte[0].dettagli.incompleta, true);
});

test("drops a type that cannot be a type", () => {
  assert.deepEqual(purga.elencoTipi("API_REQUEST, drop table"), ["API_REQUEST"]);
  assert.deepEqual(purga.elencoTipi(""), []);
  assert.deepEqual(purga.elencoTipi(null), []);
});
