const test = require("node:test");
const assert = require("node:assert/strict");

const { valuta, perEccesso, statoRedis, eta, SOGLIE } = require("../src/admin/salute");

const ORA = 60 * 60 * 1000;
const ADESSO = Date.parse("2026-11-09T12:00:00.000Z");

// Fatti di un server che sta bene: ogni prova parte da qui e guasta una cosa
// sola, cosi' si vede che il semaforo risponde a quella e non ad altro.
const sano = (modifiche = {}) => ({
  database: { risponde: true, latenzaMs: 3 },
  redis: "ready",
  ultimaSincronizzazioneRiuscita: new Date(ADESSO - 2 * ORA).toISOString(),
  ultimaSincronizzazioneAvviata: new Date(ADESSO - 2 * ORA - 60000).toISOString(),
  erroriUltimaOra: 0,
  disco: { percentualeUsata: 40 },
  memoriaPercentualeUsata: 50,
  cicloEventiP99Ms: 5,
  registroRighe: 19215,
  ultimoAccessoDispositivo: new Date(ADESSO - ORA).toISOString(),
  ultimoWebhook: new Date(ADESSO - 3 * ORA).toISOString(),
  ultimaRigaRegistro: new Date(ADESSO - 1000).toISOString(),
  ...modifiche,
});

const voce = (esito, chiave) => esito.voci.find((v) => v.chiave === chiave);

test("a healthy server is green all over", () => {
  const esito = valuta(sano(), ADESSO);

  assert.equal(esito.complessivo, "ok");
  const nonVerdi = esito.voci.filter((v) => v.stato !== "ok");
  assert.deepEqual(nonVerdi, [], "nessuna voce dovrebbe accendersi su un server sano");
});

test("the overall light is the worst of the lights", () => {
  assert.equal(valuta(sano({ erroriUltimaOra: 20 }), ADESSO).complessivo, "attenzione");
  assert.equal(valuta(sano({ erroriUltimaOra: 100 }), ADESSO).complessivo, "guasto");
  assert.equal(
    valuta(sano({ database: { risponde: false, errore: "ECONNREFUSED" } }), ADESSO).complessivo,
    "guasto",
    "un guasto non deve essere coperto da nove voci verdi"
  );
});

test("a database that does not answer is a failure, not a warning", () => {
  const esito = valuta(sano({ database: { risponde: false, errore: "ECONNREFUSED" } }), ADESSO);

  assert.equal(voce(esito, "database").stato, "guasto");
  assert.equal(voce(esito, "database").dettaglio, "ECONNREFUSED");
});

test("a slow database warns before it fails", () => {
  assert.equal(voce(valuta(sano({ database: { risponde: true, latenzaMs: 99 } }), ADESSO), "database").stato, "ok");
  assert.equal(voce(valuta(sano({ database: { risponde: true, latenzaMs: 100 } }), ADESSO), "database").stato, "attenzione");
  assert.equal(voce(valuta(sano({ database: { risponde: true, latenzaMs: 1000 } }), ADESSO), "database").stato, "guasto");
});

test("redis down is a warning, because the application keeps working", () => {
  // La cache dei prezzi ha una strada alternativa: chiamarlo guasto vorrebbe
  // dire accendere un rosso su un server che sta servendo le richieste, e un
  // pannello che grida al lupo si impara a ignorarlo.
  for (const stato of ["reconnecting", "connecting", "close", "end", "wait"]) {
    assert.equal(statoRedis(stato), "attenzione", `stato ${stato}`);
  }
  assert.equal(statoRedis("ready"), "ok");
  assert.equal(statoRedis(null), "ignoto");

  assert.equal(valuta(sano({ redis: "reconnecting" }), ADESSO).complessivo, "attenzione");
});

test("notices a sync that started and never finished", () => {
  // E' il caso che un pannello deve far vedere: mostrando solo l'ultimo
  // successo, una corsa partita e mai conclusa non si noterebbe.
  const esito = valuta(
    sano({
      ultimaSincronizzazioneRiuscita: new Date(ADESSO - 30 * ORA).toISOString(),
      ultimaSincronizzazioneAvviata: new Date(ADESSO - 12 * ORA).toISOString(),
    }),
    ADESSO
  );

  const incompleta = voce(esito, "sincronizzazione-incompleta");
  assert.ok(incompleta, "la voce deve comparire");
  assert.equal(incompleta.stato, "attenzione");
});

