const service = require("../service");
const { solanaWeb3, ECDH_AES_Server } = require("../../src/utils");
const dao = require("../dao");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const mailer = require("../mailer");
const auth = require("../auth");
const serverErrors = require('../server/serverErrors');
const { decryptXpriv } = require('../config/Keystore');
const utils = require("../../src/utils");
const speakeasy = require("speakeasy");
const fs = require('fs');
const path = require('path');
const notification = require('../../Helpers/sendNotification')
const smartContract = require("../contracts/smartContractController")

const emailVerification = async (req, res) => {
    try {
        const dati = req.query;
        const token = dati.token; // Get the token from the query string        
        // Check if the token is valid in the database and activate the account
        const user = await dao.getUserByVerificationToken(token);

        if (!user) {
            if (dati.app != undefined && dati.app === "true") {
                res.status(400).json({
                    result: false,
                    message: "Invalid verification token"
                });
                return
            } else {
                // Invalid token, display an error message
                return res.status(400).send('Invalid verification token.');  // 400 Bad Request
            }
        }
        // Valid token, activate the user's account in the database
        await dao.activateUser(user.id);

        if (dati.app != undefined && dati.app === "true") {
            res.status(200).json({
                result: true,
                message: "Account activated successfully"
            });
            return
        } else {
            res.redirect(process.env.REACT_APP_BASE_URL + `/login?confirm=${true}`);
        }
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "Server error during verification"
        });
    }
}

const restoreUser = async (req, res) => {
    const dati = req.body;

    // Genera un token di verifica univoco
    let tokenVerifica = crypto.randomBytes(20).toString('hex');

    await service.userRestore(req.user.id, dati.nome, dati.cognome, dati.email, dati.password, tokenVerifica)
        .then(async (result) => {

            mailer.sendEmailCreateUser(dati.email, tokenVerifica);

            res.json({
                result: true,
                data: result
            });
        })
        .catch(async error => {
            await dao.deleteUserById(req.user.id);

            res.status(500).json({
                result: false,
                message: error.message,
                error: error.message,
                code_route: serverErrors.ERROR_CREATE_USER,
                code: error.code,
            });
        });
}

const generateMasternodeFromMmenomnic = async (req, res) => {
  try {
      const dati = req.body;
      const userId = await service.generateMasternodeFromMmenomnicService(dati.mnemonic, dati.network)

      const user = await dao.getUserById(userId)

      // Generate a JWT token with user data
      const token = auth.generateToken({
          id: user.id,
          email: user.email,
          masternode: user.masternode,
      });

      res.status(200).json({
          result: true,
          data: token,
      });
  }
  catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while importing the wallet: " + error.message,
          error: error.message
      });
  }
}

const deleteUser = async (req, res) => {
    const dati = req.body;
    try {
        await dao.deleteUser(req.user.id);
        res.status(200).json({
            result: true
        });

    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while deleting the user: " + error.message,
            error: error.message
        });
    }
}

const getAddresses = async (req, res) => {
  try {
    const id = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(id);
    const deviceId = deviceResponse[0].id;
    if (deviceId) {
      const addresses = await service.findAddressDetails(deviceId);
      res.status(200).json({
        result: true,
        data: addresses,
      });
    } else {
      res.status(500).json({
        result: false,
        message: "An error occurred while fetching the addresses",
      });
    }
  } catch (error) {
    // console.error("Error in fetching addresses:", error);
    res.status(500).json({
      result: false,
      message: "An error occurred while fetching the addresses: " + error.message,
      error: error.message,
    });
  }
};

const getBalance = async (req, res) => {
  const data = req.body;
  try {
    const balance = await service.getBalance(data.coin_type, data.address, data.network);
    res.status(200).json({
      result: true,
      data: balance,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while fetching the balance" + error.message,
      error: error.message,
    });
  }
};

const getAllBalances = async (req, res) => {
  const data = req.body;
  const tokenVerifica = crypto.randomBytes(20).toString("hex");

  try {
    const balances = await service.getAllBalances(req.user.id, data.network, data.quicknode);
    res.status(200).json({
      result: true,
      data: balances,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while fetching all balances: " + error.message,
      error: error.message,
    });
  }
};

