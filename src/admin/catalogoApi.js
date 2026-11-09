const swaggerSpec = require("../config/swagger");

// Il catalogo delle rotte per la consolle di prova.
//
// Non e' scritto a mano: viene dalla stessa descrizione OpenAPI che genera
// `/api-docs`, costruita dai commenti sopra le rotte in `src/server/**`. Un
// elenco a mano sarebbe una seconda verita' da tenere allineata, e il giorno
// che qualcuno aggiunge una rotta senza aggiornarlo la consolle direbbe una
// bugia. Qui, se la rotta e' documentata, compare da sola.
//
// Il rovescio, detto perche' si vede: una rotta senza commento di
// documentazione non compare. La consolle accetta comunque un percorso battuto
// a mano, quindi l'elenco e' una comodita', non un confine.
const METODI = ["get", "post", "put", "patch", "delete", "head", "options"];

const PROFONDITA_ESEMPIO = 4;

// I pezzi fra graffe (`/api/wallet/{id}`): la pagina li trasforma in caselle
// da riempire, perche' un percorso con le graffe dentro non e' un percorso.
const segnaposti = (percorso) => {
  const trovati = String(percorso).match(/\{([^}]+)\}/g) || [];
  return trovati.map((p) => p.slice(1, -1));
};

// Un corpo di esempio ricavato dallo schema: niente di sofisticato, solo
// abbastanza da non dover ribattere a mano i nomi dei campi.
const dalloSchema = (schema, profondita = 0) => {
  if (!schema || typeof schema !== "object" || profondita >= PROFONDITA_ESEMPIO) return null;

  if (schema.example !== undefined) return schema.example;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];

  switch (schema.type) {
    case "object": {
      const fuori = {};
      const proprieta = schema.properties || {};
      for (const [nome, dentro] of Object.entries(proprieta)) {
        fuori[nome] = dalloSchema(dentro, profondita + 1);
      }
      return fuori;
    }
    case "array":
      return [dalloSchema(schema.items, profondita + 1)].filter((v) => v !== null);
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return false;
    case "string":
      return "";
    default:
      // Senza `type` ma con proprieta': capita, e trattarlo come oggetto da'
      // comunque l'elenco dei campi.
      if (schema.properties) return dalloSchema({ ...schema, type: "object" }, profondita);
      return null;
  }
};

const esempioCorpo = (operazione) => {
  const corpo = operazione.requestBody;
  if (!corpo || !corpo.content) return null;

  const json = corpo.content["application/json"];
  if (json) {
    if (json.example !== undefined) return json.example;
    return dalloSchema(json.schema);
  }

  // Un corpo che non e' JSON (modulo, caricamento di file) non si prova da
  // qui: lo si dice invece di generare un esempio che non significa niente.
  return { _nonJson: Object.keys(corpo.content)[0] || "sconosciuto" };
};

const parametri = (operazione) =>
  (operazione.parameters || []).map((p) => ({
    nome: p.name,
    dove: p.in,
    obbligatorio: Boolean(p.required),
    descrizione: p.description || null,
    tipo: p.schema && p.schema.type ? p.schema.type : null,
  }));

const costruisci = (spec = swaggerSpec) => {
  const percorsi = spec && spec.paths ? spec.paths : {};
  const rotte = [];

  for (const [percorso, operazioni] of Object.entries(percorsi)) {
    if (!operazioni || typeof operazioni !== "object") continue;

    for (const metodo of METODI) {
      const operazione = operazioni[metodo];
      if (!operazione || typeof operazione !== "object") continue;

      rotte.push({
        metodo: metodo.toUpperCase(),
        percorso,
        sommario: operazione.summary || null,
        descrizione: operazione.description || null,
        tag: Array.isArray(operazione.tags) && operazione.tags.length ? operazione.tags[0] : null,
        richiedeToken: Array.isArray(operazione.security) && operazione.security.length > 0,
        segnaposti: segnaposti(percorso),
        parametri: parametri(operazione),
        corpoEsempio: esempioCorpo(operazione),
      });
    }
  }

  rotte.sort((a, b) => {
    const t = String(a.tag || "zzz").localeCompare(String(b.tag || "zzz"));
    if (t !== 0) return t;
    const p = a.percorso.localeCompare(b.percorso);
    return p !== 0 ? p : a.metodo.localeCompare(b.metodo);
  });

  return rotte;
};

// Costruito una volta: la descrizione nasce dai commenti nel sorgente e non
// cambia mentre il processo gira.
let cache = null;

const catalogo = () => {
  if (!cache) {
    const rotte = costruisci();
    const tag = [...new Set(rotte.map((r) => r.tag).filter(Boolean))].sort();
    cache = {
      rotte,
      quante: rotte.length,
      tag,
      // Se la descrizione e' vuota la consolle funziona comunque, a percorso
      // battuto a mano: meglio dirlo che mostrare un elenco vuoto senza
      // spiegazione.
      vuoto: rotte.length === 0,
    };
  }
  return cache;
};

const azzeraCache = () => {
  cache = null;
};

module.exports = {
  catalogo,
  costruisci,
  azzeraCache,
  segnaposti,
  esempioCorpo,
  dalloSchema,
  METODI,
};
