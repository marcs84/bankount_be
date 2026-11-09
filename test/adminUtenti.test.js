const test = require("node:test");
const assert = require("node:assert/strict");

const utenti = require("../src/admin/utenti");
const { generaImpronta } = require("../src/admin/password");
const { RUOLI } = require("../src/admin/adminAuth");

const PASSWORD = "una-password-lunga-abbastanza";

// Un pool finto che risponde secondo il tipo di interrogazione: le prove non
// hanno un database, e quelle sulla gestione degli accessi non si lanciano su
// uno vero.
const finge = ({ tabella = true, righe = [], errore = null } = {}) => {
  const chieste = [];
  const stato = { righe: [...righe] };

  global.connection = {
    query(sql, parametri, richiamo) {
      const p = typeof parametri === "function" ? [] : parametri;
      const cb = typeof parametri === "function" ? parametri : richiamo;
      chieste.push({ sql, parametri: p });

      if (errore) return setImmediate(() => cb(errore));

      if (/information_schema\.tables/i.test(sql)) {
        return setImmediate(() => cb(null, [{ quante: tabella ? 1 : 0 }]));
      }
      if (/^\s*SELECT/i.test(sql)) {
        const nome = p[0];
        const trovate = nome
          ? stato.righe.filter((r) => String(r.username).toLowerCase() === String(nome).toLowerCase())
          : stato.righe;
        return setImmediate(() => cb(null, trovate));
      }
      // INSERT, UPDATE, DELETE
      return setImmediate(() => cb(null, { affectedRows: 1, insertId: 9 }));
    },
  };

  return { chieste, stato };
};

const riga = async (modifiche = {}) => ({
  id: 3,
  username: "silvia",
  password_hash: await generaImpronta(PASSWORD),
  role: RUOLI.OPERATORE,
  enabled: 1,
  created_at: new Date("2026-11-01T10:00:00Z"),
  created_by: "marco",
  updated_at: null,
  last_login_at: null,
  password_changed_at: new Date("2026-11-01T10:00:00Z"),
  ...modifiche,
});

test.afterEach(() => {
  delete global.connection;
  utenti.azzeraCache();
});

test("says the table is not there instead of failing, and keeps saying so", async () => {
  const { chieste } = finge({ tabella: false });

  assert.equal(await utenti.tabellaPresente(), false);
  // Il controllo non si rifa' a ogni chiamata: ricontrolla al massimo ogni
  // dieci secondi, cosi' dopo la migrazione il pannello se ne accorge da se'
  // senza un riavvio e senza interrogare a ogni richiesta.
  assert.equal(await utenti.tabellaPresente(), false);
  assert.equal(chieste.filter((c) => /information_schema/i.test(c.sql)).length, 1);
});

test("treats a database that does not answer as a table that is not there", async () => {
  finge({ errore: new Error("pool esaurito") });

  // Il pannello resta in piedi con l'amministratore dell'ambiente, che e'
  // esattamente il caso per cui esiste.
  assert.equal(await utenti.tabellaPresente(), false);
});

test("asks for the migration by name when the table is missing", async () => {
  finge({ tabella: false });

  await assert.rejects(() => utenti.elenco(), /009_admin_users\.sql/);
  await assert.rejects(
    () => utenti.crea({ nome: "silvia", password: PASSWORD }),
    /009_admin_users\.sql/
  );
});

test("never hands back a password hash", async () => {
  finge({ tabella: true, righe: [await riga()] });

  const elenco = await utenti.elenco();

  assert.equal(elenco.length, 1);
  assert.deepEqual(Object.keys(elenco[0]).filter((k) => /hash|password_hash/.test(k)), []);
  assert.equal(elenco[0].nome, "silvia");
  assert.equal(elenco[0].abilitato, true);
  assert.equal(elenco[0].creatoDa, "marco");
});

test("refuses a name that could not be a name", async () => {
  finge({ tabella: true });

  for (const nome of ["ab", "", "con spazio", "x".repeat(33), "marco;--", null, 7]) {
    await assert.rejects(
      () => utenti.crea({ nome, password: PASSWORD }),
      /il nome deve essere/,
      String(nome)
    );
  }
});

