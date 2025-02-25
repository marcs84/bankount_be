const crypto = require('crypto');
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
    createCustomError
};