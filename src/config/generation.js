const utils = require("../utils");
const dao = require("../dao");
const cryptoCores = require("../../lib/cryptoCores");
const { createWalletFull,syncWallet } = require("../../lib/monero/monero-core");

const web3EthMainnet = new utils.Web3(
  "https://mainnet.infura.io/v3/1e6776f8aada4498b94a426cd572f3db"
);
const web3EthTestnet = new utils.Web3(
  "https://goerli.infura.io/v3/1e6776f8aada4498b94a426cd572f3db"
);
// "https://sepolia.infura.io/v3/1e6776f8aada4498b94a426cd572f3db"

const web3BnbTestnet = new utils.Web3(
  'https://data-seed-prebsc-1-s1.binance.org:8545'
);
const web3BnbMainnet = new utils.Web3(
  'https://bsc-dataseed.binance.org'
);


// Definisci le costanti per il protocollo BIP44
const COIN_TYPE = {
  BTC: 0,
  ETH: 60,
  BNB: 714,
  SOL: 501,
  XMR: 128,
};

let ACCOUNT_INDEX = 0;
let CHANGE_INDEX = 0;

// Funzione generateMasternodeFromMmenomnic , usata per repuperare il Masternode data una frase mnemonica
function generateMasternodeFromMmenomnic(mnemonic,network) {
  try {
    // Verifica la validità del mnemonico
    if (!utils.bip39.validateMnemonic(mnemonic)) {
      const error = new Error('The mnemonic provided is invalid');
      throw error;
    }

    // Conversione della frase mnemonica in un seed
    const seed = utils.bip39.mnemonicToSeedSync(mnemonic);

    /* La chiave master (masterNode.toBase58() --> xpriv) è la radice
       della gerarchia di chiavi generate utilizzando lo standard BIP32 
       e viene utilizzata per generare tutte le altre chiavi nella gerarchia. */

    // Genera il masterNode utilizzando BIP32
    let masterNode;

    if (network == "TESTNET") {
        masterNode = utils.bip32.fromSeed(seed, utils.bitcoin.networks.testnet);  //si sta usando testnet ora
    } else {
        masterNode = utils.bip32.fromSeed(seed, utils.bitcoin.networks.bitcoin);
    }

    return masterNode;
} catch (error) {
   throw error;  
}
}

// Funzione generateMasternode , usata per generare un Masternode (funzione collegata alla registrazione di un utente)
function generateMasternode(network) {
  // Genera una seed phrase di 24 parole
  const mnemonic = utils.bip39.generateMnemonic(128);
  // console.log("mnemonic", mnemonic);

  // Conversione della frase mnemonica in un seed , necessario per generare la gerarchia di chiavi utilizzando lo standard BIP32.
  const seed = utils.bip39.mnemonicToSeedSync(mnemonic);
  console.log("seed:", seed);

  /* La chiave master (masterNode.toBase58() --> xpriv) è la radice
     della gerarchia di chiavi generate utilizzando lo standard BIP32 
     e viene utilizzata per generare tutte le altre chiavi nella gerarchia. */

  // Genera il masterNode utilizzando BIP32
  let masterNode;
  if (network == "TESTNET") {
    masterNode = utils.bip32.fromSeed(seed, utils.bitcoin.networks.testnet);
    
    console.log("inside testnet",masterNode.privateKey.toString('hex'))
  } else {
    masterNode = utils.bip32.fromSeed(seed, utils.bitcoin.networks.bitcoin);
    console.log("inside bitcoins",masterNode.privateKey.toString('hex'))

  }
  console.log("Public Key:", masterNode.publicKey.toString('hex'));
  console.log("masterNode.....",masterNode, "mnemonic....", mnemonic);
  return {
    mnemonic: mnemonic,
    bip32: masterNode
  }
}

async function isMnemonicCompatible(Masternode, network) {
  const coinTypes = Object.keys(COIN_TYPE);

  for (const coin of coinTypes) {
    try {
      console.log(COIN_TYPE)
      const path = `m/44'/${COIN_TYPE[coin]}'/0'/0/0`;
      const child = Masternode.derivePath(path);
      let addressDerivated,result;
      console.log(coin)
      switch (coin) {
        case "BTC":
          let {address: addressBtc} = derivationBTC(child, network);
          addressDerivated=addressBtc
          console.log(addressBtc)
          break;
        case "ETH":
          addressDerivated = await cryptoCores.ethereumCore.ethCore.createAddress(child, network);
          break;
        case "BNB":
          addressDerivated = await cryptoCores.binanceCore.bnbCore.createAddress(child, network);
          break;
        case "SOL":
          let {address: addressSol} = cryptoCores.solanaCore.solCore.createAddress(child);
          addressDerivated=addressSol
          break;
        case "XMR":
          break;
        default:
          break;
      }

      try{
        result = await dao.getAddressByAddress(addressDerivated);
      }catch(error){
        return false
      }

      if (result) {
        return result;
      }
      return false
    
    } catch (error) {
      throw error
    }
  }

  return false;
}



