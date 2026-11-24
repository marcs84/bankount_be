// Filtro dello Stream Ethereum di QuickNode.
//
// Non viene eseguito da questo progetto: si incolla nella console dello
// Stream, alla voce "Modify the payload before streaming". Sta qui perche'
// altrimenti esisterebbe in una sola copia, dentro un pannello web.
//
// Restituisce { chainName, payload, receipts }: `payload` sono i movimenti di
// ETH nativo, `receipts` i trasferimenti ERC-20. Il backend li tratta in due
// rami distinti (`quicknodeTransactionWebhook`), e per i receipts ricostruisce
// l'importo da `rawAmount` quando i decimali non arrivano.
//
// === PASSARE FRA LE DUE RETI ===
// Si cambiano soltanto le tre costanti qui sotto, e lo Stream va creato sulla
// rete corrispondente. `RETE` non e' un'etichetta: finisce in
// `transactions.network_type`, che distingue i movimenti di prova da quelli
// veri e fa parte della chiave con cui il backend riconosce la riga gia'
// scritta dall'applicazione. Sbagliarla significa righe doppie e movimenti
// che compaiono nella rete sbagliata.

// ============= RETE =============
const RETE = "TESTNET";             // "MAINNET" per la rete principale
const NOME_CATENA = "ETH Testnet";  // "ETH Mainnet"
const CHAIN_ID = 11155111;          // Sepolia; 1 per la rete principale

// ============= TOGGLES =============
const INCLUDE_IN = true;
const INCLUDE_OUT_FOR_MONITORED_FROM = true;
const SUPPRESS_OUT_WHEN_IN = true; // se una tx ha già un IN, non aggiungo OUT nella stessa tx

// ============= Helpers =============
const WEI_PER_ETH = 10n ** 18n;
const ERC20_TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function normAddr(a){ return (a && typeof a === "string") ? a.toLowerCase() : null; }
function hexToBigInt(h){ if(h==null) return 0n; if(typeof h==="bigint") return h; if(typeof h==="number") return BigInt(h); const s=String(h); return s.startsWith("0x")? BigInt(s): BigInt(s); }
function hexToNum(h){ if(h==null) return 0; if(typeof h==="number") return h; const n=parseInt(h,16); return Number.isFinite(n)? n: 0; }
function hexToNullableNum(h){ if(h==null) return null; const n=parseInt(h,16); return Number.isFinite(n)? n: null; }
function formatETHfromWei(wei){ return Number(wei) / 1e18; }
function txTypeLabel(typeHex){
  const t = hexToNum(typeHex);
  return t===0 ? "Legacy (Type 0)"
       : t===1 ? "Access List (Type 1, EIP-2930)"
       : t===2 ? "Fee Market (Type 2, EIP-1559)"
       : t===3 ? "Blob Transaction (Type 3, EIP-4844)"
       : "";
}
function extractTopicAddr(topic){
  if(!topic || typeof topic!=="string" || topic.length<66) return null;
  return "0x" + topic.slice(26).toLowerCase(); // ultimi 40 hex
}
function bigIntToDecimalString(valueBigInt, decimals){
  if(decimals==null) return null;
  const neg = valueBigInt < 0n;
  const v = neg ? -valueBigInt : valueBigInt;
  const base = 10n ** BigInt(decimals);
  const intPart = v / base;
  const fracPart = v % base;
  const fracStr = fracPart.toString().padStart(decimals, "0").replace(/0+$/, "");
  return (neg?"-":"") + intPart.toString() + (fracStr? "."+fracStr : "");
}

// Decimali noti, per rete. Sono indirizzi di contratto: quelli della rete
// principale non esistono su Sepolia e viceversa, percio' una tabella sola
// non puo' servire entrambe -- usarla sull'altra rete non sbaglia gli
// importi, semplicemente non combacia mai e li lascia da ricostruire.
//
// Quando un token non e' qui dentro, il filtro manda comunque `rawAmount` e i
// decimali li recupera il backend interrogando Rango; se non ci riesce lo
// dichiara in `system_logs` come `amountUnresolved`. Per aggiungerne senza
// toccare questo file c'e' la mappa `erc20-decimals` negli elenchi di
// QuickNode, che viene letta qui sotto e ha la precedenza.
const DECIMALI_MAINNET = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7": 6,  // USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6,  // USDC
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 18, // WETH
  "0x6b175474e89094c44da98b954eedeac495271d0f": 18, // DAI
  "0x514910771af9ca656af840dff83e8264ecf986ca": 18, // LINK
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 18, // UNI
};

// Vuota di proposito: su Sepolia i contratti cambiano spesso e un indirizzo
// scritto a memoria qui non combacerebbe comunque. Si popola da
// `erc20-decimals` quando serve.
const DECIMALI_TESTNET = {};

const DECIMALI_NOTI = RETE === "MAINNET" ? DECIMALI_MAINNET : DECIMALI_TESTNET;

