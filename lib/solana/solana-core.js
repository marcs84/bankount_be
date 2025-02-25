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

function setWeb3Instance(network) {
  let web3;

  if (network === "TESTNET") {
      web3 = web3Testnet();
  } else {
      web3 = web3Mainet();
  }

  return web3;
}

//Funzione per ricevere il quantitativo di BTC dato un address passato come parametro
async function getBalance({publicKey, network, connection}) {
  try{
    let balance = 0;

    // Se la connessione non è fornita, allora la impostiamo
    if (!connection) {
      connection = setWeb3Instance(network);
    }
    
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
function createAddress(child) {
  try{
    const privateKey=child.privateKey.toString("hex");
    const buffer = Buffer.from(privateKey, 'hex');
    const uint8SecretKey = new Uint8Array(buffer);
    const KeypairAccount = solanaWeb3.Keypair.fromSeed(uint8SecretKey)
    let address = KeypairAccount.publicKey.toString()
    //let privateKeySol = bs58.encode(KeypairAccount.secretKey)
    return { address, privateKey }
  } 
  catch(error){
    throw createCustomError(error.message,"There was a problem on the creation of a SOL address.")
  }
}

// Funzione per firmare e inviare una transazione
async function signAndSendTransaction(fromAddress, toAddress, amount, keypairFrom, network) {

  let connection,fromPubkey,toPubkey;
  connection= setWeb3Instance(network)

  fromPubkey = new solanaWeb3.PublicKey(fromAddress);
  console.log(fromPubkey)
  try{
    toPubkey = new solanaWeb3.PublicKey(toAddress);
    console.log(toPubkey)
  }
  catch(error){
    throw new Error('The destination address entered is invalid.');
  }

  const amountInLamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
  const balanceInLamports = await getBalance({publicKey:keypairFrom.publicKey, connection:connection}) * solanaWeb3.LAMPORTS_PER_SOL

  console.log(amountInLamports)
  console.log(balanceInLamports)

  if (balanceInLamports < amountInLamports) {
    throw new Error('The available balance is less than the transaction amount.');
  }

  
  // Crea un'istruzione per trasferire SOL usando l'ogetto SystemProgram
  const transferInstruction = solanaWeb3.SystemProgram.transfer({
    fromPubkey: fromPubkey,
    toPubkey: toPubkey,
    lamports: amountInLamports,
  });

  //Aggiungi all'oggetto Transaction di solanaWeb3 l'ogetto di trasferimento scritto prima
  const transaction = new solanaWeb3.Transaction().add(transferInstruction);
  console.log(transaction)
  // Firma la transazione con il KeyPair del mittente
  try {
  var signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypairFrom]
  );
  console.log("SIGNATURE", signature);
  console.log("SUCCESS");
  }
  catch(error){
    throw createCustomError(error.message,"There was a problem sending the transaction.")
  }
  return signature;
}

const getLatestTransactions = async (address,network) => {
  try{
  let connection
  connection =setWeb3Instance(network)
  
  const publicKey = new solanaWeb3.PublicKey(
    address
  );

  confirmedTx = await connection.getSignaturesForAddress(publicKey);
  
  // Itera sulle transazioni confermate e aggiungi gli oggetti a txs
  let txs = [];
  for (const tx of confirmedTx) {
    const txData = await connection.getConfirmedTransaction(tx.signature);
    const from_address = txData.transaction._message.accountKeys[0].toBase58();
    const to_address = txData.transaction._message.accountKeys[1].toBase58();
    const amount = (txData.meta.preBalances[0] - txData.meta.postBalances[0] - txData.meta.fee) / solanaWeb3.LAMPORTS_PER_SOL;
    const timestamp = txData.blockTime;
    const date = new Date(timestamp * 1000);

    const blockNumber= txData.slot
    if(blockNumber==="0" || blockNumber===0){
      console.log(txData)
      console.log("\n\n"+blockNumber)
      return
    }
    const txObject = {
      type: "COIN",
      chain: "SOL",
      token: "SOL",
      from_address: from_address,
      destination_address: to_address,
      amount: amount,
      tx: tx.signature,
      data_insert: date,
      block_number: blockNumber,
    };
    txs.push(txObject);
  }
  return txs;

  } catch (error) {
    throw new Error(error)
  }
}


const getLatestTransactionsAll = async (endBlock, network) => {
  let connection;
  connection =setWeb3Instance(network)

  const startBlock = await connection.getSlot();
  console.log('Numero dell\'ultimo blocco:', startBlock);

  console.log("ENDBLOCK"+endBlock)
  let txs = []
  for (let i = startBlock; i >= parseInt(endBlock); i--) {
    
    try {
      const block = await connection.getBlock(i, {commitment:"finalized"})
      const timestamp = block.blockTime;
      const date = new Date(timestamp * 1000);

      block.transactions.forEach(async (blockDetails) => {
        let sender=blockDetails.transaction.message.accountKeys[0]
        let destination=blockDetails.transaction.message.accountKeys[1]
        let txHash=blockDetails.transaction.signatures[0]

        console.log("Trovato alla transazione: "+ blockDetails.transaction.signatures[0])
        console.log("prebalance[0]: "+block.transactions[0].meta.preBalances[0])
        console.log("postbalance[0]: "+block.transactions[0].meta.postBalances[0])
        console.log("FEE: "+block.transactions[0].meta.fee)

        let amount=(blockDetails.meta.preBalances[0]-blockDetails.meta.postBalances[0]-blockDetails.meta.fee)/ solanaWeb3.LAMPORTS_PER_SOL
        console.log("Sono stati inviati "+amount+" SOL all'indirizzo "+ blockDetails.transaction.message.accountKeys[1])
        
        let tx={
            type:"COIN",
            chain:"SOL",
            token:"SOL",
            from_address: sender.toString(),
            destination_address: destination.toString(),
            amount:amount,
            tx: txHash,
            data_insert: date,
            block_number: i
        }
        txs.push(tx)
      })
    } catch (error) {
      continue
    }
  }
  return txs
}

const getLatestBlock = async (network) => {
  try {
    let startBlock,connection
    connection= setWeb3Instance(network)
    startBlock=await connection.getSlot({
        commitment:"confirmed"
      })
    return startBlock
  } catch (error) {
    throw createCustomError(error.message,"Solana - Errore nel recuperare l'ultimo blocco.")
  }
};


module.exports = { 
  createAddress, 
  signAndSendTransaction, 
  getBalance, 
  getLatestTransactions,
  getLatestTransactionsAll,
  getLatestBlock,
  setWeb3Instance
};