//Funzione addCryptoAccount, usata per aggiungere una data Crypto al key tree del Masternode (si aggiunge un nuovo address per la specifica blockchain)
async function addCryptoAccount(id_utente, coin, Masternode, network) {
  let sp_bitcoin
  if(process.env. QUICKNODE_IS_ACTIVE){
    sp_bitcoin = await cryptoCores.bitcoinCore.btcQuicknodeCore.getLatestBlock(network)
  }else{
    sp_bitcoin = await cryptoCores.bitcoinCore.btcCore.getLatestBlock(network)
  }
  const sp_ethereum = await cryptoCores.ethereumCore.ethCore.getLatestBlock(network)
  const sp_binance = await cryptoCores.binanceCore.bnbCore.getLatestBlock(network)
  const sp_solana = await cryptoCores.solanaCore.solCore.getLatestBlock(network)
  const sp_monero = await cryptoCores.moneroCore.xmrCore.getLatestBlock(network)
  let newIndex = await dao.getMaxIndexAddress(coin, id_utente);
  newIndex += 1

  const path = `m/44'/${COIN_TYPE[coin]}'/0'/0/${newIndex}`;
  const child = Masternode.derivePath(path);

  let address

  //Generazione address Blockchain di BITCOIN
  if (coin === "BTC") {
    address = await createAddressBitcon(coin, path, child, network, id_utente, newIndex, sp_bitcoin);
  }

  //Generazione address Blockchain di ETHEREUM
  if (coin === "ETH") {
    address = await createAddressEthereum(coin, path, child, network, id_utente, newIndex, sp_ethereum);
  }

  //Generazione address Blockchain di BINANCE
  if (coin === "BNB") {
    address = await createAddressBinance(coin, path, child, network, id_utente, newIndex, sp_binance);
  }

  //Generazione address Blockchain di SOLANA
  if (coin === "SOL") {
    address = await createAddressSolana(coin, path, child, id_utente, newIndex, sp_solana);
  }

  //Generazione address Blockchain di MONERO
  if (coin === "XMR") {
    address = await createAddressMonero(coin, path, child, network, id_utente, newIndex, sp_monero);
  }

  // const escapedAddress = typeof address === 'string' ? address.replace(/"|'/g, '') : JSON.stringify(address).replace(/"|'/g, '');

  return address;
}

async function createAddressBitcon(coin, path, child, network, id_utente, index = 0, sp_bitcoin) {
  const privateKey = child.privateKey.toString("hex");
  const publicKey = child.publicKey.toString("hex");

  let {address,keyPair} = derivationBTC(child,network)

  console.log("\n---------Bitcoin---------\n");
  console.log("Derived BTC child Private key: ", privateKey);
  console.log("Derived BTC child Public key: ", publicKey);
  console.log("Chiave pubblica BTC: ", address);
  console.log("Chiave privata BTC: ", keyPair.privateKey.toString("hex"));
  console.log("Chiave pubblica KeyPAIR: ", keyPair.publicKey.toString("hex"));
  console.log("Chiave privata KeyPAIR: ", keyPair.privateKey.toString("hex"));

  return await dao.createAddress(coin, path, address, id_utente, index, sp_bitcoin);
}

async function createAddressEthereum(coin, path, child, network, id_utente, index = 0, sp_ethereum) {
  const privateKey = child.privateKey.toString("hex");
  const publicKey = child.publicKey.toString("hex");

  let address;

  address = await cryptoCores.ethereumCore.ethCore.createAddress(child,network)

  console.log("\n---------Ethereum---------\n");
  console.log("Derived ETH child Private key: ", privateKey);
  console.log("Derived ETH child Public key: ", publicKey);
  console.log(`${coin} address: ${address}`);

  return await dao.createAddress(coin, path, address, id_utente, index, sp_ethereum);
}

