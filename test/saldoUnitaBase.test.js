const test = require("node:test");
const assert = require("node:assert/strict");

const utils = require("../src/utils");

/// Il saldo in unita' base, che viaggia accanto al numero.
///
/// Con diciotto decimali un double non basta: un saldo di 54147802024792520
/// wei sta **sei volte oltre** 2^53, e lo stesso double si scrive
/// `0.05414780202479252` o `0.054147802024792517` a seconda di come lo si
/// stampa. Il numero resta per le applicazioni gia' installate; il valore
/// esatto e' la stringa intera che il nodo ha risposto.

test("il caso misurato: il double perde, la stringa no", () => {
  const wei = "54147802024792520";

  // Esatto, cifra per cifra.
  assert.equal(utils.amountFromRawUnits(wei, 18), "0.05414780202479252");

  // Lo stesso valore passato da un double non torna indietro uguale:
  // 2^53 e' 9007199254740992, e questo saldo lo supera di sei volte.
  assert.ok(BigInt(wei) > BigInt(2) ** BigInt(53) * BigInt(6));
});

test("i wei tornano la stringa decimale esatta", () => {
  assert.equal(utils.amountFromRawUnits("1", 18), "0.000000000000000001");
  assert.equal(utils.amountFromRawUnits("1000000000000000000", 18), "1");
  assert.equal(utils.amountFromRawUnits("1234567890123456789", 18), "1.234567890123456789");
});

test("ogni catena coi suoi decimali", () => {
  assert.equal(utils.amountFromRawUnits("3939259", 9), "0.003939259"); // SOL, lamport
  assert.equal(utils.amountFromRawUnits("525149", 8), "0.00525149"); // BTC, satoshi
});

test("lo zero e cio' che non e' un intero non passano", () => {
  assert.equal(utils.amountFromRawUnits("0", 18), "0");
  assert.equal(utils.amountFromRawUnits("1.5", 18), null);
  assert.equal(utils.amountFromRawUnits("-1", 18), null);
  assert.equal(utils.amountFromRawUnits("", 18), null);
  assert.equal(utils.amountFromRawUnits(null, 18), null);
  assert.equal(utils.amountFromRawUnits("1", null), null);
});

test("il saldo di Bitcoin sottrae il non confermato solo quando e' negativo", () => {
  // La regola che il core applica in satoshi, con interi invece che con una
  // divisione in virgola mobile.
  const effettivi = (confermati, nonConfermati) => {
    const c = BigInt(confermati);
    const n = BigInt(nonConfermati);
    return (n < 0n ? c + n : c).toString();
  };

  assert.equal(effettivi("525149", "0"), "525149");
  assert.equal(effettivi("525149", "-1200"), "523949");
  // Un non confermato in entrata non si somma: non e' ancora disponibile.
  assert.equal(effettivi("525149", "70000"), "525149");
});
