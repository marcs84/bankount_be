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

function walletConnection(posseduti = [], conIndirizzi = null) {
  const executed = [];
  const conn = {
    beginTransaction: (cb) => cb(null),
    commit: (cb) => cb(null),
    rollback: (cb) => cb(),
    release: () => {},
    destroy: () => {},
    query(sql, params, cb) {
      executed.push({ sql: sql.replace(/\s+/g, " ").trim(), params });
      if (/^DELETE FROM wallet /i.test(sql)) return cb(null, { affectedRows: params.length });
      return cb(null, {});
    },
  };
  return {
    executed,
    getConnection: (cb) => cb(null, conn),
    query(sql, params, cb) {
      executed.push({ sql: sql.replace(/\s+/g, " ").trim(), params });
      if (/^SELECT id FROM wallet/i.test(sql)) return cb(null, posseduti.map((id) => ({ id })));
      if (/^SELECT DISTINCT wallet_id FROM addresses/i.test(sql)) {
        const righe = conIndirizzi === null ? posseduti : conIndirizzi;
        return cb(null, righe.map((wallet_id) => ({ wallet_id })));
      }
      return cb(null, []);
    },
  };
}

test("deletes only the wallets that belong to the device", async () => {
  const conn = walletConnection(["w-mio"]);
  global.connection = conn;

  const eliminati = await dao.deleteWallets(["w-mio", "w-altrui"], 42);

  const check = conn.executed.find((e) => /^SELECT id FROM wallet/i.test(e.sql));
  assert.ok(/AND device_id = \?$/.test(check.sql), "il possesso va verificato prima di cancellare");
  assert.deepEqual(check.params, ["w-mio", "w-altrui", 42]);

  const del = conn.executed.find((e) => /^DELETE FROM wallet /i.test(e.sql));
  assert.deepEqual(del.params, ["w-mio"], "il wallet altrui non deve essere toccato");
  assert.equal(eliminati, 1);
});

test("touches nothing when no requested wallet belongs to the device", async () => {
  const conn = walletConnection([]);
  global.connection = conn;

  assert.equal(await dao.deleteWallets(["w-altrui"], 42), 0);
  assert.ok(
    !conn.executed.some((e) => /^DELETE/i.test(e.sql)),
    "nessuna cancellazione, nemmeno degli indirizzi"
  );
});

// Una creazione interrotta a meta' lascia la riga locale, e la
// sincronizzazione spinge qui gli indirizzi senza che il portafoglio sia mai
// arrivato. Verificando il possesso solo su `wallet` quelle righe non si
// potevano piu' togliere, e le notifiche si mirano proprio dagli indirizzi.
test("removes the addresses of a wallet whose row never arrived", async () => {
  const conn = walletConnection([], ["w-senza-riga"]);
  global.connection = conn;

  const tolte = await dao.deleteWallets(["w-senza-riga"], 42);

  const del = conn.executed.find((e) => /^DELETE FROM addresses/i.test(e.sql));
  assert.ok(del, "gli indirizzi vanno tolti anche senza la riga del portafoglio");
  assert.deepEqual(del.params, ["w-senza-riga", 42], "il possesso si verifica sul dispositivo");
  assert.ok(
    !conn.executed.some((e) => /^DELETE FROM wallet /i.test(e.sql)),
    "non c'e' nessuna riga di portafoglio da togliere"
  );
  assert.ok(tolte > 0, "zero vorrebbe dire 404, e qualcosa invece e' stato tolto");
});

test("does not touch addresses of another device when the wallet row is missing", async () => {
  const conn = walletConnection([], []);
  global.connection = conn;

  // Nessuna riga di portafoglio e nessun indirizzo di questo dispositivo:
  // la richiesta non trova niente di suo.
  assert.equal(await dao.deleteWallets(["w-altrui"], 42), 0);
  assert.ok(
    !conn.executed.some((e) => /^DELETE/i.test(e.sql)),
    "senza niente di proprio non si cancella nulla"
  );
});