async function createAddressBinance(coin, path, child, network, id_utente, index = 0, sp_binance) {
  const privateKey = child.privateKey.toString("hex");
  const publicKey = child.publicKey.toString("hex");

  let address;

  address = await cryptoCores.binanceCore.bnbCore.createAddress(child,network)

  console.log("\n---------Binance---------\n");
  console.log("Derived BNB child Private key: ", privateKey);
  console.log("Derived BNB child Public key: ", publicKey);
  console.log(`${coin} address: ${address}`);

  return await dao.createAddress(coin, path, address, id_utente, index, sp_binance);
}

async function createAddressSolana(coin, path, child, id_utente, index = 0, sp_solana) {
  const privateKeyChild = child.privateKey.toString("hex");
  const publicKey = child.publicKey.toString("hex");

  let {address,privateKey} = cryptoCores.solanaCore.solCore.createAddress(child)

  console.log("\n---------Solana---------\n");
  console.log("Derived SOL child Private key: ", privateKeyChild);
  console.log('Derived SOL child Public key: ', publicKey);
  console.log(`Pubk address for 0 index: ${address}`);
  console.log(`Pivk address for 0 index: ${privateKey}`);

  /* Codice per la gestione dei token solana
  const pathSecond = `m/44'/${COIN_TYPE[coin]}'/${ACCOUNT_INDEX}'/${CHANGE_INDEX}/1`;
  const childSecond = Masternode.derivePath(pathSecond);
  const privateKeySecond = childSecond.privateKey.toString("hex");
  const publicKeySecond = childSecond.publicKey.toString("hex");

  const bufferSecond = Buffer.from(privateKeySecond, 'hex');
  const uint8SecretKeySecond = new Uint8Array(bufferSecond);
  const KeypairAccount = utils.solanaWeb3.Keypair.fromSeed(uint8SecretKeySecond)
  let secondAddress = KeypairAccount.publicKey.toString()
  let privateKeySolSecond = utils.bs58.encode(KeypairAccount.secretKey)

  console.log("\nDerived SOL child Private key: ", privateKeySecond);
  console.log('Derived SOL child Public key: ', publicKeySecond);
  console.log(`Pubk address for 1 index: ${secondAddress}`);
  console.log(`Pivk address for 1 index: ${privateKeySolSecond}`);
  */

  await dao.createAddress(coin, path, address, id_utente, index, sp_solana)
  
  /*
  if (index < 2) {
    await dao.createAddress(coin, pathSecond, secondAddress, id_utente, 1, sp_solana)
  }
  */
}

async function createAddressMonero(coin, path, child, network, id_utente, index = 0, sp_monero) {
  
  let {address,wallet}= await cryptoCores.moneroCore.xmrCore.createAddresses(child,network,id_utente,index)

  let privateSpendKey = await wallet.getPrivateSpendKey();
  let privateViewKey = await wallet.getPrivateViewKey();

  console.log(`Pubk address: ${address.primaryAddress}`);
  console.log(`Piv spendk address: ${privateSpendKey}`);
  console.log(`Piv viewk address: ${privateViewKey}`);
  console.log(`Pub spendk address: ${address.publicSpendKey}`);
  console.log(`Pub viewk address: ${address.publicViewKey}`);

  //Sync wallet
  await syncWallet(wallet,sp_monero)
 
  await dao.createAddress(coin, path, JSON.stringify(address), id_utente, index, sp_monero); 
}

