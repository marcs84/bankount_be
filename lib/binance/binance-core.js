const { Web3, createCustomError } = require("../../src/utils");

// Seleziona la rete di test (sostituisci con l'URL del nodo ETH)
const web3Mainet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_BNB_MAIN_URL
    );
  } else {
    return new Web3(
      "https://bsc-dataseed.binance.org"
    );
  }
};

const web3Testnet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_BNB_TEST_URL
    );
  } else {
    return new Web3(
      "https://data-seed-prebsc-1-s1.binance.org:8545"
    );
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
async function getBalance({ address, network, web3 }) {
  let balance = 0;

  // Se la connessione non è fornita, allora la impostiamo
  if (!web3) {
    web3 = setWeb3Instance(network);
  }
  console.log('address in binance-core file', address)
  // Verifica se l'indirizzo è valido
  if (!web3.utils.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  balance = await web3.eth.getBalance(address);
  return parseFloat(web3.utils.fromWei(balance, "ether"));
}

// Funzione per creare un nuovo indirizzo
function createAddress(child, network) {
  try{
    if (network === "TESTNET") {
      const address = web3Testnet().eth.accounts.privateKeyToAccount(
        child.privateKey.toString("hex")
      ).address;
      return address;
    } else {
      const address = web3Mainet().eth.accounts.privateKeyToAccount(
        child.privateKey.toString("hex")
      ).address;

      return address;
    }
  }
  catch(error){
    throw createCustomError(error.message,"There was a problem on the creation of a BNB address.")
  }
}

async function signAndSendTransaction(
  fromAddress,
  toAddress,
  amount,
  privateKey,
  network
) {
  let web3, gasPrice, gasLimit;

  web3= setWeb3Instance(network)

  if ( !web3.utils.isAddress(toAddress)) {
    throw new Error("The destination address entered is invalid.");
  }

  const amountInWei = web3.utils.toWei(amount.toString(), "ether");
 
  const balance = await getBalance({address:fromAddress,web3:web3});
  const balanceInWei= web3.utils.toWei(balance.toString(), "ether");

  const txCount = await web3.eth.getTransactionCount(fromAddress);
  if (parseFloat(balanceInWei) < parseFloat(amountInWei)) {
    throw new Error("The available balance is less than the transaction amount.");
  }

  try {
    gasPrice = await web3.eth.getGasPrice();
    gasLimit = 21000;
  } catch (error) {
    throw createCustomError(error.message, "Error fetching gas price and gas limit.")
  }

  const tx = {
    from: fromAddress,
    to: toAddress,
    value: amountInWei,
    gas: gasLimit,
    gasPrice: gasPrice,
    nonce: txCount,
  };

  let signedTx;
  try {
    signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  } catch (error) {
    console.log(error)
    throw createCustomError(error.message,"There was a problem signing the transaction.")
  }

  let txHash;
  try {
    txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } catch (error) {
    throw createCustomError(error.message,"There was a problem sending the signed transaction.")
  }
  return txHash;
}

async function signAndSendTransactionByUser(
  fromAddress,
  toAddress,
  amount,
  privateKey,
  network
) {
  let web3, gasPrice, gasLimit;

  web3= setWeb3Instance(network)

  if ( !web3.utils.isAddress(toAddress)) {
    throw new Error("The destination address entered is invalid.");
  }

  const amountInWei = web3.utils.toWei(amount.toString(), "ether");
 
  const balance = await getBalance({address:fromAddress,web3:web3});
  const balanceInWei= web3.utils.toWei(balance.toString(), "ether");

  const txCount = await web3.eth.getTransactionCount(fromAddress);
  if (parseFloat(balanceInWei) < parseFloat(amountInWei)) {
    throw new Error("The available balance is less than the transaction amount.");
  }

  try {
    gasPrice = await web3.eth.getGasPrice();
    gasLimit = 21000;
  } catch (error) {
    throw createCustomError(error.message, "Error fetching gas price and gas limit.")
  }

  const tx = {
    from: fromAddress,
    to: toAddress,
    value: amountInWei,
    gas: gasLimit,
    gasPrice: gasPrice,
    nonce: txCount,
  };

  let signedTx;
  try {
    signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  } catch (error) {
    console.log(error)
    throw createCustomError(error.message,"There was a problem signing the transaction.")
  }

  let txHash;
  try {
    txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } catch (error) {
    throw createCustomError(error.message,"There was a problem sending the signed transaction.")
  }
  return txHash;
}


const getLatestTransactions = async (endBlock, address) => {
  const web3= setWeb3Instance(process.env.NETWORK_TYPE)
  const startBlock = await web3.eth.getBlockNumber()
  console.log("SONO IN")
  console.log(startBlock)
  console.log(endBlock)
  let txs = []
  
  for (let i = startBlock; i >= endBlock && i > 0; i--) {
      const block = await web3.eth.getBlock(i);
      block.transactions.forEach(async (tx) => {
          const txData = await web3.eth.getTransaction(tx)
          const txReceipt = await web3.eth.getTransactionReceipt(tx);
          if (
            txData.to === address || // Verifica se l'indirizzo target è l'output (destinatario)
            (txData.input.includes(address) && txData.from === address) || // Verifica se l'indirizzo target è sia l'input (mittente) che l'output (destinatario)
            txData.from === address
          ) {
            console.log("Trovata")
            let tx={
              type:"COIN",
              chain:"ETH",
              token:"ETH",
              from_address: txData.from,
              destination_address: txData.to,
              amount:web3.utils.fromWei(txData.value, 'ether'),
              tx: txData.hash
          }
            txs.push(tx);
          }
        else{
          txReceipt.logs.forEach((log) => {
          if (log.topics[0] === web3.utils.sha3('Transfer(address,address,uint256)')) {
            const from = '0x' + log.topics[1].slice(26);
            const to = '0x' + log.topics[2].slice(26);
            const value = web3.utils.fromWei(log.data, 'ether');

            if (from === address || to === address) {
              let tx = {
                type: "TOKEN",
                chain: "ETH",
                token: "ERC20",
                from_address: from,
                destination_address: to,
                amount: value,
                tx: txData.hash
              };
              txs.push(tx);
          }
          }})
        }
      })
  }
  return txs
}

const getLatestTransactionsAll = async (startBlock, endBlock, network) => {
  let web3;
  web3 = setWeb3Instance(network);
  console.log("SONO IN");
  console.log(startBlock);
  console.log(endBlock);
  let txs = [];

  for (let i = startBlock; i >= endBlock && i > 0; i--) {
    const block = await web3.eth.getBlock(i);
    const timestamp = block.timestamp;
    const date = new Date(timestamp * 1000);
    
    for (const tx of block.transactions) {
      const txData = await web3.eth.getTransaction(tx);
      if (txData.value !== "0") {
        const txRaw = {
          type: "COIN",
          chain: "BNB",
          token: "BNB",
          from_address: txData.from,
          destination_address: txData.to,
          amount: web3.utils.fromWei(txData.value, 'ether'),
          tx: txData.hash,
          data_insert: date,
          block_number: i
        };
        txs.push(txRaw);
      } else {
        const txReceipt = await web3.eth.getTransactionReceipt(tx);
        for (const log of txReceipt.logs) {
          if (log.topics[0] === web3.utils.sha3('Transfer(address,address,uint256)')) {
            const from = '0x' + log.topics[1].slice(26);
            const to = '0x' + log.topics[2].slice(26);
            const value = web3.utils.fromWei(log.data, 'ether');
            const txRaw = {
              type: "TOKEN",
              chain: "BNB",
              token: "BEP20",
              from_address: from,
              destination_address: to,
              amount: value,
              tx: txData.hash,
              data_insert: date,
              block_number: i
            };
            txs.push(txRaw);
          }
        }
      }
    }
  }
  return txs;
}

const getLatestBlock = async (network) => {
  try {
    let startBlock, web3;
    web3 = setWeb3Instance(network);
    startBlock = await web3.eth.getBlockNumber();
    return startBlock;
  } catch (error) {
    throw createCustomError(error.message,"Binance - Errore nel recuperare l'ultimo blocco.")
  }
};

module.exports = {
  getBalance,
  getLatestTransactionsAll,
  createAddress,
  signAndSendTransaction,
  getLatestTransactions,
  getLatestBlock,
  signAndSendTransactionByUser
};