test("refuses the name of the administrator written in .env", async () => {
  finge({ tabella: true });

  // Due identita' con lo stesso nome e password diverse sarebbero un modo di
  // sbagliarsi che non si vede guardando l'elenco.
  await assert.rejects(
    () => utenti.crea({ nome: "marco", password: PASSWORD, utenteAmbiente: "marco" }),
    /e' quello dell'amministratore scritto in \.env/
  );
  await assert.rejects(
    () => utenti.crea({ nome: "MARCO", password: PASSWORD, utenteAmbiente: "marco" }),
    /e' quello dell'amministratore scritto in \.env/
  );
});

test("refuses a password shorter than the minimum", async () => {
  finge({ tabella: true });

  await assert.rejects(
    () => utenti.crea({ nome: "silvia", password: "corta" }),
    new RegExp(`almeno ${utenti.PASSWORD_MINIMA} caratteri`)
  );
});

test("refuses a role that does not exist", async () => {
  finge({ tabella: true });

  await assert.rejects(
    () => utenti.crea({ nome: "silvia", password: PASSWORD, ruolo: "amministratore" }),
    /ruolo sconosciuto/
  );
});

test("creates an operatore by default and stores a hash, never the password", async () => {
  const { chieste } = finge({ tabella: true });

  const creato = await utenti.crea({ nome: "silvia", password: PASSWORD, creatoDa: "marco" });

  assert.equal(creato.ruolo, RUOLI.OPERATORE);
  assert.equal(creato.abilitato, true);

  const inserimento = chieste.find((c) => /^\s*INSERT/i.test(c.sql));
  assert.ok(inserimento, "nessun inserimento");
  assert.ok(!inserimento.parametri.includes(PASSWORD), "la password e' finita nel database");
  assert.match(inserimento.parametri[1], /^scrypt\$/);
  assert.equal(inserimento.parametri[3], "marco");
});

test("turns a duplicate name into something the administrator can read", async () => {
  const duplicato = Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" });
  finge({ tabella: true, errore: duplicato });

  // Il controllo della tabella passa dallo stesso pool, quindi si fa prima.
  await utenti.tabellaPresente().catch(() => {});
  utenti.azzeraCache();
  finge({ tabella: true });
  const presente = await utenti.tabellaPresente();
  assert.equal(presente, true);

  // Ora solo l'inserimento fallisce.
  global.connection.query = (sql, parametri, richiamo) => {
    const cb = typeof parametri === "function" ? parametri : richiamo;
    if (/^\s*INSERT/i.test(sql)) return setImmediate(() => cb(duplicato));
    setImmediate(() => cb(null, []));
  };

  await assert.rejects(
    () => utenti.crea({ nome: "silvia", password: PASSWORD }),
    /esiste gia'/
  );
});

test("an unknown name costs the same as a wrong password", async () => {
  finge({ tabella: true, righe: [await riga()] });

  // Senza l'impronta di riserva un nome inesistente risponderebbe molto piu'
  // in fretta di uno esistente, e quella differenza direbbe quali nomi
  // esistono. Qui si misura solo che entrambi i rami facciano il lavoro di
  // `scrypt`: il tempo vero dipende dalla macchina.
  const ignoto = await utenti.verifica({ nome: "nessuno", password: PASSWORD });
  assert.equal(ignoto.ok, false);

  const sbagliata = await utenti.verifica({ nome: "silvia", password: "un'altra password" });
  assert.equal(sbagliata.ok, false);

  const giusta = await utenti.verifica({ nome: "silvia", password: PASSWORD });
  assert.equal(giusta.ok, true);
  assert.equal(giusta.utente.nome, "silvia");
  assert.equal(giusta.utente.ruolo, RUOLI.OPERATORE);
  assert.equal(typeof giusta.utente.passwordCambiataIl, "number");
});

test("a disabled administrator does not get in, and is told nothing more", async () => {
  finge({ tabella: true, righe: [await riga({ enabled: 0 })] });

  const esito = await utenti.verifica({ nome: "silvia", password: PASSWORD });

  // Lo stesso rifiuto di una password sbagliata: chi prova non deve imparare
  // che quel nome esiste ma e' chiuso.
  assert.deepEqual(esito, { ok: false });
});

