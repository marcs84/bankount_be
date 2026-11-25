
const { ECPair, bitcoin, createCustomError } = require("../../src/utils");
const axios = require('axios');

const mainnetURL=process.env.QUICKNODE_BTC_MAIN_URL
const testnetURL=process.env.QUICKNODE_BTC_TEST_URL


const headers = {
  "Content-Type": "application/json"
};

const SATOSHIS_PER_BTC = 100000000;

function validate(address,network) {
    try {
        bitcoin.address.toOutputScript(address, network);
        return true;
    } catch (e) {
      return false;
    }
  }

function setUrlAndNetworkForAPI(network) {
  let url, btcNetwork;
      if (network === "TESTNET") {
          url = testnetURL;
          btcNetwork = bitcoin.networks.testnet;
      } else {
          url = mainnetURL;
          btcNetwork = bitcoin.networks.bitcoin;
      }

  return {url,btcNetwork};
}

// Funzione per creare un nuovo indirizzo Bitcoin passando il child del Masternode riferito alla blockchain Bitcoin
// async function signAndSendTransaction(address, toAddress, amount, addressPrivateKey, network) {
//   try {
//       // Ottieni l'URL e la rete per le API
//       let { url, btcNetwork } = setUrlAndNetworkForAPI(network);

//       if(!validate(toAddress,btcNetwork)){
//         throw createCustomError("validate function bitcoin.address.toOutputScript() returns false","The destination address entered is invalid.")
//       }

//       // Stampa informazioni di debug
//       console.log("QUICKNODE\n");
//       console.log("CHIAVE PRIVATA: " + addressPrivateKey);

//       // Ottieni i bilanci degli indirizzi
//       const addressBalance = await getBalance(address, "TESTNET");
//       const toAddressBalance = await getBalance(toAddress, "TESTNET");

//       // Controlla se l'importo è un numero valido
//       if (isNaN(amount)) {
//         throw createCustomError("isNaN(amount) function returns true","The amount is not a valid number.")
//       }

//       // Converti l'importo in satoshi
//       const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC);

//       // Ottieni i saldi in satoshi
//       const addressBalanceInSatoshi = addressBalance.balance * SATOSHIS_PER_BTC;
//       const toAddressBalanceInSatoshi = toAddressBalance.balance * SATOSHIS_PER_BTC;

//       console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis);
//       console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi);
//       console.log("BALANCE TO-ADDRESS \n" + toAddressBalanceInSatoshi);

//       // Controlla se il saldo dell'indirizzo è sufficiente per la transazione
//       if (addressBalanceInSatoshi < amountInSatoshis) {
//         throw Error(`The available balance is less than the transaction amount.`);
//       }

//       // Ottieni gli UTXOs dell'indirizzo
//       const getUtxosAPI = JSON.stringify({
//           method: "bb_getutxos",
//           params: [address, {"confirmed": false}]
//       });
//       let responseGetUtxos = await axios.post(url, getUtxosAPI, { headers });
//       let utxos = responseGetUtxos.data.result;
//       console.log(utxos);

//       // Controlla se ci sono UTXOs disponibili
//       if (utxos.length === 0) {
//         throw createCustomError("Usually this error is due to the fact that no funds have been loaded to the bitcoin address and consequently there are no UTXOs present","There are no UTXOs available for the address.")
//       }

//       // Ottieni il fee rate stimato
//       const estimateFeeAPI = JSON.stringify({
//           method: "estimatesmartfee",
//           params: [10]
//       });

//       let responseEstimateFee = await axios.post(url, estimateFeeAPI, { headers })
//       const feeRate = (responseEstimateFee.data.result.feerate * SATOSHIS_PER_BTC) / 1000; // Converti da BTC/kB a satoshi/byte
//       console.log("FEERATE: "+feeRate)

//       // Calcoli relativi alla dimensione della transazione
//       const inputSize = address.startsWith('bc1') || address.startsWith('tb1') ? 68 : 148;
//       const outputSize = 31;
//       let estimatedTxSize = utxos.length * inputSize + outputSize + 10;
//       let fee = Math.round(estimatedTxSize * feeRate);
//       let securityMargin = Math.round(0.5 * fee);
//       let totalFee= fee + securityMargin;
//       // Calcola l'importo del resto
//       let totalInputAmount = utxos.reduce((acc, utxo) => acc + Number(utxo.value), 0);
//       let changeAmount = totalInputAmount - amountInSatoshis - totalFee;

//       console.log("with no change :" + changeAmount);
//       console.log("estTxSize :" + estimatedTxSize);
//       console.log("estFee :" + totalFee);

//       // Creazione della chiave privata e del PSBT
//       const privateKeyBuffer = Buffer.from(addressPrivateKey, 'hex');
//       const keyPairInitial = ECPair.fromPrivateKey(privateKeyBuffer, { network: btcNetwork });
//       const privateKeyInWIF = keyPairInitial.toWIF();
//       const keyPair = ECPair.fromWIF(privateKeyInWIF, btcNetwork);
//       const psbt = new bitcoin.Psbt({ network: btcNetwork });

