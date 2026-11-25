const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const {
  CACHE_ICONA_TOKEN,
  ESTENSIONI,
  TIPI,
  nomiPossibili,
  trovaIcona,
} = require("../src/server/iconaToken");

// Un disco finto: si dichiara quali file esistono e si guarda cosa viene
// scelto. Cosi' le prove non dipendono da cosa c'e' davvero in public/token,
// che su una macchina appena clonata e' vuota.
const disco = (...presenti) => {
  const insieme = new Set(presenti.map((n) => path.join("/cache", n)));
  return { cartella: "/cache", esiste: (p) => insieme.has(p) };
};

const INDIRIZZO_SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

test("l'indirizzo si abbassa, perche' i file sono salvati in minuscolo", () => {
  // Il 40% del catalogo ha maiuscole nell'indirizzo: sono indirizzi Solana in
  // base58. Su Linux, dove le maiuscole contano, cercare il nome cosi' com'e'
  // non trova niente.
  const trovata = trovaIcona(INDIRIZZO_SOLANA, disco(`${INDIRIZZO_SOLANA.toLowerCase()}.png`));

  assert.ok(trovata, "l'icona del token Solana non e' stata trovata");
  assert.equal(trovata.tipo, "image/png");
});

test("si prova ogni estensione, non solo .png", () => {
  // 11.615 file su 40.683 non sono .png: chiedere sempre quella lasciava
  // senza icona piu' di un quarto del catalogo.
  const trovata = trovaIcona("0xAbC123", disco("0xabc123.jpg"));

  assert.ok(trovata);
  assert.equal(trovata.tipo, "image/jpeg");
  assert.ok(trovata.percorso.endsWith(".jpg"));
});

test("fra due formati vince .png, che e' tre quarti dell'archivio", () => {
  const trovata = trovaIcona("0xAbC123", disco("0xabc123.jpg", "0xabc123.png"));

  assert.ok(trovata.percorso.endsWith(".png"));
});

test("un'icona che non c'e' non e' un errore, e' un'assenza", () => {
  assert.equal(trovaIcona("0xabc123", disco()), null);
});

test("ogni estensione cercata sa dichiarare il proprio tipo", () => {
  // Senza il tipo il file verrebbe servito come dato grezzo e nessuno lo
  // disegnerebbe.
  for (const estensione of ESTENSIONI) {
    assert.ok(TIPI[estensione], `tipo mancante per ${estensione}`);
  }
});

test("l'indirizzo non puo' uscire dalla cartella", () => {
  // L'indirizzo arriva dall'esterno e finisce in un nome di file. Questi
  // tentativi non devono nemmeno produrre un nome da cercare.
  const rifiutati = [
    "../../etc/passwd",
    "..",
    "a/b",
    "a\\b",
    "0xabc.png",
    "0xabc%2e%2e",
    "",
    "a".repeat(129),
    null,
    undefined,
    42,
  ];

  for (const tentativo of rifiutati) {
    assert.deepEqual(nomiPossibili(tentativo), [], `accettato: ${tentativo}`);
    assert.equal(trovaIcona(tentativo, disco("passwd")), null);
  }
});

test("la forma native-<chainId> resta ammessa", () => {
  // `cacheTokenImages` salva cosi' le monete native, che non hanno indirizzo.
  assert.ok(nomiPossibili("native-137").length > 0);
});

test("al chiamante si dice di tenersi l'icona", () => {
  // Non cambia mai, e la lista ne chiede decine per schermata.
  assert.equal(CACHE_ICONA_TOKEN, "7d");
});

// ---------------------------------------------------------------------------
// Una cartella per catena.
// ---------------------------------------------------------------------------

const {
  CATENE,
  nomeCatena,
  identificatore,
  estensioneDaUrl,
  estensioneDaTipo,
} = require("../src/server/iconaToken");

test("con la catena si cerca solo nella sua cartella", () => {
  const disco = (...presenti) => {
    const insieme = new Set(presenti.map((n) => path.join("/cache", n)));
    return { cartella: "/cache", esiste: (p) => insieme.has(p) };
  };

  const trovata = trovaIcona("0xAAA", { ...disco(path.join("bsc", "0xaaa.png")), catena: "BSC" });
  assert.ok(trovata, "l'icona della catena giusta");
  assert.ok(trovata.percorso.includes(path.join("bsc", "0xaaa.png")));

  assert.equal(
    trovaIcona("0xAAA", { ...disco(path.join("bsc", "0xaaa.png")), catena: "eth" }),
    null,
    "non si pesca dalla cartella di un'altra catena"
  );
});