const syncAddresses = async (req, res) => {
  const data = req.body;
  const userId = data.userId;
  const addressList = data.addressList;
  console.log("addressList", addressList);

  try {
    if (addressList.length === 0) {
      await dao.setAllAddressesToInactive(userId);
      return res.status(200).json({
        result: true,
        message: "All addresses set to inactive successfully",
      });
    }
    const addressIds = [];

    const matchedAddresses = [];
    for (const addressData of addressList) {
      const checkAddress = addressData.address;
      const checkChain = addressData.coin_type;

      const userAddress = await dao.getAddressByUserIdAndAddressAndChain(userId, checkAddress, checkChain);
      if (userAddress) {
        addressIds.push(userAddress.id);
      }

      if (!userAddress) {
        const newCoinType = checkChain == "BNB" ? "BSC" : checkChain;
        const tatumResponse = await service.registerTatumAddress(newCoinType, checkAddress);
        console.log("tatumResponse", tatumResponse.body);

        const tatumStatus = tatumResponse.body.id ? "SYNCED" : "NOT-SYNCED";
        const payload = {
          coin_type: checkChain,
          address: checkAddress,
          address_name: addressData.address_name,
          user_id: userId,
          index: addressData.index,
          tatumStatus,
          wallet_id: addressData.wallet_id,
        };
        const response = await service.insertAddress([payload]);
        addressIds.push(response[0]);

        matchedAddresses.push(checkAddress);
        // return res.status(400).json({
        //     result: false,
        //     message: "Invalid payload"
        // });
      } else {
        await dao.updateAddressStatus(userId, checkAddress, "Active");
        matchedAddresses.push(checkAddress);
      }
    }

    await dao.setUnmatchedAddressesToInactive(userId, matchedAddresses);
    const updatedAddressList = await dao.findMultipleAddressesByIds(addressIds);

    res.status(200).json({
      result: true,
      message: "Address status synchronized successfully",
      data: updatedAddressList,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while updating address status: " + error.message,
      error: error.message,
    });
  }
};

//below function is very partial, will be continued, once get confirmation on correctness
const getUtilsForTransaction = async (req, res) => {
  try {
    const { coin_type, from_address, to_address, amount, network, user_id, wallet_id } = req.body;
    // const user = await dao.getUserById(user_id);
    // console.log('user', user)
    // if (!user) {
    //     return res.status(400).json({
    //         result: false,
    //         message: "User not found"
    //     });
    // }
    console.log("req.body", req.body);
    let isAddressOwnedByUser = await dao.isAddressOwnedByUser(user_id, from_address, coin_type);
    if (!isAddressOwnedByUser) {
      return res.status(500).json({
        result: false,
        message: "The sender address is not part of the logged in user",
      });
    }

    const response = await service.txUtilsForExchangeCoinBetweenSameBc(coin_type, from_address, to_address, amount, network);
    return res.status(200).json({
      result: true,
      message: "Transaction utils fetched successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while getting utils for transaction : ", error);
    throw error;
  }
};

const filterTransactions = async (req, res) => {
  try {
    const resData = await service.findDeviceDetails(req.user.identifier);
    console.log("resData", resData);
    console.log("resData", resData);
    const device_id = resData[0].id;
    let { limit, offset, wallet_id, start_date, end_date, duration_type, search, chain, network_type } = req.query;
    let invalidParamsMessage;

    if (!wallet_id) {
      invalidParamsMessage = "wallet_id is mandatory to pass";
    } else if (start_date && !end_date) {
      invalidParamsMessage = "Please pass end_date";
    } else if (!start_date && end_date) {
      invalidParamsMessage = "Please pass start_date";
    }
    if (start_date && end_date && !moment(end_date).isSameOrAfter(moment(start_date))) {
      invalidParamsMessage = "end_date must be greater than start_date";
    }

    if (invalidParamsMessage) {
      return res.status(400).json({
        result: false,
        message: "Invalid parameters",
        error: invalidParamsMessage,
      });
    }

    if (duration_type === "recents") {
      start_date = moment().subtract(6, "days").startOf("day").format("YYYY-MM-DD HH:mm:ss");
      end_date = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
    } else if (duration_type === "current_month") {
      start_date = moment().startOf("month").format("YYYY-MM-DD HH:mm:ss");
      end_date = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
    } else if (duration_type === "last_month") {
      start_date = moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD HH:mm:ss");
      end_date = moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD HH:mm:ss");
    } else if (start_date && end_date) {
      start_date = moment(start_date).startOf("day").format("YYYY-MM-DD HH:mm:ss");
      end_date = moment(end_date).endOf("day").format("YYYY-MM-DD HH:mm:ss");
    }

    const data = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 1,
      wallet_id: parseInt(wallet_id),
      start_date,
      end_date,
      search,
      chain,
      network_type: network_type || "TESTNET",
      device_id,
    };

    const { transactions, totalCount } = await dao.filterTransactions(data);

    return res.status(200).json({
      result: true,
      data: { totalCount, transactions },
    });
  } catch (error) {
    console.log("Error whlie filtering transactions : ", error);
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions: " + error.message,
      error: error.message,
    });
  }
};

