
const utils = require('../utils');
const cryptojs = require('crypto-js');

class Keystore {
    static getXpriv(Masternode) {
      return Masternode.toBase58();
    }
  
    static encryptXpriv(xpriv, password) {
      return utils.cryptojs.AES.encrypt(xpriv, password).toString();
    }
  
    static decryptXpriv(encryptedXpriv, password) {
      const bytes = utils.cryptojs.AES.decrypt(encryptedXpriv, password);
      return bytes.toString(utils.cryptojs.enc.Utf8);
    }
  }

module.exports = Keystore;