// Metriche del database.
//
// Le interrogazioni passano da `global.connection`, lo stesso pool
// dell'applicazione: il pannello deve misurare la salute di *quella*
// connessione, non di una propria aperta per l'occasione, che potrebbe stare
// benissimo mentre il pool e' esaurito.
const VARIABILI_STATO = [
  "Threads_connected",
  "Threads_running",
  "Uptime",
  "Queries",
  "Slow_queries",
  "Aborted_connects",
  "Max_used_connections",
  "Connections",
];

// Un giorno del calendario, non un istante.
//
// Il driver restituisce `DATE(created_at)` come mezzanotte *locale*:
// `toISOString()` la riporta a UTC e, con un fuso a est di Greenwich, ogni
// giorno slitta indietro di uno. L'istogramma del registro mostrava le righe
// di oggi sotto la data di ieri. Si formatta dalle componenti locali, che sono
// quelle con cui il database ha raggruppato.
const soloData = (valore) => {
  if (!valore) return null;
  const d = valore instanceof Date ? valore : new Date(valore);
  if (Number.isNaN(d.getTime())) return null;
  const due = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
};

const interroga = (sql, parametri = []) =>
  new Promise((risolvi, rifiuta) => {
    if (!global.connection) return rifiuta(new Error("pool non disponibile"));
    global.connection.query(sql, parametri, (errore, righe) =>
      errore ? rifiuta(errore) : risolvi(righe)
    );
  });

// Le dimensioni delle tabelle si leggono da information_schema, che non e'
// gratis: con il pannello che si aggiorna da se' la si interrogherebbe in
// continuazione per un dato che cambia lentamente. Si tiene per mezzo minuto.
const DURATA_CACHE_TABELLE = 30 * 1000;
let cacheTabelle = { istante: 0, dati: null };

const ping = async () => {
  const avvio = process.hrtime.bigint();
  try {
    await interroga("SELECT 1");
    return {
      risponde: true,
      latenzaMs: Math.round(Number(process.hrtime.bigint() - avvio) / 1e4) / 100,
    };
  } catch (errore) {
    return { risponde: false, errore: errore.message };
  }
};

// Il pool di `mysql` v2 non espone contatori pubblici: si leggono i campi
// interni, con prudenza. Se una versione futura li rinomina il pannello
// mostrera' null invece di cadere, e il resto della schermata resta buono.
const statoPool = () => {
  const pool = global.connection;
  if (!pool) return null;

  const quanti = (campo) => {
    const valore = pool[campo];
    if (Array.isArray(valore)) return valore.length;
    if (valore && typeof valore.length === "number") return valore.length;
    return null;
  };

  const tutte = quanti("_allConnections");
  const libere = quanti("_freeConnections");

  return {
    aperte: tutte,
    libere,
    occupate: tutte !== null && libere !== null ? tutte - libere : null,
    inAcquisizione: quanti("_acquiringConnections"),
    inCoda: quanti("_connectionQueue"),
    // Il limite e' quello scritto in `config/database.js`.
    limite: pool.config && pool.config.connectionLimit ? pool.config.connectionLimit : null,
    chiuso: Boolean(pool._closed),
  };
};

const statoServer = async () => {
  const righe = await interroga(
    `SHOW GLOBAL STATUS WHERE Variable_name IN (${VARIABILI_STATO.map(() => "?").join(",")})`,
    VARIABILI_STATO
  );

  const fuori = {};
  for (const riga of righe) {
    const nome = riga.Variable_name || riga.variable_name;
    const valore = Number(riga.Value !== undefined ? riga.Value : riga.value);
    fuori[nome] = Number.isFinite(valore) ? valore : null;
  }
  return fuori;
};

const tabelle = async (schema) => {
  const adesso = Date.now();
  if (cacheTabelle.dati && adesso - cacheTabelle.istante < DURATA_CACHE_TABELLE) {
    return { ...cacheTabelle.dati, dallaCache: true };
  }

  const righe = await interroga(
    `SELECT table_name AS tabella,
            table_rows AS righe,
            data_length AS byteDati,
            index_length AS byteIndici,
            engine
     FROM information_schema.tables
     WHERE table_schema = ?
     ORDER BY (data_length + index_length) DESC`,
    [schema]
  );

  const elenco = righe.map((r) => ({
    // MariaDB restituisce `tabella` o `TABLE_NAME` secondo la versione.
    nome: r.tabella || r.TABLE_NAME,
    // `table_rows` e' una stima per InnoDB, non un conteggio: va detto, non
    // corretto con un COUNT(*) per tabella a ogni aggiornamento.
    righeStimate: Number(r.righe) || 0,
    byte: (Number(r.byteDati) || 0) + (Number(r.byteIndici) || 0),
    byteDati: Number(r.byteDati) || 0,
    byteIndici: Number(r.byteIndici) || 0,
    motore: r.engine || r.ENGINE,
  }));

  const dati = {
    elenco,
    totaleByte: elenco.reduce((somma, t) => somma + t.byte, 0),
    quante: elenco.length,
    dallaCache: false,
  };

  cacheTabelle = { istante: adesso, dati };
  return dati;
};

const versione = async () => {
  const righe = await interroga("SELECT VERSION() AS versione");
  return righe.length ? righe[0].versione : null;
};

// Il registro visto come oggetto da tenere d'occhio: quanto pesa, quanto
// copre, quanto cresce. E' cio' che serve a decidere quando lanciare la
// purga, che resta uno script lanciato a mano.
const registro = async () => {
  const righe = await interroga(
    `SELECT COUNT(*) AS righe,
            MIN(created_at) AS prima,
            MAX(created_at) AS ultima,
            SUM(LENGTH(details)) AS byteDettagli
     FROM system_logs`
  );
  const r = righe[0] || {};

  const perGiorno = await interroga(
    `SELECT DATE(created_at) AS giorno, COUNT(*) AS righe
     FROM system_logs
     WHERE created_at >= NOW() - INTERVAL 14 DAY
     GROUP BY DATE(created_at)
     ORDER BY giorno DESC`
  );

  return {
    righe: Number(r.righe) || 0,
    prima: r.prima ? new Date(r.prima).toISOString() : null,
    ultima: r.ultima ? new Date(r.ultima).toISOString() : null,
    byteDettagli: Number(r.byteDettagli) || 0,
    perGiorno: perGiorno.map((g) => ({
      giorno: soloData(g.giorno),
      righe: Number(g.righe) || 0,
    })),
  };
};

const raccogli = async (schema = process.env.DB_DATABASE) => {
  const risposta = await ping();

  if (!risposta.risponde) {
    // Senza database non si finge: si dice che non risponde e si restituisce
    // quel poco che si sa comunque, cioe' lo stato del pool.
    return { ping: risposta, pool: statoPool() };
  }

  const [v, stato, tab, reg] = await Promise.all([
    versione(),
    statoServer(),
    tabelle(schema),
    registro(),
  ]);

  return {
    istante: new Date().toISOString(),
    ping: risposta,
    versione: v,
    schema,
    pool: statoPool(),
    server: stato,
    tabelle: tab,
    registro: reg,
  };
};

const azzeraCache = () => {
  cacheTabelle = { istante: 0, dati: null };
};

module.exports = {
  raccogli,
  ping,
  statoPool,
  statoServer,
  tabelle,
  registro,
  versione,
  azzeraCache,
  soloData,
  VARIABILI_STATO,
};