function addressConnection(righeDopo = []) {
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

      if (/^UPDATE addresses/i.test(flat)) return cb(null, { affectedRows: 0 });
      if (/FROM addresses WHERE id = \?/i.test(flat)) return cb(null, righeDopo);
      if (/^SELECT 1 FROM wallet/i.test(flat)) return cb(null, righeDopo);
      if (/^DELETE FROM bookmarked_tokens/i.test(flat)) return cb(null, { affectedRows: righeDopo.length });
      return cb(null, []);
    },
  };
}

test("confirms wallet ownership before writing into it", async () => {
  const conn = addressConnection([{ 1: 1 }]);
  global.connection = conn;

  assert.equal(await dao.isWalletOwnedByDevice("w-1", 42), true);
  const check = conn.executed[0];
  assert.ok(/WHERE id = \? AND device_id = \? LIMIT 1$/.test(check.sql));
  assert.deepEqual(check.params, ["w-1", 42]);
});

test("denies ownership of a wallet of another device", async () => {
  global.connection = addressConnection([]);

  assert.equal(await dao.isWalletOwnedByDevice("w-1", 999), false);
});

test("scopes an address rename to owner and wallet", async () => {
  const conn = addressConnection([{ id: 7, address_name: "Casa" }]);
  global.connection = conn;

  const riga = await dao.updateAddressName(42, "w-1", 7, "Casa");

  const update = conn.executed.find((e) => /^UPDATE addresses/i.test(e.sql));
  assert.ok(/WHERE id_utente = \? AND wallet_id = \? AND id = \?$/.test(update.sql));
  assert.deepEqual(update.params, ["Casa", 42, "w-1", 7]);

  const reread = conn.executed.find((e) => /FROM addresses WHERE id = \?/i.test(e.sql));
  assert.ok(/AND id_utente = \? AND wallet_id = \?$/.test(reread.sql), "la rilettura ripete il vincolo sul proprietario");
  assert.deepEqual(riga, { id: 7, address_name: "Casa" }, "rinominare con lo stesso nome non deve fallire");
});

test("reports no address when it belongs to another device", async () => {
  global.connection = addressConnection([]);

  assert.equal(await dao.updateAddressName(999, "w-1", 7, "Casa"), null);
});

test("scopes a bookmark removal to the device that owns it", async () => {
  const conn = addressConnection([{ id: 3 }]);
  global.connection = conn;

  const rimossi = await dao.removeBookmarkedToken(3, 42);

  const del = conn.executed.find((e) => /^DELETE FROM bookmarked_tokens/i.test(e.sql));
  assert.ok(/WHERE id = \? AND user_id = \?$/.test(del.sql));
  assert.deepEqual(del.params, [3, 42]);
  assert.equal(rimossi, 1);
});

test("looks a wallet up by its identifier, not by a number parsed out of it", async () => {
  const conn = addressConnection([{ id: "6f3dc28d-b4bd-431e-8266-87b589ab0ff1" }]);
  global.connection = conn;

  await dao.isWalletOwnedByDevice("6f3dc28d-b4bd-431e-8266-87b589ab0ff1", 42);

  assert.deepEqual(
    conn.executed[0].params,
    ["6f3dc28d-b4bd-431e-8266-87b589ab0ff1", 42],
    "gli identificativi dei wallet sono uuid: troncarli a numero li rende un altro wallet"
  );
});

test("removes the addresses of a wallet from the table that exists", async () => {
  const conn = walletConnection(["w-mio"]);
  global.connection = conn;

  await dao.deleteWallets(["w-mio"], 42);

  const del = conn.executed.find((e) => /^DELETE FROM wallet /i.test(e.sql));
  assert.ok(del, "la tabella si chiama wallet, non wallets");
  assert.ok(conn.executed.some((e) => /^DELETE FROM addresses/i.test(e.sql)));
});
