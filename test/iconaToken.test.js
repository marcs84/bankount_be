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
