const { maschera, mascheraAzione } = require("./maschera");

// Il visore del registro.
//
// `system_logs` raccoglie da sola quasi tutto cio' che serve sapere: ogni
// richiesta API con corpo e risposta ripuliti, ogni evento di sistema, ogni
// errore non raccolto. Qui non si raccoglie niente di nuovo: si guarda.
//
// Tutte le interrogazioni passano da segnaposti. I filtri che arrivano dalla
// pagina non vengono mai cuciti nel testo dell'SQL, nemmeno i nomi dei tipi,
// nemmeno quando sono scelti da un elenco: un elenco si cambia, e un giorno
// qualcuno aggiunge accanto una casella libera.
const LIMITE_MASSIMO = 200;
const LIMITE_PREDEFINITO = 50;

// Oltre questa soglia il conteggio esatto non si fa: su una tabella grande
// `COUNT(*)` con un filtro largo costa piu' della pagina che si sta
// guardando, e "piu' di diecimila" dice la stessa cosa a chi legge.
const TETTO_CONTEGGIO = 10000;

const FINESTRE = {
  "15m": 15 * 60,
  "1h": 60 * 60,
  "6h": 6 * 60 * 60,
  "24h": 24 * 60 * 60,
  "7g": 7 * 24 * 60 * 60,
  "30g": 30 * 24 * 60 * 60,
  tutto: null,
};

const MASSIMO_VALORI = 12;

const interroga = (sql, parametri = []) =>
  new Promise((risolvi, rifiuta) => {
    if (!global.connection) return rifiuta(new Error("pool non disponibile"));
    global.connection.query(sql, parametri, (errore, righe) =>
      errore ? rifiuta(errore) : risolvi(righe)
    );
  });

const intero = (valore, predefinito, minimo, massimo) => {
  const n = Number.parseInt(valore, 10);
  if (!Number.isFinite(n)) return predefinito;
  return Math.min(massimo, Math.max(minimo, n));
};

