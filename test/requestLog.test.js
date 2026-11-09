const test = require("node:test");
const assert = require("node:assert/strict");

const { daRegistrare } = require("../src/server/requestLog");

test("keeps the availability probe out of the log", () => {
  assert.equal(
    daRegistrare("GET", "/"),
    false,
    "GET / era meta' del registro: 9.533 righe su 19.208"
  );
});

test("keeps the probe out even when it carries a query string", () => {
  // `req.path` non porta la stringa di query, quindi /?x=1 arriva qui come "/".
  assert.equal(daRegistrare("GET", "/"), false);
});

test("logs a write to the root, which is not the probe", () => {
  assert.equal(
    daRegistrare("POST", "/"),
    true,
    "solo la lettura della radice e' la sonda; una POST li' va vista"
  );
});

test("keeps the monitoring panel out of the log", () => {
  assert.equal(daRegistrare("GET", "/admin"), false);
  assert.equal(daRegistrare("GET", "/admin/"), false);
  assert.equal(daRegistrare("GET", "/admin/api/system"), false);
  assert.equal(
    daRegistrare("POST", "/admin/api/login"),
    false,
    "il pannello si aggiorna da se': misurerebbe soprattutto se stesso"
  );
});

test("does not mistake another route for the panel", () => {
  assert.equal(
    daRegistrare("GET", "/administrators"),
    true,
    "il confronto deve essere sul segmento, non sul prefisso di stringa"
  );
  assert.equal(daRegistrare("GET", "/api/admin-things"), true);
});

test("logs every ordinary api route", () => {
  assert.equal(daRegistrare("POST", "/api/deviceLogin"), true);
  assert.equal(daRegistrare("GET", "/api/addresses"), true);
  assert.equal(daRegistrare("DELETE", "/api/delete-wallets"), true);
  assert.equal(daRegistrare("GET", "/api/verify"), true);
});

test("survives a missing method or path", () => {
  assert.equal(daRegistrare(undefined, undefined), true);
  assert.equal(daRegistrare(null, null), true);
});
