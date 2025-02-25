
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
      console.log("bytes",bytes )
      return bytes.toString(utils.cryptojs.enc.Utf8);
    }

    // static decryptXpriv(encryptedXpriv, password) {
    //   try {
    //     const bytes = crypto.AES.decrypt(encryptedXpriv, password);
    //     const decryptedXpriv = bytes.toString(crypto.enc.Utf8);

    //     if (!decryptedXpriv) {
    //       throw new Error('Decryption failed. Check your password or encrypted data.');
    //     }

    //     return decryptedXpriv;
    //   } catch (error) {
    //     console.error('Error decrypting xpriv:', error.message);
    //     return null; // Or handle the error as needed
    //   }
    //   }
  }

  
  
module.exports = Keystore;