// ============= MAIN =============
async function main(stream){
  const dati = stream?.data ?? stream;

  // Una consegna puo' portare piu' blocchi: la dimensione del lotto e' una
  // impostazione dello Stream. Leggere solo il primo elemento faceva sparire
  // in silenzio tutto quello che stava negli altri.
  const elementi = Array.isArray(dati) ? dati : [dati];

  // Watchlist
  const monitoredAddresses = await qnLib.qnGetList('registered-addresses');
  const monitoredSet = new Set((monitoredAddresses||[]).map(a=>normAddr(a)).filter(Boolean));
  if (!monitoredSet.size) return null;

  // (opzionale) carica decimals da tuo KV
  let tokenDecimalsCache = { ...DECIMALI_NOTI };
  if (typeof qnLib.qnGetMap === "function") {
    try {
      const decMap = await qnLib.qnGetMap("erc20-decimals");
      if (decMap && typeof decMap === "object") {
        for (const [k,v] of Object.entries(decMap)) {
          if (k && v!=null) tokenDecimalsCache[normAddr(k)] = Number(v);
        }
      }
    } catch(_) {}
  }

  const payload = [];
  const receipts = [];

  for (const root of elementi) {
    if(!root || !root.block) continue;

    const txs = Array.isArray(root.block.transactions) ? root.block.transactions : [];
    const receiptsArr = Array.isArray(root.receipts) ? root.receipts : [];

    // Mappa txHash → tx (per info aggiuntive nei receipts)
    const txByHash = new Map();
    for(const t of txs){
      if(!t) continue;
      const h = t.hash || t.transactionHash || t.txid;
      if(h) txByHash.set(h, t);
    }

    // -------- Nativo ETH (payload) --------
    for(const t of txs){
      if(!t) continue;

      const fromNorm = normAddr(t.from);
      const toNorm = normAddr(t.to); // può essere null (creazione contratto)
      const fromMon = fromNorm ? monitoredSet.has(fromNorm) : false;
      const toMon   = toNorm   ? monitoredSet.has(toNorm)   : false;

      let include = false;
      if (INCLUDE_IN && toMon) include = true;
      else if (INCLUDE_OUT_FOR_MONITORED_FROM && fromMon && !toMon) include = true;
      if (!include) continue;

      const amountWei = hexToBigInt(t.value);
      const amountETH = formatETHfromWei(amountWei);

      payload.push({
        // campi “shape” come nel tuo esempio BNB
        amount: amountETH,
        blockHash: t.blockHash,
        blockNumber: hexToNum(t.blockNumber),
        chain: "ETH",
        chainId: hexToNum(t.chainId) || CHAIN_ID,
        from: t.from ?? null,
        gas: hexToNum(t.gas),
        gasPrice: hexToNum(t.gasPrice),
        hash: t.hash,
        input: t.input,
        maxFeePerGas: hexToNullableNum(t.maxFeePerGas),
        maxPriorityFeePerGas: hexToNullableNum(t.maxPriorityFeePerGas),
        network: RETE,
        nonce: t.nonce,
        r: t.r, s: t.s, v: t.v,
        to: t.to ?? null,
        transactionIndex: t.transactionIndex,
        type: txTypeLabel(t.type),
        value: t.value // hex originale
      });
    }

    // -------- ERC-20 Transfer (receipts) --------
    for(const r of receiptsArr){
      if(!r || !Array.isArray(r.logs)) continue;

      const txHash = r.transactionHash;
      const tx = txByHash.get(txHash);

      // 1° pass: questa tx ha almeno un IN verso monitorati?
      let txHasIn = false;
      for(const log of r.logs){
        if(!log || !Array.isArray(log.topics) || log.topics.length<3) continue;
        if (normAddr(log.topics[0]) !== ERC20_TRANSFER_TOPIC0) continue;
        const toAddr = extractTopicAddr(log.topics[2]);
        if (toAddr && monitoredSet.has(normAddr(toAddr))) { txHasIn = true; break; }
      }

      // 2° pass: emetti secondo regole + filtro amount=0
      for(const log of r.logs){
        if(!log || !Array.isArray(log.topics) || log.topics.length<3) continue;
        if (normAddr(log.topics[0]) !== ERC20_TRANSFER_TOPIC0) continue;

        const fromAddr = extractTopicAddr(log.topics[1]);
        const toAddr   = extractTopicAddr(log.topics[2]);
        const token    = normAddr(log.address);

        const fromMon = fromAddr ? monitoredSet.has(fromAddr) : false;
        const toMon   = toAddr   ? monitoredSet.has(toAddr)   : false;

        let include = false;
        let direction = null;
        if (INCLUDE_IN && toMon) { include = true; direction = "IN"; }
        else if (INCLUDE_OUT_FOR_MONITORED_FROM && fromMon && !toMon) {
          if (!(SUPPRESS_OUT_WHEN_IN && txHasIn)) { include = true; direction = "OUT"; }
        }
        if (!include) continue;

        const raw = hexToBigInt(log.data || "0x0");
        if (raw === 0n) continue; // <<< salta transfer a importo zero

        const decimals = token ? tokenDecimalsCache[token] : undefined;
        const amountStr = decimals!=null ? bigIntToDecimalString(raw, decimals) : null;
        const amountNum = amountStr!=null ? Number(amountStr) : null;

        receipts.push({
          tokenAddress: log.address,
          chain: "ETH",
          network: RETE,
          blockNumber: hexToNum(r.blockNumber),
          chainId: tx ? hexToNum(tx.chainId) || CHAIN_ID : CHAIN_ID,
          gas: hexToNum(r.gasUsed),
          type: tx ? txTypeLabel(tx.type) : "",
          blockHash: r.blockHash,
          amount: amountNum,          // null se decimals ignoti
          rawAmount: raw.toString(),  // sempre presente
          decimals: decimals ?? null,
          hash: txHash,
          from: fromAddr,
          to: toAddr,
          direction                   // "IN" | "OUT"
        });
      }
    }
  }

  if (payload.length || receipts.length) {
    return { chainName: NOME_CATENA, payload, receipts };
  }
  return null;
}
