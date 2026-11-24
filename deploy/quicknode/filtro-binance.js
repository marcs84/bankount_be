// Filtro dello Stream BNB Smart Chain di QuickNode.
//
// Non viene eseguito da questo progetto: si incolla nella console dello
// Stream, alla voce "Modify the payload before streaming".
//
// E' il gemello di `filtro-ethereum.js`: stessa struttura, stessi aiutanti,
// stessi interruttori. Tenerli uguali serve a questo -- un difetto trovato in
// uno si corregge nell'altro leggendo la stessa riga.
//
// Restituisce { chainName, payload, receipts }: `payload` sono i movimenti di
// BNB nativo, `receipts` i trasferimenti di token BEP-20 (che usano lo stesso
// evento `Transfer` degli ERC-20).
//
// === PASSARE FRA LE DUE RETI ===
// Si cambiano soltanto le tre costanti qui sotto, e lo Stream va creato sulla
// rete corrispondente. `RETE` non e' un'etichetta: finisce in
// `transactions.network_type`, che distingue i movimenti di prova da quelli
// veri e fa parte della chiave con cui il backend riconosce la riga gia'
// scritta dall'applicazione.

// ============= RETE =============
const RETE = "TESTNET";             // "MAINNET" per la rete principale
const NOME_CATENA = "BNB Testnet";  // "BNB Mainnet"
const CHAIN_ID = 97;                // BSC testnet; 56 per la rete principale

// ============= TOGGLES =============
const INCLUDE_IN = true;
const INCLUDE_OUT_FOR_MONITORED_FROM = true;
const SUPPRESS_OUT_WHEN_IN = true; // se una tx ha già un IN, non aggiungo OUT nella stessa tx

// ============= Helpers =============
const ERC20_TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function normAddr(a){ return (a && typeof a === "string") ? a.toLowerCase() : null; }
function hexToBigInt(h){ if(h==null) return 0n; if(typeof h==="bigint") return h; if(typeof h==="number") return BigInt(h); const s=String(h); return s.startsWith("0x")? BigInt(s): BigInt(s); }
function hexToNum(h){ if(h==null) return 0; if(typeof h==="number") return h; const n=parseInt(h,16); return Number.isFinite(n)? n: 0; }
function hexToNullableNum(h){ if(h==null) return null; const n=parseInt(h,16); return Number.isFinite(n)? n: null; }
function formatBNBfromWei(wei){ return Number(wei) / 1e18; }
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

// Decimali noti, per rete.
//
// Su BNB Smart Chain la norma sono **18 decimali anche per le stablecoin**:
// USDT e USDC qui non hanno i 6 decimali che hanno su Ethereum. Dare per
// scontati 6, come faceva la versione precedente, sbagliava l'importo di un
// fattore mille miliardi.
//
// Quando un token non e' qui dentro il filtro manda comunque `rawAmount`, e i
// decimali li recupera il backend; per aggiungerne senza toccare questo file
// c'e' la mappa `erc20-decimals` negli elenchi di QuickNode, letta qui sotto,
// che ha la precedenza.
const DECIMALI_MAINNET = {
  "0x55d398326f99059ff775485246999027b3197955": 18, // USDT (BSC-USD)
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": 18, // USDC
  "0xe9e7cea3dedca5984780bafc599bd69add087d56": 18, // BUSD
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": 18, // WBNB
};

// Vuota di proposito: sulla testnet i contratti cambiano spesso e un
// indirizzo scritto a memoria qui non combacerebbe comunque.
const DECIMALI_TESTNET = {};

const DECIMALI_NOTI = RETE === "MAINNET" ? DECIMALI_MAINNET : DECIMALI_TESTNET;

// ============= MAIN =============
async function main(stream){
  const dati = stream?.data ?? stream;

  // Una consegna puo' portare piu' blocchi: la dimensione del lotto e' una
  // impostazione dello Stream. Leggere solo `data[0]` faceva sparire in
  // silenzio tutto quello che stava negli altri.
  const elementi = Array.isArray(dati) ? dati : [dati];

  const monitoredAddresses = await qnLib.qnGetList('registered-addresses');
  const monitoredSet = new Set((monitoredAddresses||[]).map(a=>normAddr(a)).filter(Boolean));
  if (!monitoredSet.size) return null;

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

    const txByHash = new Map();
    for(const t of txs){
      if(!t) continue;
      const h = t.hash || t.transactionHash || t.txid;
      if(h) txByHash.set(h, t);
    }

    // -------- Nativo BNB (payload) --------
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

      payload.push({
        amount: formatBNBfromWei(hexToBigInt(t.value)),
        blockHash: t.blockHash,
        blockNumber: hexToNum(t.blockNumber),
        chain: "BNB",
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

    // -------- BEP-20 Transfer (receipts) --------
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

      // 2° pass: **tutti** i log che corrispondono, non solo il primo. Una
      // transazione puo' contenere piu' trasferimenti che ti riguardano, e
      // fermarsi al primo ne faceva sparire gli altri.
      for(const log of r.logs){
        if(!log || !Array.isArray(log.topics) || log.topics.length<3) continue;
        // Senza questo controllo bastava che un indirizzo sorvegliato
        // comparisse in un argomento qualunque -- per esempio in un evento
        // `Approval` -- perche' il log venisse letto come un trasferimento e
        // il suo `data` scambiato per un importo.
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
        if (raw === 0n) continue; // salta i trasferimenti a importo zero

        const decimals = token ? tokenDecimalsCache[token] : undefined;
        const amountStr = decimals!=null ? bigIntToDecimalString(raw, decimals) : null;
        const amountNum = amountStr!=null ? Number(amountStr) : null;

        receipts.push({
          tokenAddress: log.address,
          chain: "BNB",
          network: RETE,
          blockNumber: hexToNum(r.blockNumber),
          // I receipts non portano `chainId`: leggerlo da li' dava NaN.
          chainId: tx ? hexToNum(tx.chainId) || CHAIN_ID : CHAIN_ID,
          gas: hexToNum(r.gasUsed),
          // Il tipo si prende dalla transazione di **questo** receipt, trovata
          // per hash: indicizzare le transazioni con l'indice del receipt
          // accoppiava due elenchi che non sono allineati.
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
