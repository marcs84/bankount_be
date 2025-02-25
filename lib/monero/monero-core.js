const { monerojs, MoneroNetworkType,createCustomError } = require('../../src/utils');
const ATOMICUNIT_PER_XMR = 1000000000000
const dao =require("../../src/dao");
const { mn_encode } = require('./mnemonic');


async function openWallet(password, id, index, network) {
  try {
    let wallet

    if (network == "TESTNET") {
      wallet = await monerojs.openWalletFull({
        networkType: MoneroNetworkType.TESTNET,
        password: password,
        serverUri: "http://127.0.0.1:28081",
        path: `./lib/monero/wallets/testnet/MoneroWallet${id}_${index}`
      });
    } else {
      wallet = await monerojs.openWalletFull({
        networkType: MoneroNetworkType.MAINNET,
        password: password,
        serverUri: "http://127.0.0.1:28081",
        path: `./lib/monero/wallets/mainnet/MoneroWallet${id}_${index}`
      });
    }
    
    console.log(`Pubk address: ${await wallet.getPrimaryAddress()}`);
    return wallet
  } catch (error) {
    throw createCustomError(error.message,`Unable to open Monero wallet.`)
  }
}

async function createWalletFull(password, mnemonic, id, index, network) {
  try {
    let wallet, daemon

    daemon = await monerojs.connectToDaemonRpc("http://127.0.0.1:28081")
    let isConnected= await daemon.isConnected()

    if(isConnected) {
      if (network == "TESTNET") {
        // Creazione di un portafoglio completo con una frase mnemonica e connessione a un nodo locale
        wallet = await monerojs.createWalletFull({
          networkType: MoneroNetworkType.TESTNET,
          password: password,
          mnemonic: mnemonic,
          serverUri: "http://127.0.0.1:28081",
          path: `./lib/monero/wallets/testnet/MoneroWallet${id}_${index}`
        });
        await wallet.save()
      } else {
        wallet = await monerojs.createWalletFull({
          networkType: MoneroNetworkType.MAINNET,
          password: password,
          mnemonic: mnemonic,
          serverUri: "http://127.0.0.1:28081",
          path: `./lib/monero/wallets/mainnet/MoneroWallet${id}_${index}`
        });
        await wallet.save()
      }
    return wallet
    } else{
      throw createCustomError(error.message,`Unable to connect to the deamon.`)
  }
    
  } catch (error) {
    throw createCustomError(error.message,"There was a problem on the creation of a XMR address.")
  }
}

async function syncWallet(wallet,height) {
  try {
    
    let amt = -1 + "%";
    await wallet.sync(new class extends monerojs.MoneroWalletListener {
      async onSyncProgress(height, startHeight, endHeight, percentDone, message) {
        let progress = Math.round(parseFloat(percentDone.toString()) * 100) + '%';
        if (progress !== amt) {
          amt = progress;
            console.log("Synchronizing", {
            start: startHeight,
            height: height,
            end: endHeight,
            progress: amt
          });
        }
  
      };
    }, height);

    await wallet.save();
    console.log("\nWallet synchronized height: ", await wallet.getHeight());

    await wallet.startSyncing(1000);
    console.log("Wallet synchronizing: every second");
  
    await wallet.addListener(new class extends monerojs.MoneroWalletListener {
      async onOutputReceived(output) {
        console.log('Transaction-in: ', await output.getAmount());
      }
      async onOutputSpent(output) {
        console.log('Transaction-out: ', await output.getAmount());
      }
      async onBalancesChanged(newBalance, newUnlockedBalance) {
        console.log('Balance changed: ', await newBalance.toString(), await newUnlockedBalance.toString());
      }
    });
    if (!(await wallet.isSynced())) {
      throw createCustomError(error.message,"Wallet synchronization error")
    }
    else return true
  } catch (error) {
    throw createCustomError(error.message,"Wallet synchronization error")
  }
}

async function prepareWallet(id_utente, index, network) {
  const wallet = await openWallet(process.env.XMR_SECRET, id_utente, index, network);
  await handleSync(wallet)
  return wallet;
}

async function handleSync(wallet){
  try {
    let moneroAddress= await wallet.getPrimaryAddress()
    let moneroFirstBlock = (await dao.getAddressByAddress(moneroAddress)).start_block
    let moneroHeight= await wallet.getHeight()
    
    if (moneroFirstBlock > moneroHeight) {
      await syncWallet(wallet, moneroFirstBlock)
    } else {    
      await syncWallet(wallet)
    }
  } catch(error) {
    let moneroAddress= await wallet.getPrimaryAddress()
    let moneroFirstBlock = (await dao.getAddressByAddress(moneroAddress)).start_block
    await syncWallet(wallet, moneroFirstBlock)
  }
}

