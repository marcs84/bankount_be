const fs = require("fs");
const path = require("path");

// L'icona di un token, cercata nella cache che la sincronizzazione notturna
// riempie (`dao.cacheTokenImages`).
//
// Serve una rotta, e non il file statico sotto `/public/token`, perche' il
// nome del file non si puo' ricostruire da fuori: l'estensione la decide chi
// ha scaricato l'immagine -- un quarto dell'archivio non e' `.png` -- e i nomi
// sono tutti in minuscolo, mentre il 40% degli indirizzi del catalogo contiene
// maiuscole, perche' Solana usa base58 dove le maiuscole distinguono indirizzi
// diversi. Chi chiama non puo' sapere l'estensione, e non deve doversi
// ricordare di abbassare le maiuscole: su Windows non cambia niente, su Linux
// cambia tutto.
//
// Le icone stanno in una cartella per catena: `public/token/<catena>/<id>.<est>`.
// Lo stesso indirizzo esiste su catene diverse con token diversi -- misurati
// 1.279 indirizzi presenti su due catene, e 0x26d3…bdf e' Mantle su Ethereum e
// Mynth su BSC, due progetti con due loghi -- e un archivio piatto, indicizzato
// per solo indirizzo, ne poteva tenere uno solo: il primo scaricato vinceva e
// l'altro mostrava il logo sbagliato.
const CARTELLA_ICONE = path.join(process.cwd(), "public", "token");

// Nell'ordine in cui si prova. `.png` per prima perche' e' tre quarti
// dell'archivio.
const ESTENSIONI = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];

const TIPI = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

// Dal tipo dichiarato dalla sorgente all'estensione con cui si salva. Serve
// per le immagini il cui indirizzo non finisce con un'estensione: sono
// qualche centinaio, e prima venivano salvate `.png` qualunque cosa fossero.
const ESTENSIONE_PER_TIPO = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/gif": ".gif",
};

// Una settimana: l'icona di un token non cambia, e la lista ne chiede decine
// per schermata.
const CACHE_ICONA_TOKEN = "7d";

// Le catene del catalogo, in minuscolo e nell'ordine in cui si frugano quando
// chi chiede l'icona non dice di quale catena sia.
//
// Succede con le versioni dell'applicazione gia' installate, che chiedono
// l'icona per solo indirizzo: la risposta e' la stessa che davano prima --
// una delle due, sempre la stessa -- e nessuno resta senza icona dopo
// l'aggiornamento del server.
const CATENE = ["eth", "bsc", "solana", "btc"];

// L'indirizzo entra in un nome di file, quindi l'elenco e' di cio' che e'
// ammesso e non di cio' che e' vietato: lettere, cifre, trattino e trattino
// basso -- che serve agli indirizzi della forma `facet_0x…`, cinque nel
// catalogo, i cui file prima venivano scritti e poi non si potevano servire.
// Punti, barre e tutto il resto non passano, percio' nessun indirizzo puo'
// uscire dalla cartella.
const INDIRIZZO_AMMESSO = /^[A-Za-z0-9_-]{1,128}$/;

// Il nome della catena e' anch'esso un pezzo di percorso, e arriva dal
// fornitore: stessa regola, piu' corta.
const CATENA_AMMESSA = /^[a-z0-9_-]{1,32}$/;

/// Il nome della cartella di una catena, o `null` se quel nome non puo'
/// essere un pezzo di percorso.
const nomeCatena = (catena) => {
  if (typeof catena !== "string") return null;
  const pulito = catena.trim().toLowerCase();
  return CATENA_AMMESSA.test(pulito) ? pulito : null;
};

// Gli altri nomi con cui la stessa catena si chiama in giro.
//
// Le cartelle portano i nomi di Rango, che sono quelli con cui il catalogo
// arriva, ma l'applicazione chiama le catene come le chiama lei -- `BNB` per
// la BSC, a volte il nome lungo -- e quel valore passa per le mani
// dell'utente, del database locale e di `normalizeCoinTypeInput`. Tradurre
// qui, dove le cartelle si decidono, costa una tabella; tradurre nell'app
// vorrebbe dire aspettare che tutti aggiornino.
const ALIAS_CATENE = {
  ethereum: "eth",
  bnb: "bsc",
  bnbchain: "bsc",
  binance: "bsc",
  binancesmartchain: "bsc",
  smartchain: "bsc",
  sol: "solana",
  bitcoin: "btc",
};