//       // Aggiungi input alla transazione
//       for (const utxo of utxos) {
//           const getRawTx = JSON.stringify({
//               method: "getrawtransaction",
//               params: [utxo.txid]
//           });
//           let responseGetUtxos = await axios.post(url, getRawTx, { headers });
//           let rawTx = responseGetUtxos.data.result;

//           psbt.addInput({
//               hash: utxo.txid,
//               index: utxo.vout,
//               nonWitnessUtxo: Buffer.from(rawTx, 'hex')
//           });
//       }

//       // Aggiungi output per l'indirizzo di destinazione
//       psbt.addOutput({
//           address: toAddress,
//           value: amountInSatoshis
//       });

//       // Se c'è un importo di cambio, aggiungi output per il cambio
//       if (changeAmount > 0) {
//           estimatedTxSize += outputSize;
//           fee = Math.round(estimatedTxSize * feeRate);
//           securityMargin = Math.round(0.5 * fee);
//           totalFee= fee + securityMargin;

//           psbt.addOutput({
//               address: address,
//               value: changeAmount
//           });

//           console.log("WITH change :" + changeAmount);
//           console.log("estTxSize :" + estimatedTxSize);
//           console.log("estFee :" + totalFee);
//       }
      
//       psbt.setMaximumFeeRate(totalFee)
//       // Firma e finalizza la transazione
//       psbt.signAllInputs(keyPair);
//       psbt.finalizeAllInputs();
//       // Estrai l'esadecimale della transazione
//       const txHex = psbt.extractTransaction().toHex();
//       console.log(txHex)
//       // Invia la transazione alla rete
//       const sendRawTxAPI = JSON.stringify({
//           method: "sendrawtransaction",
//           params: [txHex]
//       });
//       let txHash;
//       try {
//           let responseSend = await axios.post(url, sendRawTxAPI, { headers });
//           txHash = responseSend.data.result;
//       } catch (error) {
//         throw createCustomError(error.message,"There was a problem sending raw transaction through blockchain.")
//       }

//       // Stampa l'hash della transazione
//       console.log(txHash);
//       return txHash;
//   } catch (error) {
//     throw error
//   }
// }

// async function transactionUtils(address, toAddress, amount, network) {
//     try {
//         // Ottieni l'URL e la rete per le API
//         let { url, btcNetwork } = setUrlAndNetworkForAPI(network);
  
//         if(!validate(toAddress,btcNetwork)){
//           throw createCustomError("validate function bitcoin.address.toOutputScript() returns false","The destination address entered is invalid.")
//         }
  
//         // Stampa informazioni di debug
//         console.log("QUICKNODE\n");
  
//         // Ottieni i bilanci degli indirizzi
//         const addressBalance = await getBalance(address, network);
  
//         // Controlla se l'importo è un numero valido
//         if (isNaN(amount)) {
//           throw createCustomError("isNaN(amount) function returns true","The amount is not a valid number.")
//         }
  
//         // Converti l'importo in satoshi
//         const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC);
  
//         // Ottieni i saldi in satoshi
//         const addressBalanceInSatoshi = addressBalance.balance * SATOSHIS_PER_BTC;
  
//         console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis);
//         console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi);
  
//         // Controlla se il saldo dell'indirizzo è sufficiente per la transazione
//         if (addressBalanceInSatoshi < amountInSatoshis) {
//           throw Error(`The available balance is less than the transaction amount.`);
//         }
  
//         // Ottieni gli UTXOs dell'indirizzo
//         const getUtxosAPI = JSON.stringify({
//             method: "bb_getutxos",
//             params: [address, {"confirmed": false}]
//         });
//         let responseGetUtxos = await axios.post(url, getUtxosAPI, { headers });
//         let utxos = responseGetUtxos.data.result;
//         console.log(utxos);
  
//         // Controlla se ci sono UTXOs disponibili
//         if (utxos.length === 0) {
//           throw createCustomError("Usually this error is due to the fact that no funds have been loaded to the bitcoin address and consequently there are no UTXOs present","There are no UTXOs available for the address.")
//         }
  
//         // Ottieni il fee rate stimato
//         const estimateFeeAPI = JSON.stringify({
//             method: "estimatesmartfee",
//             params: [10]
//         });
  
//         let responseEstimateFee = await axios.post(url, estimateFeeAPI, { headers })
//         const feeRate = (responseEstimateFee.data.result.feerate * SATOSHIS_PER_BTC) / 1000; // Converti da BTC/kB a satoshi/byte
//         console.log("FEERATE: "+feeRate)
  
