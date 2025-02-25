
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
function createAddress(child, network) {
    try{
        const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey, 'hex'));
        const { address } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: network
        });
    
        return { address, keyPair };
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem on the creation of a BTC address.")
      }
}

async function signAndSendTransaction(address, toAddress, amount, addressPrivateKey, network) {
  try {
      // Ottieni l'URL e la rete per le API
      let { url, btcNetwork } = setUrlAndNetworkForAPI(network);

      if(!validate(toAddress,btcNetwork)){
        throw createCustomError("validate function bitcoin.address.toOutputScript() returns false","The destination address entered is invalid.")
      }

      // Stampa informazioni di debug
      console.log("QUICKNODE\n");
      console.log("CHIAVE PRIVATA: " + addressPrivateKey);

      // Ottieni i bilanci degli indirizzi
      const addressBalance = await getBalance(address, "TESTNET");
      const toAddressBalance = await getBalance(toAddress, "TESTNET");

      // Controlla se l'importo è un numero valido
      if (isNaN(amount)) {
        throw createCustomError("isNaN(amount) function returns true","The amount is not a valid number.")
      }

      // Converti l'importo in satoshi
      const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC);

      // Ottieni i saldi in satoshi
      const addressBalanceInSatoshi = addressBalance.balance * SATOSHIS_PER_BTC;
      const toAddressBalanceInSatoshi = toAddressBalance.balance * SATOSHIS_PER_BTC;

      console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis);
      console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi);
      console.log("BALANCE TO-ADDRESS \n" + toAddressBalanceInSatoshi);

      // Controlla se il saldo dell'indirizzo è sufficiente per la transazione
      if (addressBalanceInSatoshi < amountInSatoshis) {
        throw Error(`The available balance is less than the transaction amount.`);
      }

      // Ottieni gli UTXOs dell'indirizzo
      const getUtxosAPI = JSON.stringify({
          method: "bb_getutxos",
          params: [address, {"confirmed": false}]
      });
      let responseGetUtxos = await axios.post(url, getUtxosAPI, { headers });
      let utxos = responseGetUtxos.data.result;
      console.log(utxos);

      // Controlla se ci sono UTXOs disponibili
      if (utxos.length === 0) {
        throw createCustomError("Usually this error is due to the fact that no funds have been loaded to the bitcoin address and consequently there are no UTXOs present","There are no UTXOs available for the address.")
      }

      // Ottieni il fee rate stimato
      const estimateFeeAPI = JSON.stringify({
          method: "estimatesmartfee",
          params: [10]
      });

      let responseEstimateFee = await axios.post(url, estimateFeeAPI, { headers })
      const feeRate = (responseEstimateFee.data.result.feerate * SATOSHIS_PER_BTC) / 1000; // Converti da BTC/kB a satoshi/byte
      console.log("FEERATE: "+feeRate)

      // Calcoli relativi alla dimensione della transazione
      const inputSize = address.startsWith('bc1') || address.startsWith('tb1') ? 68 : 148;
      const outputSize = 31;
      let estimatedTxSize = utxos.length * inputSize + outputSize + 10;
      let fee = Math.round(estimatedTxSize * feeRate);
      let securityMargin = Math.round(0.5 * fee);
      let totalFee= fee + securityMargin;
      // Calcola l'importo del resto
      let totalInputAmount = utxos.reduce((acc, utxo) => acc + Number(utxo.value), 0);
      let changeAmount = totalInputAmount - amountInSatoshis - totalFee;

      console.log("with no change :" + changeAmount);
      console.log("estTxSize :" + estimatedTxSize);
      console.log("estFee :" + totalFee);

      // Creazione della chiave privata e del PSBT
      const privateKeyBuffer = Buffer.from(addressPrivateKey, 'hex');
      const keyPairInitial = ECPair.fromPrivateKey(privateKeyBuffer, { network: btcNetwork });
      const privateKeyInWIF = keyPairInitial.toWIF();
      const keyPair = ECPair.fromWIF(privateKeyInWIF, btcNetwork);
      const psbt = new bitcoin.Psbt({ network: btcNetwork });

      // Aggiungi input alla transazione
      for (const utxo of utxos) {
          const getRawTx = JSON.stringify({
              method: "getrawtransaction",
              params: [utxo.txid]
          });
          let responseGetUtxos = await axios.post(url, getRawTx, { headers });
          let rawTx = responseGetUtxos.data.result;

          psbt.addInput({
              hash: utxo.txid,
              index: utxo.vout,
              nonWitnessUtxo: Buffer.from(rawTx, 'hex')
          });
      }

      // Aggiungi output per l'indirizzo di destinazione
      psbt.addOutput({
          address: toAddress,
          value: amountInSatoshis
      });

      // Se c'è un importo di cambio, aggiungi output per il cambio
      if (changeAmount > 0) {
          estimatedTxSize += outputSize;
          fee = Math.round(estimatedTxSize * feeRate);
          securityMargin = Math.round(0.5 * fee);
          totalFee= fee + securityMargin;

          psbt.addOutput({
              address: address,
              value: changeAmount
          });

          console.log("WITH change :" + changeAmount);
          console.log("estTxSize :" + estimatedTxSize);
          console.log("estFee :" + totalFee);
      }
      
      psbt.setMaximumFeeRate(totalFee)
      // Firma e finalizza la transazione
      psbt.signAllInputs(keyPair);
      psbt.finalizeAllInputs();
      // Estrai l'esadecimale della transazione
      const txHex = psbt.extractTransaction().toHex();
      console.log(txHex)
      // Invia la transazione alla rete
      const sendRawTxAPI = JSON.stringify({
          method: "sendrawtransaction",
          params: [txHex]
      });
      let txHash;
      try {
          let responseSend = await axios.post(url, sendRawTxAPI, { headers });
          txHash = responseSend.data.result;
      } catch (error) {
        throw createCustomError(error.message,"There was a problem sending raw transaction through blockchain.")
      }

      // Stampa l'hash della transazione
      console.log(txHash);
      return txHash;
  } catch (error) {
    throw error
  }
}

