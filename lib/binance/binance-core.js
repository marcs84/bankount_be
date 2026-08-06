const { Web3, createCustomError } = require("../../src/utils");

// Seleziona la rete di test (sostituisci con l'URL del nodo ETH)
const web3Mainet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(process.env.QUICKNODE_BNB_MAIN_URL);
  } else {
    return new Web3("https://bsc-dataseed.binance.org");
  }
};

const web3Testnet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(process.env.QUICKNODE_BNB_TEST_URL);
  } else {
    return new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");
  }
};

function setWeb3Instance(network) {
  let web3;

  if (network === "TESTNET") {
    web3 = web3Testnet();
  } else {
    web3 = web3Mainet();
  }

  return web3;
}

//Funzione per ricevere il quantitativo di ETH dato un address passato come parametro
async function getBalance({ address, network, url }) {
  let balance = 0;

  // Se la connessione non è fornita, allora la impostiamo
  // if (!web3) {
  //   web3 = setWeb3Instance(network);
  // }
  const web3 = new Web3(url)
  console.log("address in binance-core file", address);
  // Verifica se l'indirizzo è valido
  if (!web3.utils.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  balance = await web3.eth.getBalance(address);
  return parseFloat(web3.utils.fromWei(balance, "ether"));
}

// Funzione per creare un nuovo indirizzo
async function transactionUtils(fromAddress, toAddress, amount, network) {
  let web3, gasPrice, gasLimit;

  web3 = setWeb3Instance(network);

  if (!web3.utils.isAddress(toAddress)) {
    throw new Error("The destination address entered is invalid.");
  }

  const amountInWei = web3.utils.toWei(amount.toString(), "ether");

  const balance = await getBalance({ address: fromAddress, web3: web3 });
  const balanceInWei = web3.utils.toWei(balance.toString(), "ether");

  const txCount = await web3.eth.getTransactionCount(fromAddress);
  if (parseFloat(balanceInWei) < parseFloat(amountInWei)) {
    throw new Error("The available balance is less than the transaction amount.");
  }

  try {
    gasPrice = await web3.eth.getGasPrice();
    gasLimit = 21000;
  } catch (error) {
    throw createCustomError(error.message, "Error fetching gas price and gas limit.");
  }
  const latest_block = await getLatestBlock(network);
  const chainId = await web3.bnb.getChainId();

  return {
    latest_block,
    balance,
    converted_balance: balanceInWei,
    amount,
    converted_amount: amountInWei,
    tx_count: txCount,
    fee: null,
    chain_id: chainId,
    gas_price: gasPrice,
    gas_limit: gasLimit,
  };
}
const getLatestBlock = async (network) => {
  try {
    let startBlock, web3;
    web3 = setWeb3Instance(network);
    startBlock = await web3.eth.getBlockNumber();
    return startBlock;
  } catch (error) {
    throw createCustomError(error.message, "Binance - Errore nel recuperare l'ultimo blocco.");
  }
};

module.exports = {
  getBalance,

  transactionUtils,

  getLatestBlock,

};
