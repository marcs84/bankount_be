const crypto = require('crypto');
const {Redis} = require('ioredis');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const bitcore = require("bitcore-lib")
const bip44 = require('bip44');
const Web3 = require("web3")
const mysql = require("mysql");
const cryptojs = require('crypto-js');
const solanaWeb3 = require('@solana/web3.js');
const solanaSPLtoken =require("@solana/spl-token")
const bs58 = require('bs58');
const monerojs = require('monero-javascript');
const nacl = require('tweetnacl');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32')
const { ECPairFactory } = require('ecpair')
const axios = require("axios")

const ECPair = ECPairFactory(ecc);
// Genera le gerarchie di chiavi utilizzando lo standard BIP32.
// Generate key hierarchies using the BIP32 standard.
const bip32 = BIP32Factory(ecc);

setWeb3Provider = (provider) => {
    return new Web3(provider)
}

const MoneroNetworkType = {
    MAINNET: monerojs.MoneroNetworkType.MAINNET,
    TESTNET: monerojs.MoneroNetworkType.TESTNET,
    STAGENET: monerojs.MoneroNetworkType.STAGENET,
};

function createCustomError(originalError, errorText) {
    const customError = new Error();
    customError.error = originalError;
    customError.message = errorText
    return customError;
}

class ECDH_AES_Server {
    constructor() {
        this.ecdh = crypto.createECDH('secp256k1'); // Using secp256k1 curve
        this.ecdh.generateKeys();
    }

    getPublicKey() {
        return this.ecdh.getPublicKey('base64'); // Send as Base64
    }

    computeSharedSecret(clientPublicKeyBase64) {
        const clientPublicKey = Buffer.from(clientPublicKeyBase64, 'base64');
        return this.ecdh.computeSecret(clientPublicKey); // Returns a Buffer
    }

    deriveAESKey(sharedSecret) {
        return crypto.createHash('sha256').update(sharedSecret).digest().slice(0, 32); // AES-256 key
    }

    encryptData(data, aesKey) {
        const iv = crypto.randomBytes(16); // Generate a random IV
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return {
            iv: iv.toString('base64'),
            encryptedData: encrypted,
            server_public_key: this.getPublicKey()
        };
    }
}

function formatNumberRobust(number, maxDecimals = 18) {
  if (number === 0) return "0";
 
  // Per numeri molto piccoli, usa toFixed per evitare notazione scientifica
  if (Math.abs(number) < 0.000001) {
    let formatted = number.toFixed(maxDecimals);
 
    // Rimuovi zeri finali
    formatted = formatted.replace(/0+$/, "");
    // Rimuovi eventuale punto finale
    formatted = formatted.replace(/\.$/, "");
    return formatted;
  }
 
  try {
    // Usa toPrecision per avere un controllo simile a toDoubleStringAsPrecised
    let formatted = number.toPrecision(maxDecimals);
 
    // Se toPrecision genera notazione scientifica, fallback a toFixed
    if (formatted.includes("e") || formatted.includes("E")) {
      formatted = number.toFixed(maxDecimals);
    }
 
    // Pulizia finale
    formatted = formatted.replace(/0+$/, "");
    formatted = formatted.replace(/\.$/, "");
    return formatted;
  } catch (e) {
    // Fallback sicuro
    let formatted = number.toFixed(maxDecimals);
    formatted = formatted.replace(/0+$/, "");
    formatted = formatted.replace(/\.$/, "");
    return formatted;
  }
}



module.exports = {
    mysql,
    ECPair,
    crypto,
    bip39,
    bitcoin,
    bip44,
    Web3,
    setWeb3Provider,
    solanaWeb3,
    solanaSPLtoken,
    bs58,
    monerojs,
    nacl,
    ecc,
    cryptojs,
    bip32,
    bitcore,
    axios,
    MoneroNetworkType,
    createCustomError,
    ECDH_AES_Server,
    formatNumberRobust
};