//Funzione hierarchyGeneration, usata per la generazione di un address per ogni blockchain integrata al cryptowallet (BTC,ETH,BNB, SOL e XMR)
async function hierarchyGeneration(Masternode, network, id_utente) {
  let sp_bitcoin
  if(process.env.QUICKNODE_IS_ACTIVE){
    sp_bitcoin = await cryptoCores.bitcoinCore.btcQuicknodeCore.getLatestBlock(network)
    console.log("test", sp_bitcoin)
  }else{
    sp_bitcoin = await cryptoCores.bitcoinCore.btcCore.getLatestBlock(network)
  }
  // const sp_ethereum = await cryptoCores.ethereumCore.ethCore.getLatestBlock(network)
  const sp_binance = await cryptoCores.binanceCore.bnbCore.getLatestBlock(network)
  const sp_solana = await cryptoCores.solanaCore.solCore.getLatestBlock(network)
  // const sp_monero = await cryptoCores.moneroCore.xmrCore.getLatestBlock(network)
  const existingBlocks = await dao.getBlocks();

  if (existingBlocks.length > 0) {
    // Genera una gerarchia di chiavi e indirizzi crittografici per ciascuna criptovaluta
    Object.keys(COIN_TYPE).forEach(async (coin) => {
      const path = `m/44'/${COIN_TYPE[coin]}'/${ACCOUNT_INDEX}'/${CHANGE_INDEX}/0`;
      console.log("path....", path);
      const child = Masternode.derivePath(path);
      const privateKey = child.privateKey.toString("hex");
      const publicKey = child.publicKey.toString("hex");
      console.log("Private key:", privateKey);
      console.log("Public key:", publicKey);
      console.log("child:", child);


      //Generazione address Blockchain di BITCOIN
      if (coin === "BTC") {
        await createAddressBitcon(coin, path, child, network, id_utente, 0, sp_bitcoin);
      }

      //Generazione address Blockchain di ETHEREUM
      // if (coin === "ETH") {
      //   await createAddressEthereum(coin, path, child, network, id_utente, 0, sp_ethereum);
      // }

      //Generazione address Blockchain di BINANCE
      if (coin === "BNB") {
        await createAddressBinance(coin, path, child, network, id_utente, 0, sp_binance);
      }

      //Generazione address Blockchain di SOLANA
      if (coin === "SOL") {
        await createAddressSolana(coin, path, child, id_utente, 0, sp_solana);
      }

      //Generazione address Blockchain di MONERO
      // if (coin === "XMR") {
      //   await createAddressMonero(coin, path, child, network, id_utente, 0, sp_monero);
      // }
    })
  } else {
    // Genera una gerarchia di chiavi e indirizzi crittografici per ciascuna criptovaluta
    Object.keys(COIN_TYPE).forEach(async (coin) => {
      const path = `m/44'/${COIN_TYPE[coin]}'/${ACCOUNT_INDEX}'/${CHANGE_INDEX}/0`;
      const child = Masternode.derivePath(path);
      const privateKey = child.privateKey.toString("hex");
      const publicKey = child.publicKey.toString("hex");

      console.log("child Private key:", privateKey);
      console.log("child Public key:", publicKey);

      //Generazione address Blockchain di BITCOIN
      if (coin === "BTC") {
        await createAddressBitcon(coin, path, child, network, id_utente, 0, sp_bitcoin);
      }

      //Generazione address Blockchain di ETHEREUM
      if (coin === "ETH") {
        await createAddressEthereum(coin, path, child, network, id_utente, 0, sp_ethereum);
      }

      //Generazione address Blockchain di BINANCE
      if (coin === "BNB") {
        await createAddressBinance(coin, path, child, network, id_utente, 0, sp_binance);
      }

      //Generazione address Blockchain di SOLANA
      if (coin === "SOL") {
        await createAddressSolana(coin, path, child, id_utente, 0, sp_solana);
      }

      //Generazione address Blockchain di MONERO
      if (coin === "XMR") {
        await createAddressMonero(coin, path, child, network, id_utente, 0, sp_monero);
      }
    });

    dao.insertStartingBlock(sp_bitcoin, sp_ethereum, sp_binance, sp_solana, sp_monero);
  }
}

const recoverPrivateKey = async (Masternode, address) => {
  const path = await dao.getPathByAddress(address)
  const child = Masternode.derivePath(path)
  return child.privateKey.toString("hex")
};

function calculateSHA1(inputString) {
  const sha1Hash = utils.crypto.createHash('sha1');
  sha1Hash.update(inputString);
  return sha1Hash.digest('hex');
}

function derivationBTC(child,network){
  let address,keyPair
  if (network == "TESTNET") {
    // Genera un indirizzo Bitcoin sulla TESTNET
    ({ address, keyPair } = process.env.QUICKNODE_IS_ACTIVE
      ? cryptoCores.bitcoinCore.btcQuicknodeCore.createAddress(child, utils.bitcoin.networks.testnet)
      : cryptoCores.bitcoinCore.btcCore.createAddress(child, utils.bitcoin.networks.testnet));
  } else {
    // Genera un indirizzo Bitcoin sulla MAINET
    ({ address, keyPair } = process.env.QUICKNODE_IS_ACTIVE
      ? cryptoCores.bitcoinCore.btcQuicknodeCore.createAddress(child)
      : cryptoCores.bitcoinCore.btcCore.createAddress(child));
  }
  return {address,keyPair}
}

module.exports = {
  generateMasternode,
  generateMasternodeFromMmenomnic,
  addCryptoAccount,
  hierarchyGeneration,
  recoverPrivateKey,
  calculateSHA1,
  isMnemonicCompatible
};
