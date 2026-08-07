const test = require("node:test");
const assert = require("node:assert/strict");

const { redact } = require("../src/server/redact");

test("removes the passkey from a device login body", () => {
  const out = redact({ identifier: "abc123", passkey: "s3cret", device_token: "fcm-token" });

  assert.equal(out.identifier, "abc123");
  assert.equal(out.passkey, "[redacted]");
  assert.equal(out.device_token, "[redacted]");
});

test("removes the token from a login response", () => {
  const out = redact({ result: true, data: { token: "eyJhbGciOiJIUzI1NiJ9.x.y", id: 42 } });

  assert.equal(out.data.token, "[redacted]");
  assert.equal(out.data.id, 42);
});

test("redacts inside a response serialised as a json string", () => {
  const out = redact(JSON.stringify({ data: { token: "eyJabc", id: 7 } }));

  assert.ok(!out.includes("eyJabc"), "il token non deve comparire");
  assert.ok(out.includes("[redacted]"));
  assert.ok(out.includes('"id":7'));
});

test("redacts sensitive keys whatever their casing", () => {
  const out = redact({ Passkey: "x", AUTHORIZATION: "Bearer y", Mnemonic: "word ".repeat(12) });

  assert.equal(out.Passkey, "[redacted]");
  assert.equal(out.AUTHORIZATION, "[redacted]");
  assert.equal(out.Mnemonic, "[redacted]");
});

test("walks arrays and nested objects", () => {
  const out = redact({ items: [{ passkey: "a" }, { nested: { seed: "b", name: "keep" } }] });

  assert.equal(out.items[0].passkey, "[redacted]");
  assert.equal(out.items[1].nested.seed, "[redacted]");
  assert.equal(out.items[1].nested.name, "keep");
});

test("leaves harmless payloads untouched", () => {
  const body = { wallet_id: "w-1", coin_type: "ETH", network: "TESTNET" };

  assert.deepEqual(redact(body), body);
});

test("survives null, undefined and cyclic-free primitives", () => {
  assert.equal(redact(null), null);
  assert.equal(redact(undefined), undefined);
  assert.equal(redact(5), 5);
  assert.equal(redact("plain"), "plain");
});
