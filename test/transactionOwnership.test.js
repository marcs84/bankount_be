const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");

function capturingConnection(rowsByShape = {}) {
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

      if (/FROM addresses WHERE wallet_id/i.test(flat)) return cb(null, rowsByShape.walletAddresses || []);
      if (/FROM transactions t/i.test(flat)) return cb(null, rowsByShape.transactions || []);
      return cb(null, []);
    },
  };
}

const saved = global.connection;
test.afterEach(() => {
  global.connection = saved;
});

test("resolves ownership through the device addresses, not the transaction wallet", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.filterTransactions({ device_id: 7, wallet_id: "w-1", limit: 10, offset: 0 });

  const main = conn.executed.find((e) => /FROM transactions t/i.test(e.sql));
  assert.ok(main, "la query principale deve essere eseguita");
  assert.ok(/EXISTS \( SELECT 1 FROM addresses a/i.test(main.sql), "deve risolvere la proprieta' dagli indirizzi");
  assert.ok(!/JOIN wallet w ON t\.wallet_id/i.test(main.sql), "non deve piu' legarsi a transactions.wallet_id");
  assert.ok(!/AND t\.wallet_id = \?/i.test(main.sql), "il wallet non deve filtrare la colonna della transazione");
});

test("scopes the addresses to the selected wallet", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.filterTransactions({ device_id: 7, wallet_id: "w-1", limit: 10, offset: 0 });

  const main = conn.executed.find((e) => /FROM transactions t/i.test(e.sql));
  assert.ok(/AND a\.wallet_id = \?/i.test(main.sql), "deve limitare gli indirizzi al wallet scelto");
  assert.deepEqual(main.params.slice(0, 2), [7, "w-1"], "device e wallet nell'ordine dei segnaposto");
});

test("omits the wallet scope when the caller does not pass one", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.filterTransactions({ device_id: 7, limit: 10, offset: 0 });

  const main = conn.executed.find((e) => /FROM transactions t/i.test(e.sql));
  assert.ok(!/a\.wallet_id = \?/i.test(main.sql));
  assert.ok(!/\{\{WALLET_SCOPE\}\}/.test(main.sql), "il segnaposto deve essere sempre sostituito");
  assert.deepEqual(main.params.slice(0, 1), [7]);
});

test("keeps the other filters and their parameter order", async () => {
  const conn = capturingConnection();
  global.connection = conn;

  await dao.filterTransactions({
    device_id: 7,
    wallet_id: "w-1",
    start_date: "2026-01-01",
    end_date: "2026-01-31",
    chain: "ETH",
    network_type: "TESTNET",
    limit: 20,
    offset: 2,
  });

  const main = conn.executed.find((e) => /FROM transactions t/i.test(e.sql));
  assert.deepEqual(main.params, [7, "w-1", "2026-01-01", "2026-01-31", "ETH", "TESTNET", 20, 40]);
});

test("marks a transaction outgoing when the wallet owns the sender", async () => {
  const conn = capturingConnection({
    transactions: [{ id: 1, from_address: "0xmine", destination_address: "0xother" }],
    walletAddresses: [{ address: "0xmine" }],
  });
  global.connection = conn;

  const { transactions } = await dao.filterTransactions({ device_id: 7, wallet_id: "w-1" });

  assert.equal(transactions[0].transaction_type, "outgoing");
});

test("marks a transaction incoming when the wallet owns the recipient", async () => {
  const conn = capturingConnection({
    transactions: [{ id: 1, from_address: "0xother", destination_address: "0xmine" }],
    walletAddresses: [{ address: "0xmine" }],
  });
  global.connection = conn;

  const { transactions } = await dao.filterTransactions({ device_id: 7, wallet_id: "w-1" });

  assert.equal(transactions[0].transaction_type, "incoming");
});
