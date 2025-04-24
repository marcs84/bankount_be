const utils = require("./utils");
const dao = require("./dao");
const tranasactionType = require("./server/tranasactionType");
const cryptoCores = require("../lib/cryptoCores");
const {
  hierarchyGeneration,
  generateMasternode,
  addCryptoAccount,
  recoverPrivateKey,
  calculateSHA1,
  generateMasternodeFromMmenomnic,
  isMnemonicCompatible,
} = require("./config/generation");
const { PublicKey } = require("@solana/web3.js");
const { openWallet } = require("../lib/monero/monero-core");
const erc20Tokens = require("./contractsCreation/erc20/ERC20Contracts");
const bep20Tokens = require("./contractsCreation/bep20/BEP20Contracts");
const slpTokens = require("./contractsCreation/slp/SLPtokens");
const Keystore = require("./config/Keystore");
const fs = require("fs");
const { default: axios } = require("axios");
const crypto = require("crypto");

const encryptSymmetric = (key, plaintext) => {
  const iv = crypto.randomBytes(12).toString("base64");
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), Buffer.from(iv, "base64"));
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();

  return { ciphertext, tag };
};

const plaintext = "encrypt me";
const key = crypto.randomBytes(32).toString("base64");

const { ciphertext, iv, tag } = encryptSymmetric(key, plaintext);
console.log("ciphertext", ciphertext);

const userRestore = (id_utente, nome, cognome, email, password, tokenVerifica) => {
  return new Promise((resolve, reject) => {
    dao
      .restoreUser(id_utente, nome, cognome, email, password, tokenVerifica)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const addCryptoAccountService = (id_utente, coin, Masternode, network) => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await addCryptoAccount(id_utente, coin, Masternode, network));
    } catch (error) {
      reject(error);
    }
  });
};