async function transactionUtils(address, toAddress, amount, network) {
    try {
        // Ottieni l'URL e la rete per le API
        let { url, btcNetwork } = setUrlAndNetworkForAPI(network);
  
        if(!validate(toAddress,btcNetwork)){
          throw createCustomError("validate function bitcoin.address.toOutputScript() returns false","The destination address entered is invalid.")
        }
  
        // Stampa informazioni di debug
        console.log("QUICKNODE\n");
  
        // Ottieni i bilanci degli indirizzi
        const addressBalance = await getBalance(address, network);
  
        // Controlla se l'importo è un numero valido
        if (isNaN(amount)) {
          throw createCustomError("isNaN(amount) function returns true","The amount is not a valid number.")
        }
  
        // Converti l'importo in satoshi
        const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC);
  
        // Ottieni i saldi in satoshi
        const addressBalanceInSatoshi = addressBalance.balance * SATOSHIS_PER_BTC;
  
        console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis);
        console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi);
  
        // Controlla se il saldo dell'indirizzo è sufficiente per la transazione
        if (addressBalanceInSatoshi < amountInSatoshis) {
          throw Error(`The available balance is less than the transaction amount.`);
        }
  
        // Ottieni gli UTXOs dell'indirizzo
        const getUtxosAPI = JSON.stringify({
            method: "bb_getutxos",
            params: [address, {"confirmed": false}]
        });
        let responseGetUtxos = await axios.post(url, getUtxosAPI, { headers });
        let utxos = responseGetUtxos.data.result;
        console.log(utxos);
  
        // Controlla se ci sono UTXOs disponibili
        if (utxos.length === 0) {
          throw createCustomError("Usually this error is due to the fact that no funds have been loaded to the bitcoin address and consequently there are no UTXOs present","There are no UTXOs available for the address.")
        }
  
        // Ottieni il fee rate stimato
        const estimateFeeAPI = JSON.stringify({
            method: "estimatesmartfee",
            params: [10]
        });
  
        let responseEstimateFee = await axios.post(url, estimateFeeAPI, { headers })
        const feeRate = (responseEstimateFee.data.result.feerate * SATOSHIS_PER_BTC) / 1000; // Converti da BTC/kB a satoshi/byte
        console.log("FEERATE: "+feeRate)
  
        // Calcoli relativi alla dimensione della transazione
        const inputSize = address.startsWith('bc1') || address.startsWith('tb1') ? 68 : 148;
        const outputSize = 31;
        let estimatedTxSize = utxos.length * inputSize + outputSize + 10;
        let fee = Math.round(estimatedTxSize * feeRate);
        let securityMargin = Math.round(0.5 * fee);
        let totalFee= fee + securityMargin;
        // Calcola l'importo del resto
        let totalInputAmount = utxos.reduce((acc, utxo) => acc + Number(utxo.value), 0);
        let changeAmount = totalInputAmount - amountInSatoshis - totalFee;
  
        console.log("with no change :" + changeAmount);
        console.log("estTxSize :" + estimatedTxSize);
        console.log("estFee :" + totalFee);

        const psbt = new bitcoin.Psbt({ network: btcNetwork });
  
        // Aggiungi input alla transazione
        for (const utxo of utxos) {
            const getRawTx = JSON.stringify({
                method: "getrawtransaction",
                params: [utxo.txid]
            });
            let responseGetUtxos = await axios.post(url, getRawTx, { headers });
            let rawTx = responseGetUtxos.data.result;
  
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(rawTx, 'hex')
            });
        }
  
        // Aggiungi output per l'indirizzo di destinazione
        psbt.addOutput({
            address: toAddress,
            value: amountInSatoshis
        });
  
        // Se c'è un importo di cambio, aggiungi output per il cambio
        if (changeAmount > 0) {
            estimatedTxSize += outputSize;
            fee = Math.round(estimatedTxSize * feeRate);
            securityMargin = Math.round(0.5 * fee);
            totalFee= fee + securityMargin;
  
            psbt.addOutput({
                address: address,
                value: changeAmount
            });
  
            console.log("WITH change :" + changeAmount);
            console.log("estTxSize :" + estimatedTxSize);
            console.log("estFee :" + totalFee);
        }
        
        psbt.setMaximumFeeRate(totalFee)
        // Firma e finalizza la transazione
        psbt.signAllInputs(keyPair);
        psbt.finalizeAllInputs();
        // Estrai l'esadecimale della transazione
        const txHex = psbt.extractTransaction().toHex();
        console.log(txHex)
        // Invia la transazione alla rete
        const sendRawTxAPI = JSON.stringify({
            method: "sendrawtransaction",
            params: [txHex]
        });
        let txHash;
        try {
            let responseSend = await axios.post(url, sendRawTxAPI, { headers });
            txHash = responseSend.data.result;
        } catch (error) {
          throw createCustomError(error.message,"There was a problem sending raw transaction through blockchain.")
        }
  
        // Stampa l'hash della transazione
        console.log(txHash);
        return txHash;
    } catch (error) {
      throw error
    }
  }

