// Filtro dello Stream Solana di QuickNode.
//
// Non viene eseguito da questo progetto: si incolla nella console dello
// Stream, alla voce "Modify the payload before streaming". Sta qui perche'
// altrimenti esisterebbe in una sola copia, dentro un pannello web, e decide
// se le notifiche di Solana arrivano o no.
//
// Restituisce la forma che `quicknodeTransactionWebhook` si aspetta:
// { chainName, payload: [ { hash, from, to, amount, chain, network,
//                           blockHash, blockNumber, type } ] }
//
// Lo Stream deve seguire la rete **testnet**: l'applicazione trasmette li'
// (QUICKNODE_SOL_TEST_URL), e gli slot di devnet sono un'altra catena.
//
// Per la rete principale lo stesso filtro va bene: cambiano soltanto le due
// costanti qui sotto, e lo Stream va creato su Solana Mainnet. Gli
// identificativi dei programmi sono gli stessi su ogni cluster, e lo sono
// anche gli indirizzi: la stessa seed produce lo stesso indirizzo su testnet
// e su mainnet, quindi `registered-addresses` serve a entrambi senza
// modifiche.
//
// `RETE` non e' un'etichetta: finisce in `transactions.network_type`, che
// distingue i movimenti di prova da quelli veri e fa parte della chiave con
// cui il backend riconosce la riga gia' scritta dall'applicazione. Sbagliarla
// significa righe doppie e movimenti che compaiono nella rete sbagliata.

const RETE = "TESTNET"; // "MAINNET" per la rete principale
const NOME_CATENA = "SOL Testnet"; // "SOL Mainnet" per la rete principale
const ELENCO_INDIRIZZI = "registered-addresses";

const PROGRAMMA_SISTEMA = "11111111111111111111111111111111";
const PROGRAMMI_TOKEN = new Set([
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", // Token-2022
]);

async function main(stream) {
  const dati = stream.data ? stream.data : stream;

  // Una consegna puo' portare piu' blocchi: la dimensione del lotto e' una
  // impostazione dello Stream. Leggerne solo il primo faceva sparire in
  // silenzio tutto quello che stava negli altri.
  const blocchi = Array.isArray(dati) ? dati : [dati];

  const sorvegliati = await elencoSorvegliati();
  if (!sorvegliati.size) return null;

  // Aggregati per (firma, da, a, token): una stessa transazione puo'
  // contenere piu' istruzioni di trasferimento fra gli stessi due conti, e il
  // backend riconosce un movimento proprio da quella terna. Emetterle separate
  // significherebbe farle fondere a valle, dove l'ultimo importo scritto
  // sostituisce il precedente invece di sommarsi.
  const movimenti = new Map();

  for (const blocco of blocchi) {
    const transazioni = blocco && blocco.transactions;
    if (!Array.isArray(transazioni)) continue;

    const blockHash = blocco.blockhash || null;
    const blockNumber = blocco.slot ?? null;

    for (const t of transazioni) {
      // Una transazione fallita non ha spostato niente: notificarla
      // annuncerebbe un movimento che non esiste.
      if (t && t.meta && t.meta.err) continue;

      const firma =
        t && t.transaction && t.transaction.signatures && t.transaction.signatures[0];
      if (!firma) continue;

      for (const m of trasferimentiNativi(t, sorvegliati)) {
        aggiungi(movimenti, { ...m, firma, blockHash, blockNumber });
      }

      for (const m of trasferimentiToken(t, sorvegliati)) {
        aggiungi(movimenti, { ...m, firma, blockHash, blockNumber });
      }
    }
  }

  const payload = [...movimenti.values()];
  return payload.length ? { chainName: NOME_CATENA, payload } : null;
}

async function elencoSorvegliati() {
  const elenco = (await qnLib.qnGetList(ELENCO_INDIRIZZI)) || [];
  // Il confronto resta insensibile alle maiuscole com'era prima: cambiarlo
  // qui, mentre si corregge altro, significherebbe non sapere piu' a quale
  // delle due modifiche attribuire un indirizzo che smette di combaciare.
  return new Set(elenco.map((a) => String(a).toLowerCase()));
}

const sorvegliato = (insieme, indirizzo) =>
  typeof indirizzo === "string" && insieme.has(indirizzo.toLowerCase());

/// Tutte le istruzioni della transazione, comprese quelle annidate: un
/// trasferimento puo' nascere dentro l'istruzione di un altro programma e
/// nelle istruzioni di primo livello non comparirebbe.
function istruzioni(t) {
  const elenco = [];
  const messaggio = t && t.transaction && t.transaction.message;

  for (const ix of (messaggio && messaggio.instructions) || []) elenco.push(ix);
  for (const gruppo of (t && t.meta && t.meta.innerInstructions) || []) {
    for (const ix of gruppo.instructions || []) elenco.push(ix);
  }

  return elenco;
}

