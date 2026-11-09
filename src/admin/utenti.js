const crypto = require("crypto");

const { generaImpronta, verificaPassword } = require("./password");
const { RUOLI } = require("./adminAuth");

// Gli amministratori tenuti nella tabella `admin_users`.
//
// Quello di `.env` non sta qui dentro, e non e' una dimenticanza. Se gli
// unici amministratori stessero nel database, il giorno che il database non
// risponde nessuno potrebbe entrare nel pannello per vedere che il database
// non risponde. Quello dell'ambiente e' la chiave sotto lo zerbino; questi
// sono gli ordinari. Conseguenza voluta: nessun amministratore della tabella
// puo' disabilitare quello dell'ambiente, perche' non ha una riga da toccare.
const TABELLA = "admin_users";

// Il nome: lettere, cifre, punto, trattino e trattino basso. Non e' una
// restrizione estetica - il nome finisce nel soggetto del token, nelle righe
// della traccia e nell'URL delle rotte di gestione, e tenerlo semplice
// significa che non deve essere sfuggito in tre posti diversi.
const NOME_VALIDO = /^[A-Za-z0-9._-]{3,32}$/;

const PASSWORD_MINIMA = 12;

// Lo stato di un amministratore si rilegge dal database ogni dieci secondi.
//
// Serve perche' disabilitare un accesso deve chiudere la sessione **subito**,
// non alla scadenza del token. Una lista in memoria farebbe la stessa cosa e
// costerebbe meno, ma si svuoterebbe al riavvio: dopo un riavvio il token di
// un amministratore disabilitato tornerebbe a funzionare fino a scadenza. Una
// interrogazione ogni dieci secondi per amministratore collegato e' un prezzo
// che si paga volentieri per non avere quel buco.
const DURATA_CACHE_MS = 10 * 1000;

// La presenza della tabella si ricontrolla solo finche' non c'e': una volta
// trovata non cambia piu', e dopo la migrazione il pannello se ne accorge da
// se' entro questo tempo, senza un riavvio.
const ATTESA_RICONTROLLO_MS = 10 * 1000;

const perLUtente = (messaggio) =>
  Object.assign(new Error(messaggio), { perLUtente: true });

const interroga = (sql, parametri = []) =>
  new Promise((risolvi, rifiuta) => {
    if (!global.connection) return rifiuta(new Error("pool non disponibile"));
    global.connection.query(sql, parametri, (errore, risultato) =>
      errore ? rifiuta(errore) : risolvi(risultato)
    );
  });

let tabella = { presente: false, controllataIl: 0 };