// Funzione per firmare e inviare una transazione     
async function signAndSendTransaction(id_utente, toAddress, amount, index, network) {
  let wallet = await prepareWallet(id_utente, index, network)
  console.log("\nWallet synchronization started...");

  console.log(await wallet.getOutputs())
  
  await wallet.rescanSpent()

  let blocksToUnlockArray= await wallet.getNumBlocksToUnlock() 
  let blocksToUnlock=blocksToUnlockArray[1]
  console.log(blocksToUnlock)
  if(blocksToUnlock!==0 && blocksToUnlock!==undefined){
    throw new Error('You need to wait for '+blocksToUnlock+' blocks');
  }

  const balance = await getBalance(wallet);
  console.log(balance)
  if (balance.balance< amount) {
    throw new Error("The available balance is less than the transaction amount.");
  }

  
  let fromAddress = await wallet.getAddress(0, 0)
  console.log(fromAddress)

  let unlockedBalance = await wallet.getUnlockedBalance(0, 0)
  console.log(unlockedBalance)
  // Creazione della configurazione della transazione

  let amountInAtomic = ATOMICUNIT_PER_XMR * amount

  let block_number= await wallet.getHeight()

  let tx
  try{
    // Creazione della transazione
    tx = await wallet.createTx({
      accountIndex: 0,
      address: toAddress,
      amount: amountInAtomic.toString(),
      relay:true
    });
  }
  catch(error){
    throw createCustomError(error.message,"There was a problem sending the transaction.")
  }

  console.log(tx)
  console.log(tx.state)
  let hash = tx.state.hash
  
  let timestamp= tx.state.lastRelayedTimestamp
  const date = new Date(timestamp * 1000);

  return {date,block_number,hash}
}

async function getBalance(wallet) {
  await handleSync(wallet)
  const balance = parseFloat((await wallet.getBalance(0)).toString()) / ATOMICUNIT_PER_XMR
  console.log(balance)
  const unlockedBalance = await getUnlockedBalance(wallet)
  console.log(unlockedBalance)
  let balances= {balance,unlockedBalance}
  return balances
}


async function getUnlockedBalance(wallet) {
  const unlockedBalance = parseFloat((await wallet.getUnlockedBalance(0)).toString()) / ATOMICUNIT_PER_XMR
  return unlockedBalance
}

async function getLatestBlock() {
  try {
    let daemon = await monerojs.connectToDaemonRpc("http://127.0.0.1:28081");
    console.log("daemon",daemon)
    let height = await daemon.getHeight();
    console.log("height", height)
    return height
  } catch (error) {
    throw createCustomError(error.message, "Monero - Error getting last block.")
 }
}

async function getLatestTransactionsAll(endBlock=2305944) {
  const deamon = await monerojs.connectToDaemonRpc("http://localhost:28081");
  const startBlock = await deamon.getHeight();
  console.log(startBlock)
  let txs = []
  for (let i = startBlock; i >= endBlock && i > 0; i--) {
    const block = await deamon.getBlockByHeight(i-1)
    console.log(block)
    block.state.txHashes.forEach(async (tx) => {
        const txData = await deamon.getTx(tx)
        txData.state.inputs.forEach(async (input) =>{

        })

        txData.state.outputs.forEach(async (output) =>{
          
        })
        console.log(txData)
        console.log(txData.state.rctSignatures.ecdhInfo)
        console.log(txData.state.outputs)
        console.log(txData.state.inputs[0].state.amount)
        console.log(txData.state.inputs[0].state.keyImage)
        console.log(txData.state.inputs[0].state.ringOutputIndices)
        console.log(txData.state.inputs[0].state.tx.state.hash)
        
        console.log(txData.state.inputs[1].state.amount)
        console.log(txData.state.inputs[1].state.keyImage)
        console.log(txData.state.inputs[1].state.ringOutputIndices)
        console.log(txData.state.inputs[1].state.tx.state.hash)
        console.log(tx)
    })
}
return txs
}

async function createAddresses(child,network,id_utente,index){
  const privateKey = child.privateKey.toString("hex");

  let wallet,address

  const mnemonic = mn_encode(
    privateKey,
    "english"
  );
  console.log(mnemonic)
  wallet = await createWalletFull(process.env.XMR_SECRET, mnemonic, id_utente, index, network)
  
  console.log("\n---------Monero---------\n");
  let primaryAddress = await wallet.getPrimaryAddress();
  let publicSpendKey = await wallet.getPublicSpendKey();
  let publicViewKey = await wallet.getPublicViewKey();

  address = {
    primaryAddress: primaryAddress,
    publicSpendKey: publicSpendKey,
    publicViewKey: publicViewKey,
  };

  return {address,wallet}
}


module.exports = {
  getLatestTransactionsAll,
  signAndSendTransaction,
  getBalance,
  syncWallet,
  createWalletFull,
  openWallet,
  getLatestBlock,
  createAddresses
};