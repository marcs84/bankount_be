const test = require("node:test");
const assert = require("node:assert/strict");

const {
  leggiRitenzione,
  RITENZIONE_CRON_PREDEFINITO,
} = require("../src/admin/adminConfig");

test("is off when nobody switched it on", () => {
  // E' il caso predefinito, e deve restare il piu' silenzioso: nessun cron
  // pianificato e nessuna riga cancellata da sola.
  assert.equal(leggiRitenzione({}).attiva, false);
  assert.equal(leggiRitenzione({ ADMIN_LOG_RETENTION_DAYS: "" }).attiva, false);
  assert.equal(leggiRitenzione({ ADMIN_LOG_RETENTION_DAYS: "   " }).attiva, false);
  assert.equal(leggiRitenzione({ ADMIN_LOG_RETENTION_DAYS: "0" }).attiva, false);
});

test("is off independently of the panel", () => {
  // Riguarda il database, non la schermata: deve poter funzionare su un
  // server dove il pannello non c'e'.
  const r = leggiRitenzione({
    ADMIN_PANEL_ENABLED: "false",
    ADMIN_LOG_RETENTION_DAYS: "90",
  });

  assert.equal(r.attiva, true);
  assert.equal(r.giorni, 90);
});

test("reads the days and the default schedule", () => {
  const r = leggiRitenzione({ ADMIN_LOG_RETENTION_DAYS: "30" });

  assert.equal(r.giorni, 30);
  assert.equal(r.cron, RITENZIONE_CRON_PREDEFINITO);
  assert.equal(r.tipi, null);
});

test("refuses a number of days that is not one", () => {
  // Un refuso qui cancella dati: si ferma l'avvio invece di conservare una
  // quantita' di giorni decisa dal caso.
  for (const valore of ["novanta", "-1", "1.5", "90 giorni", "1e3", "01"]) {
    assert.throws(
      () => leggiRitenzione({ ADMIN_LOG_RETENTION_DAYS: valore }),
      /ADMIN_LOG_RETENTION_DAYS/,
      valore
    );
  }
});

test("refuses a schedule that is not a schedule", () => {
  assert.throws(
    () =>
      leggiRitenzione({
        ADMIN_LOG_RETENTION_DAYS: "90",
        ADMIN_LOG_RETENTION_CRON: "ogni notte",
      }),
    /ADMIN_LOG_RETENTION_CRON/
  );
});

test("takes a schedule that is one", () => {
  const r = leggiRitenzione({
    ADMIN_LOG_RETENTION_DAYS: "90",
    ADMIN_LOG_RETENTION_CRON: "0 4 * * 0",
  });

  assert.equal(r.cron, "0 4 * * 0");
});

test("passes the chosen types along as written", () => {
  const r = leggiRitenzione({
    ADMIN_LOG_RETENTION_DAYS: "90",
    ADMIN_LOG_RETENTION_TYPES: "API_REQUEST,SYSTEM_EVENT",
  });

  // Chi li ripulisce e' `purga`, in un posto solo: due puliture diverse
  // vorrebbero dire due idee diverse di quali tipi esistono.
  assert.equal(r.tipi, "API_REQUEST,SYSTEM_EVENT");
});
