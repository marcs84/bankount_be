const sysLogger = require("../sysLogger");

// La purga del registro.
//
// Una sola funzione, usata da due parti: il bottone del pannello, che chiede
// una conferma battuta a mano, e il cron di scadenza, che nasce spento. Se
// fossero due codici diversi, uno dei due sarebbe quello meno provato, e
// sarebbe quello che cancella davvero.
//
// La traccia dell'amministratore e' esclusa in modo predefinito. `ADMIN_AUTH`
// e `ADMIN_ACTION` sono l'unica memoria di chi e' entrato nel pannello e cosa
// ha fatto: una purga generica non deve portarsela via senza che nessuno
// l'abbia chiesto. Per toglierla bisogna nominare quei tipi.
const TIPI_PROTETTI = ["ADMIN_AUTH", "ADMIN_ACTION"];

// A lotti, non in un colpo. Una `DELETE` da decine di migliaia di righe tiene
// la tabella occupata per tutto il tempo che ci mette, e nel frattempo ogni
// richiesta che arriva deve scriverci dentro.
const LOTTO = 2000;
const LOTTI_MASSIMI = 500;

// Non si cancella fino a "adesso". Il margine serve perche' la riga che
// racconta la purga viene scritta subito dopo la purga stessa, e perche' una
// data sbagliata di un paio di minuti non deve poter svuotare il registro di
// cio' che sta succedendo mentre si guarda.
const MARGINE_MINIMO_MS = 60 * 60 * 1000;

const interroga = (sql, parametri = []) =>
  new Promise((risolvi, rifiuta) => {
    if (!global.connection) return rifiuta(new Error("pool non disponibile"));
    global.connection.query(sql, parametri, (errore, risultato) =>
      errore ? rifiuta(errore) : risolvi(risultato)
    );
  });

const elencoTipi = (tipi) => {
  const grezzo = Array.isArray(tipi) ? tipi : String(tipi || "").split(",");
  const puliti = grezzo
    .map((t) => String(t || "").trim().toUpperCase())
    .filter((t) => t !== "" && /^[A-Z0-9_]{1,50}$/.test(t));
  return [...new Set(puliti)].slice(0, 12);
};

// Le condizioni della purga: la stessa coppia usata dall'anteprima e dalla
// cancellazione, cosi' il numero mostrato prima e quello cancellato dopo non
// possono venire da due filtri diversi.
const condizioni = (primaDi, tipi) => {
  const scelti = elencoTipi(tipi);

  if (scelti.length) {
    return {
      sql: `created_at < ? AND log_type IN (${scelti.map(() => "?").join(",")})`,
      parametri: [primaDi, ...scelti],
      tipi: scelti,
      protettiInclusi: scelti.filter((t) => TIPI_PROTETTI.includes(t)),
    };
  }

  return {
    sql: `created_at < ? AND log_type NOT IN (${TIPI_PROTETTI.map(() => "?").join(",")})`,
    parametri: [primaDi, ...TIPI_PROTETTI],
    tipi: null,
    protettiInclusi: [],
  };
};

const dataValida = (valore) => {
  const d = valore instanceof Date ? valore : new Date(valore);
  if (Number.isNaN(d.getTime())) {
    throw new Error("data non valida");
  }
  if (d.getTime() > Date.now() - MARGINE_MINIMO_MS) {
    throw new Error(
      "la data deve essere almeno un'ora nel passato: una purga fino a adesso " +
        "cancellerebbe anche le righe di cio' che sta succedendo"
    );
  }
  return d;
};

const primaDiGiorni = (giorni) => {
  const n = Number.parseInt(giorni, 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error("i giorni di conservazione devono essere almeno 1");
  }
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
};

// Quanto porterebbe via, prima di portarlo via. E' cio' che il pannello mostra
// accanto alla casella della conferma: una conferma battuta su un numero che
// non si conosce non e' una conferma.
const anteprima = async ({ primaDi, tipi } = {}) => {
  const data = dataValida(primaDi);
  const dove = condizioni(data, tipi);

  const righe = await interroga(
    `SELECT COUNT(*) AS quante, MIN(created_at) AS prima, MAX(created_at) AS ultima
     FROM system_logs WHERE ${dove.sql}`,
    dove.parametri
  );
  const r = righe[0] || {};

  const totali = await interroga("SELECT COUNT(*) AS quante FROM system_logs");

  return {
    primaDi: data.toISOString(),
    tipi: dove.tipi,
    tipiProtetti: dove.tipi ? [] : TIPI_PROTETTI,
    righe: Number(r.quante) || 0,
    prima: r.prima ? new Date(r.prima).toISOString() : null,
    ultima: r.ultima ? new Date(r.ultima).toISOString() : null,
    righeTotali: Number(totali[0] ? totali[0].quante : 0) || 0,
  };
};

const purga = async ({ primaDi, tipi, origine = "manuale" } = {}) => {
  const data = dataValida(primaDi);
  const dove = condizioni(data, tipi);

  let righe = 0;
  let lotti = 0;
  let incompleta = false;
  const avvio = Date.now();

  for (;;) {
    // `ORDER BY id` rende deterministico quale lotto va via per primo: senza,
    // il database sceglie, e due esecuzioni della stessa purga toccherebbero
    // righe in ordine diverso.
    const risultato = await interroga(
      `DELETE FROM system_logs WHERE ${dove.sql} ORDER BY id LIMIT ?`,
      [...dove.parametri, LOTTO]
    );

    const quante = Number(risultato && risultato.affectedRows) || 0;
    righe += quante;
    lotti += 1;

    if (quante < LOTTO) break;

    if (lotti >= LOTTI_MASSIMI) {
      // Si ferma e lo dice. Una purga che gira senza fine su una tabella
      // enorme e' indistinguibile da una bloccata, e chi guarda il pannello
      // non deve dover indovinare quale delle due.
      incompleta = true;
      break;
    }
  }

  const esito = {
    primaDi: data.toISOString(),
    tipi: dove.tipi,
    righe,
    lotti,
    incompleta,
    durataMs: Date.now() - avvio,
    origine,
  };

  // Scritta *dopo*: una riga scritta prima sarebbe stata cancellata dalla
  // purga stessa se fosse caduta dentro l'intervallo. E il tipo e'
  // `SYSTEM_EVENT`, non `ADMIN_ACTION`, perche' la purga la lancia anche il
  // cron, quando non c'e' nessun amministratore collegato.
  sysLogger.logToDb(
    "SYSTEM_EVENT",
    "logPurge.eseguita",
    esito,
    incompleta ? "WARN" : "INFO",
    esito.durataMs
  );

  return esito;
};

module.exports = {
  purga,
  anteprima,
  primaDiGiorni,
  condizioni,
  elencoTipi,
  TIPI_PROTETTI,
  LOTTO,
  LOTTI_MASSIMI,
  MARGINE_MINIMO_MS,
};