const istante = (valore) => {
  if (!valore) return null;
  const d = new Date(valore);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Un elenco di valori che arriva dalla pagina: ripulito nel numero e nella
// forma, perche' un filtro con mille voci e' un modo di far lavorare il
// database senza chiedere niente.
const elencoValori = (valore) => {
  const grezzo = Array.isArray(valore) ? valore : String(valore || "").split(",");
  const puliti = grezzo
    .map((v) => String(v || "").trim().toUpperCase())
    .filter((v) => v !== "" && /^[A-Z0-9_]{1,50}$/.test(v));
  return [...new Set(puliti)].slice(0, MASSIMO_VALORI);
};

const testoBreve = (valore, massimo = 200) => {
  const s = String(valore === undefined || valore === null ? "" : valore).trim();
  return s === "" ? null : s.slice(0, massimo);
};

// Il carattere di fuga di LIKE: senza, un `%` battuto nella casella di
// ricerca significherebbe "qualunque cosa" invece di cercare un per cento.
const perLike = (testo) => testo.replace(/[\\%_]/g, (c) => `\\${c}`);

// Da filtri a `WHERE`. Una sola funzione, usata da tutte le interrogazioni
// (righe, conteggio, statistiche): se la pagina mostrasse un totale calcolato
// con condizioni diverse da quelle delle righe, non ci sarebbe modo di
// accorgersene guardando lo schermo.
const condizioni = (filtri = {}) => {
  const dove = [];
  const parametri = [];

  const finestra = Object.prototype.hasOwnProperty.call(FINESTRE, filtri.finestra)
    ? filtri.finestra
    : "24h";

  const da = istante(filtri.da);
  const a = istante(filtri.a);

  if (da) {
    dove.push("created_at >= ?");
    parametri.push(da);
  } else if (FINESTRE[finestra] !== null) {
    dove.push("created_at >= NOW() - INTERVAL ? SECOND");
    parametri.push(FINESTRE[finestra]);
  }

  if (a) {
    dove.push("created_at <= ?");
    parametri.push(a);
  }

  const tipi = elencoValori(filtri.tipo);
  if (tipi.length) {
    dove.push(`log_type IN (${tipi.map(() => "?").join(",")})`);
    parametri.push(...tipi);
  }

  const stati = elencoValori(filtri.stato);
  if (stati.length) {
    dove.push(`status IN (${stati.map(() => "?").join(",")})`);
    parametri.push(...stati);
  }

  const azione = testoBreve(filtri.azione);
  if (azione) {
    dove.push("action LIKE ?");
    parametri.push(`%${perLike(azione)}%`);
  }

  // Il testo libero cerca dentro i dettagli. E' una scansione: non c'e'
  // indice che possa aiutarla, e la pagina lo dice invece di farla sembrare
  // gratis.
  const testo = testoBreve(filtri.testo);
  if (testo) {
    dove.push("details LIKE ?");
    parametri.push(`%${perLike(testo)}%`);
  }

  const durata = Number.parseInt(filtri.durataMinMs, 10);
  if (Number.isFinite(durata) && durata > 0) {
    dove.push("duration_ms >= ?");
    parametri.push(durata);
  }

  return {
    sql: dove.length ? `WHERE ${dove.join(" AND ")}` : "",
    parametri,
    lenta: Boolean(testo),
    finestra,
  };
};

const dettagli = (testo) => {
  if (testo === null || testo === undefined) return null;
  try {
    const dato = JSON.parse(testo);
    return dato && typeof dato === "object" ? dato : testo;
  } catch (e) {
    return testo;
  }
};

const riga = (r, mascherare) => {
  const corpo = dettagli(r.details);
  return {
    id: r.id,
    tipo: r.log_type,
    azione: mascherare ? mascheraAzione(r.action) : r.action,
    stato: r.status,
    durataMs:
      r.duration_ms === null || r.duration_ms === undefined ? null : Number(r.duration_ms),
    istante: r.created_at ? new Date(r.created_at).toISOString() : null,
    dettagli: mascherare && corpo && typeof corpo === "object" ? maschera(corpo) : corpo,
  };
};

const vuoleMaschera = (valore) => valore !== false && valore !== "false";

// Il conteggio con il tetto. `LIMIT` dentro una sottointerrogazione fa
// fermare il database appena ha visto abbastanza righe.
const conta = async (dove) => {
  const righe = await interroga(
    `SELECT COUNT(*) AS quante FROM (
       SELECT 1 FROM system_logs ${dove.sql} LIMIT ${TETTO_CONTEGGIO + 1}
     ) AS limitate`,
    dove.parametri
  );
  const quante = Number(righe[0] ? righe[0].quante : 0) || 0;
  return quante > TETTO_CONTEGGIO
    ? { totale: TETTO_CONTEGGIO, esatto: false }
    : { totale: quante, esatto: true };
};

const cerca = async (filtri = {}) => {
  const dove = condizioni(filtri);
  const limite = intero(filtri.limite, LIMITE_PREDEFINITO, 1, LIMITE_MASSIMO);
  const pagina = intero(filtri.pagina, 1, 1, 10000);
  const salto = (pagina - 1) * limite;
  const mascherare = vuoleMaschera(filtri.maschera);

  // Ordinate per `id`, non per `created_at`: quella colonna e' un timestamp
  // al secondo, e piu' righe dello stesso secondo tornerebbero in ordine
  // arbitrario. Due pagine di seguito potrebbero cosi' ripetere una riga e
  // perderne un'altra. L'identificativo cresce, quindi l'ordine e' comunque
  // quello del tempo, ed e' un ordine totale.
  const righe = await interroga(
    `SELECT id, log_type, action, details, status, duration_ms, created_at
     FROM system_logs ${dove.sql}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...dove.parametri, limite, salto]
  );

  const conteggio = await conta(dove);

  return {
    righe: righe.map((r) => riga(r, mascherare)),
    pagina,
    limite,
    totale: conteggio.totale,
    totaleEsatto: conteggio.esatto,
    pagine: Math.max(1, Math.ceil(conteggio.totale / limite)),
    mascherato: mascherare,
    interrogazioneLenta: dove.lenta,
    finestra: dove.finestra,
  };
};

const unaRiga = async (id, opzioni = {}) => {
  const numero = Number.parseInt(id, 10);
  if (!Number.isFinite(numero)) return null;
  const righe = await interroga(
    `SELECT id, log_type, action, details, status, duration_ms, created_at
     FROM system_logs WHERE id = ?`,
    [numero]
  );
  if (!righe.length) return null;
  return riga(righe[0], vuoleMaschera(opzioni.maschera));
};

// Le statistiche rispondono a tre domande che il solo elenco non risponde:
// quando sono arrivati gli errori, quali rotte sono lente, quali rotte sono
// battute. Tutte e tre sugli stessi filtri dell'elenco.
const statistiche = async (filtri = {}) => {
  const dove = condizioni(filtri);
  const mascherare = vuoleMaschera(filtri.maschera);

  const perTipo = await interroga(
    `SELECT log_type AS tipo, status AS stato, COUNT(*) AS righe
     FROM system_logs ${dove.sql}
     GROUP BY log_type, status
     ORDER BY righe DESC`,
    dove.parametri
  );

  // Raggruppate per ora dell'orologio locale, cosi' l'istogramma si legge
  // accanto all'orologio di chi guarda: il database raggruppa con il suo
  // fuso, che e' quello del processo.
  const perOra = await interroga(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS ora,
            SUM(status = 'ERROR') AS errori,
            COUNT(*) AS righe
     FROM system_logs ${dove.sql}
     GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:00')
     ORDER BY ora DESC
     LIMIT 48`,
    dove.parametri
  );

  const frequenti = await interroga(
    `SELECT action AS azione, COUNT(*) AS righe,
            SUM(status = 'ERROR') AS errori,
            ROUND(AVG(duration_ms), 1) AS durataMedia,
            MAX(duration_ms) AS durataMassima
     FROM system_logs ${dove.sql}
     GROUP BY action
     ORDER BY righe DESC
     LIMIT 15`,
    dove.parametri
  );

  // Le piu' lente si cercano solo dove la durata c'e': le righe scritte prima
  // che la colonna esistesse, e gli eventi di sistema, hanno `null`, e una
  // media che le contasse come zero farebbe sembrare veloce tutto.
  const lente = await interroga(
    `SELECT action AS azione, COUNT(*) AS righe,
            ROUND(AVG(duration_ms), 1) AS durataMedia,
            MAX(duration_ms) AS durataMassima
     FROM system_logs ${dove.sql}${dove.sql ? " AND" : " WHERE"} duration_ms IS NOT NULL
     GROUP BY action
     ORDER BY durataMedia DESC
     LIMIT 15`,
    dove.parametri
  );

  const nome = (azione) => (mascherare ? mascheraAzione(azione) : azione);

  return {
    finestra: dove.finestra,
    perTipo: perTipo.map((r) => ({
      tipo: r.tipo,
      stato: r.stato,
      righe: Number(r.righe) || 0,
    })),
    perOra: perOra
      .map((r) => ({
        ora: r.ora,
        righe: Number(r.righe) || 0,
        errori: Number(r.errori) || 0,
      }))
      .reverse(),
    frequenti: frequenti.map((r) => ({
      azione: nome(r.azione),
      righe: Number(r.righe) || 0,
      errori: Number(r.errori) || 0,
      durataMedia: r.durataMedia === null ? null : Number(r.durataMedia),
      durataMassima: r.durataMassima === null ? null : Number(r.durataMassima),
    })),
    lente: lente.map((r) => ({
      azione: nome(r.azione),
      righe: Number(r.righe) || 0,
      durataMedia: r.durataMedia === null ? null : Number(r.durataMedia),
      durataMassima: r.durataMassima === null ? null : Number(r.durataMassima),
    })),
  };
};

// Le voci con cui si riempiono i menu dei filtri. Si leggono dal registro e
// non da un elenco scritto nel codice: i tipi nascono dal codice che scrive,
// e un elenco a mano resterebbe indietro senza dirlo.
let cacheVoci = { istante: 0, dati: null };
const DURATA_CACHE = 60 * 1000;

const voci = async () => {
  const adesso = Date.now();
  if (cacheVoci.dati && adesso - cacheVoci.istante < DURATA_CACHE) {
    return { ...cacheVoci.dati, dallaCache: true };
  }

  const tipi = await interroga(
    "SELECT log_type AS valore, COUNT(*) AS righe FROM system_logs GROUP BY log_type ORDER BY righe DESC"
  );
  const stati = await interroga(
    "SELECT status AS valore, COUNT(*) AS righe FROM system_logs GROUP BY status ORDER BY righe DESC"
  );

  const dati = {
    tipi: tipi.map((r) => ({ valore: r.valore, righe: Number(r.righe) || 0 })),
    stati: stati.map((r) => ({ valore: r.valore, righe: Number(r.righe) || 0 })),
    finestre: Object.keys(FINESTRE),
    limiteMassimo: LIMITE_MASSIMO,
    tettoConteggio: TETTO_CONTEGGIO,
    dallaCache: false,
  };

  cacheVoci = { istante: adesso, dati };
  return dati;
};

const azzeraCache = () => {
  cacheVoci = { istante: 0, dati: null };
};

module.exports = {
  cerca,
  vuoleMaschera,
  unaRiga,
  statistiche,
  voci,
  condizioni,
  azzeraCache,
  perLike,
  elencoValori,
  FINESTRE,
  LIMITE_MASSIMO,
  LIMITE_PREDEFINITO,
  TETTO_CONTEGGIO,
};