const doTransactionBetweenSameBC = async (req, res) => {
  try {
    const { signed_tx, user_id, wallet_id, coin_type, amount, from_address, to_address, latest_block, network_type } = req.body;
    let isAddressOwnedByUser = await dao.isAddressOwnedByUser(user_id, from_address, coin_type);
    if (!isAddressOwnedByUser) {
      return res.status(500).json({
        result: false,
        message: "The sender address is not part of the logged in user",
      });
    }
    const response = await service.doTransactionBetweenSameBC(
      signed_tx,
      user_id,
      wallet_id,
      coin_type,
      amount,
      from_address,
      to_address,
      latest_block,
      network_type
    );
    return res.status(200).json({
      result: true,
      data: response,
    });
  } catch (error) {
    console.log("Error whlie doing transaction : ", error);
    res.status(500).json({
      result: false,
      message: "An error occurred while doing transaction : " + error.message,
      error: error.message,
    });
  }
};

const exchangeCoinBetweenSameBc = async (req, res) => {
  try {
      const data = req.body;
      let user, Masternode, decryptedMasternode
      user = await dao.getUserById(req.user.id);
      if (!user) {
          return res.status(400).json({
              result: false,
              message: "User not found"
          });
      }

      let isAddressOwnedByUser = await dao.isAddressOwnedByUser(req.user.id, data.fromaddress, data.cointype)
      if (!isAddressOwnedByUser) {
          return res.status(500).json({
              result: false,
              message: "The sender address is not part of the logged in user"
          });
      }

      decryptedMasternode = decryptXpriv(req.user.masternode, user.password);

      if (data.network == "TESTNET") {
          Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
      } else {
          Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.bitcoin);
      }

      const exchangeResult = await service.exchangeCoinBetweenSameBc(data.cointype, data.fromaddress, data.toaddress, data.amount, data.network, Masternode);

      res.status(200).json({
          result: true,
          data: exchangeResult
      });
  } catch (e) {
      res.status(500).json({
          result: false,
          message: "An error occurred during coin exchange: " + e.message,
          error: e.error
      });
  }
}

const addCryptoToAccount = async (req, res) => {
  const data = req.body;
  try {
      const user = await dao.getUserById(req.user.id);
      const decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
      const Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
      const result = await service.addCryptoAccountService(req.user.id, data.cointype, Masternode, data.network);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while adding crypto account: " + error.message,
          error: error.message
      });
  }
}

const getTokens = async (req, res) => {
    const data = req.body;
    try {
        const result = await service.getTokens(data.chain, data.symbol, data.address, data.network);
        res.status(200).json({
            result: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while getting tokens: " + error.message,
            error: error.message
        });
    }
}

const exchangeTokenBetweenSameBc = async (req, res) => {
  const data = req.body;
  try {
      let Masternode, decryptedMasternode, user
      user = await dao.getUserById(req.user.id)

      if (!user) {
          return res.status(400).json({
              result: false,
              message: "User not found"
          });
      }

      let isAddressOwnedByUser = await dao.isAddressOwnedByUser(req.user.id, data.fromaddress, data.cointype)
      if (!isAddressOwnedByUser) {
          return res.status(500).json({
              result: false,
              message: "The sender address is not part of the logged in user"
          });
      }
      decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
      if (data.network == "TESTNET") {
          Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
      } else {
          Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.bitcoin);
      }
      const result = await service.exchangeTokenBetweenSameBc(data.chain, data.symbol, data.toaddress, data.fromaddress, data.amount, Masternode, data.network);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred during token exchange: " + error.message,
          error: error.message
      });
  }
}

