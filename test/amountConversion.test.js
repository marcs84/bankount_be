const test = require("node:test");
const assert = require("node:assert/strict");

const { amountFromRawUnits } = require("../src/utils");
const { convertCoinsToAmount } = require("../src/service");

const rates = {
  ethereum: { usd: 3000, eur: 2800 },
  solana: { usd: 150 },
  bitcoin: { usd: 60000 },
  binancecoin: { usd: 600 },
};

test("rebuilds a token amount from its smallest units", () => {
  assert.equal(amountFromRawUnits("1000000", 6), "1");
  assert.equal(amountFromRawUnits("1500000", 6), "1.5");
  assert.equal(amountFromRawUnits("1", 18), "0.000000000000000001");
  assert.equal(amountFromRawUnits("2500", 2), "25");
  assert.equal(amountFromRawUnits("42", 0), "42");
});

test("keeps the precision of amounts a double could not hold", () => {
  assert.equal(amountFromRawUnits("123456789012345678901", 18), "123.456789012345678901");
});

test("gives up instead of inventing an amount", () => {
  assert.equal(amountFromRawUnits("1000000", null), null, "senza decimali il grezzo non e' interpretabile");
  assert.equal(amountFromRawUnits(null, 18), null);
  assert.equal(amountFromRawUnits("non un numero", 18), null);
  assert.equal(amountFromRawUnits("-100", 18), null);
  assert.equal(amountFromRawUnits("100", 99), null);
});

test("converts the known chains", () => {
  assert.equal(convertCoinsToAmount("ETH", 2, "usd", rates), 6000);
  assert.equal(convertCoinsToAmount("BNB", 1, "usd", rates), 600);
  assert.equal(convertCoinsToAmount("Bitcoin", 0.5, "usd", rates), 30000);
});

test("accepts the currency in either case", () => {
  assert.equal(convertCoinsToAmount("ETH", 1, "USD", rates), 3000, "l'app puo' mandare la valuta in maiuscolo");
  assert.equal(convertCoinsToAmount("ETH", 1, "EUR", rates), 2800);
});

test("returns null rather than undefined for an unknown chain", () => {
  assert.equal(convertCoinsToAmount("MATIC", 1, "usd", rates), null);
  assert.equal(convertCoinsToAmount(undefined, 1, "usd", rates), null);
});

test("returns null rather than NaN when the amount is missing", () => {
  assert.equal(convertCoinsToAmount("ETH", NaN, "usd", rates), null);
  assert.equal(convertCoinsToAmount("ETH", parseFloat(null), "usd", rates), null, "una riga senza importo non deve produrre NaN");
});

test("returns null when the rate is unavailable", () => {
  assert.equal(convertCoinsToAmount("SOL", 1, "eur", rates), null);
  assert.equal(convertCoinsToAmount("ETH", 1, "usd", null), null);
  assert.equal(convertCoinsToAmount("ETH", 1, "usd", {}), null);
});
