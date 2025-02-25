
const { bitcoin, ECPair, bitcore } = require("../../src/utils");
const axios = require('axios');

const SATOSHIS_PER_BTC = 100000000;

//Funzione per ricevere il quantitativo di BTC dato un address passato come parametro
async function getBalance(address, network) {
  let url;

  if (network == "TESTNET") {
    url = `https://api.bitcore.io/api/BTC/testnet/address/${address}/balance`;
  } else {
    url = `https://api.bitcore.io/api/BTC/testnet/address/${address}/balance`;
  }

  const response = await axios.get(url);
  const balance = response.data.balance / 100000000;
  console.log(`Il balance dell'account ${address} è di ${balance} BTC`);
  return balance;
}

// Funzione per creare un nuovo indirizzo Bitcoin passando il child del Masternode riferito alla blockchain Bitcoin
// Function to create a new Bitcoin address by passing the child of the Masternode referred to the Bitcoin blockchain
function createAddress(child, network) {
  const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey, 'hex'));
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: network
  });

  return { address, keyPair };
}

async function signAndSendTransaction(address, toAddress, amount, addressPrivateKey) {

  // to take the network type as input for utxos. 
  try {
    console.log("CHIAVE PRIVATA: " + addressPrivateKey)
    const addressBalance = await getBalance(address);
    const toAddressBalance = await getBalance(toAddress);

    const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC)
    const addressBalanceInSatoshi = addressBalance * SATOSHIS_PER_BTC
    console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis)

    const toAddressBalanceInSatoshi = toAddressBalance * SATOSHIS_PER_BTC

    console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi)

    console.log("BALANCE TO-ADDRESS \n" + toAddressBalanceInSatoshi)
    if (addressBalanceInSatoshi < amountInSatoshis) {
      console.log(`Non puoi inviare ${amount} BTC dall'indirizzo ${address} perché il saldo disponibile è inferiore all'ammontare della transazione.`);
      return;
    }

    const utxos = (await axios.get(`https://api.bitcore.io/api/BTC/testnet/address/${address}/?unspent=true`)).data;

    if (utxos.length === 0) {
      console.log(`Non ci sono output non spesi disponibili per l'indirizzo ${address}.`);
      return;
    }

    const unspentOutputs = utxos.map(utxo => new bitcore.Transaction.UnspentOutput({
      "txId": utxo.mintTxid,
      "outputIndex": utxo.mintIndex,
      "address": utxo.address,
      "script": utxo.script,
      "satoshis": utxo.value
    }));

    let tx = new bitcore.Transaction();
    console.log("\n --------Unspent Outputs-------- \n");
    console.log(unspentOutputs);
    tx.from(unspentOutputs);
    tx.to(toAddress, amountInSatoshis);
    tx.change(address);

    console.log(tx)
    // Chiave privata dell'indirizzo pubblico specificato che sta inviando BTC
    tx.sign(addressPrivateKey);

    console.log("\n --------TX OBJECT-------- \n");
    console.log(tx.toObject());

    const serializedTX = tx.serialize();
    console.log(serializedTX);
    console.log("QUI")
    const txid = (await axios.post(`https://api.bitcore.io/api/BTC/testnet/tx/send`, { rawTx: serializedTX })).data;
    console.log(txid);
    return txid
  } catch (error) {
    console.error(`Si è verificato un errore durante l'invio della transazione: ${error.message}`);
  }
}

async function signAndSendTransactionByUser(address, toAddress, amount, signedTx) {
  console.log("signTax===>", signedTx)
  try {
    console.log("CHIAVE PRIVATA: " + addressPrivateKey)
    const addressBalance = await getBalance(address);
    const toAddressBalance = await getBalance(toAddress);

    const amountInSatoshis = Math.round(amount * SATOSHIS_PER_BTC)
    const addressBalanceInSatoshi = addressBalance * SATOSHIS_PER_BTC
    console.log("AMOUNT IN SATOSHI \n" + amountInSatoshis)

    const toAddressBalanceInSatoshi = toAddressBalance * SATOSHIS_PER_BTC

    console.log("BALANCE ADDRESS \n" + addressBalanceInSatoshi)

    console.log("BALANCE TO-ADDRESS \n" + toAddressBalanceInSatoshi)
    if (addressBalanceInSatoshi < amountInSatoshis) {
      console.log(`Non puoi inviare ${amount} BTC dall'indirizzo ${address} perché il saldo disponibile è inferiore all'ammontare della transazione.`);
      return;
    }

    const utxos = (await axios.get(`https://api.bitcore.io/api/BTC/testnet/address/${address}/?unspent=true`)).data;

    if (utxos.length === 0) {
      console.log(`Non ci sono output non spesi disponibili per l'indirizzo ${address}.`);
      return;
    }

    const unspentOutputs = utxos.map(utxo => new bitcore.Transaction.UnspentOutput({
      "txId": utxo.mintTxid,
      "outputIndex": utxo.mintIndex,
      "address": utxo.address,
      "script": utxo.script,
      "satoshis": utxo.value
    }));

    let tx = new bitcore.Transaction();
    console.log("\n --------Unspent Outputs-------- \n");
    console.log(unspentOutputs);
    tx.from(unspentOutputs);
    tx.to(toAddress, amountInSatoshis);
    tx.change(address);

    console.log(tx)
    // Chiave privata dell'indirizzo pubblico specificato che sta inviando BTC
    tx.sign(addressPrivateKey);

    console.log("\n --------TX OBJECT-------- \n");
    console.log(tx.toObject());

    const serializedTX = tx.serialize();
    console.log(serializedTX);
    console.log("QUI")
    const txid = (await axios.post(`https://api.bitcore.io/api/BTC/testnet/tx/send`, { rawTx: serializedTX })).data;
    console.log(txid);
    return txid
  } catch (error) {
    console.error(`Si è verificato un errore durante l'invio della transazione: ${error.message}`);
  }
}

async function getLatestBlock(network) {
  try {
    let response
    if(network=="TESTNET"){
       response = await axios.get('https://api.blockcypher.com/v1/btc/test3');
    }
    else{
      response = await axios.get('https://api.blockcypher.com/v1/btc/main');
    }
    return response.data.height;
  } catch (error) {
    console.error(`Bitcoin - Errore nel recuperare l'ultimo blocco: ${error}`);
  }
}

const getLatestTransactionsAll = () => {
   //In futuro è possibile implementare con provider free ma con limitazioni forti
};




module.exports = {
   createAddress, 
   signAndSendTransaction, 
   getBalance , 
   getLatestBlock, 
   getLatestTransactionsAll,
   signAndSendTransactionByUser
  };