const test = require("node:test");
const assert = require("node:assert/strict");

const { verificaUrlEsterno } = require("../src/server/nodeUrl");

const pubblico = { risolvi: async () => [{ address: "104.18.32.7", family: 4 }] };
const versoLoopback = { risolvi: async () => [{ address: "127.0.0.1", family: 4 }] };
const nonRisolvibile = {
  risolvi: async () => {
    throw new Error("ENOTFOUND");
  },
};

test("accepts the address of a public node", async () => {
  const esito = await verificaUrlEsterno("https://cold-fine.quiknode.pro/abc/", pubblico);

  assert.equal(esito.ok, true);
});

test("treats an absent value as nothing to change", async () => {
  for (const valore of [null, undefined, ""]) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, true, `${valore} doveva essere trattato come assente`);
    assert.equal(esito.assente, true);
  }
});

test("refuses anything that is not https", async () => {
  for (const valore of ["http://example.com", "javascript:alert(1)", "data:text/html,x", "file:///etc/passwd", "ftp://example.com"]) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, false, `${valore} doveva essere respinto`);
  }
});

test("refuses the loopback and the private ranges by literal address", async () => {
  const casi = [
    "https://127.0.0.1:8545",
    "https://10.0.0.5/",
    "https://172.16.4.4/",
    "https://192.168.1.10/",
    "https://100.64.0.1/",
    "https://0.0.0.0/",
    "https://[::1]/",
    "https://[fd00::1]/",
    "https://[fe80::1]/",
    "https://[::ffff:127.0.0.1]/",
    "https://[::ffff:7f00:1]/",
    "https://[::ffff:10.0.0.5]/",
    "https://[0:0:0:0:0:0:0:1]/",
    "https://[fc00::abcd]/",
    "https://[febf::1]/",
  ];
  for (const valore of casi) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, false, `${valore} doveva essere respinto`);
  }
});

test("still accepts a public IPv6 node", async () => {
  for (const valore of ["https://[2606:4700::6810:85e5]/", "https://[2001:4860:4860::8888]/"]) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, true, `${valore} doveva essere ammesso`);
  }
});

test("refuses the address that serves cloud instance metadata", async () => {
  const esito = await verificaUrlEsterno("https://169.254.169.254/latest/meta-data/", pubblico);

  assert.equal(esito.ok, false, "e' l'obiettivo classico di una richiesta forzata dal server");
});

test("refuses the names that point at the machine itself", async () => {
  for (const valore of ["https://localhost/rpc", "https://api.localhost/", "https://nodo.internal/", "https://nodo.local/"]) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, false, `${valore} doveva essere respinto`);
  }
});

test("refuses credentials embedded in the address", async () => {
  const esito = await verificaUrlEsterno("https://utente:segreto@example.com/", pubblico);

  assert.equal(esito.ok, false);
});

test("refuses a public name that resolves into the internal network", async () => {
  const esito = await verificaUrlEsterno("https://nodo-che-sembra-pubblico.example/", versoLoopback);

  assert.equal(esito.ok, false, "il nome e' pubblico ma l'indirizzo no");
});

test("refuses a name it cannot resolve", async () => {
  const esito = await verificaUrlEsterno("https://non-esiste.example/", nonRisolvibile);

  assert.equal(esito.ok, false, "senza sapere dove porta l'indirizzo non si accetta");
});

test("does not resolve an address given as a literal", async () => {
  let chiamato = false;
  const esito = await verificaUrlEsterno("https://104.18.32.7/", {
    risolvi: async () => {
      chiamato = true;
      return [];
    },
  });

  assert.equal(esito.ok, true);
  assert.equal(chiamato, false, "un indirizzo letterale e' gia' stato verificato");
});

test("refuses a value that is not a string", async () => {
  for (const valore of [42, {}, []]) {
    const esito = await verificaUrlEsterno(valore, pubblico);
    assert.equal(esito.ok, false);
  }
});
