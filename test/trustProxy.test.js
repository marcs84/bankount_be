const test = require("node:test");
const assert = require("node:assert/strict");

const { interpretaFiducia } = require("../src/server/trustProxy");

test("reads a number of hops as a number", () => {
  // E' il motivo per cui questo modulo esiste: Express legge la stringa "1"
  // come un elenco di indirizzi che contiene "1", non combacia con niente, e
  // l'impostazione sembra applicata senza esserlo. Verificato su express.
  assert.equal(interpretaFiducia("1"), 1);
  assert.equal(interpretaFiducia("2"), 2);
  assert.equal(interpretaFiducia(" 1 "), 1);
  assert.equal(interpretaFiducia("0"), 0);
});

test("reads the two words that mean yes and no", () => {
  // `app.set("trust proxy", "true")` solleva "invalid IP address: true" e
  // ferma l'avvio del server.
  assert.equal(interpretaFiducia("true"), true);
  assert.equal(interpretaFiducia("false"), false);
});

test("nothing means trust nothing", () => {
  assert.equal(interpretaFiducia(""), false);
  assert.equal(interpretaFiducia("   "), false);
});

test("leaves an address list to Express, which knows how to read it", () => {
  assert.equal(interpretaFiducia("loopback"), "loopback");
  assert.equal(interpretaFiducia("127.0.0.1"), "127.0.0.1");
  assert.equal(interpretaFiducia("loopback, 10.0.0.0/8"), "loopback, 10.0.0.0/8");
  assert.equal(interpretaFiducia("uniquelocal"), "uniquelocal");
});

test("hands back anything that is not a string as it is", () => {
  // Chi passa un booleano o una funzione sa cosa sta facendo: e' la forma che
  // Express accetta direttamente.
  assert.equal(interpretaFiducia(true), true);
  assert.equal(interpretaFiducia(2), 2);
  assert.equal(interpretaFiducia(undefined), undefined);
});
