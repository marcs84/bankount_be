// Quali richieste finiscono nel registro delle API.
//
// Il registro serve a capire cosa sta facendo il server. Due famiglie di
// richieste lo riempiono senza dire niente, e vanno tenute fuori.
//
// `GET /` e' la sonda di disponibilita': 9.533 righe delle 19.208 in archivio
// sono quella, cioe' meta' del registro. Non porta informazione - risponde
// sempre la stessa stringa - e seppellisce le righe che contano.
//
// `/admin` e' il pannello di monitoraggio, che si aggiorna da se'. Registrarlo
// qui vorrebbe dire scrivere qualche migliaio di righe al giorno nella stessa
// tabella che il pannello mostra: il visore misurerebbe soprattutto se stesso.
// Le azioni dell'amministratore hanno una traccia separata (`ADMIN_*`), che
// non passa da questo middleware.
const ESCLUSE = [
  (metodo, percorso) => metodo === "GET" && percorso === "/",
  (metodo, percorso) => percorso === "/admin" || percorso.startsWith("/admin/"),
];

// Il confronto e' sul percorso, non sull'URL completo: `req.path` non porta la
// stringa di query, quindi `/?x=1` resta escluso come `/`.
const daRegistrare = (metodo, percorso) => {
  const m = String(metodo || "");
  const p = String(percorso || "");
  return !ESCLUSE.some((esclusa) => esclusa(m, p));
};

module.exports = { daRegistrare };