const activateTokenAccounts = async (req, res) => {
  try {
      const user = await dao.getUserById(req.user.id);
      const decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
      const Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);

      const result = await service.activateTokenAccounts(req.user.id, Masternode);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while activating token accounts: " + error.message,
          error: error.message
      });
  }
}

const getListOfSupportedTokens = async (req, res) => {
  try {
      const dati = req.body;

      // Validate the blockchain option
      const validChains = ["ETH", "BNB", "SOL"];
      if (!validChains.includes(dati.chain)) {
          throw new Error("Invalid blockchain option");
      }

      const result = await service.getListOfSupportedTokens(dati.chain);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while retrieving list of supported tokens: " + error.message,
          error: error.message
      });
  }
}

const getTransactions = async (req, res) => {
  try {
      const dati = req.body;
      const resData = await service.findDeviceDetails(req.user.identifier);
      const userId = resData[0].id;
      const addressArray = await service.findPublicAddress(userId);
      let { totalCount, transactions } = await service.getTransactions(userId, dati.network_type, parseInt(dati.limit), parseInt(dati.offset))
      //   console.log("transactions", transactions, totalCount)
      transactions.forEach(transactionItem => {
          const { from_address, destination_address } = transactionItem;
          const isOutgoing = addressArray.includes(from_address);
          // Check for incoming
          const isIncoming = addressArray.includes(destination_address);
          // console.log("from_address", from_address, "destination_address", destination_address, "isOutgoing", isOutgoing, "isIncoming",isIncoming)
          let status;
          if (isOutgoing && isIncoming) {
              status = 'self-transfer';
          } else if (isOutgoing) {
              status = 'outgoing';
          } else if (isIncoming) {
              status = 'incoming';
          } else {
              status = 'none';
          }
          transactionItem.status = status;
      });
      res.status(200).json({
          result: true,
          data: {
              totalCount: totalCount,
              transactions: transactions
          }
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while retrieving list of transactions: " + error.message,
          error: error.message
      });
  }
}

const getTransactionsByAddress = async (req, res) => {
  try {
      const dati = req.body;
      let { totalCount, transactions } = await service.getTransactionsByAddress(dati.address, parseInt(dati.limit), parseInt(dati.offset))
      const resData = await service.findDeviceDetails(req.user.identifier);
      const userId = resData[0].id
      const addressArray = await service.findPublicAddress(userId);
      transactions.forEach(transactionItem => {
          const { from_address, destination_address } = transactionItem;
          const isOutgoing = addressArray.includes(from_address);
          // Check for incoming
          const isIncoming = addressArray.includes(destination_address);
          let status;
          if (isOutgoing && isIncoming) {
              status = 'self-transfer';
          } else if (isOutgoing) {
              status = 'outgoing';
          } else if (isIncoming) {
              status = 'incoming';
          } else {
              status = 'none';
          }
          transactionItem.status = status;
      });
      res.status(200).json({
          result: true,
          data: {
              totalCount: totalCount,
              transactions: transactions
          }
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while retrieving list of transactions by address: " + error.message,
          error: error.message
      });
  }
}

const getAllTransactions = async (req, res) => {
  try {
      const addresses = await dao.getAddresses(req.user.id)
      const result = await service.getAllTransactions(addresses);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while getting all transactions: " + error.message,
          error: error.message
      });
  }
}

const getLatestTransactionsFromDB = async (req, res) => {
  try {
      const data = req.body
      const result = await service.getLatestTransactionsFromDB(data.limit);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while getting latest transactions: " + error.message,
          error: error.message
      });
  }
}

const getAllTransactionsForAddress = async (req, res) => {
  try {
      const data = req.body
      const result = await service.getAllTransactionsForAddress(data.address);
      res.status(200).json({
          result: true,
          data: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while getting all transactions for an address: " + error.message,
          error: error.message
      });
  }
}

const changePassword = async (req, res) => {
  try {
      const dati = req.body;
      const userId = req.user.id;
      const result = await service.changePasswordForLoggedUser(dati.old_password, dati.new_password, userId);
      res.status(200).json({
          result: true,
          message: result
      });
  } catch (error) {
      res.status(500).json({
          result: false,
          message: "An error occurred while changing password: " + error.message,
          error: error.message
      });
  }
}

