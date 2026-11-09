const crypto = require("crypto");

// Impronta della password dell'amministratore.
//
// La passkey dei dispositivi e' confrontata in chiaro (`dao.js`): il valore
// sta nel database come l'utente l'ha scelto. Qui non si segue quella strada.
// In `.env` finisce solo un'impronta, e la password in chiaro non esiste in
// nessun file del progetto.
//
// `scrypt` sta nel nucleo di node: nessuna dipendenza nuova, e un costo in
// memoria che rende inutile provare le password a ritmo di macchina.
//
// Formato memorizzato, un campo per ogni parametro perche' l'impronta resti
// verificabile anche se un domani i parametri cambiano:
//
//   scrypt$<N>$<r>$<p>$<sale in base64>$<impronta in base64>
//
const ALGORITMO = "scrypt";
const N = 16384; // costo in CPU e memoria: 128 * N * r = 16 MiB
const R = 8;
const P = 1;
const BYTE_SALE = 16;
const BYTE_IMPRONTA = 32;

// Il valore predefinito di maxmem e' 32 MiB e questi parametri ne chiedono 16:
// lo si dichiara comunque, perche' alzando N senza alzare questo scrypt
// smetterebbe di funzionare con un errore che non parla di memoria.
const maxmem = (N, r) => Math.max(32 * 1024 * 1024, 256 * N * r);

const derivaBase = (password, sale, n, r, p, lunghezza) =>
  new Promise((risolvi, rifiuta) => {
    crypto.scrypt(
      String(password),
      sale,
      lunghezza,
      { N: n, r, p, maxmem: maxmem(n, r) },
      (errore, chiave) => (errore ? rifiuta(errore) : risolvi(chiave))
    );
  });

// Costruisce l'impronta da memorizzare. Usata dallo strumento a riga di
// comando, non dal server: il server verifica, non genera.
const generaImpronta = async (password) => {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("password assente");
  }

  const sale = crypto.randomBytes(BYTE_SALE);
  const impronta = await derivaBase(password, sale, N, R, P, BYTE_IMPRONTA);

  return [
    ALGORITMO,
    N,
    R,
    P,
    sale.toString("base64"),
    impronta.toString("base64"),
  ].join("$");
};

// Riconosce una impronta ben formata senza verificare nessuna password. Serve
// al controllo all'avvio: se in `.env` c'e' una password in chiaro al posto
// dell'impronta, il server deve rifiutarsi di partire invece di accettare
// qualunque cosa.
const improntaValida = (memorizzata) => {
  try {
    leggiImpronta(memorizzata);
    return true;
  } catch (e) {
    return false;
  }
};

const leggiImpronta = (memorizzata) => {
  if (typeof memorizzata !== "string") throw new Error("impronta assente");

  const parti = memorizzata.split("$");
  if (parti.length !== 6) throw new Error("impronta malformata");

  const [algoritmo, n, r, p, sale, impronta] = parti;
  if (algoritmo !== ALGORITMO) throw new Error(`algoritmo non gestito: ${algoritmo}`);

  const numeri = [Number(n), Number(r), Number(p)];
  if (numeri.some((v) => !Number.isInteger(v) || v <= 0)) {
    throw new Error("parametri non validi");
  }

  const saleBin = Buffer.from(sale, "base64");
  const improntaBin = Buffer.from(impronta, "base64");
  if (saleBin.length === 0 || improntaBin.length === 0) {
    throw new Error("sale o impronta vuoti");
  }

  return { n: numeri[0], r: numeri[1], p: numeri[2], sale: saleBin, impronta: improntaBin };
};

// Verifica una password contro l'impronta memorizzata.
//
// Il confronto e' a tempo costante: un confronto normale si interrompe al
// primo byte diverso, e il tempo che impiega racconta quanti byte iniziali
// erano giusti. Qui le lunghezze sono sempre uguali, perche' i parametri
// vengono dall'impronta stessa.
//
// Non solleva eccezioni: qualunque problema - impronta illeggibile, password
// assente - e' un "no". Un'impronta rotta non deve diventare un modo per
// entrare, ne' un errore che racconta com'e' fatta.
const verificaPassword = async (password, memorizzata) => {
  if (typeof password !== "string" || password.length === 0) return false;

  let letta;
  try {
    letta = leggiImpronta(memorizzata);
  } catch (e) {
    return false;
  }

  try {
    const candidata = await derivaBase(
      password,
      letta.sale,
      letta.n,
      letta.r,
      letta.p,
      letta.impronta.length
    );
    return crypto.timingSafeEqual(candidata, letta.impronta);
  } catch (e) {
    return false;
  }
};

module.exports = {
  generaImpronta,
  verificaPassword,
  improntaValida,
  leggiImpronta,
  PARAMETRI: { ALGORITMO, N, R, P, BYTE_SALE, BYTE_IMPRONTA },
};