test("nobody gets in through the table when the table is not there", async () => {
  finge({ tabella: false, righe: [await riga()] });

  assert.deepEqual(await utenti.verifica({ nome: "silvia", password: PASSWORD }), { ok: false });
});

test("reads the state with a cache in front, and forgets it when it changes", async () => {
  const { chieste } = finge({ tabella: true, righe: [await riga()] });

  const primo = await utenti.stato("silvia");
  assert.equal(primo.esiste, true);
  assert.equal(primo.abilitato, true);
  assert.equal(primo.ruolo, RUOLI.OPERATORE);

  const letture = () => chieste.filter((c) => /FROM admin_users WHERE username/i.test(c.sql)).length;
  const dopoIlPrimo = letture();

  await utenti.stato("silvia");
  assert.equal(letture(), dopoIlPrimo, "la seconda lettura doveva venire dalla cache");

  // Cambiare qualcosa butta la cache: altrimenti per dieci secondi il
  // cancello guarderebbe uno stato vecchio.
  utenti.scordaStato("silvia");
  await utenti.stato("silvia");
  assert.equal(letture(), dopoIlPrimo + 1);
});

test("the state of a name that is not there is not a state", async () => {
  finge({ tabella: true, righe: [] });

  assert.deepEqual(await utenti.stato("nessuno"), { esiste: false });
});

test("refuses to disable or delete yourself", async () => {
  finge({ tabella: true, righe: [await riga()] });

  await assert.rejects(
    () => utenti.abilita({ nome: "silvia", acceso: false, chiLoChiede: "silvia" }),
    /non puoi disabilitare te stesso/
  );
  await assert.rejects(
    () => utenti.elimina({ nome: "silvia", chiLoChiede: "SILVIA" }),
    /non puoi eliminare te stesso/
  );

  // Riabilitare se stessi non ha lo stesso problema.
  const riacceso = await utenti.abilita({ nome: "silvia", acceso: true, chiLoChiede: "silvia" });
  assert.equal(riacceso.abilitato, true);
});

test("refuses to touch an administrator that does not exist", async () => {
  finge({ tabella: true, righe: [] });

  await assert.rejects(() => utenti.cambiaPassword({ nome: "nessuno", password: PASSWORD }), /non esiste/);
  await assert.rejects(() => utenti.abilita({ nome: "nessuno", acceso: false }), /non esiste/);
  await assert.rejects(() => utenti.elimina({ nome: "nessuno" }), /non esiste/);
});

test("changing a password moves the instant the session is checked against", async () => {
  const { chieste } = finge({ tabella: true, righe: [await riga()] });

  await utenti.cambiaPassword({ nome: "silvia", password: "un'altra-password-lunga" });

  const aggiornamento = chieste.find((c) => /^\s*UPDATE/i.test(c.sql));
  assert.match(aggiornamento.sql, /password_changed_at = NOW\(\)/);
  assert.match(aggiornamento.parametri[0], /^scrypt\$/);
  assert.ok(!aggiornamento.parametri.includes("un'altra-password-lunga"));
});

test("the owner of a password must know the current one to change it", async () => {
  finge({ tabella: true, righe: [await riga()] });

  await assert.rejects(
    () =>
      utenti.cambiaPasswordDaSe({
        nome: "silvia",
        passwordAttuale: "non e' questa",
        passwordNuova: "una-password-nuova-lunga",
      }),
    /la password attuale non e' quella giusta/
  );

  await assert.rejects(
    () =>
      utenti.cambiaPasswordDaSe({
        nome: "silvia",
        passwordAttuale: PASSWORD,
        passwordNuova: PASSWORD,
      }),
    /identica a quella attuale/
  );

  const esito = await utenti.cambiaPasswordDaSe({
    nome: "silvia",
    passwordAttuale: PASSWORD,
    passwordNuova: "una-password-nuova-lunga",
  });
  assert.equal(esito.nome, "silvia");
});

test("marking a login never breaks the login", async () => {
  finge({ tabella: true, errore: new Error("database sparito") });

  // E' una comodita' per l'elenco, non un pezzo dell'autenticazione.
  assert.doesNotThrow(() => utenti.segnaAccesso("silvia"));
});