const fetchLookupUrls = async (req, res) => {
  try {
    const data = {};
    let { coin_type, key_type, client_public_key } = req.body;
    if (!client_public_key) {
      client_public_key = "BEZwUM6CGUGT5TPfNO7KBr8HK37e1Cua2Ct+/j3wRmIlwUpOliifPTK0mZoHdvYqukD22eTyT/Ka+tP+1LXxQgk=";
    }
    if (!client_public_key || !(coin_type || key_type)) {
      return res.status(400).json({
        result: false,
        message: "Missing input fields",
        error: "Missing input fields",
      });
    }

    if (coin_type) {
      data["quicknode_is_active"] = process.env.QUICKNODE_IS_ACTIVE == "true" ? true : false;
      switch (coin_type) {
        case "BTC": {
          data["quicknode_testnet_url"] = process.env.QUICKNODE_BTC_TEST_URL;
          data["quicknode_mainnet_url"] = process.env.QUICKNODE_BTC_MAIN_URL;
          data["testnet"] = process.env.BITCORE_TEST_URL;
          data["mainnet"] = process.env.BITCORE_MAIN_URL;
          break;
        }

        case "ETH": {
          data["quicknode_testnet_url"] = process.env.QUICKNODE_ETH_TEST_URL;
          data["quicknode_mainnet_url"] = process.env.QUICKNODE_ETH_MAIN_URL;
          data["testnet"] = process.env.ETH_TEST_URL;
          data["mainnet"] = process.env.ETH_MAIN_URL;
          break;
        }

        case "BNB": {
          data["quicknode_testnet_url"] = process.env.QUICKNODE_BNB_TEST_URL;
          data["quicknode_mainnet_url"] = process.env.QUICKNODE_BNB_MAIN_URL;
          data["testnet"] = process.env.BNB_TEST_URL;
          data["mainnet"] = process.env.BNB_MAIN_URL;
          break;
        }

        case "SOL": {
          data["quicknode_testnet_url"] = process.env.QUICKNODE_SOL_TEST_URL;
          data["quicknode_mainnet_url"] = process.env.QUICKNODE_SOL_MAIN_URL;
          data["testnet"] = process.env.SOL_TEST_URL;
          data["mainnet"] = solanaWeb3.clusterApiUrl("mainnet-beta");
          break;
        }
      }
    }

    if (key_type) {
      let key = "";
      const possibleTypes = ["wallet_connect", "coin_gecko", "moralis", "tatum"];
      const isValidType = possibleTypes.includes(key_type);
      if (!isValidType) {
        return res.status(400).json({
          result: false,
          message: "Invalid type value",
          error: "Invalid type value",
        });
      }

      switch (key_type) {
        case "wallet_connect":
          key = process.env.WALLET_CONNECT_API_KEY;
          break;
        case "coin_gecko":
          key = process.env.COIN_GECKO_API_KEY;
          break;
        case "moralis":
          key = process.env.MORALIS_API_KEY;
          break;
        case "tatum":
          key = process.env.TATUM_KEY;
          break;
        default:
          throw new Error("Invalid type");
      }
      data.key = key;
    }

    //encrypt the data
    const server = new ECDH_AES_Server();

    const sharedSecret = server.computeSharedSecret(client_public_key);
    console.log("sharedSecret", sharedSecret);
    const aesKey = server.deriveAESKey(sharedSecret);
    console.log("aesKey", aesKey);
    const encryptedPayload = server.encryptData(JSON.stringify(data), aesKey);

    return res.status(200).json({
      result: true,
      message: "Lookup URLs fetched successfully",
      data: {
        data,
        encryptedPayload,
      },
    });
  } catch (error) {
    console.log("Error while fetching lookup urls : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while updating address name : " + error.message,
      error: error.message,
    });
  }
};

const getPublicKey = (req, res) => {
  try {
    const server = new ECDH_AES_Server();
    console.log("Server Public Key:", server.getPublicKey());

    return res.status(200).json({
      result: true,
      message: "Public key fetched successfully",
      data: { server_public_key: server.getPublicKey() },
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error while fetching public key : " + error.message,
      error: error.message,
    });
  }
};

