const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");

function capturingConnection(risposte = {}) {
  const executed = [];
  return {
    executed,
    query(sql, params, cb) {
      if (typeof params === "function") {
        cb = params;
        params = undefined;
      }
      const flat = sql.replace(/\s+/g, " ").trim();
      executed.push({ sql: flat, params });

      if (/^UPDATE custom_urls/i.test(flat)) return cb(null, { affectedRows: risposte.updateAffected ?? 1 });
      if (/^DELETE FROM custom_urls/i.test(flat)) return cb(null, { affectedRows: risposte.deleteAffected ?? 1 });
      if (/^SELECT \* FROM custom_urls/i.test(flat)) return cb(null, risposte.righe ?? [{ id: 5, user_id: 42 }]);
      return cb(null, []);
    },
  };
}

const saved = global.connection;
test.afterEach(() => {
  global.connection = saved;
});

test("scopes a custom chain url update to the device that owns it", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.updateCustomChainUrl(5, 42, "https://nodo.example", null);

  const update = conn.executed.find((e) => /^UPDATE custom_urls/i.test(e.sql));
  assert.ok(/WHERE id = \? AND user_id = \?$/.test(update.sql), "l'aggiornamento deve vincolare il proprietario");
  assert.deepEqual(update.params, ["https://nodo.example", 5, 42]);
});

test("reports nothing changed when the url belongs to someone else", async () => {
  const conn = capturingConnection({ updateAffected: 0 });
  global.connection = conn;

  const esito = await dao.updateCustomChainUrl(5, 999, "https://nodo.example", null);

  assert.equal(esito, null, "un identificativo indovinato non deve poter dirottare il nodo di un altro wallet");
  assert.ok(
    !conn.executed.some((e) => /^SELECT \* FROM custom_urls/i.test(e.sql)),
    "senza righe toccate non deve nemmeno rileggere la riga"
  );
});

test("builds the update from the fields actually provided", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.updateCustomChainUrl(5, 42, null, "https://explorer.example");

  const update = conn.executed.find((e) => /^UPDATE custom_urls/i.test(e.sql));
  assert.ok(/SET explorer_url = \? WHERE/.test(update.sql), "niente virgole o spazi mancanti nella SET");
  assert.deepEqual(update.params, ["https://explorer.example", 5, 42]);
});

test("refuses an update with no field to change", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await assert.rejects(() => dao.updateCustomChainUrl(5, 42, null, null));
  assert.equal(conn.executed.length, 0, "non deve raggiungere il database con una SET vuota");
});

test("scopes a custom chain url deletion to the device that owns it", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  const rimosse = await dao.deleteCustomChainUrl(5, 42);

  const del = conn.executed.find((e) => /^DELETE FROM custom_urls/i.test(e.sql));
  assert.ok(/WHERE id = \? AND user_id = \?$/.test(del.sql), "la cancellazione deve vincolare il proprietario");
  assert.deepEqual(del.params, [5, 42]);
  assert.equal(rimosse, 1);
});

test("reports nothing removed when the url belongs to someone else", async () => {
  const conn = capturingConnection({ deleteAffected: 0 });
  global.connection = conn;

  assert.equal(await dao.deleteCustomChainUrl(5, 999), 0);
});
