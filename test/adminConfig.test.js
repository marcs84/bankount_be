const test = require("node:test");
const assert = require("node:assert/strict");

const { leggiConfigurazione, problemi } = require("../src/admin/adminConfig");

// Un'impronta vera, generata una volta e incollata: le prove sulla
// configurazione non devono pagare `scrypt` a ogni caso.
const IMPRONTA =
  "scrypt$16384$8$1$kqY3Jx1xT8jWnQ0bJmQ4Lg==$7mG0Xq5sKv3xAqN0t1oRz9pQw8eYc2hJkL4mN6pQr8s=";

const SEGRETO = "un-segreto-del-pannello-lungo-abbastanza-per-passare";

const ambiente = (modifiche = {}) => ({
  ADMIN_PANEL_ENABLED: "true",
  ADMIN_USERNAME: "marco",
  ADMIN_PASSWORD_HASH: IMPRONTA,
  ADMIN_JWT_SECRET: SEGRETO,
  JWT_SECRET: "il-segreto-dei-dispositivi-che-e-un-altra-cosa",
  ...modifiche,
});

test("is off unless it is switched on, and nothing else matters then", () => {
  assert.equal(leggiConfigurazione({}).attivo, false);
  assert.equal(leggiConfigurazione({ ADMIN_PANEL_ENABLED: "false" }).attivo, false);
  assert.equal(leggiConfigurazione({ ADMIN_PANEL_ENABLED: "1" }).attivo, false);
  assert.equal(leggiConfigurazione({ ADMIN_PANEL_ENABLED: "TRUE" }).attivo, false);

  // Spento, una configurazione incompleta non e' un problema: non c'e' niente
  // da proteggere, perche' le rotte non vengono montate.
  assert.equal(
    leggiConfigurazione({ ADMIN_PANEL_ENABLED: "no", ADMIN_USERNAME: "" }).attivo,
    false
  );
});

test("reads a complete configuration", () => {
  const c = leggiConfigurazione(ambiente());

  assert.equal(c.attivo, true);
  assert.equal(c.utente, "marco");
  assert.equal(c.impronta, IMPRONTA);
  assert.equal(c.segreto, SEGRETO);
  assert.equal(c.ttlSessione, "30m", "la durata predefinita della sessione");
  assert.equal(c.distruttivoAmmesso, false, "i metodi distruttivi nascono spenti");
});

test("turns the destructive methods on only when told exactly so", () => {
  assert.equal(
    leggiConfigurazione(ambiente({ ADMIN_PROBE_DESTRUCTIVE: "true" })).distruttivoAmmesso,
    true
  );
  assert.equal(
    leggiConfigurazione(ambiente({ ADMIN_PROBE_DESTRUCTIVE: "yes" })).distruttivoAmmesso,
    false
  );
  assert.equal(
    leggiConfigurazione(ambiente({ ADMIN_PROBE_DESTRUCTIVE: "1" })).distruttivoAmmesso,
    false
  );
});

test("refuses to start when the panel is on but the name is missing", () => {
  assert.throws(
    () => leggiConfigurazione(ambiente({ ADMIN_USERNAME: "" })),
    /ADMIN_USERNAME assente/
  );
});

test("refuses a plaintext password written where the print belongs", () => {
  const guasti = problemi(ambiente({ ADMIN_PASSWORD_HASH: "la-mia-password" }));

  assert.equal(guasti.length, 1);
  assert.match(guasti[0], /non e' un'impronta valida/);
  assert.match(guasti[0], /admin:hash/, "il messaggio deve dire come rimediare");
});

test("refuses a secret shared with the device authentication", () => {
  // E' il guasto che renderebbe la separazione scritta nel codice e
  // inesistente nei fatti.
  const condiviso = "lo-stesso-segreto-per-tutti-e-due-i-sistemi";
  const guasti = problemi(
    ambiente({ ADMIN_JWT_SECRET: condiviso, JWT_SECRET: condiviso })
  );

  assert.equal(guasti.length, 1);
  assert.match(guasti[0], /uguale a JWT_SECRET/);
});

test("refuses a secret short enough to guess", () => {
  const guasti = problemi(ambiente({ ADMIN_JWT_SECRET: "corto" }));

  assert.equal(guasti.length, 1);
  assert.match(guasti[0], /piu' corto di 32/);
});

test("reports every problem at once", () => {
  // Chi configura il pannello vuole sapere in una volta cosa manca, non
  // scoprirlo una variabile per riavvio.
  const guasti = problemi({ ADMIN_PANEL_ENABLED: "true" });

  assert.equal(guasti.length, 3);
  assert.ok(guasti.some((g) => /ADMIN_USERNAME/.test(g)));
  assert.ok(guasti.some((g) => /ADMIN_PASSWORD_HASH/.test(g)));
  assert.ok(guasti.some((g) => /ADMIN_JWT_SECRET/.test(g)));
});

test("the raised error names every problem, so the log says what to fix", () => {
  assert.throws(
    () => leggiConfigurazione({ ADMIN_PANEL_ENABLED: "true" }),
    (errore) => {
      assert.match(errore.message, /ADMIN_USERNAME/);
      assert.match(errore.message, /ADMIN_PASSWORD_HASH/);
      assert.match(errore.message, /ADMIN_JWT_SECRET/);
      return true;
    }
  );
});

test("keeps a session duration that was set on purpose", () => {
  assert.equal(
    leggiConfigurazione(ambiente({ ADMIN_SESSION_TTL: "5m" })).ttlSessione,
    "5m"
  );
  assert.equal(
    leggiConfigurazione(ambiente({ ADMIN_SESSION_TTL: "  " })).ttlSessione,
    "30m",
    "una durata vuota ricade sulla predefinita"
  );
});
