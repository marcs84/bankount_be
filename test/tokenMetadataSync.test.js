const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");

function fakeConnection(script) {
  const executed = [];
  return {
    executed,
    query(sql, params, cb) {
      if (typeof params === "function") {
        cb = params;
        params = undefined;
      }
      executed.push({ sql: sql.replace(/\s+/g, " ").trim(), rows: params && params[0] ? params[0].length : 0 });
      const failure = script.find((s) => sql.includes(s.match));
      if (failure) return cb(new Error(failure.error));
      cb(null, {});
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