//         // Calcoli relativi alla dimensione della transazione
//         const inputSize = address.startsWith('bc1') || address.startsWith('tb1') ? 68 : 148;
//         const outputSize = 31;
//         let estimatedTxSize = utxos.length * inputSize + outputSize + 10;
//         let fee = Math.round(estimatedTxSize * feeRate);
//         let securityMargin = Math.round(0.5 * fee);
//         let totalFee= fee + securityMargin;
//         // Calcola l'importo del resto
//         let totalInputAmount = utxos.reduce((acc, utxo) => acc + Number(utxo.value), 0);
//         let changeAmount = totalInputAmount - amountInSatoshis - totalFee;
  
//         console.log("with no change :" + changeAmount);
//         console.log("estTxSize :" + estimatedTxSize);
//         console.log("estFee :" + totalFee);

//         const psbt = new bitcoin.Psbt({ network: btcNetwork });
  
//         // Aggiungi input alla transazione
//         for (const utxo of utxos) {
//             const getRawTx = JSON.stringify({
//                 method: "getrawtransaction",
//                 params: [utxo.txid]
//             });
//             let responseGetUtxos = await axios.post(url, getRawTx, { headers });
//             let rawTx = responseGetUtxos.data.result;
  
//             psbt.addInput({
//                 hash: utxo.txid,
//                 index: utxo.vout,
//                 nonWitnessUtxo: Buffer.from(rawTx, 'hex')
//             });
//         }
  
//         // Aggiungi output per l'indirizzo di destinazione
//         psbt.addOutput({
//             address: toAddress,
//             value: amountInSatoshis
//         });
  
//         // Se c'è un importo di cambio, aggiungi output per il cambio
//         if (changeAmount > 0) {
//             estimatedTxSize += outputSize;
//             fee = Math.round(estimatedTxSize * feeRate);
//             securityMargin = Math.round(0.5 * fee);
//             totalFee= fee + securityMargin;
  
//             psbt.addOutput({
//                 address: address,
//                 value: changeAmount
//             });
  
//             console.log("WITH change :" + changeAmount);
//             console.log("estTxSize :" + estimatedTxSize);
//             console.log("estFee :" + totalFee);
//         }
        
//         psbt.setMaximumFeeRate(totalFee)
//         // Firma e finalizza la transazione
//         psbt.signAllInputs(keyPair);
//         psbt.finalizeAllInputs();
//         // Estrai l'esadecimale della transazione
//         const txHex = psbt.extractTransaction().toHex();
//         console.log(txHex)
//         // Invia la transazione alla rete
//         const sendRawTxAPI = JSON.stringify({
//             method: "sendrawtransaction",
//             params: [txHex]
//         });
//         let txHash;
//         try {
//             let responseSend = await axios.post(url, sendRawTxAPI, { headers });
//             txHash = responseSend.data.result;
//         } catch (error) {
//           throw createCustomError(error.message,"There was a problem sending raw transaction through blockchain.")
//         }
  
//         // Stampa l'hash della transazione
//         console.log(txHash);
//         return txHash;
//     } catch (error) {
//       throw error
//     }
//   }
//Funzione per ricevere gli UTXOS BTC dato un address passato come parametro
//Funzione per ricevere il quantitativo di BTC dato un address passato come parametro
async function getBalance(address,network, url) {  
    try{
        // let {url}= setUrlAndNetworkForAPI(network)
        const data = JSON.stringify({
            method: "bb_getaddress",
            params: [address]
        });
        let response= await axios.post(url, data, { headers })
        console.log('response', response.data)

        let unlockedBalance= response.data.result.unconfirmedBalance / SATOSHIS_PER_BTC
        let balance= response.data.result.balance / SATOSHIS_PER_BTC
        console.log("unlockedBalance",unlockedBalance)
        if (unlockedBalance < 0) {
            balance += unlockedBalance;
        }
        console.log(`Il balance dell'account ${address} è di ${balance} BTC`);
        console.log(`L'unconfirmed balance dell'account ${address} è di ${unlockedBalance} BTC`);
        // Blockbook risponde in satoshi, interi e come stringhe: si tengono
        // tali. Otto decimali starebbero anche in un double -- qui il numero
        // e' gia' giusto -- ma il valore esatto viaggia lo stesso, perche'
        // chi legge un saldo non debba chiedersi di quale catena si fida.
        const confermati = BigInt(response.data.result.balance);
        const nonConfermati = BigInt(response.data.result.unconfirmedBalance);
        const effettivi = nonConfermati < 0n ? confermati + nonConfermati : confermati;

        return {balance, unlockedBalance, unitaBase: effettivi.toString(), decimali: 8};
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting balances.")
    }
}
async function getBlockHeightByHash(blockHash,url){
    try{
        const data = JSON.stringify({
            method: "getblock",
            params: [blockHash,1] 
        });
        
        let response= await axios.post(url, data, { headers })
        let blockHeight= response.data.result.height
        return blockHeight
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting block height by hash.")
    }
}
module.exports={

    getBalance,

    // signAndSendTransaction,
    // transactionUtils

    
}