/// La cartella in cui cercare l'icona di una catena chiamata come capita.
const cartellaDiCatena = (catena) => {
  if (typeof catena !== "string") return null;
  const senzaSpazi = catena.trim().toLowerCase().replace(/[\s_-]/g, "");
  return nomeCatena(ALIAS_CATENE[senzaSpazi] || catena);
};

/// Il nome con cui si archivia un token, o `null` se non e' archiviabile.
///
/// Le monete native non hanno indirizzo: dentro la cartella della loro catena
/// si chiamano `native`, e il nome della cartella dice gia' quale catena sia.
const identificatore = (indirizzo) => {
  if (indirizzo === null || indirizzo === undefined || indirizzo === "") return "native";
  if (typeof indirizzo !== "string") return null;
  return INDIRIZZO_AMMESSO.test(indirizzo) ? indirizzo.toLowerCase() : null;
};

/// L'estensione da usare per un'immagine, guardando il suo indirizzo.
/// `null` se l'indirizzo non la dichiara o dichiara qualcosa che non serviremmo.
const estensioneDaUrl = (url) => {
  try {
    const estensione = path.extname(new URL(url).pathname).toLowerCase();
    return ESTENSIONI.includes(estensione) ? estensione : null;
  } catch (errore) {
    return null;
  }
};

/// L'estensione da usare guardando il tipo dichiarato nella risposta.
const estensioneDaTipo = (tipo) => {
  if (typeof tipo !== "string") return null;
  return ESTENSIONE_PER_TIPO[tipo.split(";")[0].trim().toLowerCase()] || null;
};

/// I nomi di file possibili per un indirizzo, dal piu' probabile in giu'.
///
/// Con `catena` si cerca solo nella sua cartella; senza, si frugano tutte
/// nell'ordine di `CATENE` e per ultimo l'archivio piatto di prima, che resta
/// leggibile finche' non lo si pota.
///
/// Vuoto se l'indirizzo non ha una forma accettabile: chi chiama tratta il
/// caso come "icona non trovata", che e' la risposta giusta sia per un
/// indirizzo inesistente sia per uno malevolo.
const nomiPossibili = (indirizzo, catena = null) => {
  if (typeof indirizzo !== "string" || !INDIRIZZO_AMMESSO.test(indirizzo)) {
    return [];
  }

  const base = indirizzo.toLowerCase();

  if (catena !== null && catena !== undefined) {
    const cartella = nomeCatena(catena);
    if (cartella === null) return [];
    return ESTENSIONI.map((estensione) => path.join(cartella, `${base}${estensione}`));
  }

  const nomi = [];
  for (const cartella of CATENE) {
    for (const estensione of ESTENSIONI) {
      nomi.push(path.join(cartella, `${base}${estensione}`));
    }
  }
  for (const estensione of ESTENSIONI) {
    nomi.push(`${base}${estensione}`);
  }
  return nomi;
};

/// Il primo file che esiste per quell'indirizzo, o `null`.
///
/// `cartella` ed `esiste` si possono sostituire: servono alle prove, che non
/// devono dipendere da cosa c'e' sul disco di chi le esegue.
const trovaIcona = (
  indirizzo,
  { catena = null, cartella = CARTELLA_ICONE, esiste = fs.existsSync } = {}
) => {
  for (const nome of nomiPossibili(indirizzo, catena)) {
    const percorso = path.join(cartella, nome);
    if (esiste(percorso)) {
      return { percorso, tipo: TIPI[path.extname(nome)] };
    }
  }

  return null;
};

module.exports = {
  CARTELLA_ICONE,
  CACHE_ICONA_TOKEN,
  CATENE,
  ESTENSIONI,
  TIPI,
  INDIRIZZO_AMMESSO,
  nomeCatena,
  cartellaDiCatena,
  identificatore,
  estensioneDaUrl,
  estensioneDaTipo,
  nomiPossibili,
  trovaIcona,
};
