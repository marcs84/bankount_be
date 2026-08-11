const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const risolto = require.resolve(path.join(__dirname, "..", "src/sysLogger.js"));
const registrati = [];
require.cache[risolto] = {
  id: risolto,
  filename: risolto,
  loaded: true,
  exports: { logToDb: (tipo, azione, dettaglio) => registrati.push({ tipo, azione, dettaglio }) },
};

const { hideInternalErrors, MESSAGGIO_NEUTRO } = require("../src/server/errorResponse");

const contesto = (statusCode) => {
  const req = { originalUrl: "/api/qualcosa", method: "GET", path: "/api/qualcosa" };
  const res = { statusCode, inviato: null };
  res.json = (body) => {
    res.inviato = body;
    return res;
  };
  hideInternalErrors(req, res, () => {});
  return { req, res };
};

test("withholds the internal detail of a failure from the caller", () => {
  registrati.length = 0;
  const { res } = contesto(500);

  res.json({
    result: false,
    message: "An error occurred while retrieving list of transactions: Unknown column 'wallets.id'",
    error: "Unknown column 'wallets.id' in 'field list'",
  });

  assert.deepEqual(res.inviato, { result: false, message: MESSAGGIO_NEUTRO });
  assert.ok(!JSON.stringify(res.inviato).includes("wallets"), "nessun frammento di query deve raggiungere il chiamante");
});

test("keeps the detail where it is useful, in the log", () => {
  registrati.length = 0;
  const { res } = contesto(500);

  res.json({ result: false, message: "boom", error: "dettaglio interno" });

  assert.equal(registrati.length, 1);
  assert.equal(registrati[0].dettaglio.error, "dettaglio interno");
  assert.equal(registrati[0].dettaglio.path, "/api/qualcosa");
});

test("leaves the successful responses untouched", () => {
  const { res } = contesto(200);
  const corpo = { result: true, data: { addresses: [1, 2, 3] } };

  res.json(corpo);

  assert.deepEqual(res.inviato, corpo);
});

test("leaves the client errors untouched, they explain what to correct", () => {
  for (const stato of [400, 401, 404, 429]) {
    const { res } = contesto(stato);
    const corpo = { result: false, message: "wallet_id is required" };

    res.json(corpo);

    assert.deepEqual(res.inviato, corpo, `lo stato ${stato} deve conservare il messaggio`);
  }
});
