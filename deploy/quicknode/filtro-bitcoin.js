// Filtro dello Stream Bitcoin di QuickNode.
//
// Non viene eseguito da questo progetto: si incolla nella console dello
// Stream, alla voce "Modify the payload before streaming".
//
// Restituisce { chainName, payload }: Bitcoin non ha token, quindi non c'e'
// un ramo `receipts` come in `filtro-ethereum.js` e `filtro-binance.js`.
//
// === PASSARE FRA LE DUE RETI ===
// Si cambiano le due costanti qui sotto, e lo Stream va creato sulla rete
// corrispondente. `RETE` non e' un'etichetta: finisce in
// `transactions.network_type`, che distingue i movimenti di prova da quelli
// veri e fa parte della chiave con cui il backend riconosce la riga gia'
// scritta dall'applicazione.
//
// Gli indirizzi non vanno toccati: quelli di prova e quelli veri hanno forme
// diverse (`tb1`/`m`/`n`/`2` contro `bc1`/`1`/`3`) e vivono entrambi in
// `registered-addresses`, dove non possono confondersi.

// ============= RETE =============
const RETE = "TESTNET";             // "MAINNET" per la rete principale
const NOME_CATENA = "BTC Testnet";  // "BTC Mainnet"

// ============= TOGGLES =============
const EMIT_IN = true;                            // emetti accrediti verso indirizzi monitorati
const EMIT_OUT_FOR_MONITORED_INPUTS = true;      // emetti uscite verso NON monitorati se c’è almeno un input monitorato
const SUPPRESS_OUT_WHEN_IN_PRESENT = true;       // se una tx produce IN, non emettere OUT nella stessa tx (evita doppioni indesiderati)
const EXCLUDE_CHANGE = true;                     // prova a scartare il "resto": skip vout verso indirizzi presenti fra gli input
const SELECT_SINGLE_NON_MONITORED_OUT = true;    // se ci sono più OUT verso non-monitorati, tieni solo il più grande (più probabile pagamento)

// ============= Helpers =============
// Bech32 e' insensibile alle maiuscole e si scrive minuscolo; base58 **non**
// lo e', e abbassarlo darebbe un indirizzo diverso. Per questo la
// normalizzazione tocca solo la prima forma.
function isBech32(addr){ if(typeof addr!=="string")return false; const a=addr.toLowerCase(); return a.startsWith("bc1")||a.startsWith("tb1")||a.startsWith("bcrt1"); }
function normAddr(addr){ if(!addr||typeof addr!=="string")return null; return isBech32(addr)?addr.toLowerCase():addr; }
function isAddressEntry(e){ if(!e||!Array.isArray(e.addresses)||!e.addresses[0])return false; if(e.isAddress===false)return false; const a0=e.addresses[0]; if(typeof a0!=="string")return false; return !a0.startsWith("OP_RETURN"); }
function firstAddr(e){ return isAddressEntry(e)?(e.addresses[0]||null):null; }
function getSats(v){ if(v==null) return 0n; if(typeof v==="bigint") return v; if(typeof v==="number") return BigInt(Math.trunc(v)); if(typeof v==="string") return BigInt(v); return 0n; }
function toBTC(satsBigInt){ return Number(satsBigInt)/1e8; }

// ============= MAIN =============
async function main(stream){
  const data = stream?.data ?? stream;
  if(!Array.isArray(data) || data.length===0) return null;

  const monitoredAddresses = await qnLib.qnGetList('registered-addresses');
  const monitoredSet = new Set((monitoredAddresses||[]).map(normAddr).filter(Boolean));
  if(!monitoredSet.size) return null;

  const payload = [];

  for(const block of data){
    if(!block || !Array.isArray(block.txs)) continue;

    for(const tx of block.txs){
      if(!tx) continue;
      const vin = tx.vin || [];
      const vout = tx.vout || [];

      // salta coinbase
      const isCoinbase = vin.length>0 && vin[0]?.isAddress===false;
      if(isCoinbase) continue;

      // input addresses (raw + norm)
      const inputAddrsRaw = vin.map(firstAddr).filter(Boolean);
      const inputAddrsNorm = inputAddrsRaw.map(normAddr).filter(Boolean);
      const inputAddrSetNorm = new Set(inputAddrsNorm);

      // mittente "rappresentativo": se c'è un solo input address usa quello; altrimenti se c'è un solo input monitorato usa quello; altrimenti primo input
      let representativeFrom = null;
      const uniqInputsRaw = [...new Set(inputAddrsRaw)];
      const monitoredInputsRaw = inputAddrsRaw.filter(a => a && monitoredSet.has(normAddr(a)));
      if(uniqInputsRaw.length===1) representativeFrom = uniqInputsRaw[0];
      else if([...new Set(monitoredInputsRaw)].length===1) representativeFrom = [...new Set(monitoredInputsRaw)][0];
      else representativeFrom = uniqInputsRaw[0] || null;

      const hasMonitoredInput = inputAddrsNorm.some(a => monitoredSet.has(a));

      // Quante entrate ha prodotto **questa** transazione. Prima lo si
      // deduceva guardando l'ultimo elemento di `payload`, che e' l'elenco di
      // tutte le transazioni del lotto: una domanda su questa transazione
      // fatta a una struttura che ne contiene molte.
      let entrateEmesse = 0;

      // Pre-classifica i vout
      const outsToOthers = [];
      for(const o of vout){
        const toRaw = firstAddr(o);
        if(!toRaw) continue;
        const toNorm = normAddr(toRaw);
        const val = getSats(o?.value);
        if(val<=0n) continue;

        const baseRec = {
          chain: "BTC",
          network: RETE,
          type: "BTC_NATIVE",
          blockHash: tx.blockHash ?? block.hash,
          blockNumber: tx.blockHeight ?? block.height,
          hash: tx.txid,
          from: representativeFrom,
          to: toRaw,
          amount: toBTC(val),
          rawAmountSats: val.toString(),
          meta: { voutIndex: o?.n ?? null }
        };

        const toIsMon = !!toNorm && monitoredSet.has(toNorm);
        const isChangeBasic = !!toNorm && inputAddrSetNorm.has(toNorm); // euristica "basica": change verso un input già visto

        if(toIsMon){
          // IN verso monitorati
          if(EMIT_IN && (!EXCLUDE_CHANGE || !isChangeBasic)){
            payload.push({ ...baseRec, meta: { ...baseRec.meta, isChange: isChangeBasic } });
            entrateEmesse++;
          }
        } else {
          // candidato OUT verso non-monitorati
          if(EMIT_OUT_FOR_MONITORED_INPUTS && hasMonitoredInput){
            if(!EXCLUDE_CHANGE || !isChangeBasic){
              outsToOthers.push({ rec: baseRec, value: val });
            }
          }
        }
      }

      // Se la tx ha prodotto IN e vogliamo sopprimere gli OUT
      if(!(SUPPRESS_OUT_WHEN_IN_PRESENT && entrateEmesse>0)){
        if(outsToOthers.length){
          if(SELECT_SINGLE_NON_MONITORED_OUT){
            // tieni solo il più grande (probabile pagamento, l'altro/i più piccoli come resto)
            outsToOthers.sort((a,b)=> (a.value<b.value?1:-1));
            const { rec } = outsToOthers[0];
            payload.push({ ...rec, meta: { ...rec.meta, isChange: false } });
          } else {
            for(const {rec} of outsToOthers){
              payload.push({ ...rec, meta: { ...rec.meta, isChange: false } });
            }
          }
        }
      }
    }
  }

  return payload.length ? { chainName: NOME_CATENA, payload } : null;
}
