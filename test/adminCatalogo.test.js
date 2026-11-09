const test = require("node:test");
const assert = require("node:assert/strict");

const catalogoApi = require("../src/admin/catalogoApi");

const SPEC = {
  paths: {
    "/api/wallet/{id}": {
      get: {
        tags: ["Wallet"],
        summary: "Fetch a wallet",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
      },
      delete: {
        tags: ["Wallet"],
        summary: "Delete a wallet",
      },
    },
    "/api/deviceLogin": {
      post: {
        tags: ["Device Login"],
        summary: "Log a device in",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  device_id: { type: "string", example: "A8F2C1B4" },
                  passkey: { type: "string" },
                  attivo: { type: "boolean" },
                  tentativi: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    "/api/upload": {
      post: {
        requestBody: { content: { "multipart/form-data": { schema: {} } } },
      },
    },
  },
};

test.afterEach(() => catalogoApi.azzeraCache());

test("one entry per method, not one per path", () => {
  const rotte = catalogoApi.costruisci(SPEC);

  // La consolle manda un metodo e un percorso: due metodi sullo stesso
  // percorso sono due cose da provare, non una.
  assert.equal(rotte.length, 4);
  assert.equal(rotte.filter((r) => r.percorso === "/api/wallet/{id}").length, 2);
});

test("pulls out the placeholders, because a path with braces is not a path", () => {
  const rotte = catalogoApi.costruisci(SPEC);
  const wallet = rotte.find((r) => r.percorso === "/api/wallet/{id}");

  assert.deepEqual(wallet.segnaposti, ["id"]);
  assert.deepEqual(
    rotte.find((r) => r.percorso === "/api/deviceLogin").segnaposti,
    []
  );
});

test("builds a body skeleton from the schema", () => {
  const rotte = catalogoApi.costruisci(SPEC);
  const login = rotte.find((r) => r.percorso === "/api/deviceLogin");

  // Gli esempi dichiarati si usano; per il resto bastano i nomi dei campi e
  // un valore del tipo giusto, per non ribattere a mano la forma.
  assert.deepEqual(login.corpoEsempio, {
    device_id: "A8F2C1B4",
    passkey: "",
    attivo: false,
    tentativi: 0,
  });
});

test("says when a body is not JSON instead of inventing one", () => {
  const rotte = catalogoApi.costruisci(SPEC);
  const caricamento = rotte.find((r) => r.percorso === "/api/upload");

  assert.deepEqual(caricamento.corpoEsempio, { _nonJson: "multipart/form-data" });
});

test("no body at all stays no body", () => {
  const rotte = catalogoApi.costruisci(SPEC);

  assert.equal(rotte.find((r) => r.metodo === "GET").corpoEsempio, null);
});

test("reports whether the route asks for a token", () => {
  const rotte = catalogoApi.costruisci(SPEC);

  assert.equal(rotte.find((r) => r.metodo === "GET").richiedeToken, true);
  assert.equal(rotte.find((r) => r.metodo === "DELETE").richiedeToken, false);
});

test("keeps the parameters, with where each one goes", () => {
  const rotte = catalogoApi.costruisci(SPEC);
  const wallet = rotte.find((r) => r.metodo === "GET");

  assert.deepEqual(wallet.parametri, [
    { nome: "id", dove: "path", obbligatorio: true, descrizione: null, tipo: "integer" },
  ]);
});

test("sorts by group so the list can be read", () => {
  const rotte = catalogoApi.costruisci(SPEC);

  assert.deepEqual(
    rotte.map((r) => r.tag),
    ["Device Login", "Wallet", "Wallet", null]
  );
});

test("an empty description is empty, and says so", () => {
  const rotte = catalogoApi.costruisci({ paths: {} });

  assert.deepEqual(rotte, []);
  assert.deepEqual(catalogoApi.costruisci({}), []);
  assert.deepEqual(catalogoApi.costruisci(null), []);
});

test("the real description of this server produces real routes", () => {
  const c = catalogoApi.catalogo();

  // Viene dai commenti sopra le rotte in src/server: se qualcuno li rompe,
  // questa prova lo dice prima che la consolle mostri un elenco vuoto.
  assert.equal(c.vuoto, false);
  assert.ok(c.quante > 20, `rotte trovate: ${c.quante}`);
  assert.ok(c.tag.includes("Wallet"));
  assert.ok(c.rotte.every((r) => r.percorso.startsWith("/")));
  assert.ok(c.rotte.every((r) => /^[A-Z]+$/.test(r.metodo)));
});

test("builds the real catalogue once", () => {
  assert.equal(catalogoApi.catalogo(), catalogoApi.catalogo());
});
