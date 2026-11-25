const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");

// Finto database.
//
// `script` elenca le query che devono fallire: `match` e' un pezzo dell'SQL e
// `quando`, se c'e', decide guardando anche i parametri -- serve a far
// rifiutare una riga sola invece di tutto il lotto.
//
// `inServizio` e' la risposta al conteggio del catalogo in servizio, cioe'
// cio' su cui la guardia del dimagrimento si pronuncia. `null` significa che
// il conteggio non risponde: la tabella non c'e' ancora.
function fakeConnection(script, { inServizio = null, lucchettoOccupato = false } = {}) {
  const executed = [];

  const query = (sql, params, cb) => {
    if (typeof params === "function") {
      cb = params;
      params = undefined;
    }
    executed.push({
      sql: sql.replace(/\s+/g, " ").trim(),
      rows: params && params[0] ? params[0].length : 0,
      valori: params,
    });

    const failure = script.find(
      (s) => sql.includes(s.match) && (typeof s.quando !== "function" || s.quando(sql, params))
    );
    if (failure) return cb(new Error(failure.error));

    // Il lucchetto vive sulla connessione tenuta ferma, non sulla riserva.
    if (/GET_LOCK/.test(sql)) return cb(null, [{ preso: lucchettoOccupato ? 0 : 1 }]);
    if (/RELEASE_LOCK/.test(sql)) return cb(null, [{ liberato: 1 }]);

    if (/SELECT COUNT\(\*\) AS n FROM token_metadata\b/.test(sql)) {
      if (inServizio === null) return cb(new Error("Table 'token_metadata' doesn't exist"));
      return cb(null, [{ n: inServizio }]);
    }

    cb(null, {});
  };

  let rilasci = 0;

  return {
    executed,
    query,
    get rilasci() {
      return rilasci;
    },
    getConnection(cb) {
      cb(null, {
        query,
        release() {
          rilasci++;
        },
      });
    },
  };
}

function tokens(count) {
  return Array.from({ length: count }, (_, i) => ({
    blockchain: "ETH",
    symbol: `T${i}`,
    name: `Token ${i}`,
    chainId: "1",
    address: `0x${String(i).padStart(40, "0")}`,
    decimals: 18,
  }));
}

const savedConnection = global.connection;

test.afterEach(() => {
  global.connection = savedConnection;
});

test("writes to a staging table and swaps it in, never truncating the live table", async () => {
  const conn = fakeConnection([]);
  global.connection = conn;

  await dao.syncTokenMetaDataInDB(tokens(3));

  const sqls = conn.executed.map((e) => e.sql);
  assert.ok(!sqls.some((s) => /TRUNCATE/i.test(s)), "non deve esserci alcun TRUNCATE");
  assert.ok(sqls.some((s) => /CREATE TABLE token_metadata_staging LIKE token_metadata/i.test(s)));
  assert.ok(sqls.some((s) => /INSERT INTO token_metadata_staging/i.test(s)));
  assert.ok(sqls.some((s) => /RENAME TABLE token_metadata TO token_metadata_previous/i.test(s)));
});

test("leaves the live table untouched when the insert fails", async () => {
  const conn = fakeConnection([{ match: "INSERT INTO token_metadata_staging", error: "ER_NET_PACKET_TOO_LARGE" }]);
  global.connection = conn;

  await assert.rejects(() => dao.syncTokenMetaDataInDB(tokens(3)), /Error inserting token metadata/);

  const sqls = conn.executed.map((e) => e.sql);
  assert.ok(!sqls.some((s) => /RENAME TABLE/i.test(s)), "non deve scambiare le tabelle se l'insert fallisce");
  assert.ok(!sqls.some((s) => /TRUNCATE/i.test(s)));
  assert.ok(
    sqls.filter((s) => /DROP TABLE IF EXISTS token_metadata_staging/i.test(s)).length >= 2,
    "deve ripulire la staging table"
  );
});

test("splits the insert into batches so it stays under max_allowed_packet", async () => {
  const conn = fakeConnection([]);
  global.connection = conn;

  await dao.syncTokenMetaDataInDB(tokens(1200));

  const inserts = conn.executed.filter((e) => /INSERT INTO token_metadata_staging/i.test(e.sql));
  assert.equal(inserts.length, 3);
  assert.deepEqual(
    inserts.map((i) => i.rows),
    [500, 500, 200]
  );
});

test("does nothing when the provider returns no tokens", async () => {
  const conn = fakeConnection([]);
  global.connection = conn;

  const result = await dao.syncTokenMetaDataInDB([]);

  assert.equal(result, "No tokens to sync");
  assert.equal(conn.executed.length, 0);
});