test("senza la catena si frugano le cartelle e poi l'archivio piatto", () => {
  const disco = (...presenti) => {
    const insieme = new Set(presenti.map((n) => path.join("/cache", n)));
    return { cartella: "/cache", esiste: (p) => insieme.has(p) };
  };

  // Le versioni dell'applicazione gia' installate chiedono cosi'.
  const dallaCartella = trovaIcona("0xaaa", disco(path.join("solana", "0xaaa.jpg")));
  assert.ok(dallaCartella.percorso.includes("solana"));

  const dalPiatto = trovaIcona("0xaaa", disco("0xaaa.png"));
  assert.ok(dalPiatto, "l'archivio di prima resta leggibile finche' non lo si pota");
});

test("il nome della catena non puo' uscire dalla cartella", () => {
  // Una catena dichiarata male non produce nessun nome da cercare. Il caso
  // "nessuna catena" e' un'altra cosa, ed e' la prova qui sopra: li' si
  // frugano tutte.
  for (const tentativo of ["../etc", "a/b", "a.b", "", 42, "x".repeat(33)]) {
    assert.equal(nomeCatena(tentativo), null, `accettato: ${tentativo}`);
    assert.deepEqual(nomiPossibili("0xaaa", tentativo), [], `accettato: ${tentativo}`);
  }

  assert.equal(nomeCatena(null), null);
  assert.equal(nomeCatena(undefined), null);
  assert.equal(nomeCatena("SOLANA"), "solana");
  assert.equal(nomeCatena(" Eth "), "eth");
});

test("la moneta nativa si chiama native, l'indirizzo malformato niente", () => {
  assert.equal(identificatore(null), "native");
  assert.equal(identificatore(""), "native");
  assert.equal(identificatore("0xAbC"), "0xabc");
  assert.equal(identificatore("facet_0x26231ad9"), "facet_0x26231ad9");
  assert.equal(identificatore("../../x"), null);
  assert.equal(identificatore(42), null);
});

test("la forma facet_0x… ora si puo' servire", () => {
  // Cinque token del catalogo hanno il trattino basso nell'indirizzo: i loro
  // file venivano scritti e poi non si trovavano.
  assert.ok(nomiPossibili("facet_0x26231ad975456d53682e1b6364e9e005886281e7").length > 0);
});

test("l'estensione si prende dall'indirizzo solo se la sapremmo servire", () => {
  assert.equal(estensioneDaUrl("https://a/b/logo.PNG"), ".png");
  assert.equal(estensioneDaUrl("https://a/b/logo.jpg?x=1"), ".jpg");
  assert.equal(estensioneDaUrl("https://a/b/logo"), null);
  assert.equal(estensioneDaUrl("https://a/b/logo.infra_icon"), null);
  assert.equal(estensioneDaUrl("non un indirizzo"), null);
});

test("l'estensione si prende anche dal tipo dichiarato", () => {
  assert.equal(estensioneDaTipo("image/webp"), ".webp");
  assert.equal(estensioneDaTipo("image/svg+xml; charset=utf-8"), ".svg");
  assert.equal(estensioneDaTipo("application/octet-stream"), null);
  assert.equal(estensioneDaTipo(null), null);
});

test("le catene frugate sono quelle del catalogo", () => {
  assert.deepEqual(CATENE, ["eth", "bsc", "solana", "btc"]);
});

test("la catena si riconosce anche col nome che usa l'applicazione", () => {
  // L'app chiama BNB la catena che nel catalogo si chiama BSC, e a volte usa
  // il nome lungo. Le cartelle portano i nomi del catalogo.
  const { cartellaDiCatena } = require("../src/server/iconaToken");

  assert.equal(cartellaDiCatena("BNB"), "bsc");
  assert.equal(cartellaDiCatena("BNB CHAIN"), "bsc");
  assert.equal(cartellaDiCatena("Binance Smart Chain"), "bsc");
  assert.equal(cartellaDiCatena("smartchain"), "bsc");
  assert.equal(cartellaDiCatena("Ethereum"), "eth");
  assert.equal(cartellaDiCatena("ETH"), "eth");
  assert.equal(cartellaDiCatena("SOL"), "solana");
  assert.equal(cartellaDiCatena("SOLANA"), "solana");
  assert.equal(cartellaDiCatena("Bitcoin"), "btc");

  // Quello che non si riconosce resta quello che e', se puo' essere una
  // cartella; e se non puo', non lo e'.
  assert.equal(cartellaDiCatena("polygon"), "polygon");
  assert.equal(cartellaDiCatena("../etc"), null);
  assert.equal(cartellaDiCatena(null), null);
});
