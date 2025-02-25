const { Web3, createCustomError } = require("../../src/utils");

// Seleziona la rete di test (sostituisci con l'URL del nodo ETH)
const web3Mainet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_ETH_MAIN_URL
    );
  } else {
    return new Web3(
      "https://mainnet.infura.io/v3/7c4cec27d7954603b6833e7e585d1565"
    );
  }
};

const web3Testnet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_ETH_TEST_URL
    );
  } else {
    return new Web3(
      "https://goerli.infura.io/v3/7c4cec27d7954603b6833e7e585d1565"
    );
  }
}; //https://sepolia.infura.io/v3/1e6776f8aada4498b94a426cd572f3db

const {getContractData} = require("../../src/contractsCreation/utils/contract-utils");
const {SetAtmosRouterContract} = require("../../src/contractsCreation/erc20/SetAtmosRouter");

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
  console.log("web3", web3)
  if (!web3) {
    web3 = setWeb3Instance(network);
  }
  // Verifica se l'indirizzo è valido
  console.log("web3.utils.isAddress(address)........", web3.utils.isAddress(address))

  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }

  balance = await web3.eth.getBalance(address);
  console.log("web3 balance", balance)
  
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
    throw createCustomError(error.message,"There was a problem on the creation of a ETH address.")
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

  if (!web3.utils.isAddress(toAddress)) {
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

async function transactionUtils(
  fromAddress,
  toAddress,
  amount,
  network
) {
  let web3, gasPrice, gasLimit;

  web3= setWeb3Instance(network)

  if (!web3.utils.isAddress(toAddress)) {
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

  const latest_block = getLatestBlock(network)

  return {
    latest_block,
    balance, 
    converted_balance: balanceInWei,
    amount,
    converted_amount: amountInWei,
    tx_count: txCount,
    gas_price: gasPrice,
    gas_limit: gasLimit
  }
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

  if (!web3.utils.isAddress(toAddress)) {
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

async function takeERC20Token(coinName, fromAddress, tokenAmount, privateKey) {
  try {
    await getBalance(fromAddress, "TESTNET");
    const { address, abi, decimals } = getContractData(coinName);

    const ethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const amountInWei = web3Testnet.utils.toWei(
      tokenAmount.toString(),
      "ether"
    );
    const router = SetAtmosRouterContract(web3Testnet);
    // Estimate amount out
    const amountsOut = await router.methods
      .getAmountsOut(amountInWei, [ethAddress, address])
      .call();
    console.log(amountsOut);
    const amountOutMin = amountsOut[1]; // This is an estimate. Your actual result may be different.
    const account = web3Testnet.eth.accounts.privateKeyToAccount(privateKey);
    web3Testnet.eth.accounts.wallet.add(account);

    const txObject = {
      from: fromAddress,
      to: router.options.address, // The address of the Uniswap Router contract
      gasLimit: web3Testnet.utils.toHex(1000000), // Arbitrary gas limit, should be adjusted accordingly
      gasPrice: web3Testnet.utils.toHex(web3Testnet.utils.toWei("10", "gwei")),
      data: router.methods
        .swapExactETHForTokens(
          amountOutMin,
          [ethAddress, address],
          fromAddress,
          deadline
        )
        .encodeABI(),
      value: web3Testnet.utils.toHex(amountInWei),
    };

    console.log("\nTX OBJ:\n");
    console.log(txObject);
    // Sign the transaction
    const signedTx = await web3Testnet.eth.accounts.signTransaction(
      txObject,
      privateKey
    );

    console.log("\n SIGNED TX :\n");
    console.log(signedTx);
    // Send the transaction
    const tx = await web3Testnet.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log("\n TX :\n");
    console.log(tx);
    return tx;
  } catch (error) {
    console.error("An error occurred while executing the transaction:", error);
    throw error;
  }
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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = startBlock; i >= endBlock && i > 0; i--) {
    const block = await web3.eth.getBlock(i);
    const timestamp = block.timestamp;
    const date = new Date(timestamp * 1000);
    
    for (const tx of block.transactions) {
      const txData = await web3.eth.getTransaction(tx);
      if (txData.value !== "0") {
        const txRaw = {
          type: "COIN",
          chain: "ETH",
          token: "ETH",
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
              chain: "ETH",
              token: "ERC20",
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
    let startBlock,web3
    web3= setWeb3Instance(network)
    startBlock=await web3.eth.getBlockNumber()  
    return startBlock
  } catch (error) {
    console.log("error", error)
    throw createCustomError(error.message,"Ethereum - Errore nel recuperare l'ultimo blocco.")
  }
};

module.exports = {
  takeERC20Token,
  getBalance,
  createAddress,
  signAndSendTransaction,
  getLatestTransactions,
  getLatestTransactionsAll,
  getLatestBlock,
  signAndSendTransactionByUser
};