// ---------------------------------------------------------------------------
// La guardia sul dimagrimento del catalogo.
//
// Fino a ieri l'unico controllo era "almeno un token": una risposta degradata
// del fornitore sostituiva il catalogo con la sua scheggia, e la ricerca dei
// token restava mezza vuota fino alla notte dopo.
// ---------------------------------------------------------------------------

test("rifiuta di sostituire un catalogo molto piu' piccolo di quello in servizio", async () => {
  const conn = fakeConnection([], { inServizio: 29680 });
  global.connection = conn;

  await assert.rejects(() => dao.syncTokenMetaDataInDB(tokens(100)), /catalogo troppo piccolo/);

  const sqls = conn.executed.map((e) => e.sql);
  assert.ok(!sqls.some((s) => /RENAME TABLE/i.test(s)), "non deve scambiare niente");
  assert.ok(
    !sqls.some((s) => /CREATE TABLE token_metadata_staging/i.test(s)),
    "si ferma prima di costruire la staging table"
  );
});

test("un calo dentro la soglia passa", async () => {
  // Sette decimi di 100 sono 70: ottanta token sono un giorno in cui il
  // fornitore ha sfoltito, non un guasto.
  const conn = fakeConnection([], { inServizio: 100 });
  global.connection = conn;

  const esito = await dao.syncTokenMetaDataInDB(tokens(80));

  assert.equal(esito.affectedRows, 80);
  assert.equal(esito.inServizioPrima, 100);
  assert.ok(conn.executed.some((e) => /RENAME TABLE/i.test(e.sql)));
});

test("con la forzatura il catalogo piccolo passa comunque", async () => {
  const conn = fakeConnection([], { inServizio: 29680 });
  global.connection = conn;

  const esito = await dao.syncTokenMetaDataInDB(tokens(100), { forza: true });

  assert.equal(esito.affectedRows, 100);
  assert.ok(conn.executed.some((e) => /RENAME TABLE/i.test(e.sql)));
});

test("alla prima corsa non c'e' niente con cui confrontarsi", async () => {
  // Il conteggio non risponde perche' la tabella non esiste ancora: la
  // guardia non deve diventare il motivo per cui non si parte mai.
  const conn = fakeConnection([], { inServizio: null });
  global.connection = conn;

  const esito = await dao.syncTokenMetaDataInDB(tokens(3));

  assert.equal(esito.inServizioPrima, null);
  assert.ok(conn.executed.some((e) => /RENAME TABLE/i.test(e.sql)));
});

test("la soglia si puo' cambiare dall'ambiente", async () => {
  const prima = process.env.TOKEN_METADATA_MIN_RATIO;
  process.env.TOKEN_METADATA_MIN_RATIO = "0.1";
  try {
    const conn = fakeConnection([], { inServizio: 1000 });
    global.connection = conn;

    const esito = await dao.syncTokenMetaDataInDB(tokens(150));

    assert.equal(esito.affectedRows, 150);
  } finally {
    if (prima === undefined) delete process.env.TOKEN_METADATA_MIN_RATIO;
    else process.env.TOKEN_METADATA_MIN_RATIO = prima;
  }
});

// ---------------------------------------------------------------------------
// Una riga malata non butta via la corsa.
//
// Un `INSERT` da cinquecento righe cade tutto intero per colpa di una sola, e
// con `STRICT_TRANS_TABLES` il database rifiuta invece di troncare.
// ---------------------------------------------------------------------------

test("una riga rifiutata viene saltata e il resto del catalogo entra", async () => {
  const conn = fakeConnection(
    [
      {
        match: "INSERT INTO token_metadata_staging",
        error: "ER_DATA_TOO_LONG",
        // Il lotto intero, e poi la sola riga di T7.
        quando: (sql, params) => params[0].length > 1 || params[0][0][1] === "T7",
      },
    ],
    { inServizio: 10 }
  );
  global.connection = conn;

  const esito = await dao.syncTokenMetaDataInDB(tokens(10));

  assert.equal(esito.scartate, 1, "una sola riga scartata");
  assert.equal(esito.affectedRows, 9);
  assert.ok(conn.executed.some((e) => /RENAME TABLE/i.test(e.sql)), "il catalogo si scambia comunque");

  const singole = conn.executed.filter((e) => /INSERT INTO token_metadata_staging/i.test(e.sql) && e.rows === 1);
  assert.equal(singole.length, 10, "riprova riga per riga");
});