async function signAndSendTransactionByUser(signedTx, network) {
  try {
      // Ottieni l'URL e la rete per le API
      let { url } = setUrlAndNetworkForAPI(network);
      console.log("signedTx", signedTx)
      const txHex = psbt.extractTransaction().toHex();
      // Invia la transazione alla rete
      const sendRawTxAPI = JSON.stringify({
          method: "sendrawtransaction",
          params: [txHex]
      });
      let txHash;
      try {
          let responseSend = await axios.post(url, sendRawTxAPI, { headers });
          txHash = responseSend.data.result;
      } catch (error) {
        throw createCustomError(error.message,"There was a problem sending raw transaction through blockchain.")
      }
      // Stampa l'hash della transazione
      return txHash;
  } catch (error) {
    throw error
  }
}

//Funzione per ricevere gli UTXOS BTC dato un address passato come parametro
const getUtxos = async (address) => {
    const data = JSON.stringify({
        method: "bb_getutxos",
        params: [address]
      });
      
      let response= await axios.post(url, data, { headers })
      let utxos=response.data.result
      return utxos
};

//Funzione per ricevere il quantitativo di BTC dato un address passato come parametro
async function getBalance(address,network) {  
    try{
        let {url}= setUrlAndNetworkForAPI(network)
console.log("url", url)
        const data = JSON.stringify({
            method: "bb_getaddress",
            params: [address]
        });
console.log("data", data)

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
        return {balance,unlockedBalance};
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting balances.")
    }
}


async function getLatestBlock(network){
    try{
        let {url}= setUrlAndNetworkForAPI(network)
        console.log("url", url)
        const data = JSON.stringify({
        method: "getblockchaininfo"
        });
        let response= await axios.post(url, data, { headers })
        console.log("response", response)

        let latestblock= response.data.result.blocks
        return latestblock
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting latest block.")
    }
}

