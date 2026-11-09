const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");

const { PERCORSO_ICONA, CACHE_ICONA } = require("../src/server/icona");

test("the icon the server promises is actually there", () => {
  // Il file vive nella cartella del pannello e la rotta di radice lo
  // raggiunge da fuori: e' l'unico riferimento che attraversa due cartelle, e
  // spostarlo si scoprirebbe altrimenti solo da un 404 in produzione.
  assert.ok(fs.existsSync(PERCORSO_ICONA), `icona assente: ${PERCORSO_ICONA}`);
});

test("and it is a real image, not a placeholder", () => {
  const byte = fs.readFileSync(PERCORSO_ICONA);

  assert.equal(byte.slice(1, 4).toString(), "PNG");
  assert.ok(byte.length > 1000, "l'icona e' sospettosamente piccola");

  // Quadrata: un'icona rettangolare viene schiacciata dal browser.
  assert.equal(byte.readUInt32BE(16), byte.readUInt32BE(20));
});

test("the browser is told to keep it", () => {
  // E' un'immagine che non cambia mai e il browser la chiede a ogni pagina.
  assert.equal(CACHE_ICONA, "1d");
});
