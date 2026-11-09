const test = require("node:test");
const assert = require("node:assert/strict");

const {
  maschera,
  mascheraAzione,
  mascheraPercorso,
  mascheraStringa,
} = require("../src/admin/maschera");

const INDIRIZZO = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

test("keeps head and tail so two rows about the same address still match", () => {
  const mascherato = mascheraStringa(INDIRIZZO);

  assert.equal(mascherato, "1A1zP1…vfNa");
  // E' il punto del mascheramento: due righe che parlano dello stesso
  // indirizzo restano riconoscibili l'una nell'altra.
  assert.equal(mascheraStringa(INDIRIZZO), mascherato);
  assert.notEqual(mascheraStringa("1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfnb"), mascherato);
});

test("replaces a short value instead of showing most of it", () => {
  // Mezzo di una stringa corta sarebbe quasi tutta la stringa.
  assert.equal(mascheraStringa("a@b.it"), "***");
  assert.equal(mascheraStringa("1234567890123"), "***");
  assert.equal(mascheraStringa("12345678901234"), "123456…1234");
});

test("masks only the keys that carry a person, and leaves the rest readable", () => {
  const fuori = maschera({
    address: INDIRIZZO,
    device_id: "A8F2C1B4-9D3E-4F5A-8B7C-1D2E3F4A5B6C",
    amount: 0.015,
    coin_type: "BTC",
    responseStatus: 200,
    annidato: { to_address: INDIRIZZO, nome: "portafoglio di prova" },
  });

  assert.equal(fuori.address, "1A1zP1…vfNa");
  assert.equal(fuori.device_id, "A8F2C1…5B6C");
  assert.equal(fuori.annidato.to_address, "1A1zP1…vfNa");

  // Cio' che serve per capire la riga resta leggibile: mascherare tutto
  // sarebbe come non mostrare la riga.
  assert.equal(fuori.amount, 0.015);
  assert.equal(fuori.coin_type, "BTC");
  assert.equal(fuori.responseStatus, 200);
  assert.equal(fuori.annidato.nome, "portafoglio di prova");
});

test("masks identifiers inside a path and keeps the path a path", () => {
  assert.equal(
    mascheraPercorso(`/api/transactions/${INDIRIZZO}`),
    "/api/transactions/1A1zP1…vfNa"
  );
  // I pezzi corti sono nomi di rotta, non identificativi.
  assert.equal(mascheraPercorso("/api/deviceLogin"), "/api/deviceLogin");
  assert.equal(mascheraPercorso("/api/wallet/12"), "/api/wallet/12");
});

test("masks the identifiers in a query string and keeps the filters readable", () => {
  // Nelle rotte in lettura gli identificativi stanno qui: lasciare intera la
  // stringa di interrogazione vorrebbe dire mascherare le PUT e non le GET.
  // Il resto dei filtri resta leggibile, perche' e' spesso l'unico modo di
  // capire cosa cercava quella richiesta.
  assert.equal(
    mascheraPercorso(
      "/api/addresses?wallet_id=083684b0-bbd8-4168-96a7-53d5ae5d438a&user_id=191&network=TESTNET&selected_currency=EUR"
    ),
    "/api/addresses?wallet_id=083684…438a&user_id=191&network=TESTNET&selected_currency=EUR"
  );

  // Un filtro vuoto resta vuoto, e una coppia senza uguale non si tocca.
  assert.equal(
    mascheraPercorso("/api/addresses?coin_type=&address=&flag"),
    "/api/addresses?coin_type=&address=&flag"
  );
});

test("masks the path of an action without eating the method", () => {
  assert.equal(
    mascheraAzione(`GET /api/transactions/${INDIRIZZO}`),
    "GET /api/transactions/1A1zP1…vfNa"
  );
  assert.equal(mascheraAzione("POST /api/deviceLogin"), "POST /api/deviceLogin");

  // Le azioni che non sono "metodo percorso" esistono: gli eventi di sistema
  // si chiamano `cron.syncTokenMetaDataInDB.start`.
  assert.equal(
    mascheraAzione("cron.syncTokenMetaDataInDB.start"),
    "cron.syncTokenMetaDataInDB.start"
  );
});

test("survives what the log actually contains", () => {
  assert.equal(maschera(null), null);
  assert.equal(maschera(undefined), undefined);
  assert.equal(maschera("una riga di testo"), "una riga di testo");
  assert.equal(mascheraAzione(null), null);
  assert.equal(mascheraPercorso(""), "");

  // Un elenco sotto una chiave da mascherare si maschera elemento per
  // elemento: `insertAddress` prende un array, ed e' proprio dove gli
  // indirizzi sono di piu'.
  const fuori = maschera({ addresses: [INDIRIZZO, "corto"], address: 12345 });
  assert.equal(fuori.addresses[0], "1A1zP1…vfNa");
  assert.equal(fuori.addresses[1], "***");

  // Un valore non testuale sotto quella chiave non deve far cadere la vista:
  // si scende dentro e si continua.
  assert.equal(fuori.address, 12345);
});

test("does not loop forever on a deeply nested detail", () => {
  let dentro = { address: INDIRIZZO };
  for (let i = 0; i < 40; i += 1) dentro = { dentro };

  // Il limite di profondita' smette di scendere senza sollevare.
  assert.doesNotThrow(() => maschera(dentro));
});