async function getRawTransaction (txid,url){
    try{
        const data = JSON.stringify({
            method: "getrawtransaction",
            params: [
                txid,
                2
            ]
        });
        
        let response= await axios.post(url, data, { headers })
        let rawTx= response.data.result
        return rawTx
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting raw transaction.")
    }
};

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

async function getTransactionIdsByAddress(address,url){
    try{
        const data = JSON.stringify({
            method: "bb_getaddress",
            params: [
            address,
            {
                "details": "txids"
            }
            ] 
        });
        
        let response= await axios.post(url, data, { headers })
        let txids= response.data.result.txids
        return txids
    }
    catch(error){
        throw createCustomError(error.message,"There was a problem getting TxID by address.")
    }
}



async function getLatestTransactionsAll (address,network){
    try {
    let {url}= setUrlAndNetworkForAPI(network)
    let txids= await getTransactionIdsByAddress(address,url)
    if(!txids) return
    let txs= []
    for (const txid of txids) {
        try {
        let rawTx = await getRawTransaction(txid, url);
        let from_address,to_address,amount=0,date,block_number,timestamp,vinArray,voutArray,possibleSenders
        console.log(rawTx);
        timestamp = rawTx.blocktime;
        date = new Date(timestamp * 1000);
        block_number= await getBlockHeightByHash(rawTx.blockhash,url)
        console.log(block_number)

        vinArray=rawTx.vin
        voutArray=rawTx.vout

        possibleSenders = []

        /*
        For per calcolare i possibili Mittenti.
        In una tx Bitcoin possono essere molteplici gli indirizzi che partecipano ad una transazione,
        quindi si stila un array dei possibili mittenti al quale successivamente si andranno ad effettuare
        altri controlli per verificare se l'indirizzo può essere il vero mittente.
        */
        for (const vin of vinArray) {
            console.log("CONTROLLO VIN PRECEDENTE")
            let previousOutput=await getRawTransaction(vin.txid, url);
            let previousVinArray= previousOutput.vin
            let addressInCurrentVin= vin.prevout.scriptPubKey.address
            let addressInPreviousVin
            for (const vin of previousVinArray) {
                addressInPreviousVin= vin.prevout.scriptPubKey.address
            }
            if(addressInCurrentVin===addressInPreviousVin)
            possibleSenders.push(addressInCurrentVin)
        }

        /*
        For per calcolare i possibili Destinatari.
        In una tx Bitcoin possono essere molteplici gli indirizzi che partecipano ad una transazione,
        quindi si stila un array dei possibili mittenti al quale successivamente si andranno ad effettuare
        altri controlli per verificare se l'indirizzo può essere il vero mittente.
        */
        possibleDestinations = []
        for (const vout of voutArray) {
            possibleDestinations.push(vout.scriptPubKey.address)
        }
        console.log("POSSIBLE SENDERS")
        console.log(possibleSenders)

        console.log(rawTx.vout)
        
        /*
        For per calcolare l'indirizzo mittente
        andando a iterare sui possibili Mittenti calcolati precedentemente
        */

        if (possibleSenders.length>0){
            for (const possibleSender of possibleSenders) {
                if(address===possibleSender){
                    from_address=possibleSender
                }
            }
        }


        /*
        For per calcolare l'amount
        andando a iterare sugli UTXOs della transazione corrente
        */
        for (const vout of voutArray) {
            if(vout.scriptPubKey.address!==from_address){
                amount=amount + vout.value
            }
        }

        /*
        For per calcolare l'indirizzo di destinazione
        andando a iterare sui possibili destinatari calcolati precedentemente
        */
        for (const address of possibleDestinations) {
            if(address!==from_address){
                to_address=address
            }
        }
        
        const txObject = {
            type: "COIN",
            chain: "BTC",
            token: "BTC",
            from_address: from_address,
            destination_address: to_address,
            amount: amount,
            tx: txid,
            data_insert: date,
            block_number: block_number,
          };
          console.log(txObject)
        txs.push(txObject);
        } catch (error) {
            console.log(`Error processing transaction ${txid}:`, error);
            continue
        }
        }
    }catch(error){
        throw createCustomError(error.message,"An error occurred while fetching transactions.")
    }
  };

module.exports={
    getUtxos,
    getBalance,
    getLatestBlock,
    signAndSendTransaction,
    transactionUtils,
    createAddress,
    getLatestTransactionsAll,
    getRawTransaction,
    signAndSendTransactionByUser
}