const tabellaPresente = async () => {
  if (tabella.presente) return true;
  if (Date.now() - tabella.controllataIl < ATTESA_RICONTROLLO_MS) return false;

  try {
    const righe = await interroga(
      `SELECT COUNT(*) AS quante
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [TABELLA]
    );
    tabella = {
      presente: Number(righe[0] ? righe[0].quante : 0) > 0,
      controllataIl: Date.now(),
    };
  } catch (errore) {
    // Database non raggiungibile: non si sa, e non sapere vale come "non
    // c'e'". Il pannello resta in piedi con l'amministratore dell'ambiente,
    // che e' esattamente il caso per cui esiste.
    tabella = { presente: false, controllataIl: Date.now() };
  }

  return tabella.presente;
};

const esigiTabella = async () => {
  if (await tabellaPresente()) return;
  throw perLUtente(
    "la tabella degli amministratori non esiste ancora: " +
      "va applicata la migrazione 009_admin_users.sql"
  );
};

const ruoloValido = (ruolo) => Object.values(RUOLI).includes(ruolo);

const epoca = (valore) => {
  if (!valore) return null;
  const d = valore instanceof Date ? valore : new Date(valore);
  return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
};

const iso = (valore) => {
  if (!valore) return null;
  const d = valore instanceof Date ? valore : new Date(valore);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// La riga come la vede il pannello: senza impronta, mai, nemmeno di passaggio.
const perLaVista = (r) => ({
  nome: r.username,
  ruolo: r.role,
  abilitato: Boolean(Number(r.enabled)),
  creatoIl: iso(r.created_at),
  creatoDa: r.created_by || null,
  aggiornatoIl: iso(r.updated_at),
  ultimoAccesso: iso(r.last_login_at),
  passwordCambiataIl: iso(r.password_changed_at),
});

const trova = async (nome) => {
  const righe = await interroga(
    `SELECT id, username, password_hash, role, enabled, created_at, created_by,
            updated_at, last_login_at, password_changed_at
     FROM ${TABELLA} WHERE username = ? LIMIT 1`,
    [String(nome === undefined || nome === null ? "" : nome)]
  );
  return righe.length ? righe[0] : null;
};

const elenco = async () => {
  await esigiTabella();
  const righe = await interroga(
    `SELECT id, username, role, enabled, created_at, created_by,
            updated_at, last_login_at, password_changed_at
     FROM ${TABELLA} ORDER BY username ASC`
  );
  return righe.map(perLaVista);
};

const controllaNome = (nome, utenteAmbiente) => {
  if (typeof nome !== "string" || !NOME_VALIDO.test(nome)) {
    throw perLUtente(
      "il nome deve essere lungo da 3 a 32 caratteri, fra lettere, cifre, punto, trattino e trattino basso"
    );
  }

  // Due identita' con lo stesso nome e password diverse sarebbero un modo di
  // sbagliarsi che non si vede guardando l'elenco.
  if (
    typeof utenteAmbiente === "string" &&
    nome.toLowerCase() === utenteAmbiente.toLowerCase()
  ) {
    throw perLUtente(
      "questo nome e' quello dell'amministratore scritto in .env: scegline un altro"
    );
  }
};

const controllaPassword = (password) => {
  if (typeof password !== "string" || password.length < PASSWORD_MINIMA) {
    throw perLUtente(`la password deve essere lunga almeno ${PASSWORD_MINIMA} caratteri`);
  }
};

const crea = async ({ nome, password, ruolo, creatoDa, utenteAmbiente } = {}) => {
  await esigiTabella();
  controllaNome(nome, utenteAmbiente);
  controllaPassword(password);

  const ruoloScelto = ruolo || RUOLI.OPERATORE;
  if (!ruoloValido(ruoloScelto)) {
    throw perLUtente(`ruolo sconosciuto: ${ruoloScelto}`);
  }

  const impronta = await generaImpronta(password);

  try {
    await interroga(
      `INSERT INTO ${TABELLA} (username, password_hash, role, enabled, created_by)
       VALUES (?, ?, ?, 1, ?)`,
      [nome, impronta, ruoloScelto, creatoDa || null]
    );
  } catch (errore) {
    if (errore && errore.code === "ER_DUP_ENTRY") {
      throw perLUtente("esiste gia' un amministratore con questo nome");
    }
    throw errore;
  }

  return { nome, ruolo: ruoloScelto, abilitato: true };
};

const esigiRiga = async (nome) => {
  await esigiTabella();
  const riga = await trova(nome);
  if (!riga) throw perLUtente("questo amministratore non esiste");
  return riga;
};

const cambiaPassword = async ({ nome, password } = {}) => {
  const riga = await esigiRiga(nome);
  controllaPassword(password);

  const impronta = await generaImpronta(password);
  await interroga(
    `UPDATE ${TABELLA}
     SET password_hash = ?, password_changed_at = NOW(), updated_at = NOW()
     WHERE id = ?`,
    [impronta, riga.id]
  );

  // La cache porta l'istante del cambio, ed e' quello che chiude le sessioni
  // aperte con la password di prima: va buttata subito, o per dieci secondi
  // resterebbero valide.
  scordaStato(riga.username);
  return { nome: riga.username };
};

// Il cambio fatto dall'interessato: vuole la password attuale, perche' chi si
// siede davanti a una sessione lasciata aperta non deve poterla cambiare.
const cambiaPasswordDaSe = async ({ nome, passwordAttuale, passwordNuova } = {}) => {
  const riga = await esigiRiga(nome);

  const giusta = await verificaPassword(passwordAttuale, riga.password_hash);
  if (!giusta) throw perLUtente("la password attuale non e' quella giusta");

  if (typeof passwordNuova === "string" && passwordNuova === passwordAttuale) {
    throw perLUtente("la password nuova e' identica a quella attuale");
  }

  return cambiaPassword({ nome: riga.username, password: passwordNuova });
};

const abilita = async ({ nome, acceso, chiLoChiede } = {}) => {
  const riga = await esigiRiga(nome);

  if (
    !acceso &&
    typeof chiLoChiede === "string" &&
    chiLoChiede.toLowerCase() === riga.username.toLowerCase()
  ) {
    throw perLUtente("non puoi disabilitare te stesso");
  }

  await interroga(
    `UPDATE ${TABELLA} SET enabled = ?, updated_at = NOW() WHERE id = ?`,
    [acceso ? 1 : 0, riga.id]
  );

  scordaStato(riga.username);
  return { nome: riga.username, abilitato: Boolean(acceso) };
};

const elimina = async ({ nome, chiLoChiede } = {}) => {
  const riga = await esigiRiga(nome);

  if (
    typeof chiLoChiede === "string" &&
    chiLoChiede.toLowerCase() === riga.username.toLowerCase()
  ) {
    throw perLUtente("non puoi eliminare te stesso");
  }

  await interroga(`DELETE FROM ${TABELLA} WHERE id = ?`, [riga.id]);
  scordaStato(riga.username);

  // Le azioni di questo amministratore restano in `system_logs`: il nome e'
  // scritto come testo, non come riferimento a questa tabella.
  return { nome: riga.username };
};

// L'impronta su cui si spende lo stesso `scrypt` quando il nome non esiste.
// E' l'impronta di byte casuali che nessuno vede mai: senza di essa un nome
// inesistente risponderebbe molto piu' in fretta di uno esistente, e quella
// differenza direbbe quali nomi esistono.
let improntaDiRiserva = null;

const riserva = async () => {
  if (!improntaDiRiserva) {
    improntaDiRiserva = await generaImpronta(crypto.randomBytes(24).toString("hex"));
  }
  return improntaDiRiserva;
};

const verifica = async ({ nome, password } = {}) => {
  if (!(await tabellaPresente())) return { ok: false };

  const riga = typeof nome === "string" && nome !== "" ? await trova(nome) : null;
  const impronta = riga ? riga.password_hash : await riserva();
  const giusta = await verificaPassword(password, impronta);

  if (!riga || !giusta) return { ok: false };

  // Disabilitato non entra. Il rifiuto e' lo stesso di una password sbagliata:
  // chi prova non deve imparare che quel nome esiste ma e' chiuso.
  if (!Boolean(Number(riga.enabled))) return { ok: false };

  return {
    ok: true,
    utente: {
      nome: riga.username,
      ruolo: ruoloValido(riga.role) ? riga.role : RUOLI.OPERATORE,
      passwordCambiataIl: epoca(riga.password_changed_at),
    },
  };
};

const segnaAccesso = (nome) => {
  // Senza attendere e senza far cadere l'accesso: e' una comodita' per
  // l'elenco, non un pezzo dell'autenticazione.
  interroga(`UPDATE ${TABELLA} SET last_login_at = NOW() WHERE username = ?`, [nome]).catch(
    () => {}
  );
};

// ---------------------------------------------------------------- lo stato
//
// Cio' che il cancello controlla a ogni richiesta, con la cache davanti.

const cache = new Map();

const scordaStato = (nome) => {
  cache.delete(String(nome).toLowerCase());
};

const stato = async (nome) => {
  const chiave = String(nome === undefined || nome === null ? "" : nome).toLowerCase();
  const adesso = Date.now();
  const tenuto = cache.get(chiave);
  if (tenuto && adesso - tenuto.istante < DURATA_CACHE_MS) {
    return tenuto.dati;
  }

  if (!(await tabellaPresente())) {
    // Non si finge che vada bene: senza tabella un amministratore della
    // tabella non esiste.
    return { esiste: false };
  }

  const riga = await trova(nome);
  const dati = riga
    ? {
        esiste: true,
        abilitato: Boolean(Number(riga.enabled)),
        ruolo: ruoloValido(riga.role) ? riga.role : RUOLI.OPERATORE,
        passwordCambiataIl: epoca(riga.password_changed_at),
      }
    : { esiste: false };

  cache.set(chiave, { istante: adesso, dati });
  return dati;
};

const azzeraCache = () => {
  cache.clear();
  tabella = { presente: false, controllataIl: 0 };
  improntaDiRiserva = null;
};

module.exports = {
  tabellaPresente,
  elenco,
  trova,
  crea,
  cambiaPassword,
  cambiaPasswordDaSe,
  abilita,
  elimina,
  verifica,
  segnaAccesso,
  stato,
  scordaStato,
  azzeraCache,
  perLaVista,
  TABELLA,
  NOME_VALIDO,
  PASSWORD_MINIMA,
  DURATA_CACHE_MS,
};
