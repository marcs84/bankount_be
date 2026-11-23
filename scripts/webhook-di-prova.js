#!/usr/bin/env node
//
// Bussa alla rotta del webhook Quicknode come farebbe Quicknode.
//
// Serve a provare le notifiche push senza aspettare una transazione vera e
// senza che uno Stream sia configurato: la rotta e' la stessa, la verifica
// della firma e' la stessa, e da li' in poi il percorso e' quello di
// produzione -- riga in `transactions`, riga in `transaction_notifications`,
// invio a Firebase.
//
// ATTENZIONE, due effetti veri:
//   1. scrive una riga in `transactions`, che comparira' nella cronologia
//      dell'applicazione come un movimento qualunque;
//   2. manda una notifica push vera a ogni dispositivo attivo che possiede
//      l'indirizzo indicato.
// Non e' una simulazione a vuoto. L'hash nasce con un prefisso riconoscibile
// e a fine corsa lo script stampa la riga SQL per togliere cio' che ha
// scritto.
//
// Uso:
//   node scripts/webhook-di-prova.js --to 0x33dC... --chain ETH --amount 0.01
//   node scripts/webhook-di-prova.js --from 0x33dC... --chain ETH --amount 0.5
//
//   --to     indirizzo che riceve  -> notifica "Transazione ricevuta"
//   --from   indirizzo che invia   -> notifica "Transazione inviata"
//            (almeno uno dei due; indicarli entrambi e' lecito)
//   --chain  ETH | BNB | BTC | SOL            (predefinito ETH)
//   --amount importo                          (predefinito 0.01)
//   --network TESTNET | MAINNET               (predefinito TESTNET)
//   --url    destinazione                     (predefinito il backend locale)
//   --hash   hash da usare                    (predefinito uno riconoscibile)

require("dotenv").config();

const crypto = require("crypto");

const PREFISSO_DI_PROVA = "0xPROVA";

const leggiArgomenti = () => {
  const a = process.argv.slice(2);
  const v = {};
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith("--")) continue;
    const nome = a[i].slice(2);
    const valore = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    v[nome] = valore;
  }
  return v;
};

const arg = leggiArgomenti();

if (!arg.to && !arg.from) {
  console.error(
    "Serve almeno --to o --from: senza un indirizzo che il database conosca,\n" +
      "il webhook non trova destinatari e non manda niente.\n\n" +
      "Esempio:\n" +
      "  node scripts/webhook-di-prova.js --to 0x… --chain ETH --amount 0.01"
  );
  process.exit(2);
}

const segreto = process.env.QUICKNODE_WEBHOOK_SECRET;
if (!segreto) {
  console.error(
    "QUICKNODE_WEBHOOK_SECRET non e' configurato: la rotta risponderebbe 503\n" +
      "prima ancora di guardare la firma."
  );
  process.exit(2);
}

const intestazioneFirma = (
  process.env.QUICKNODE_WEBHOOK_SIGNATURE_HEADER || "x-qn-signature"
).toLowerCase();
const algoritmo = process.env.QUICKNODE_WEBHOOK_ALGORITHM || "sha256";
const schema = process.env.QUICKNODE_WEBHOOK_SCHEME || "raw";
const porta = process.env.PORT || 3000;

const url = arg.url || `http://127.0.0.1:${porta}/api/webhook-quicknode/transaction`;
const chain = (arg.chain || "ETH").toUpperCase();
const rete = (arg.network || "TESTNET").toUpperCase();
const importo = arg.amount || "0.01";

const hash =
  arg.hash ||
  `${PREFISSO_DI_PROVA}${crypto.randomBytes(12).toString("hex")}`;

const transazione = {
  chain,
  network: rete,
  hash,
  from: arg.from || "0x000000000000000000000000000000000000dEaD",
  to: arg.to || "0x000000000000000000000000000000000000dEaD",
  amount: importo,
  chainId: arg.chainId || null,
  blockNumber: null,
  blockHash: null,
  gas: null,
  gasPrice: null,
  type: null,
  input: null,
};

const corpo = Buffer.from(JSON.stringify({ payload: [transazione], receipts: [] }));

// Quicknode firma la concatenazione di nonce, timestamp e corpo -- non il solo
// corpo. Con lo schema `raw` firma invece il corpo da solo. Si rispetta cio'
// che dice la configurazione, altrimenti lo script proverebbe qualcosa di
// diverso da quello che succede in produzione.
const nonce = crypto.randomBytes(16).toString("hex");
const timestamp = String(Date.now());

const daFirmare =
  schema === "quicknode"
    ? Buffer.concat([Buffer.from(nonce), Buffer.from(timestamp), corpo])
    : corpo;

const firma = crypto
  .createHmac(algoritmo, Buffer.from(segreto))
  .update(daFirmare)
  .digest("hex");

const intestazioni = {
  "content-type": "application/json",
  "content-length": String(corpo.length),
  "x-qn-nonce": nonce,
  "x-qn-timestamp": timestamp,
  [intestazioneFirma]: firma,
};

console.log(`→ ${url}`);
console.log(`  schema di firma : ${schema} (${algoritmo})`);
console.log(`  catena          : ${chain} su ${rete}`);
console.log(`  da              : ${transazione.from}`);
console.log(`  a               : ${transazione.to}`);
console.log(`  importo         : ${importo}`);
console.log(`  hash            : ${hash}`);
console.log("");

(async () => {
  let risposta;
  try {
    risposta = await fetch(url, { method: "POST", headers: intestazioni, body: corpo });
  } catch (errore) {
    console.error(`Non ho raggiunto il server: ${errore.message}`);
    console.error("Il backend e' in ascolto su quella porta?");
    process.exit(1);
  }

  const testo = await risposta.text();
  console.log(`← ${risposta.status} ${risposta.statusText}`);
  console.log(testo);
  console.log("");

  if (risposta.status === 401) {
    console.log(
      "Firma rifiutata. Di solito e' QUICKNODE_WEBHOOK_SCHEME diverso fra\n" +
        "questo script e il server, oppure il segreto cambiato dopo l'avvio:\n" +
        "il server legge l'ambiente che aveva quando e' partito."
    );
  } else if (risposta.status === 503) {
    console.log(
      "La rotta si e' dichiarata non configurata: manca il segreto o il nome\n" +
        "dell'intestazione nell'ambiente del server."
    );
  } else if (risposta.ok) {
    console.log("Per togliere la riga che questa chiamata ha scritto:");
    console.log(`  DELETE FROM transactions WHERE tx = '${hash}';`);
    console.log("");
    console.log("Per togliere tutte quelle lasciate dalle prove:");
    console.log(`  DELETE FROM transactions WHERE tx LIKE '${PREFISSO_DI_PROVA}%';`);
  }
})();
