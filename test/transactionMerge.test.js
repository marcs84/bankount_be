const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");

function fakeTransactionsTable() {
  const rows = [];
  let nextId = 1;

  return {
    rows,
    query(sql, params, cb) {
      if (typeof params === "function") {
        cb = params;
        params = [];
      }
      const flat = sql.replace(/\s+/g, " ").trim();

      if (/^SELECT \* FROM transactions WHERE tx = \? AND from_address/i.test(flat)) {
        const [tx, from, to, network] = params;
        return cb(
          null,
          rows.filter(
            (r) => r.tx === tx && r.from_address === from && r.destination_address === to && r.network_type === network
          )
        );
      }

      if (/^SELECT \* FROM transactions WHERE id = \?$/i.test(flat)) {
        return cb(null, rows.filter((r) => r.id === params[0]));
      }

      if (/^INSERT INTO transactions\(/i.test(flat)) {
        const columns = flat
          .match(/^INSERT INTO transactions\(([^)]+)\)/i)[1]
          .split(",")
          .map((c) => c.trim());
        const row = { id: nextId++ };
        columns.forEach((column, i) => {
          row[column] = params[i] === undefined ? null : params[i];
        });
        rows.push(row);
        return cb(null, { insertId: row.id, affectedRows: 1 });
      }

      if (/^UPDATE transactions SET/i.test(flat)) {
        const assignments = flat
          .match(/^UPDATE transactions SET (.+) WHERE id = \?$/i)[1]
          .split(/,\s*(?=[a-z_]+ =)/i);
        const row = rows.find((r) => r.id === params[params.length - 1]);
        assignments.forEach((assignment, i) => {
          const parsed = assignment.trim().match(/^([a-z_]+) = COALESCE\(\?, \1\)$/i);
          assert.ok(parsed, `l'aggiornamento di ${assignment.trim()} deve conservare il valore esistente`);
          const value = params[i];
          if (value !== null && value !== undefined) {
            row[parsed[1]] = value;
          }
        });
        return cb(null, { affectedRows: 1 });
      }

      return cb(null, []);
    },
  };
}

const movement = {
  tx: "0x3b8a5788694721f05a210da4fe5e790f5e7dc2da434f62f226054f65d08cd2ec",
  from_address: "0x33dc6397deda3066ca93a9a42ea563390f02e680",
  destination_address: "0xe1fce8d1885c4207ed213f643fe8f4acf721b8d6",
  network_type: "TESTNET",
  chain: "ETH",
  amount: 0.0001,
};

const fromApp = () => ({
  ...movement,
  isHistoryReceivedFromWebhook: false,
  chain_id: null,
  block_number: null,
  gas: null,
  gas_price: null,
  type: null,
  block_hash: null,
  input: null,
});

const fromWebhook = () => ({
  ...movement,
  isHistoryReceivedFromWebhook: true,
  chain_id: 11155111,
  block_number: 11456801,
  gas: 21000,
  gas_price: 1500000000,
  type: "Legacy (Type 0)",
  block_hash: "0xblock",
  input: "0x",
});

const saved = global.connection;
test.afterEach(() => {
  global.connection = saved;
});

test("keeps the on-chain data when the app writes after the webhook", async () => {
  const db = fakeTransactionsTable();
  global.connection = db;

  await dao.insertTransactionNew(fromWebhook());
  await dao.insertTransactionNew(fromApp());

  assert.equal(db.rows.length, 1, "lo stesso movimento non deve produrre due righe");
  const row = db.rows[0];
  assert.equal(row.block_number, 11456801, "il blocco non deve essere azzerato");
  assert.equal(row.chain_id, 11155111);
  assert.equal(row.block_hash, "0xblock");
  assert.equal(row.type, "Legacy (Type 0)");
  assert.equal(row.gas, 21000);
  assert.equal(row.tx_status, "success");
});

test("completes the pending row when the webhook writes after the app", async () => {
  const db = fakeTransactionsTable();
  global.connection = db;

  await dao.insertTransactionNew(fromApp());
  assert.equal(db.rows[0].tx_status, "pending");

  await dao.insertTransactionNew(fromWebhook());

  assert.equal(db.rows.length, 1);
  const row = db.rows[0];
  assert.equal(row.tx_status, "success");
  assert.equal(row.block_number, 11456801);
  assert.equal(row.block_hash, "0xblock");
});

test("does not confirm a transaction the app writes twice", async () => {
  const db = fakeTransactionsTable();
  global.connection = db;

  await dao.insertTransactionNew(fromApp());
  await dao.insertTransactionNew(fromApp());

  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].tx_status, "pending", "solo il webhook conferma il movimento");
});

test("returns the row it wrote when the transaction carries several transfers", async () => {
  const db = fakeTransactionsTable();
  global.connection = db;

  const first = await dao.insertTransactionNew(fromWebhook());
  const second = await dao.insertTransactionNew({
    ...fromWebhook(),
    destination_address: "0x0000000000000000000000000000000000000042",
    amount: 5,
  });

  assert.equal(db.rows.length, 2, "due trasferimenti nella stessa tx sono due movimenti");
  assert.notEqual(first.id, second.id);
  assert.equal(second.destination_address, "0x0000000000000000000000000000000000000042");
  assert.equal(second.amount, 5, "la rilettura non deve restituire l'altro trasferimento");
});

test("reports the stored confirmation state to the caller", async () => {
  const db = fakeTransactionsTable();
  global.connection = db;

  const pending = await dao.insertTransactionNew(fromApp());
  assert.equal(pending.tx_status, "pending");

  const confirmed = await dao.insertTransactionNew(fromWebhook());
  assert.equal(confirmed.tx_status, "success");
});