// The API call Get ERC20 token metadata by symbols (Moralis)
const getTokenMetaData = async (req, res) => {
  const { chain, symbol } = req.query;

  try {
    const response = await axios.get(`${process.env.MORALIS_ERC20_TOKEN_URL}?chain=` + chain + `&symbols%5B0%5D=` + symbol, {
      headers: {
        Accept: "application/json",
        "X-API-Key": `${process.env.MORALIS_API_KEY}`,
      },
    });

    return res.status(200).json({
      result: true,
      message: "Token metadata fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching token metadata : " + error.message,
      error: error.message,
    });
  }
};

const onboardUser = async (req, res) => {
  try {
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const deviceId = deviceResponse[0].id;
    await dao.onboardUser(deviceId);

    return res.status(200).json({
      result: true,
      message: "User onboarded successfully",
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error while onboarding user : " + error.message,
      error: error.message,
    });
  }
};

const storeRangoBlockchainData = async (req, res) => {
  try {
    const url = `https://api.rango.exchange/basic/meta/blockchains?apiKey=${process.env.RANGO_API_KEY}`;
    const response = await axios.get(url, { headers: { accept: "*/*" } });
    const data = response.data
      .map((obj) => {
        if (obj.name === "SOLANA" || obj.name === "BNB" || obj.name === "ETH" || obj.name === "BSC" || obj.name === "BTC") {
          return {
            name: obj.name,
            defaultDecimals: obj.defaultDecimals,
            type: obj.type,
            chainId: obj.chainId,
            logo: obj.logo,
            displayName: obj.displayName,
            shortName: obj.shortName,
            info: obj.info,
          };
        } else {
          return null;
        }
      })
      .filter((o) => o !== null);
    console.log("data", data);
    for (let i = 0; i < data.length; i++) {
      await dao.storeRangoBlockChains(
        data[i].name,
        data[i].defaultDecimals,
        data[i].type,
        data[i].chainId,
        data[i].logo,
        data[i].displayName,
        data[i].shortName,
        data[i].info
      );
    }
    return res.status(200).json({
      result: true,
      message: "Rango data stored in DB successfully",
      data: data,
    });
  } catch (error) {
    console.log("Error while storing rango blockchain data : ", error);
    return res.status(500).json({
      result: false,
      message: "Error storing rango blockchain data : " + error.message,
      error: error.message,
    });
  }
};

const fetchRangoBlockchainData = async (req, res) => {
  try {
    const response = await dao.fetchRangoBlockchainData();
    response.map((data) => {
      if (data.info) data.info = JSON.parse(data.info);
    });
    return res.status(200).json({
      result: true,
      message: "Blockchain data fetched successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while fetching Rango blockchain data : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching Rango blockchain data : " + error.message,
      error: error.message,
    });
  }
};

const fetchRangoMetadata = async (req, res) => {
  try {
    let url = `https://api.rango.exchange/basic/meta?apiKey=${process.env.RANGO_API_KEY}&excludeNonPopulars=true`;
    const { blockchains } = req.query;
    if (!blockchains) {
      return res.status(400).json({
        result: false,
        message: "blockchain is required params",
        error: "Invalid parameters",
      });
    }
    url += `&blockchains=${blockchains}`;
    const response = await axios.get(url);

    return res.status(200).json({
      result: true,
      message: "Rango metadata fetched successfully",
      data: response.data.tokens,
    });
  } catch (error) {
    console.log("Error while fetching Rango metadata : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching Rango metadata : " + error.message,
      error: error.message,
    });
  }
};

module.exports = {
  emailVerification,
  restoreUser,
  generateMasternodeFromMmenomnic,
  deleteUser,
  getAddresses,
  getBalance,
  getAllBalances,
  syncAddresses,
  getUtilsForTransaction,
  filterTransactions,
  doTransactionBetweenSameBC,
  exchangeCoinBetweenSameBc,
  addCryptoToAccount,
  getTokens,
  exchangeTokenBetweenSameBc,
  activateTokenAccounts,
  getListOfSupportedTokens,
  getTransactions,
  getTransactionsByAddress,
  getAllTransactions,
  getLatestTransactionsFromDB,
  getAllTransactionsForAddress,
  changePassword,
  fetchLookupUrls,
  getPublicKey,
  getTokenMetaData,
  onboardUser,
  storeRangoBlockchainData,
  fetchRangoBlockchainData,
  fetchRangoMetadata,
};
