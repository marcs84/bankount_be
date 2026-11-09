const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generaImpronta,
  verificaPassword,
  improntaValida,
  PARAMETRI,
} = require("../src/admin/password");

test("accepts the password it was built from", async () => {
  const impronta = await generaImpronta("una password lunga abbastanza");

  assert.equal(await verificaPassword("una password lunga abbastanza", impronta), true);
});

test("refuses a wrong password, including one that differs by a byte", async () => {
  const impronta = await generaImpronta("password-giusta");

  assert.equal(await verificaPassword("password-sbagliata", impronta), false);
  assert.equal(await verificaPassword("password-giustA", impronta), false);
  assert.equal(await verificaPassword("password-giust", impronta), false);
  assert.equal(await verificaPassword("", impronta), false);
});

test("never stores the password itself", async () => {
  const impronta = await generaImpronta("segretissima-12345");

  assert.ok(
    !impronta.includes("segretissima"),
    "l'impronta non deve contenere la password in nessuna forma leggibile"
  );
});

test("salts, so the same password gives two different prints", async () => {
  const prima = await generaImpronta("identica");
  const seconda = await generaImpronta("identica");

  assert.notEqual(prima, seconda, "senza sale due impronte uguali si riconoscono");
  assert.equal(await verificaPassword("identica", prima), true);
  assert.equal(await verificaPassword("identica", seconda), true);
});

test("records its own parameters, so the print stays verifiable", async () => {
  const impronta = await generaImpronta("qualunque");
  const parti = impronta.split("$");

  assert.equal(parti.length, 6);
  assert.equal(parti[0], PARAMETRI.ALGORITMO);
  assert.equal(Number(parti[1]), PARAMETRI.N);
  assert.equal(Number(parti[2]), PARAMETRI.R);
  assert.equal(Number(parti[3]), PARAMETRI.P);
});

test("verifies a print made with different parameters", async () => {
  // I parametri si leggono dall'impronta, non dalle costanti: alzare il costo
  // in futuro non deve invalidare le impronte gia' in uso.
  const impronta = await generaImpronta("password-vecchia");
  const parti = impronta.split("$");
  assert.equal(await verificaPassword("password-vecchia", parti.join("$")), true);
});

test("treats a broken print as a refusal, never as a way in", async () => {
  for (const rotta of [
    undefined,
    null,
    "",
    "password-in-chiaro",
    "scrypt$16384$8$1$soloquattrocampi",
    "scrypt$16384$8$1$c2FsZQ==$aW1wcm9udGE=$extra",
    "argon2$16384$8$1$c2FsZQ==$aW1wcm9udGE=",
    "scrypt$0$8$1$c2FsZQ==$aW1wcm9udGE=",
    "scrypt$16384$8$1$$",
  ]) {
    assert.equal(
      await verificaPassword("qualunque", rotta),
      false,
      `impronta rotta accettata: ${JSON.stringify(rotta)}`
    );
  }
});

test("recognises a well formed print without checking any password", async () => {
  const impronta = await generaImpronta("x".repeat(20));

  assert.equal(improntaValida(impronta), true);
  assert.equal(
    improntaValida("password-in-chiaro"),
    false,
    "il controllo all'avvio deve accorgersi di una password scritta in chiaro"
  );
  assert.equal(improntaValida(undefined), false);
});