/// I trasferimenti di SOL, letti dall'istruzione e non dalla differenza di
/// saldo.
///
/// La differenza di saldo non distingue il trasferimento dalla commissione:
/// per chi invia vale `-(importo + commissione)`, e in un trasferimento a se'
/// stessi i lamport rientrano e resta la sola commissione -- cioe' l'importo
/// annunciato sarebbe la commissione e il destinatario non esisterebbe.
/// L'istruzione porta invece entrambi gli estremi e i lamport esatti, e li
/// porta anche quando la controparte non e' fra gli indirizzi sorvegliati.
function* trasferimentiNativi(t, sorvegliati) {
  for (const ix of istruzioni(t)) {
    if (ix.programId !== PROGRAMMA_SISTEMA) continue;

    const p = ix.parsed;
    if (!p || !p.info) continue;
    if (p.type !== "transfer" && p.type !== "transferWithSeed") continue;

    const da = p.info.source;
    const a = p.info.destination;
    if (!sorvegliato(sorvegliati, da) && !sorvegliato(sorvegliati, a)) continue;

    const lamport = Number(p.info.lamports);
    if (!Number.isFinite(lamport)) continue;

    yield { da, a, importo: lamport / 1e9, token: null, tipo: "NATIVE_SOL" };
  }
}

/// I trasferimenti di token SPL, letti dai saldi per conto token.
///
/// Le istruzioni SPL indicano i **conti token**, non i portafogli, e quelli
/// non compaiono fra gli indirizzi sorvegliati: confrontarli li' non trovava
/// mai niente. `pre/postTokenBalances` porta invece `owner` e `mint`, cioe'
/// il portafoglio vero e il token, con i decimali dichiarati dalla catena
/// invece che dati per scontati.
function* trasferimentiToken(t, sorvegliati) {
  const meta = t && t.meta;
  if (!meta) return;

  const prima = meta.preTokenBalances || [];
  const dopo = meta.postTokenBalances || [];
  if (!prima.length && !dopo.length) return;

  // Variazione per (token, portafoglio): i conti token si sommano, perche' un
  // portafoglio puo' averne piu' d'uno per lo stesso token.
  const variazioni = new Map();

  const annota = (riga, segno) => {
    if (!riga || !riga.mint || !riga.owner) return;
    const q = riga.uiTokenAmount;
    if (!q) return;

    const decimali = Number(q.decimals);
    const grezzo = Number(q.amount);
    if (!Number.isFinite(decimali) || !Number.isFinite(grezzo)) return;

    const chiave = `${riga.mint}|${riga.owner}`;
    const corrente = variazioni.get(chiave) || { mint: riga.mint, owner: riga.owner, decimali, delta: 0 };
    corrente.delta += segno * grezzo;
    variazioni.set(chiave, corrente);
  };

  for (const riga of prima) annota(riga, -1);
  for (const riga of dopo) annota(riga, +1);

  // Per ogni token, chi ha perso paga chi ha guadagnato. Con un solo mittente
  // e un solo destinatario -- il caso normale -- l'accoppiamento e' esatto.
  const perToken = new Map();
  for (const v of variazioni.values()) {
    if (!v.delta) continue;
    if (!perToken.has(v.mint)) perToken.set(v.mint, []);
    perToken.get(v.mint).push(v);
  }

  for (const [mint, righe] of perToken) {
    const uscite = righe.filter((r) => r.delta < 0);
    const entrate = righe.filter((r) => r.delta > 0);
    if (uscite.length !== 1 || entrate.length !== 1) continue;

    const da = uscite[0].owner;
    const a = entrate[0].owner;
    if (!sorvegliato(sorvegliati, da) && !sorvegliato(sorvegliati, a)) continue;

    const decimali = entrate[0].decimali;
    yield {
      da,
      a,
      importo: Math.abs(entrate[0].delta) / Math.pow(10, decimali),
      token: mint,
      tipo: "SPL_TOKEN",
    };
  }
}

function aggiungi(movimenti, { firma, da, a, importo, token, tipo, blockHash, blockNumber }) {
  const chiave = `${firma}|${da}|${a}|${token || "SOL"}`;
  const esistente = movimenti.get(chiave);

  if (esistente) {
    esistente.amount += importo;
    return;
  }

  movimenti.set(chiave, {
    hash: firma,
    from: da,
    to: a,
    amount: importo,
    chain: "SOL",
    network: RETE,
    blockHash,
    blockNumber,
    type: tipo,
  });
}