test("does not cry about an incomplete sync when the success came after", () => {
  const esito = valuta(sano(), ADESSO);

  assert.equal(
    voce(esito, "sincronizzazione-incompleta"),
    undefined,
    "l'avvio precede il successo: la corsa e' arrivata in fondo"
  );
});

test("gives the sync a day and a bit before complaining", () => {
  const conEta = (ore) =>
    voce(
      valuta(
        sano({
          ultimaSincronizzazioneRiuscita: new Date(ADESSO - ore * ORA).toISOString(),
          ultimaSincronizzazioneAvviata: new Date(ADESSO - ore * ORA - 60000).toISOString(),
        }),
        ADESSO
      ),
      "sincronizzazione"
    ).stato;

  assert.equal(conEta(25), "ok", "gira una volta al giorno: 25 ore sono normali");
  assert.equal(conEta(27), "attenzione");
  assert.equal(conEta(51), "guasto");
});

test("says it does not know, instead of saying it is fine", () => {
  const esito = valuta(
    sano({
      ultimaSincronizzazioneRiuscita: null,
      ultimaSincronizzazioneAvviata: null,
      disco: { errore: "EACCES" },
      cicloEventiP99Ms: null,
    }),
    ADESSO
  );

  assert.equal(voce(esito, "sincronizzazione").stato, "ignoto");
  assert.equal(voce(esito, "disco").stato, "ignoto");
  assert.equal(voce(esito, "ciclo-eventi").stato, "ignoto");
  assert.equal(
    esito.complessivo,
    "ignoto",
    "non sapere non e' stare bene, ma non e' nemmeno un guasto"
  );
});

test("leaves the signs of life uncoloured", () => {
  // Quanto tempo passa fra due accessi o fra due webhook dipende da chi usa
  // l'applicazione, non dalla salute del server: una soglia li' sarebbe
  // inventata.
  const vecchio = new Date(ADESSO - 30 * 24 * ORA).toISOString();
  const esito = valuta(
    sano({ ultimoAccessoDispositivo: vecchio, ultimoWebhook: vecchio }),
    ADESSO
  );

  assert.equal(voce(esito, "ultimo-accesso-dispositivo").stato, "ok");
  assert.equal(voce(esito, "ultimo-webhook").stato, "ok");
  assert.equal(esito.complessivo, "ok");
});

test("marks a sign of life as unknown when it never happened", () => {
  const esito = valuta(sano({ ultimoWebhook: null }), ADESSO);

  assert.equal(voce(esito, "ultimo-webhook").stato, "ignoto");
});

test("the log fills up long before it warns", () => {
  // Con 19.215 righe oggi e qualche centinaio al giorno, la soglia non deve
  // accendersi la settimana prossima.
  assert.equal(voce(valuta(sano({ registroRighe: 19215 }), ADESSO), "registro").stato, "ok");
  assert.equal(voce(valuta(sano({ registroRighe: 250000 }), ADESSO), "registro").stato, "attenzione");
  assert.equal(voce(valuta(sano({ registroRighe: 2000000 }), ADESSO), "registro").stato, "guasto");
});

test("the threshold helper is inclusive at the edge and refuses nonsense", () => {
  const soglie = { attenzione: 10, guasto: 50 };

  assert.equal(perEccesso(9, soglie), "ok");
  assert.equal(perEccesso(10, soglie), "attenzione");
  assert.equal(perEccesso(49, soglie), "attenzione");
  assert.equal(perEccesso(50, soglie), "guasto");

  assert.equal(perEccesso(null, soglie), "ignoto");
  assert.equal(perEccesso(undefined, soglie), "ignoto");
  assert.equal(perEccesso(NaN, soglie), "ignoto");
  assert.equal(perEccesso(Infinity, soglie), "ignoto");
  assert.equal(perEccesso("30", soglie), "ignoto", "una stringa non e' un numero");
});

test("reads an age from an iso string, a date or nothing", () => {
  assert.equal(eta(new Date(ADESSO - 5000).toISOString(), ADESSO), 5000);
  assert.equal(eta(new Date(ADESSO - 5000), ADESSO), 5000);
  assert.equal(eta(null, ADESSO), null);
  assert.equal(eta("non una data", ADESSO), null);
});

test("every threshold has a warning below its failure", () => {
  // Una soglia scritta al rovescio renderebbe il semaforo muto: passerebbe da
  // verde a rosso senza mai avvisare.
  for (const [nome, soglia] of Object.entries(SOGLIE)) {
    assert.ok(
      soglia.attenzione < soglia.guasto,
      `${nome}: attenzione (${soglia.attenzione}) deve stare sotto guasto (${soglia.guasto})`
    );
  }
});
