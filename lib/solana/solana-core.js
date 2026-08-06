const { solanaWeb3, createCustomError } = require('../../src/utils');


// Reti utilizzate
const web3Testnet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new solanaWeb3.Connection(process.env.QUICKNODE_SOL_TEST_URL);
  } else {
    return new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('testnet'),'confirmed');
  }
}

const web3Mainet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new solanaWeb3.Connection(process.env.QUICKNODE_SOL_MAIN_URL);
  } else {
    return new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'),'confirmed')
  }
}
//Funzione per ricevere il quantitativo di BTC dato un address passato come parametro
async function getBalance({publicKey, network, url}) {
  try{
    let balance = 0;

    // Se la connessione non è fornita, allora la impostiamo
    // if (!connection) {
    //   connection = setWeb3Instance(network);
    // }
    const connection = new solanaWeb3.Connection(url)
    // Verifica se l'indirizzo è valido
    if (!solanaWeb3.PublicKey.isOnCurve(publicKey)) {
      throw new Error('Invalid Solana address');
    }

    balance = await connection.getBalance(publicKey);
    return balance / solanaWeb3.LAMPORTS_PER_SOL;
  } 
  catch(error){
    throw createCustomError(error.message,"There was a problem getting balances.")
  }
}

// Funzione per creare un nuovo indirizzo
// Funzione per firmare e inviare una transazione
module.exports = { 
 
  getBalance 

  
};