test("se cade tutto il lotto si ferma invece di scambiare un catalogo mutilato", async () => {
  // Non e' una riga malata: e' la connessione che si chiude o il pacchetto
  // troppo grande. Proseguire vorrebbe dire perdere cinquecento token senza
  // che nessuno se ne accorga.
  const conn = fakeConnection([{ match: "INSERT INTO token_metadata_staging", error: "PROTOCOL_CONNECTION_LOST" }], {
    inServizio: 600,
  });
  global.connection = conn;

  await assert.rejects(() => dao.syncTokenMetaDataInDB(tokens(600)), /batch rifiutato in blocco/);
  assert.ok(!conn.executed.some((e) => /RENAME TABLE/i.test(e.sql)));
});

// ---------------------------------------------------------------------------
// Il lucchetto.
//
// La tabella di scorta ha un nome fisso e la prima cosa che ogni corsa fa e'
// buttarla giu': due corse insieme -- la cron di mezzanotte e un lancio a
// mano -- si guastano a vicenda.
// ---------------------------------------------------------------------------

test("prende il lucchetto prima di toccare le tabelle e lo rilascia dopo", async () => {
  const conn = fakeConnection([], { inServizio: 3 });
  global.connection = conn;

  await dao.syncTokenMetaDataInDB(tokens(3));

  const sqls = conn.executed.map((e) => e.sql);
  const iLucchetto = sqls.findIndex((s) => /GET_LOCK/.test(s));
  const iCreazione = sqls.findIndex((s) => /CREATE TABLE token_metadata_staging/i.test(s));

  assert.ok(iLucchetto >= 0, "deve chiedere il lucchetto");
  assert.ok(iCreazione > iLucchetto, "prima il lucchetto, poi le tabelle");
  assert.ok(sqls.some((s) => /RELEASE_LOCK/.test(s)), "deve rilasciarlo");
  assert.equal(conn.rilasci, 1, "deve restituire la connessione alla riserva");
});

test("col lucchetto occupato non fa niente e non pulisce niente", async () => {
  // La tabella di scorta che si vede e' quella che l'altra corsa sta
  // riempiendo: buttarla giu' sarebbe il guasto che il lucchetto evita.
  const conn = fakeConnection([], { inServizio: 3, lucchettoOccupato: true });
  global.connection = conn;

  const esito = await dao.syncTokenMetaDataInDB(tokens(3));

  assert.equal(esito.saltata, true);
  const sqls = conn.executed.map((e) => e.sql);
  assert.ok(!sqls.some((s) => /DROP TABLE/i.test(s)), "non deve buttare giu' nessuna tabella");
  assert.ok(!sqls.some((s) => /RENAME TABLE/i.test(s)));
  assert.ok(!sqls.some((s) => /RELEASE_LOCK/.test(s)), "non si rilascia un lucchetto che non si ha");
  assert.equal(conn.rilasci, 1, "la connessione torna alla riserva comunque");
});

test("il lucchetto si rilascia anche se il lavoro cade", async () => {
  const conn = fakeConnection([{ match: "CREATE TABLE token_metadata_staging", error: "ER_TABLEACCESS_DENIED" }], {
    inServizio: 3,
  });
  global.connection = conn;

  await assert.rejects(() => dao.syncTokenMetaDataInDB(tokens(3)), /Error inserting token metadata/);

  assert.ok(conn.executed.some((e) => /RELEASE_LOCK/.test(e.sql)), "mai lasciarlo chiuso");
  assert.equal(conn.rilasci, 1);
});

test("il simbolo con l'emoji arriva intero", async () => {
  // Prima le emoji venivano tolte dal simbolo e dal nome, perche' la
  // connessione parlava utf8 a tre byte e il server avrebbe scritto quattro
  // punti di domanda al posto di ciascuna. Ora la connessione e' utf8mb4,
  // come le colonne.
  const conn = fakeConnection([], { inServizio: 1 });
  global.connection = conn;

  const rana = "PEPE \u{1F438}";
  await dao.syncTokenMetaDataInDB([
    { blockchain: "ETH", symbol: rana, name: "Pepe \u{1F438} Token", address: "0xaaa", decimals: 18 },
  ]);

  const inserimento = conn.executed.find(
    (e) => /INSERT INTO token_metadata_staging/i.test(e.sql) && e.rows === 1
  );
  assert.ok(inserimento, "l'inserimento c'e'");
  assert.equal(inserimento.valori[0][0][1], rana, "il simbolo non si tocca");
  assert.equal(inserimento.valori[0][0][2], "Pepe \u{1F438} Token");
});