const getAddresses = (id) => {
  return new Promise((resolve, reject) => {
    dao
      .getAddresses(id)
      .then((addresses) => {
        resolve(addresses);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getTransactions = (id, network_type, limit, offset) => {
  return new Promise((resolve, reject) => {
    dao
      .getTransactions(id, network_type, limit, offset)
      .then(({ totalCount, transactions }) => {
        resolve({ totalCount, transactions });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getTransactionsByAddress = (address, limit, offset) => {
  return new Promise((resolve, reject) => {
    dao
      .getTransactionsByAddress(address, limit, offset)
      .then(({ totalCount, transactions }) => {
        resolve({ totalCount, transactions });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getBalance = (cointype, address, network, user_id, wallet_id) => {
  const result = {};
  return new Promise(async (resolve, reject) => {
    let balance = 0;

    try {
      switch (cointype) {
        case "BTC": {
          if (process.env.QUICKNODE_IS_ACTIVE) {
            await fetchLookupUrls(user_id, wallet_id, cointype, result);
            let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
            balance = await cryptoCores.bitcoinCore.btcQuicknodeCore.getBalance(address, network, url);
          } else {
            balance = await cryptoCores.bitcoinCore.btcCore.getBalance(address, network);
          }
          break;
        }

        case "ETH": {
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.ethereumCore.ethCore.getBalance({
            address: address,
            network: network,
            url,
          });
          break;
        }

        case "BNB": {
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.binanceCore.bnbCore.getBalance({
            address: address,
            network: network,
            url,
          });
          break;
        }

        case "SOL": {
          const publicKey = new PublicKey(address);
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.solanaCore.solCore.getBalance({
            publicKey: publicKey,
            network: network,
            url,
          });
          break;
        }

        case "XMR": {
          let addressDB = await dao.getAddressByAddress(address);
          let wallet = await openWallet("MoneroRoot", addressDB.idUtente, addressDB.index, network);
          balance = await cryptoCores.moneroCore.xmrCore.getBalance(wallet);
          break;
        }

        default: {
          //coin non valido
          reject(new Error("Coin non valido"));
        }
      }

      resolve(balance);
    } catch (error) {
      reject(error);
    }
  });
};

const getAllBalances = (id_utente, network) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Coins = ["BTC", "ETH", "BNB", "SOL", "XMR"];
      let addresses = await getAddresses(id_utente);
      const balancesArray = {};
      for (const currentCoin of Coins) {
        balancesArray[currentCoin] = [];
        for (const index in addresses[currentCoin]) {
          const addressIndex = index;
          let balance;

          switch (currentCoin) {
            case "BTC":
              if (process.env.QUICKNODE_IS_ACTIVE) {
                balance = await cryptoCores.bitcoinCore.btcQuicknodeCore.getBalance(addresses[currentCoin][addressIndex], network);
              } else {
                balance = await cryptoCores.bitcoinCore.btcCore.getBalance(addresses[currentCoin][addressIndex], network);
              }
              break;

            // case "ETH":
            //     // balance = await cryptoCores.ethereumCore.ethCore.getBalance({
            //     //     address: addresses[currentCoin][addressIndex],
            //     //     network: network
            //     // });

            //     break;

            // case "BNB":
            //     balance = await cryptoCores.binanceCore.bnbCore.getBalance({
            //         address: addresses[currentCoin][addressIndex],
            //         network: network
            //     });

            //     break;

            // case "SOL":
            //     const publicKey = new PublicKey(addresses[currentCoin][addressIndex]);
            //     balance = await cryptoCores.solanaCore.solCore.getBalance({
            //         publicKey: publicKey,
            //         network: network
            //     });

            //     break;

            // case "XMR":
            //     // const addressDB = await dao.getAddressByAddress(
            //     //     addresses[currentCoin][addressIndex]
            //     // );
            //     // const wallet = await openWallet("MoneroRoot", addressDB.idUtente, addressDB.index, network);
            //     // balance = await cryptoCores.moneroCore.xmrCore.getBalance(wallet);

            //     break;

            default:
              reject("Coin non valido");
          }

          if (balance != undefined) {
            balancesArray[currentCoin].push({
              index: addressIndex,
              balance: balance,
            });
          }
        }
      }
      resolve(balancesArray);
    } catch (error) {
      reject(error);
    }
  });
};

const exchangeCoinBetweenSameBc = (cointype, fromAddress, toAddress, amount, network, Masternode) => {
  return new Promise(async (resolve, reject) => {
    try {
      let txid;

      let userAddress = await dao.getAddressByAddress(fromAddress);

      if (userAddress == null) {
        reject("Indirizzo non valido");
      }
      let childPrivateKey = await recoverPrivateKey(Masternode, userAddress.address);

      switch (cointype) {
        case "BTC": {
          if (process.env.QUICKNODE_IS_ACTIVE) {
            txid = await cryptoCores.bitcoinCore.btcQuicknodeCore.signAndSendTransaction(
              userAddress.address,
              toAddress,
              amount,
              childPrivateKey,
              network
            );
          } else {
            txid = await cryptoCores.bitcoinCore.btcCore.signAndSendTransaction(userAddress.address, toAddress, amount * -1, childPrivateKey);
          }

          let date = new Date();
          await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);
          break;
        }

        case "ETH": {
          txid = await cryptoCores.ethereumCore.ethCore.signAndSendTransaction(userAddress.address, toAddress, amount, childPrivateKey, network);
          let date = new Date();
          await dao.insertTransaction(
            tranasactionType.COIN,
            cointype,
            cointype,
            userAddress.id,
            fromAddress,
            txid.transactionHash,
            toAddress,
            amount * -1,
            date,
            0
          );

          break;
        }

        case "BNB": {
          txid = await cryptoCores.binanceCore.bnbCore.signAndSendTransaction(userAddress.address, toAddress, amount, childPrivateKey, network);
          let date = new Date();
          await dao.insertTransaction(
            tranasactionType.COIN,
            cointype,
            cointype,
            userAddress.id,
            fromAddress,
            txid.transactionHash,
            toAddress,
            amount * -1,
            date,
            0
          );

          break;
        }

        case "SOL": {
          const buffer = Buffer.from(childPrivateKey, "hex");
          const uint8SecretKey = new Uint8Array(buffer);
          const KeypairAccount = utils.solanaWeb3.Keypair.fromSeed(uint8SecretKey);
          txid = await cryptoCores.solanaCore.solCore.signAndSendTransaction(userAddress.address, toAddress, amount, KeypairAccount, network);
          let date = new Date();
          await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);

          break;
        }

        case "XMR": {
          let {
            date: blockTime,
            block_number: blockNumber,
            hash: tx,
          } = await cryptoCores.moneroCore.xmrCore.signAndSendTransaction(userAddress.idUtente, toAddress, amount, userAddress.index, network);
          txid = tx;
          await dao.insertTransaction(
            tranasactionType.COIN,
            cointype,
            cointype,
            userAddress.id,
            fromAddress,
            txid,
            toAddress,
            amount * -1,
            blockTime,
            blockNumber
          );

          break;
        }

        default: {
          //coin non valido
          reject("Coin non valido");
        }
      }

      let finalTx;
      if (txid.transactionHash !== undefined) {
        finalTx = txid.transactionHash;
      } else {
        finalTx = txid;
      }

      // transaction = await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, finalTx, toAddress, amount);

      resolve({
        type: tranasactionType.COIN,
        chain: cointype,
        token: cointype,
        address_id: userAddress.id,
        from_address: fromAddress,
        tx: finalTx,
        destination_address: toAddress,
        amount: amount,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const txUtilsForExchangeCoinBetweenSameBc = (cointype, fromAddress, toAddress, amount, network) => {
  return new Promise(async (resolve, reject) => {
    try {
      let txid;

      let userAddress = await dao.getAddressByAddress(fromAddress);

      if (userAddress == null) {
        reject("Indirizzo non valido");
      }
      let response;
      switch (cointype) {
        // case "BTC": {
        //     if (process.env.QUICKNODE_IS_ACTIVE) {
        //         response = await cryptoCores.bitcoinCore.btcQuicknodeCore.transactionUtils(userAddress.address, toAddress, amount, network);
        //     } else {
        //         response = await cryptoCores.bitcoinCore.btcCore.transactionUtils(userAddress.address, toAddress, amount * -1);
        //     }

        //     let date = new Date()
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);
        //     break;
        // }
        case "ETH": {
          response = await cryptoCores.ethereumCore.ethCore.transactionUtils(userAddress.address, toAddress, amount, network);
          break;
        }

        case "BNB": {
          response = await cryptoCores.binanceCore.bnbCore.transactionUtils(userAddress.address, toAddress, amount, network);
          break;
        }

        // case "SOL": {
        //     const buffer = Buffer.from(childPrivateKey, 'hex');
        //     const uint8SecretKey = new Uint8Array(buffer);
        //     const KeypairAccount = utils.solanaWeb3.Keypair.fromSeed(uint8SecretKey)
        //     txid = await cryptoCores.solanaCore.solCore.signAndSendTransaction(userAddress.address, toAddress, amount, KeypairAccount, network);
        //     let date = new Date()
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);

        //     break;
        // }

        // case "XMR": {
        //     let { date: blockTime, block_number: blockNumber, hash: tx } = await cryptoCores.moneroCore.xmrCore.signAndSendTransaction(userAddress.idUtente, toAddress, amount, userAddress.index, network);
        //     txid = tx
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, blockTime, blockNumber);

        //     break;
        // }

        default: {
          //coin non valido
          reject("Coin non valido");
        }
      }
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

const doTransactionBetweenSameBC = (signed_tx, user_id, wallet_id, coin_type, amount, from_address, to_address, latest_block, network_type) => {
  return new Promise(async (resolve, reject) => {
    let txId;
    const userAddress = await dao.getAddressByAddress(from_address);
    if (userAddress == null) {
      reject("Indirizzo non valido");
    }
    switch (coin_type) {
      // case "BTC": {
      //     if (process.env.QUICKNODE_IS_ACTIVE) {
      //         response = await cryptoCores.bitcoinCore.btcQuicknodeCore.transactionUtils(userAddress.address, toAddress, amount, network);
      //     } else {
      //         response = await cryptoCores.bitcoinCore.btcCore.transactionUtils(userAddress.address, toAddress, amount * -1);
      //     }

      //     let date = new Date()
      //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);
      //     break;
      // }
      case "ETH": {
        txId = await cryptoCores.ethereumCore.ethCore.doTransaction(signed_tx, network_type);
        break;
      }

      case "BNB": {
        txId = await cryptoCores.binanceCore.bnbCore.doTransaction(signed_tx, network_type);
        break;
      }

      // case "SOL": {
      //     const buffer = Buffer.from(childPrivateKey, 'hex');
      //     const uint8SecretKey = new Uint8Array(buffer);
      //     const KeypairAccount = utils.solanaWeb3.Keypair.fromSeed(uint8SecretKey)
      //     txid = await cryptoCores.solanaCore.solCore.signAndSendTransaction(userAddress.address, toAddress, amount, KeypairAccount, network);
      //     let date = new Date()
      //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);

      //     break;
      // }

      // case "XMR": {
      //     let { date: blockTime, block_number: blockNumber, hash: tx } = await cryptoCores.moneroCore.xmrCore.signAndSendTransaction(userAddress.idUtente, toAddress, amount, userAddress.index, network);
      //     txid = tx
      //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, blockTime, blockNumber);

      //     break;
      // }

      default: {
        //coin non valido
        reject("Coin non valido");
      }
    }

    let finalTx;
    if (txId.transactionHash !== undefined) {
      finalTx = txId.transactionHash;
    } else {
      finalTx = txId;
    }
    // type, chain, token, address_id, from_address, tx, destination_address, amount, data_insert, block_number, id_utente, network_type, wallet_id
    const date = new Date();
    const response = await dao.insertTransaction(
      tranasactionType.COIN,
      coin_type,
      coin_type,
      userAddress.id,
      from_address,
      txId,
      to_address,
      amount,
      date,
      latest_block,
      user_id,
      network_type,
      wallet_id
    );
    return resolve(response);
  });
};

const getTokens = async (chain, symbol, address, network) => {
  try {
    let tokenBalance;
    switch (chain) {
      case "ETH": {
        tokenBalance = await cryptoCores.ethereumCore.ERC20Core.getTokenBalance(symbol, address, network);
        break;
      }

      case "BNB": {
        tokenBalance = await cryptoCores.binanceCore.BEP20Core.getTokenBalance(symbol, address, network);
        break;
      }

      /*
            case "SOL": {
                tokenBalance = await cryptoCores.solanaCore.SLPCore.getTokenBalance(symbol);
                break;
            }
            */

      default: {
        // coin non valido
        throw new Error("Invalid chain");
      }
    }

    return tokenBalance;
  } catch (error) {
    throw error;
  }
};

const exchangeTokenBetweenSameBc = async (chain, symbol, toAddress, fromAddress, amount, Masternode, network) => {
  try {
    let receipt;

    let userAddress = await dao.getAddressByAddress(fromAddress);

    if (userAddress == null) {
      reject("Indirizzo non valido");
    }
    let childPrivateKey = await recoverPrivateKey(Masternode, userAddress.address);

    switch (chain) {
      case "ETH": {
        receipt = await cryptoCores.ethereumCore.ERC20Core.transferToken(symbol, toAddress, fromAddress, amount, childPrivateKey, network);
        await dao.insertTransaction(
          tranasactionType.TOKEN,
          cointype,
          "ERC-20",
          userAddress.id,
          fromAddress,
          receipt.transactionHash,
          toAddress,
          amount * -1,
          date,
          0
        );
        break;
      }

      case "BNB": {
        receipt = await cryptoCores.binanceCore.BEP20Core.transferToken(symbol, toAddress, fromAddress, amount, childPrivateKey, network);
        await dao.insertTransaction(
          tranasactionType.TOKEN,
          cointype,
          "BEP-20",
          userAddress.id,
          fromAddress,
          receipt.transactionHash,
          toAddress,
          amount * -1,
          date,
          0
        );
        break;
      }

      /*
            case "SOL": {
                receipt = await cryptoCores.solanaCore.solCore.SLPCore.transferToken(symbol, toAddress, fromAddress, amount);
                break;
            }
            */

      default: {
        throw new Error("Invalid chain");
      }
    }

    return receipt;
  } catch (error) {
    throw error;
  }
};

const activateTokenAccounts = async (id_utente, Masternode) => {
  return new Promise(async (resolve, reject) => {
    try {
      let addressesSolana = await dao.getAddressesByUserIdAndCoinType(id_utente, "SOL");

      if (!addressesSolana || addressesSolana.length < 2) {
        reject("Insufficient addresses or none found for the given user ID and coin type");
        return;
      }

      let childPayer, keyPayer, payer, childOwner, keyOwner, owner;

      try {
        childPayer = Masternode.derivePath(addressesSolana[0].path);
        keyPayer = childPayer.privateKey.toString("hex");
        payer = utils.solanaWeb3.Keypair.fromSeed(Buffer.from(keyPayer, "hex"));

        childOwner = Masternode.derivePath(addressesSolana[1].path);
        keyOwner = childOwner.privateKey.toString("hex");
        owner = utils.solanaWeb3.Keypair.fromSeed(Buffer.from(keyOwner, "hex"));
      } catch (err) {
        reject("Error processing Masternode or derived paths");
        return;
      }

      try {
        let result = cryptoCores.solanaCore.SLPCore.activateTokenHandle(id_utente, payer, owner);
        resolve(result);
      } catch (error) {
        reject("Failed to activate token handle: " + error.message);
      }
    } catch (error) {
      reject("Unexpected error: " + error.message);
    }
  });
};

const getListOfSupportedTokens = (chain) => {
  return new Promise(async (resolve, reject) => {
    let tokenList;
    switch (chain) {
      case "ETH": {
        tokenList = erc20Tokens.erc20Contracts;
        break;
      }

      case "BNB": {
        tokenList = bep20Tokens.bep20Contracts;
        break;
      }

      case "SOL": {
        tokenList = slpTokens.SLPtokens;
        break;
      }

      default: {
        reject("Chain non valida");
      }
    }
    resolve(tokenList);
  });
};

const getLatestTransactionsFromDB = (limit) => {
  return new Promise((resolve, reject) => {
    dao
      .getLatestTransactionsFromDB(limit)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/* Pericolosa */
/* TO-DO aggiungere pagginazione su database */
const getAllTransactions = (addresses) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allTransactions = [];

      for (const currency of Object.keys(addresses)) {
        const addressesArray = Object.values(addresses[currency]);

        for (const address of addressesArray) {
          try {
            const transactions = await dao.getTransactionsForAddress(address);
            allTransactions.push(...transactions);
          } catch (error) {
            console.log(`No transactions found for address ${address}`);
          }
        }
      }
      allTransactions.sort((a, b) => {
        if (a.data_insert && b.data_insert) {
          return new Date(a.data_insert) - new Date(b.data_insert);
        }
        return 0;
      });
      resolve(allTransactions);
      console.log(allTransactions);
    } catch (error) {
      reject(error);
    }
  });
};

const getAllTransactionsForAddress = (address) => {
  return new Promise(async (resolve, reject) => {
    try {
      const transactions = await dao.getTransactionsForAddress(address);
      resolve(transactions);
    } catch (error) {
      reject(error);
    }
  });
};

const changePasswordForLoggedUser = async (old_password, new_password, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await dao.getUserById(id);
      let encrypetdOldPassword = calculateSHA1(old_password);
      let encryptedNewPassword = calculateSHA1(new_password);
      if (!user) {
        throw new Error("User not found.");
      }

      if (user.password !== encrypetdOldPassword) {
        throw new Error("Old password is incorrect.");
      }

      let decryptedMasternode;
      let encryptedNewMasternode;

      try {
        decryptedMasternode = Keystore.decryptXpriv(user.masternode, user.password);
        encryptedNewMasternode = Keystore.encryptXpriv(decryptedMasternode, encryptedNewPassword);
      } catch (err) {
        throw utils.createCustomError(err.message, "Failed to process Masternode:");
      }

      try {
        await dao.saveMasternode(encryptedNewMasternode, id);
        let result = await dao.changePassword(encryptedNewPassword, id);
        resolve(result);
      } catch (err) {
        throw utils.createCustomError(err.message, "Database update error: ");
      }
    } catch (error) {
      reject(error);
    }
  });
};

const changePasswordForNoLoggedUser = async (token, new_password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await dao.selectUserByToken(token);
      let encryptedNewPassword = calculateSHA1(new_password);
      if (!user) {
        throw new Error("User not found.");
      }

      let decryptedMasternode;
      let encryptedNewMasternode;

      try {
        decryptedMasternode = Keystore.decryptXpriv(user.masternode, user.password);
        encryptedNewMasternode = Keystore.encryptXpriv(decryptedMasternode, encryptedNewPassword);
      } catch (err) {
        throw utils.createCustomError(err.message, "Failed to process Masternode:");
      }

      try {
        await dao.saveMasternode(encryptedNewMasternode, user.id);
        let result = await dao.changePassword(encryptedNewPassword, user.id);
        resolve(result);
      } catch (err) {
        throw utils.createCustomError(err.message, "Database update error: ");
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Funzione ricorsiva per creare utenti univoci
function _createUniqueUser(attempt = 0) {
  return new Promise((resolve, reject) => {
    // Genera un numero casuale
    let randomNumber = Math.floor(Math.random() * 10000);

    // Aggiungi il numero casuale alla stringa "TempUser"
    let username = "TempUser" + randomNumber;

    // Verifica se l'username esiste già nel database
    dao
      .selectUserByEmail(username)
      .then((userExists) => {
        if (!userExists) {
          resolve(username);
        } else if (attempt < 10) {
          // Se l'utente esiste già e non abbiamo superato il numero massimo di tentativi, riprova
          _createUniqueUser(attempt + 1)
            .then((username) => resolve(username))
            .catch((error) => reject(error));
        } else {
          // Se abbiamo superato il numero massimo di tentativi, rifiuta la promessa
          reject("Failed to create user.");
        }
      })
      .catch((error) => reject(error));
  });
}
const generateMasternodeFromMmenomnicService = (mnemonic, network) => {
  return new Promise(async (resolve, reject) => {
    try {
      let masterNode = generateMasternodeFromMmenomnic(mnemonic, network);
      const cryptedPassword = calculateSHA1(process.env.SECRET_APP);
      const keystore = dao.generateKeystore(cryptedPassword, masterNode);
      let result = await isMnemonicCompatible(masterNode, network);
      if (result.idUtente) {
        //utente vecchio
        await dao.setRecoveryUser(result.idUtente);
        resolve(result.idUtente);
      } else {
        //utente nuovo
        _createUniqueUser()
          .then((username) => {
            // Crea l'utente
            dao
              .createUser(username, username, username, process.env.SECRET_APP, null, keystore, 99)
              .then(async (userId) => {
                await hierarchyGeneration(masterNode, network, userId);
                resolve(userId);
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const devicelogin = (identifier, passkey, device_token) => {
  return new Promise((resolve, reject) => {
    dao
      .verifyDevice(identifier, passkey, device_token)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const insertAddress = (userData) => {
  return new Promise((resolve, reject) => {
    dao
      .insertUserAddress(userData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const findDeviceDetails = (id) => {
  return new Promise((resolve, reject) => {
    dao
      .verifyDeviceDetails(id)
      .then((deviceDetails) => {
        resolve(deviceDetails);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const findAddressDetails = (uid) => {
  return new Promise((resolve, reject) => {
    dao
      .fetchAddress(uid)
      .then((addresses) => {
        resolve(addresses);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const findPublicAddress = (uid) => {
  return new Promise((resolve, reject) => {
    dao
      .fetchAddressArray(uid)
      .then((addresses) => {
        resolve(addresses);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const findAddressDetailsById = (id) => {
  return new Promise((resolve, reject) => {
    dao
      .fetchAddressById(id)
      .then((addresses) => {
        resolve(addresses);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const checkAddressDetails = (address) => {
  return new Promise((resolve, reject) => {
    dao
      .getAddressByAddress(address)
      .then((addressDetail) => {
        resolve(addressDetail);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const insertTransactionDetails = (data) => {
  return new Promise((resolve, reject) => {
    let date = new Date();
    dao
      .insertTransaction(
        data.type,
        data.chain,
        data.token,
        data.address_id,
        data.from_address,
        data.tx,
        data.destination_address,
        data.amount,
        date,
        data.block_number,
        data.idUtente,
        data.network_type,
        data.wallet_id
      )
      .then((transactionDetails) => {
        resolve(transactionDetails);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const findAddressBySearchField = (deviceId, coin_type, address) => {
  return new Promise((resolve, reject) => {
    dao
      .findAddressBySearchKey(deviceId, coin_type, address)
      .then((resultData) => {
        resolve(resultData);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const registerTatumAddress = (chain, address) => {
  return new Promise((resolve, reject) => {
    dao
      .insertTatumAddress(chain, address)
      .then(async (data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getAddressByUserId = (userId, address) => {
  return new Promise((resolve, reject) => {
    dao
      .getAddressByUserId(userId, address)
      .then(async (data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getDeviceTokenByFromAddress = (address) => {
  return new Promise((resolve, reject) => {
    dao
      .getDeviceTokenByFromAddress(address)
      .then(async (data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const sendTransaction = (userId, chain, fromAddress, toAddress, amount, network, signedTx) => {
  return new Promise(async (resolve, reject) => {
    try {
      let txid;

      switch (chain) {
        case "BTC": {
          if (process.env.QUICKNODE_IS_ACTIVE) {
            txid = await cryptoCores.bitcoinCore.btcQuicknodeCore.signAndSendTransactionByUser(signedTx, network);
          } else {
            txid = await cryptoCores.bitcoinCore.btcCore.signAndSendTransactionByUser(fromAddress, toAddress, amount * -1, signedTx);
          }

          let date = new Date();
          await dao.insertTransaction(userId, tranasactionType.COIN, cointype, fromAddress, txid, toAddress, amount * -1, date, 0);
          break;
        }

        case "ETH": {
          txid = await cryptoCores.ethereumCore.ethCore.signAndSendTransactionByUser(fromAddress, toAddress, amount, signedTx, network);
          let date = new Date();
          await dao.insertTransaction(tranasactionType.COIN, cointype, userId, fromAddress, txid.transactionHash, toAddress, amount * -1, date, 0);

          break;
        }

        // case "BNB": {
        //     txid = await cryptoCores.binanceCore.bnbCore.signAndSendTransactionByUser(userAddress.address, toAddress, amount, signedTx, network);
        // 	let date = new Date()
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid.transactionHash, toAddress, amount* -1, date, 0);

        //     break;
        // }

        default: {
          //coin non valido
          reject("Coin non valido");
        }
      }

      let finalTx;
      if (txid.transactionHash !== undefined) {
        finalTx = txid.transactionHash;
      } else {
        finalTx = txid;
      }

      // transaction = await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, finalTx, toAddress, amount);

      resolve({
        type: tranasactionType.COIN,
        chain: cointype,
        token: cointype,
        address_id: userAddress.id,
        from_address: fromAddress,
        tx: finalTx,
        destination_address: toAddress,
        amount: amount,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getLatestCoinRates = async (currency) => {
  const response = await axios.get(`${process.env.COIN_GECKO_COIN_PRICE_URI}?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=${currency}`, {
    headers: {
      accept: "application/json",
      "x-pro-cg-api-key": `${process.env.COIN_GECKO_API_KEY}`,
    },
  });
  return response.data;
};

const convertCoinsToAmount = async (coinType, coins, currency, coinRates) => {
  try {
    if (coinType === "Ethereum" || coinType === "ETH") {
      return coinRates.ethereum[currency] * coins;
    } else if (coinType === "Solana" || coinType === "SOL") {
      return coinRates.solana[currency] * coins;
    } else if (coinType === "Bitcoin" || coinType === "BTC") {
      return coinRates.bitcoin[currency] * coins;
    } else if (coinType === "Binance" || coinType === "BNB" || coinType === "BSC") {
      return coinRates.binancecoin[currency] * coins;
    }
  } catch (error) {
    throw error;
  }
};

const storeAddressInQuicknode = async (address) => {
  try {
    const response = await axios.post(
      "https://api.quicknode.com/kv/rest/v1/lists",
      {
        key: "registered-addresses",
        items: [address],
      },
      { headers: { Accept: "application/json", "Content-Type": "application/json", "x-api-key": process.env.QUICKNODE_API_KEY } }
    );
    if (response.data.code === 200) {
      return true;
    }
  } catch (error) {
    console.log("Error whlie storing address in Quicknode Key-Value Store : ", error);
    return false;
  }
};

const fetchLookupUrls = async (user_id, wallet_id, coin_type, data) => {
  const customUrls = await dao.fetchCustomChainUrlsByWallet(user_id, wallet_id);

  const existigNodeUrl = (blockchain_name) => {
    const index = customUrls.findIndex((obj) => obj.blockchain_name === blockchain_name);
    if (index !== -1) {
      return customUrls[index].node_url;
    } else {
      return null;
    }
  };

  const existingExplorerUrl = (blockchain_name)=>{
    const index = customUrls.findIndex((obj) => obj.blockchain_name === blockchain_name);
    if (index !== -1) {
      return customUrls[index].explorer_url;
    } else {
      return null;
    }
  }

  if (coin_type) {
    data["quicknode_is_active"] = process.env.QUICKNODE_IS_ACTIVE == "true" ? true : false;
    switch (coin_type) {
      case "BTC": {
        data["quicknode_testnet_url"] = existigNodeUrl("Bitcoin Testnet") ?? process.env.QUICKNODE_BTC_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Bitcoin Mainnet") ?? process.env.QUICKNODE_BTC_MAIN_URL;
        data['explorer_testnet_url'] = existingExplorerUrl("Bitcoin Testnet") ?? process.env.QUICKNODE_BTC_TEST_EXPLORER_URL;
        data['explorer_mainnet_url'] = existingExplorerUrl("Bitcoin Mainnet") ?? process.env.QUICKNODE_BTC_MAIN_EXPLORER_URL;
        // data["testnet"] = process.env.BITCORE_TEST_URL;
        // data["mainnet"] = process.env.BITCORE_MAIN_URL;
        break;
      }

      case "ETH": {
        data["quicknode_testnet_url"] = existigNodeUrl("Ethereum Testnet") ?? process.env.QUICKNODE_ETH_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Ethereum Mainnet") ?? process.env.QUICKNODE_ETH_MAIN_URL;
        data['explorer_testnet_url'] = existingExplorerUrl("Ethereum Testnet") ?? process.env.QUICKNODE_ETH_TEST_EXPLORER_URL;
        data['explorer_mainnet_url'] = existingExplorerUrl("Ethereum Mainnet") ?? process.env.QUICKNODE_ETH_MAIN_EXPLORER_URL;
        // data["testnet"] = process.env.ETH_TEST_URL;
        // data["mainnet"] = process.env.ETH_MAIN_URL;
        break;
      }

      case "BNB": {
        data["quicknode_testnet_url"] = existigNodeUrl("Binance Testnet") ?? process.env.QUICKNODE_BNB_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Binance Mainnet") ?? process.env.QUICKNODE_BNB_MAIN_URL;
        data['explorer_testnet_url'] = existingExplorerUrl("Binance Testnet") ?? process.env.QUICKNODE_BNB_TEST_EXPLORER_URL;
        data['explorer_mainnet_url'] = existingExplorerUrl("Binance Mainnet") ?? process.env.QUICKNODE_BNB_MAIN_EXPLORER_URL;
        // data["testnet"] = process.env.BNB_TEST_URL;
        // data["mainnet"] = process.env.BNB_MAIN_URL;
        break;
      }

      case "SOL": {
        data["quicknode_testnet_url"] = existigNodeUrl("Solana Testnet") ?? process.env.QUICKNODE_SOL_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Solana Mainnet") ?? process.env.QUICKNODE_SOL_MAIN_URL;
        data['explorer_testnet_url'] = existingExplorerUrl("Solana Testnet") ?? process.env.QUICKNODE_SOL_TEST_EXPLORER_URL;
        data['explorer_mainnet_url'] = existingExplorerUrl("Solana Mainnet") ?? process.env.QUICKNODE_SOL_MAIN_EXPLORER_URL;
        // data["testnet"] = process.env.SOL_TEST_URL;
        // data["mainnet"] = solanaWeb3.clusterApiUrl("mainnet-beta");
        break;
      }
    }
  }
};

module.exports = {
  userRestore,
  changePasswordForLoggedUser,
  getAddresses,
  getBalance,
  exchangeCoinBetweenSameBc,
  txUtilsForExchangeCoinBetweenSameBc,
  doTransactionBetweenSameBC,
  getTokens,
  exchangeTokenBetweenSameBc,
  activateTokenAccounts,
  addCryptoAccountService,
  changePasswordForNoLoggedUser,
  getListOfSupportedTokens,
  getAllBalances,
  getTransactions,
  getTransactionsByAddress,
  getLatestTransactionsFromDB,
  getAllTransactions,
  getAllTransactionsForAddress,
  generateMasternodeFromMmenomnicService,
  devicelogin,
  insertAddress,
  findDeviceDetails,
  findAddressDetails,
  findAddressDetailsById,
  insertTransactionDetails,
  checkAddressDetails,
  findAddressBySearchField,
  findPublicAddress,
  registerTatumAddress,
  getAddressByUserId,
  sendTransaction,
  getDeviceTokenByFromAddress,
  getLatestCoinRates,
  convertCoinsToAmount,
  storeAddressInQuicknode,
  fetchLookupUrls,
};
