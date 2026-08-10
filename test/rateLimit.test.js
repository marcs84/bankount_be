const test = require("node:test");
const assert = require("node:assert/strict");

const { loginKey } = require("../src/server/rateLimit");

test("counts the attempts against the identifier when the caller sends one", () => {
  const key = loginKey({ body: { identifier: "device-42" }, ip: "203.0.113.7" });

  assert.equal(key, "device-42", "cambiare indirizzo non deve azzerare il contatore");
});

test("falls back to the address when there is no identifier", () => {
  const key = loginKey({ body: {}, ip: "203.0.113.7" });

  assert.equal(key, "203.0.113.7");
});

test("treats an IPv6 range as a single origin", () => {
  const first = loginKey({ body: {}, ip: "2001:db8:1234:5678:aaaa:bbbb:cccc:dddd" });
  const second = loginKey({ body: {}, ip: "2001:db8:1234:5678:1111:2222:3333:4444" });

  assert.equal(first, second, "chi controlla un intervallo IPv6 non deve avere un contatore per indirizzo");
  assert.match(first, /\/\d+$/, "la chiave deve essere una sottorete, non un singolo indirizzo");
});

test("keeps distinct IPv6 ranges apart", () => {
  const mine = loginKey({ body: {}, ip: "2001:db8:1234:5678::1" });
  const other = loginKey({ body: {}, ip: "2001:db8:9999:0000::1" });

  assert.notEqual(mine, other, "reti diverse non devono condividere il limite");
});
