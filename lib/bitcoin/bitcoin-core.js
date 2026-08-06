
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
module.exports = {
 
   getBalance  

   
  };