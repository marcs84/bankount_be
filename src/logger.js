const Web3 = require("web3")

const cryptoCores = require("../lib/cryptoCores")
const utils = require('./utils');
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58');
const monerojs = require('monero-javascript');
const nacl = require('tweetnacl');


const debugMasternode = async (Masternode, idx, network) => {

  if (!process.env.DEBUG) {
    return
  }

  // Definisci le costanti per il protocollo BIP44
  const COIN_TYPE = {
    'BTC': 0,
    'ETH': 60,
    'BNB': 714,
    'SOL': 501,
    'XMR': 128
  };

  const ACCOUNT_INDEX = 0;
  const CHANGE_INDEX = 0;

  const MoneroNetworkType = {
    "MAINNET": monerojs.MoneroNetworkType.MAINNET,
    "TESTNET": monerojs.MoneroNetworkType.TESTNET,
    "STAGENET": monerojs.MoneroNetworkType.STAGENET,
  }

  Object.keys(COIN_TYPE).forEach(async (coin) => {
    const path = `m/44'/${COIN_TYPE[coin]}'/${ACCOUNT_INDEX}'/${CHANGE_INDEX}/${idx}`;
    const child = Masternode.derivePath(path);
    const privateKey = child.privateKey.toString('hex');
    const publicKey = child.publicKey.toString('hex');

    if (coin === 'BTC') {
      console.log("\n---------Bitcoin---------\n")
      console.log('Derived BTC child Private key: ', privateKey);
      console.log('Derived BTC child Public key: ', publicKey);
      if (network == utils.bitcoin.networks.testnet) {

        // Genera un indirizzo Bitcoin
        const { address, keyPair } = cryptoCores.bitcoinCore.createAddress(child, network)
        console.log('Chiave pubblica BTC: ', address);
        console.log('Chiave privata BTC: ', keyPair.toWIF());
        console.log('Chiave pubblica keyPair: ', keyPair.publicKey.toString('hex'));
        console.log('Chiave privata keyPair: ', keyPair.privateKey.toString('hex'));
      }
      else {
        console.log("\n---------Bitcoin---------\n")
        // Genera un indirizzo Bitcoin
        const { address, keyPair } = cryptoCores.bitcoinCore.createAddress(child)
        console.log('Chiave pubblica BTC: ', address);
        console.log('Chiave privata BTC: ', keyPair.privateKey.toString('hex'));
        console.log('Chiave pubblica keyPair: ', keyPair.publicKey.toString('hex'));
        console.log('Chiave privata keyPair: ', keyPair.privateKey.toString('hex'));
      }
    }

    else if (coin === 'ETH') {


      const web3 = new Web3();
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const address = account.address;
      const mnemonic = utils.bip39.entropyToMnemonic(privateKey);


      console.log("\n---------Ethereum---------\n");
      console.log("Derived ETH child Private key: ", privateKey);
      console.log("Derived ETH child Public key: ", publicKey);
      console.log("ETH Address: ", address);
      console.log("ETH Mnemonic: ", mnemonic);
    }

    else if (coin === 'BNB') {
      console.log("\n---------Binance---------\n")
      console.log('Derived BNB child Private key: ', privateKey);
      console.log('Derived BNB child Public key: ', publicKey);
      // Genera un indirizzo Binance Smart Chain
      const web3 = new Web3('https://bsc-dataseed.binance.org');
      const address = web3.eth.accounts.privateKeyToAccount(child.privateKey.toString('hex')).address;
      console.log(`${coin} address: ${address}`);
    }

    else if (coin === 'SOL') {
      console.log("\n---------Solana---------\n")
      console.log('Derived SOL child Private key: ', privateKey);
      console.log('Derived SOL child Public key: ', publicKey);
      // Genera una coppia di chiavi ed25519 (Solana non utilizza la curva ellittica secp256k1 utilizzata da BTC quindi va generata esternamente)
      const keyPair = nacl.sign.keyPair.fromSeed(child.privateKey);
      //console.log (keyPair)
      const publicKeySol = bs58.encode(keyPair.publicKey);
      const privateKeySol = bs58.encode(keyPair.secretKey);
      //console.log("PubK "+publicKeySol+"  PivK "+privateKeySol)
      // Genera un indirizzo Solana
      //const publicKey = new solanaWeb3.PublicKey(publicKeySol);
      console.log(`${coin} address: ${publicKey}`);
      console.log(`Pubk address: ${publicKeySol}`);
      console.log(`Pivk address: ${privateKeySol}`);
      child.privateKey = privateKeySol;



      /* Utilizza la chiave privata esterna per firmare un messaggio
        const message = 'Hello, world!';
        const signature = nacl.sign(Buffer.from(message), privateKey);
 
        console.log('Message:', message);
        console.log('Signature:', Buffer.from(signature).toString('hex'));*/
    }

    else if (coin === 'XMR') {
      console.log("\n---------Monero---------\n")
      console.log('Derived XMR child Private key: ', privateKey);
      console.log('Derived XMR child Public key: ', publicKey);
      // create a random keys-only (offline) stagenet wallet
      const mnemonic = cryptoCores.moneroCore.mnemonicGen.mn_encode(privateKey, "english")
      console.log(mnemonic)
      let wallet = await utils.monerojs.createWalletKeys({
        networkType: MoneroNetworkType.TESTNET,
        mnemonic: mnemonic
      });

      console.log(`Pubk address: ${await wallet.getPrimaryAddress()}`);
      console.log(`Piv spendk address: ${await wallet.getPrivateSpendKey()}`);
      console.log(`Piv viewk address: ${await wallet.getPrivateViewKey()}`);
      console.log(`Pub spendk address: ${await wallet.getPublicSpendKey()}`);
      console.log(`Pub viewk address: ${await wallet.getPublicViewKey()}`);
    }
  });
}

module.exports = {
  debugMasternode
}