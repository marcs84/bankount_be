const fs = require("fs");
const path = require("path");

// L'icona di un token, cercata nella cache che la sincronizzazione notturna
// riempie (`dao.cacheTokenImages`).
//
// Serve una rotta, e non il file statico sotto `/public/token`, perche' il
// nome del file non si puo' ricostruire da fuori. `cacheTokenImages` lo scrive
// come `indirizzo.toLowerCase()` piu' l'estensione che aveva la **sorgente**:
// su 40.683 file in archivio 11.615 non sono `.png` -- jpg, webp, svg, gif --
// e tutti i nomi sono in minuscolo, mentre il 40% degli indirizzi del catalogo
// contiene maiuscole, perche' Solana usa base58 dove le maiuscole distinguono
// indirizzi diversi. Chi chiama non puo' sapere l'estensione, e non deve
// doversi ricordare di abbassare le maiuscole: su Windows non cambia niente,
// su Linux cambia tutto.
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

// Una settimana: l'icona di un token non cambia, e la lista ne chiede decine
// per schermata.
const CACHE_ICONA_TOKEN = "7d";

// L'indirizzo entra in un nome di file, quindi l'elenco e' di cio' che e'
// ammesso e non di cio' che e' vietato: lettere, cifre e trattino -- che serve
// alla forma `native-<chainId>` con cui si salvano le monete native. Punti,
// barre e tutto il resto non passano, percio' nessun indirizzo puo' uscire
// dalla cartella.
const INDIRIZZO_AMMESSO = /^[A-Za-z0-9-]{1,128}$/;

/// I nomi di file possibili per un indirizzo, dal piu' probabile in giu'.
///
/// Vuoto se l'indirizzo non ha una forma accettabile: chi chiama tratta il
/// caso come "icona non trovata", che e' la risposta giusta sia per un
/// indirizzo inesistente sia per uno malevolo.
const nomiPossibili = (indirizzo) => {
  if (typeof indirizzo !== "string" || !INDIRIZZO_AMMESSO.test(indirizzo)) {
    return [];
  }

  const base = indirizzo.toLowerCase();
  return ESTENSIONI.map((estensione) => `${base}${estensione}`);
};

/// Il primo file che esiste per quell'indirizzo, o `null`.
///
/// `cartella` ed `esiste` si possono sostituire: servono alle prove, che non
/// devono dipendere da cosa c'e' sul disco di chi le esegue.
const trovaIcona = (
  indirizzo,
  { cartella = CARTELLA_ICONE, esiste = fs.existsSync } = {}
) => {
  for (const nome of nomiPossibili(indirizzo)) {
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
  ESTENSIONI,
  TIPI,
  nomiPossibili,
  trovaIcona,
};
