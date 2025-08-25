const service = require("../service");
const { ECDH_AES_Server } = require("../../src/utils");
const dao = require("../dao");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const mailer = require("../mailer");
const auth = require("../auth");
const serverErrors = require("../server/serverErrors");
const { decryptXpriv } = require("../config/Keystore");
const utils = require("../../src/utils");
const speakeasy = require("speakeasy");
const notification = require("../../Helpers/sendNotification");
const { RangoClient } = require("rango-sdk-basic");
const rango = new RangoClient(process.env.RANGO_API_KEY);

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
          message: "Invalid verification token",
        });
        return;
      } else {
        // Invalid token, display an error message
        return res.status(400).send("Invalid verification token."); // 400 Bad Request
      }
    }
    // Valid token, activate the user's account in the database
    await dao.activateUser(user.id);

    if (dati.app != undefined && dati.app === "true") {
      res.status(200).json({
        result: true,
        message: "Account activated successfully",
      });
      return;
    } else {
      res.redirect(process.env.REACT_APP_BASE_URL + `/login?confirm=${true}`);
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "Server error during verification",
    });
  }
};

const restoreUser = async (req, res) => {
  const dati = req.body;

  // Genera un token di verifica univoco
  let tokenVerifica = crypto.randomBytes(20).toString("hex");

  await service
    .userRestore(req.user.id, dati.nome, dati.cognome, dati.email, dati.password, tokenVerifica)
    .then(async (result) => {
      mailer.sendEmailCreateUser(dati.email, tokenVerifica);

      res.json({
        result: true,
        data: result,
      });
    })
    .catch(async (error) => {
      await dao.deleteUserById(req.user.id);

      res.status(500).json({
        result: false,
        message: error.message,
        error: error.message,
        code_route: serverErrors.ERROR_CREATE_USER,
        code: error.code,
      });
    });
};

const generateMasternodeFromMmenomnic = async (req, res) => {
  try {
    const dati = req.body;
    const userId = await service.generateMasternodeFromMmenomnicService(dati.mnemonic, dati.network);

    const user = await dao.getUserById(userId);

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
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while importing the wallet: " + error.message,
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const dati = req.body;
  try {
    await dao.deleteUser(req.user.id);
    res.status(200).json({
      result: true,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while deleting the user: " + error.message,
      error: error.message,
    });
  }
};

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
    console.log("Error while fetching balance : ", error);
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
        // https://api.quicknode.com/kv/rest/v1/lists

        // const tatumResponse = await service.registerTatumAddress(newCoinType, checkAddress);
        const quicknodeResponse = await service.storeAddressInQuicknode(checkAddress);

        const tatumStatus = quicknodeResponse ? "SYNCED" : "NOT-SYNCED";
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

const syncWallets = async (req, res) => {
  try {
    const data = req.body;
    const resData = await service.findDeviceDetails(req.user.identifier);
    const userId = resData[0].id;
    const walletList = data.wallet_list;
    if (!Array.isArray(walletList) || walletList.length === 0) {
      return res.status(400).json({
        result: false,
        message: "Invalid wallet list provided",
      });
    }
    const existingWallets = (await dao.getWalletsByDeviceId(userId)) ?? [];
    console.log("existingWallets", existingWallets);
    const newWalletList = [];
    for (const wallet of walletList) {
      const matchingWallet = existingWallets.find((w) => w.id === wallet.id);
      if (matchingWallet) {
        //update existing wallet
        await dao.updateWalletDuringSync(matchingWallet.id, {
          name: matchingWallet.name,
          is_active: matchingWallet.is_active,
          wallet_type: matchingWallet.wallet_type,
        });
      } else {
        //pass it to new wallet list
        newWalletList.push(wallet);
      }
    }
    //insert new wallets
    if (newWalletList.length > 0) {
      console.log("newWalletList", newWalletList);
      for (const wallet of newWalletList) {
        //create new wallet
        await dao.createWallet(wallet.id, wallet.name, wallet.wallet_type, wallet.is_active, userId, userId);
      }
    }

    return res.status(200).json({
      result: true,
      message: "Wallets synced successfully",
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "An error occurred while syncing wallets: " + error.message,
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
    const device_id = resData[0].id;
    let { limit, offset, wallet_id, start_date, end_date, duration_type, search, chain, network_type, selected_currency } = req.query;
    let invalidParamsMessage;
    const coinRates = await service.getLatestCoinRates(selected_currency);

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
      offset: parseInt(offset) || 0,
      wallet_id: wallet_id,
      start_date,
      end_date,
      search,
      chain,
      network_type: network_type || "TESTNET",
      device_id,
    };

    const { transactions, totalCount } = await dao.filterTransactions(data);
    transactions.map((transaction) => {
      transaction.converted_amount = service.convertCoinsToAmount(transaction.chain, parseFloat(transaction.amount), selected_currency, coinRates);
    });
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
    let user, Masternode, decryptedMasternode;
    user = await dao.getUserById(req.user.id);
    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }

    let isAddressOwnedByUser = await dao.isAddressOwnedByUser(req.user.id, data.fromaddress, data.cointype);
    if (!isAddressOwnedByUser) {
      return res.status(500).json({
        result: false,
        message: "The sender address is not part of the logged in user",
      });
    }

    decryptedMasternode = decryptXpriv(req.user.masternode, user.password);

    if (data.network == "TESTNET") {
      Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
    } else {
      Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.bitcoin);
    }

    const exchangeResult = await service.exchangeCoinBetweenSameBc(
      data.cointype,
      data.fromaddress,
      data.toaddress,
      data.amount,
      data.network,
      Masternode
    );

    res.status(200).json({
      result: true,
      data: exchangeResult,
    });
  } catch (e) {
    res.status(500).json({
      result: false,
      message: "An error occurred during coin exchange: " + e.message,
      error: e.error,
    });
  }
};

const addCryptoToAccount = async (req, res) => {
  const data = req.body;
  try {
    const user = await dao.getUserById(req.user.id);
    const decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
    const Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
    const result = await service.addCryptoAccountService(req.user.id, data.cointype, Masternode, data.network);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while adding crypto account: " + error.message,
      error: error.message,
    });
  }
};

const getTokens = async (req, res) => {
  const data = req.body;
  try {
    const result = await service.getTokens(data.chain, data.symbol, data.address, data.network);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while getting tokens: " + error.message,
      error: error.message,
    });
  }
};

const exchangeTokenBetweenSameBc = async (req, res) => {
  const data = req.body;
  try {
    let Masternode, decryptedMasternode, user;
    user = await dao.getUserById(req.user.id);

    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }

    let isAddressOwnedByUser = await dao.isAddressOwnedByUser(req.user.id, data.fromaddress, data.cointype);
    if (!isAddressOwnedByUser) {
      return res.status(500).json({
        result: false,
        message: "The sender address is not part of the logged in user",
      });
    }
    decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
    if (data.network == "TESTNET") {
      Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);
    } else {
      Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.bitcoin);
    }
    const result = await service.exchangeTokenBetweenSameBc(
      data.chain,
      data.symbol,
      data.toaddress,
      data.fromaddress,
      data.amount,
      Masternode,
      data.network
    );
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred during token exchange: " + error.message,
      error: error.message,
    });
  }
};

const activateTokenAccounts = async (req, res) => {
  try {
    const user = await dao.getUserById(req.user.id);
    const decryptedMasternode = decryptXpriv(req.user.masternode, user.password);
    const Masternode = utils.bip32.fromBase58(decryptedMasternode, utils.bitcoin.networks.testnet);

    const result = await service.activateTokenAccounts(req.user.id, Masternode);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while activating token accounts: " + error.message,
      error: error.message,
    });
  }
};

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
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of supported tokens: " + error.message,
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const dati = req.body;
    const resData = await service.findDeviceDetails(req.user.identifier);
    const userId = resData[0].id;
    const addressArray = await service.findPublicAddress(userId);
    let { totalCount, transactions } = await service.getTransactions(userId, dati.network_type, parseInt(dati.limit), parseInt(dati.offset));
    //   console.log("transactions", transactions, totalCount)
    transactions.forEach((transactionItem) => {
      const { from_address, destination_address } = transactionItem;
      const isOutgoing = addressArray.includes(from_address);
      // Check for incoming
      const isIncoming = addressArray.includes(destination_address);
      // console.log("from_address", from_address, "destination_address", destination_address, "isOutgoing", isOutgoing, "isIncoming",isIncoming)
      let status;
      if (isOutgoing && isIncoming) {
        status = "self-transfer";
      } else if (isOutgoing) {
        status = "outgoing";
      } else if (isIncoming) {
        status = "incoming";
      } else {
        status = "none";
      }
      transactionItem.status = status;
    });
    res.status(200).json({
      result: true,
      data: {
        totalCount: totalCount,
        transactions: transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions: " + error.message,
      error: error.message,
    });
  }
};

const getTransactionsByAddress = async (req, res) => {
  try {
    const dati = req.body;
    let { totalCount, transactions } = await service.getTransactionsByAddress(dati.address, parseInt(dati.limit), parseInt(dati.offset));
    const resData = await service.findDeviceDetails(req.user.identifier);
    const userId = resData[0].id;
    const addressArray = await service.findPublicAddress(userId);
    transactions.forEach((transactionItem) => {
      const { from_address, destination_address } = transactionItem;
      const isOutgoing = addressArray.includes(from_address);
      // Check for incoming
      const isIncoming = addressArray.includes(destination_address);
      let status;
      if (isOutgoing && isIncoming) {
        status = "self-transfer";
      } else if (isOutgoing) {
        status = "outgoing";
      } else if (isIncoming) {
        status = "incoming";
      } else {
        status = "none";
      }
      transactionItem.status = status;
    });
    res.status(200).json({
      result: true,
      data: {
        totalCount: totalCount,
        transactions: transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions by address: " + error.message,
      error: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const addresses = await dao.getAddresses(req.user.id);
    const result = await service.getAllTransactions(addresses);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while getting all transactions: " + error.message,
      error: error.message,
    });
  }
};

const getLatestTransactionsFromDB = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.getLatestTransactionsFromDB(data.limit);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while getting latest transactions: " + error.message,
      error: error.message,
    });
  }
};

const getAllTransactionsForAddress = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.getAllTransactionsForAddress(data.address);
    res.status(200).json({
      result: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while getting all transactions for an address: " + error.message,
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const dati = req.body;
    const userId = req.user.id;
    const result = await service.changePasswordForLoggedUser(dati.old_password, dati.new_password, userId);
    res.status(200).json({
      result: true,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while changing password: " + error.message,
      error: error.message,
    });
  }
};

const changePasswordForNoLoggedUser = async (req, res) => {
  try {
    const dati = req.body;
    const result = await service.changePasswordForNoLoggedUser(dati.token, dati.new_password);
    res.status(200).json({
      result: true,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while changing password " + error.message,
      error: error.message,
    });
  }
};

const sendChangePasswordEmail = async (req, res) => {
  try {
    const dati = req.body;
    let user = await dao.selectUserByEmail(dati.email);
    if (user) {
      const tokenVerifica = crypto.randomBytes(20).toString("hex");
      mailer.sendEmailRecoverPassword(dati.email, tokenVerifica);
      await dao.saveTokenDataForUser(tokenVerifica, dati.email);
      res.status(200).json({
        result: true,
        message: "Email sent succsessfully",
      });
    } else {
      res.status(500).json({
        result: false,
        message: "The email entered is not present in our system",
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while changing password: " + error.message,
      error: error.message,
    });
  }
};

const verifyTokenChangePassword = async (req, res) => {
  try {
    const dati = req.query;
    let user = await dao.selectUserByToken(dati.token);
    if (!user) {
      res.status(400).json({
        result: false,
        message: "User not found",
      });
      return;
    }
    if (user.token_verifica === null) {
      res.status(400).json({
        result: false,
        message: "The token is not valid",
      });
      return;
    }

    if (user.token_verifica === dati.token) {
      if (dati.app != undefined && dati.app === "true") {
        res.status(200).json({
          result: true,
          message: "Token verified",
        });
        return;
      } else {
        res.redirect(process.env.REACT_APP_BASE_URL + `/recover?token=${dati.token}`);
      }
    } else {
      res.status(400).json({
        result: false,
        message: "The token does not match the user's token",
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while verifying token: " + error.message,
      error: error.message,
    });
  }
};

const generateTotp = async (req, res) => {
  try {
    let user = await dao.getUserById(req.user.id);

    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }

    // genero il totp per google authenticator
    var secret = speakeasy.generateSecret({ length: 20 });
    let totp = secret.base32;

    // genero l'URL per il QR Code
    var otpAuthUrl = speakeasy.otpauthURL({ secret: totp, encoding: "base32", label: "Banckount" });
    await dao.saveUserTotp(user.id, totp);
    res.status(200).json({
      result: true,
      data: {
        totp: totp,
        qrCodeUrl: otpAuthUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while save TOTP status: " + error.message,
      error: error.message,
    });
  }
};

const enable2FA = async (req, res) => {
  try {
    let user = await dao.getUserById(req.user.id);
    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }
    await dao.toggleUser2FA(user.id, true);
    res.status(200).json({
      result: true,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while save 2fa status: " + error.message,
      error: error.message,
    });
  }
};

const disable2FA = async (req, res) => {
  try {
    let user = await dao.getUserById(req.user.id);
    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }
    await dao.saveUserTotp(user.id, null);
    await dao.toggleUser2FA(user.id, false);
    res.status(200).json({
      result: true,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while save 2fa status: " + error.message,
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    let user = await dao.getUserById(req.user.id);

    if (!user) {
      return res.status(400).json({
        result: false,
        message: "User not found",
      });
    }

    // Verifico l'OTP
    let isVerified = speakeasy.totp.verify({
      secret: user.totp,
      encoding: "base32",
      token: req.body.otp,
    });

    if (!isVerified) {
      return res.status(400).json({
        result: false,
        message: "Invalid OTP",
      });
    }
    res.status(200).json({
      result: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while verifying OTP: " + error.message,
      error: error.message,
    });
  }
};

const deviceLogin = async (req, res) => {
  const dati = req.body;
  const { identifier, passkey, device_token } = dati;
  console.log("dati", dati);
  const token = auth.generateToken({
    identifier,
    device_token,
  });
  console.log("token", token);
  await service
    .devicelogin(dati.identifier, dati.passkey, dati.device_token)
    .then((responseId) => {
      res.json({
        result: true,
        data: {
          token: token,
          id: responseId,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        result: false,
        message: error.message ? error.message : error,
        error: error.message,
        code_route: serverErrors.ERROR_DEVICE_LOGIN,
        code: error.code,
      });
    });
};

const insertAddress = async (req, res) => {
  const addresses = req.body;
  let arr = [];
  if (!Array.isArray(addresses)) {
    return res.status(400).json({
      result: false,
      message: "Invalid payload format",
    });
  }

  for (const address of addresses) {
    const newCoinType = address.coin_type == "BNB" ? "BSC" : address.coin_type;
    // const tatumResponse = await service.registerTatumAddress(newCoinType, address.address);
    const quicknodeResponse = await service.storeAddressInQuicknode(address.address);
    address.tatumStatus = quicknodeResponse ? "SYNCED" : "NOT-SYNCED";
    // address.tatumStatus = tatumResponse.body.id ? "SYNCED" : "NOT-SYNCED";
  }

  await service
    .insertAddress(addresses)
    .then(async (data) => {
      const addressDetails = await dao.findMultipleAddressesByIds(data);
      res.json({
        result: true,
        message: "Address stored successfully",
        data: addressDetails,
      });
    })
    .catch(async (error) => {
      console.log("Error while inserting addresses : ", error);
      res.status(500).json({
        result: false,
        message: error.message ? error.message : error,
        error: error.message,
        code_route: serverErrors.ERROR_CREATE_ADDRESS,
        code: error.code,
      });
    });
};

const insertTransaction = async (req, res) => {
  try {
    const data = req.body;
    const addressDetails = await service.checkAddressDetails(data.from_address);
    const response = await dao.insertTransactionNew({
      isHistoryReceivedFromWebhook: false,
      address_id: addressDetails.id,
      id_utente: addressDetails.idUtente,
      wallet_id: addressDetails.wallet_id,
      chain: data.chain,
      chain_id: data.chain_id || null,
      network_type: data.network_type,
      block_number: data.block_number || null,
      gas: data.gas || null,
      gas_price: data.gas_price || null,
      type: data.type || null,
      block_hash: data.block_hash || null,
      input: data.input || null,
      from_address: data.from_address,
      destination_address: data.destination_address,
      tx: data.tx,
      amount: data.amount,
    });

    return res.status(200).json({
      result: true,
      message: "Transaction stored successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: error.message ? error.message : error,
      error: error.message,
      code_route: serverErrors.ERROR_CREATE_ADDRESS,
      code: error.code,
    });
  }
};

const quicknodeTransactionWebhook = async (req, res) => {
  try {
    const transactions = req.body.payload;
    const receipts = req.body.receipts;
    const payload = {};
    console.log("transactions", transactions);
    console.log("receipts", receipts);

    if (transactions && transactions.length) {
      for (let transaction of transactions) {
        let addressDetails = await service.checkAddressDetails(transaction.from);
        let objLength = Object.keys(addressDetails).length;

        //check if transaction is done from third party to our application address, when
        if (!objLength) {
          addressDetails = await service.checkAddressDetails(transaction.to);
          objLength = Object.keys(addressDetails).length;
        }

        payload.isHistoryReceivedFromWebhook = true;
        payload.address_id = objLength > 0 ? addressDetails.id : null;
        payload.id_utente = objLength > 0 ? addressDetails.idUtente : null;
        payload.wallet_id = objLength > 0 ? addressDetails.wallet_id : null;
        payload.chain = transaction.chain;
        payload.chain_id = transaction.chainId ?? null;
        payload.network_type = transaction.network;
        payload.block_number = transaction.blockNumber ?? null;
        payload.gas = transaction.gas ?? null;
        payload.gas_price = transaction.gasPrice ?? null;
        payload.type = transaction.type ?? null;
        payload.block_hash = transaction.blockHash ?? null;
        payload.tx = transaction.hash;
        payload.input = transaction.input;
        payload.from_address = transaction.from;
        payload.destination_address = transaction.to;
        payload.amount = transaction.amount;
        await dao.insertTransactionNew(payload);
        const fromAddress = await service.getDeviceTokenByFromAddress(transaction.from);
        const designationAddress = await service.getDeviceTokenByFromAddress(transaction.to);

        if (fromAddress) {
          const notificationTitle = "Transaction Sent";
          const notificationBody = `The transaction successfully sent ${transaction.amount} ${transaction.chain} to address ${transaction.to}.
Transaction ID: ${transaction.hash}`;
          try {
            notification.sendNotification(fromAddress, {
              notificationTitle,
              notificationBody,
            });
            await dao.insertTransactionNotification(
              addressDetails.idUtente,
              addressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              transaction.chain
            );
          } catch (error) {
            console.error("Error sending notification: ", error);
          }
        }

        if (designationAddress) {
          const notificationTitle = "Transaction Received";
          const notificationBody = `The transaction successfully received ${transaction.amount} ${transaction.chain} from address ${transaction.from}.
Transaction ID: ${transaction.hash}.`;
          try {
            notification.sendNotification(designationAddress, {
              notificationTitle,
              notificationBody,
            });

            const addressDetails = await service.checkAddressDetails(transaction.to);
            await dao.insertTransactionNotification(
              addressDetails.idUtente,
              addressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              transaction.chain
            );
          } catch (error) {
            console.error("Error sending notification: ", error);
          }
        }
      }
    }

    if (receipts && receipts.length) {
      for (let receipt of receipts) {
        let addressDetails = await service.checkAddressDetails(receipt.from);
        let objLength = Object.keys(addressDetails).length;

        //check if transaction is done from third party to our application address, when
        if (!objLength) {
          addressDetails = await service.checkAddressDetails(receipt.to);
          objLength = Object.keys(addressDetails).length;
          console.log("addressDetails", addressDetails);
        }

        payload.isHistoryReceivedFromWebhook = true;
        payload.address_id = objLength > 0 ? addressDetails.id : null;
        payload.id_utente = objLength > 0 ? addressDetails.idUtente : null;
        payload.wallet_id = objLength > 0 ? addressDetails.wallet_id : null;
        payload.chain = receipt.chain;
        payload.chain_id = receipt.chainId ?? null;
        payload.network_type = receipt.network;
        payload.block_number = receipt.blockNumber ?? null;
        payload.gas = receipt.gas ?? null;
        payload.gas_price = receipt.gasPrice ?? null;
        payload.type = receipt.type ?? null;
        payload.block_hash = receipt.blockHash ?? null;
        payload.tx = receipt.hash;
        payload.input = receipt.input;
        payload.from_address = receipt.from;
        payload.destination_address = receipt.to;
        payload.amount = receipt.amount;
        await dao.insertTransactionNew(payload);
        const fromAddress = await service.getDeviceTokenByFromAddress(receipt.from);
        const designationAddress = await service.getDeviceTokenByFromAddress(receipt.to);

        if (fromAddress) {
          const notificationTitle = "Transaction Sent";
          const notificationBody = `The transaction successfully sent ${receipt.amount} ${receipt.chain} to address ${receipt.to}.
Transaction ID: ${receipt.hash}`;
          try {
            notification.sendNotification(fromAddress, {
              notificationTitle,
              notificationBody,
            });
            await dao.insertTransactionNotification(
              addressDetails.idUtente,
              addressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              receipt.chain
            );
          } catch (error) {
            console.error("Error sending notification: ", error);
          }
        }

        if (designationAddress) {
          const notificationTitle = "Transaction Received";
          const notificationBody = `The transaction successfully received ${receipt.amount} ${receipt.chain} from address ${receipt.from}.
Transaction ID: ${receipt.hash}.`;
          try {
            notification.sendNotification(designationAddress, {
              notificationTitle,
              notificationBody,
            });

            const addressDetails = await service.checkAddressDetails(receipt.to);
            console.log("addressDetails", addressDetails);
            await dao.insertTransactionNotification(
              addressDetails.idUtente,
              addressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              receipt.chain
            );
          } catch (error) {
            console.error("Error sending notification: ", error);
          }
        }
      }
    }

    return res.status(200).json({
      result: true,
      message: "OK",
    });
  } catch (error) {
    console.log("Error while fetching webhook data  : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions by address: ",
      error: "An error occurred while retrieving list of transactions by address: ",
    });
  }
};

const findAddressBySearchField = async (req, res) => {
  try {
    const dati = req.body;
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const deviceId = deviceResponse[0].id;
    if (!req.body.coin_type && !req.body.address) {
      return res.status(400).json({
        result: false,
        message: "Invalid payload format",
      });
    }
    const coin_type = req.body.coin_type || "";
    const address = req.body.address || "";
    let resultData = await service.findAddressBySearchField(deviceId, coin_type, address);
    const replaceKey = (arrObj) => {
      return arrObj.map((item) => {
        const { cointype, ...rest } = item;
        return {
          ...rest,
          coin_type: cointype,
        };
      });
    };
    const updatedArray = replaceKey(resultData);
    //    console.log(updatedArray);
    res.status(200).json({
      result: true,
      data: updatedArray,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions by address: " + error.message,
      error: error.message,
    });
  }
};

const tatumTransactionWebhook = async (req, res) => {
  try {
    console.log("req.body", req.body);
    let reqData = req.body;
    const addressDetails = await service.checkAddressDetails(reqData.counterAddress);
    const objLength = Object.keys(addressDetails).length;
    const addresId = objLength > 0 ? addressDetails.id : null;
    const userID = objLength > 0 ? addressDetails.idUtente : 0;
    reqData.tx = reqData.txId;
    reqData.address_id = addresId;
    reqData.idUtente = userID;
    reqData.chain = reqData.asset;
    reqData.token = reqData.asset;
    reqData.from_address = reqData.counterAddress;
    reqData.destination_address = reqData.address;
    reqData.block_number = reqData.blockNumber;
    reqData.type = reqData.type == "native" ? "COIN" : "TOKEN";
    reqData.network_type = "TESTNET";

    if (reqData.subscriptionType == "ADDRESS_EVENT") {
      const responseData = await service.insertTransactionDetails(reqData);
      // console.log("responseData", responseData);
      const fromAddress = await service.getDeviceTokenByFromAddress(responseData.from_address);
      const designationAddress = await service.getDeviceTokenByFromAddress(responseData.destination_address);

      if (fromAddress) {
        notification.sendNotification(fromAddress, {
          notificationTitle: "Transaction Sent",
          notificationBody: `The transaction successfully sent ${responseData.amount} ${responseData.chain} to address ${responseData.destination_address}.
                                               Transaction ID: ${responseData.tx}`,
        });
      }

      if (designationAddress) {
        notification.sendNotification(designationAddress, {
          notificationTitle: "Transaction Received",
          notificationBody: `The transaction successfully received ${responseData.amount} ${responseData.chain} from address ${responseData.from_address}.
                                               Transaction ID: ${responseData.tx}.`,
        });
      }

      res.json({
        result: true,
        message: "Transaction stored successfully",
        data: responseData,
      });
    } else {
      notification.sendNotification(fromAddress, {
        notificationTitle: "Transaction Failed",
        notificationBody: "Your transaction could not be completed.",
      });
      res.status(500).json({
        result: false,
        message: "Transaction not stored successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions by address: ",
      error: "An error occurred while retrieving list of transactions by address: ",
    });
  }
};

const sendTransaction = async (req, res) => {
  const data = req.body;
  try {
    const userAddress = await dao.getAddressByUserIdAndAddress(data.userId, data.senderAddress);
    if (!userAddress) {
      return res.status(400).json({
        result: false,
        message: "Invalid userId or senderAddress.",
      });
    } else {
      const exchangeResult = await service.sendTransaction(data.chain, data.fromaddress, data.toaddress, data.amount, data.network, data.signedTx);
      res.status(200).json({
        result: true,
        data: exchangeResult,
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred during token exchange: " + error.message,
      error: error.message,
    });
  }
};

const createNewWallet = async (req, res) => {
  try {
    const { id, name, wallet_type, is_active, user_id } = req.body;
    const deviceDetails = await dao.verifyDeviceDetails(req.user.identifier);
    const response = await dao.createWallet(id, name, wallet_type, is_active, deviceDetails[0].id, user_id);
    const data = await dao.getWalletById(id);
    return res.status(200).json({
      result: true,
      message: "Wallet created successfully",
      data,
    });
  } catch (error) {
    console.log("Error while creating new wallet : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while creating new wallet : " + error.message,
      error: error.message,
    });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { wallet_id, updates } = req.body;
    if (!wallet_id) {
      throw new Error("wallet_id is required");
    }
    await dao.updateWallet(wallet_id, updates);
    const updatedWallet = await dao.getWalletById(wallet_id);
    return res.status(200).json({
      result: true,
      message: "Wallet updated successfully",
      data: { updatedWallet },
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "An error occurred while updating wallet : " + error.message,
      error: error.message,
    });
  }
};

const fetchWallets = async (req, res) => {
  try {
    const { wallet_id, device_id, user_id } = req.query;
    if (!(wallet_id || device_id || user_id)) {
      throw new Error("Please provide valid parameters to fetch wallet");
    }
    if (wallet_id) {
      const response = await dao.getWalletById(parseInt(wallet_id));
      return res.status(200).json({
        result: true,
        message: "Wallet fetched successfully",
        data: response,
      });
    }
    if (device_id) {
      const response = await dao.getWalletsByDeviceId(parseInt(device_id));
      return res.status(200).json({
        result: true,
        message: "Wallets fetched successfully",
        data: response,
      });
    }
    if (user_id) {
      const response = await dao.getWalletsByUserId(parseInt(user_id));
      return res.status(200).json({
        result: true,
        message: "Wallets fetched successfully",
        data: response,
      });
    }
  } catch (error) {
    console.log("Error while fetching wallet : ", error);
    return res.status(500).json({
      result: false,
      message: "An Error occurred whlie fetching wallet : " + error.message,
      error: error.message,
    });
  }
};

const filterAddresses = async (req, res) => {
  try {
    const filters = Object.keys(req.query).length === 0 ? null : req.query;
    const validFilters = ["user_id", "wallet_id", "coin_type", "has_positive_address", "network", "selected_currency"];
    if (filters) {
      const areValidFilters = Object.keys(filters).every((key) => validFilters.includes(key));
      if (!areValidFilters) {
        return res.status(400).json({
          result: false,
          message: "Invalid filters",
        });
      }
    }
    const { user_id, wallet_id, coin_type, has_positive_address, network, selected_currency } = req.query;
    const coinRates = await service.getLatestCoinRates(selected_currency);
    const filter1 = {};
    if (user_id) {
      filter1.id_utente = user_id;
    }
    if (wallet_id) {
      filter1.wallet_id = wallet_id;
    }
    if (coin_type) {
      filter1.cointype = coin_type;
    }

    const addresses = await dao.filterAddresses(filter1);
    if (!addresses || addresses.length === 0) {
      return res.status(400).json({
        result: false,
        message: "No addresses found for the given filters",
      });
    }

    for (const address of addresses) {
      const balance = await service.getBalance(address.coin_type, address.address, network, user_id, wallet_id);
      address.balance = balance?.balance ?? balance;
    }
    const data = { addresses };

    if (coin_type && selected_currency) {
      let coinsSum = 0;
      for (const address of addresses) {
        coinsSum += address.balance;
      }

      data.coins_sum = coinsSum;
      data.coins_sum_converted = await service.convertCoinsToAmount(coin_type, coinsSum, selected_currency, coinRates);
      data.coin_type = coin_type;
    }
    if (has_positive_address && has_positive_address == "true") {
      const positiveBalanceAddresses = addresses.filter((address) => address.balance > 0);
      data.addresses = positiveBalanceAddresses;
    }

    return res.status(200).json({
      result: true,
      message: "Addresses fetched successfully",
      data: data,
    });
  } catch (error) {
    console.log("Error while fetching addresses : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while fetching adderesses : " + error.message,
      error: error.message,
    });
  }
};

const fetchAssets = async (req, res) => {
  try {
    const { user_id, wallet_id, selected_currency, network } = req.query;
    if (!(user_id && wallet_id && selected_currency && network)) {
      return res.status(400).json({
        result: false,
        message: "Invalid Parameters",
      });
    }
    const filters = { id_utente: user_id, wallet_id: wallet_id };
    const addresses = await dao.filterAddresses(filters);

    const assets = {};
    const coinRates = await service.getLatestCoinRates(selected_currency);
    for (const index in addresses) {
      let balance;
      try {
        balance = await service.getBalance(addresses[index].coin_type, addresses[index].address, network, user_id, wallet_id);
      } catch (error) {
        console.log("Error while fetching balance for address : " + addresses[index].address, error);
        addresses.splice(index, 1);
        continue;
      }
      addresses[index].balance = balance?.balance ?? balance;
      if (addresses[index].coin_type === "ETH") {
        if (!assets["Ethereum"]) {
          assets["Ethereum"] = { addresses: [] };
        }
        assets["Ethereum"]["addresses"].push(addresses[index]);
        assets["Ethereum"]["coin_type"] = "ETH";
        assets["Ethereum"]["coin_name"] = "Ethereum";
      } else if (addresses[index].coin_type === "BNB") {
        if (!assets["Binance"]) {
          assets["Binance"] = { addresses: [] };
        }
        assets["Binance"]["addresses"].push(addresses[index]);
        assets["Binance"]["coin_type"] = "BNB";
        assets["Binance"]["coin_name"] = "Binance";
      } else if (addresses[index].coin_type === "BTC") {
        if (!assets["Bitcoin"]) {
          assets["Bitcoin"] = { addresses: [] };
        }
        assets["Bitcoin"]["addresses"].push(addresses[index]);
        assets["Bitcoin"]["coin_type"] = "BTC";
        assets["Bitcoin"]["coin_name"] = "Bitcoin";
      } else if (addresses[index].coin_type === "SOL") {
        if (!assets["Solana"]) {
          assets["Solana"] = { addresses: [] };
        }
        assets["Solana"]["addresses"].push(addresses[index]);
        assets["Solana"]["coin_type"] = "SOL";
        assets["Solana"]["coin_name"] = "Solana";
      }
    }

    let walletTotalBalance = 0; //wallet total balance
    let convertedTotalAmount = 0;

    for (let key in assets) {
      let coinWiseTotal = 0; //coin total balance
      for (const add of assets[key]["addresses"]) {
        coinWiseTotal += add.balance;
        walletTotalBalance += add.balance;
      }
      assets[key]["coin_balance"] = coinWiseTotal;
      const converted_amount = service.convertCoinsToAmount(key, coinWiseTotal, selected_currency, coinRates);
      assets[key]["converted_amount"] = converted_amount;
      convertedTotalAmount += converted_amount;
      delete assets[key]["addresses"]; //remove addresses field in response as not required in frontend
    }

    const bookmarkedTokens = await dao.fetchBookmarkedTokens(user_id, wallet_id);

    if (addresses && bookmarkedTokens) {
      for (const token of bookmarkedTokens) {
        const index = addresses.findIndex((obj) => obj.coin_type === token.chain);
        if (index === -1) {
          continue;
        }
        let blockchain = addresses[index].coin_type;
        if (blockchain === "BNB") {
          blockchain = "BSC";
        }
        if (blockchain === "SOL") {
          blockchain = "SOLANA";
        }
        token.balance = await rango.tokenBalance({
          walletAddress: addresses[index].address,
          blockchain,
          symbol: token.symbol,
          address: token.address,
        });

        if (token.balance && token.balance.balance) {
          const tokenDetails = await rango.token({ blockchain, address: token.address });
          if (tokenDetails) {
            token.balance.balance = token.balance.balance / Math.pow(10, tokenDetails.token.decimals);
            console.log("token.balance", token.balance);
          }
        }
        // console.log('addresses[index].chain', addresses[index].coin_type)
        token.balance.converted_balance = service.convertCoinsToAmount(
          addresses[index].coin_type,
          token.balance.balance,
          selected_currency,
          coinRates
        );
        // token.balance = token.balance.balance;
      }
    }

    const data = {
      total_balance: walletTotalBalance,
      converted_total_balance: convertedTotalAmount,
      assets,
      bookmarked_tokens: bookmarkedTokens,
    };

    return res.status(200).json({
      result: true,
      message: "Assets fetched successfully",
      data: data,
    });
  } catch (error) {
    console.log("Error while fetching assets : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while fetching assets : " + error.message,
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { user_id, wallet_id, address_id, address_name } = req.body;
    // if(!(address_id && address_name)){
    //     return res.status(400).json({
    //         result: false,
    //         message: 'Invalid parameters',
    //         error: 'Invalid parameters'
    //     })
    // }
    const data = await dao.updateAddressName(user_id, wallet_id, address_id, address_name);
    return res.status(200).json({
      result: true,
      message: "Address name updated successfully",
      data,
    });
  } catch (error) {
    console.log("Error while updating address name : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while updating address name : " + error.message,
      error: error.message,
    });
  }
};

const fetchLookupUrls = async (req, res) => {
  try {
    let { coin_type, key_type, client_public_key, wallet_id } = req.body;
    const data = {};
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const user_id = deviceResponse[0].id;
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

    await service.fetchLookupUrls(user_id, wallet_id, coin_type, data);

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
    const aesKey = server.deriveAESKey(sharedSecret);
    const encryptedPayload = server.encryptData(JSON.stringify(data), aesKey);

    return res.status(200).json({
      result: true,
      message: "Lookup URLs fetched successfully",
      data: {
        // data,
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
    const response = await rango.chains();
    const data = response
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
    const { blockchains } = req.query;
    if (!blockchains) {
      return res.status(400).json({
        result: false,
        message: "blockchain is required params",
        error: "Invalid parameters",
      });
    }
    let response;
    try {
      response = await rango.meta({ blockchains: [blockchains], excludeNonPopulars: true });
    } catch (error) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw error;
      }
    }
    return res.status(200).json({
      result: true,
      message: "Rango metadata fetched successfully",
      data: response.tokens,
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

const initiateSwap = async (req, res) => {
  try {
    const { from_blockchain, from_token_address, to_blockchain, to_token_address, amount, from_wallet_address, to_wallet_address, slippage } =
      req.body;
    let response;
    try {
      response = await rango.swap({
        from: { blockchain: from_blockchain, address: from_token_address },
        to: { blockchain: to_blockchain, address: to_token_address },
        amount: amount,
        fromAddress: from_wallet_address,
        toAddress: to_wallet_address,
        disableEstimate: true,
        slippage: slippage,
      });
    } catch (error) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw error;
      }
    }
    return res.status(200).json({
      result: true,
      message: "Swap initiated successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while initiating swap : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while initiating swap : " + error.message,
      error: error.message,
    });
  }
};

const getSwapRoutes = async (req, res) => {
  try {
    const { from_blockchain, from_address, to_blockchain, to_address, amount, slippage } = req.query;
    let response;
    try {
      response = await rango.quote({
        from: { blockchain: from_blockchain, address: from_address },
        to: { blockchain: to_blockchain, address: to_address },
        amount: amount,
        slippage: slippage,
      });
    } catch (error) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw error;
      }
    }

    return res.status(200).json({
      result: true,
      message: "Swap routes fetched successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while fetching swap routes : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetchihng swap routes : " + error.message,
      error: error.message,
    });
  }
};

const getTokenBalance = async (req, res) => {
  const { wallet_address, blockchain, symbol, token_address } = req.query;
  if (!wallet_address || !blockchain || !symbol) {
    return res.status(400).json({
      result: false,
      message: "wallet_address, blockchain, symbol are required",
      error: "wallet_address, blockchain, symbol are required",
    });
  }
  try {
    let response;
    try {
      response = await rango.tokenBalance({
        walletAddress: wallet_address,
        blockchain: blockchain,
        symbol: symbol,
        address: token_address,
      });
    } catch (error) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw error;
      }
    }
    return res.status(200).json({
      result: true,
      message: "Token balance fetched successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while fetching token balance : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching token balance : " + error.message,
      error: error.message,
    });
  }
};

const checkTxStatus = async (req, res) => {
  try {
    const { request_id, tx_id } = req.body;
    if (!request_id || !tx_id) {
      return res.status(400).json({
        result: false,
        message: "wallet_address, blockchain, symbol are required",
        error: "wallet_address, blockchain, symbol are required",
      });
    }
    let response;
    try {
      response = await rango.status({ requestId: request_id, txId: tx_id });
    } catch (error) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw error;
      }
    }

    return res.status(200).json({
      result: true,
      data: response,
    });
  } catch (error) {
    console.log("Error while checking tx status : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while checking tx status : " + error.message,
      error: error.message,
    });
  }
};

const searchTokensUsingQuicknode = async (req, res) => {
  try {
    let url = `https://thrumming-white-reel.btc.quiknode.pro/c4ba0c80a1d10dfca5420e8a4bdf020a820d4608/addon/748/v1/search`;
    const { q } = req.query;
    url += `?q=${q}&limit=250&c=currencies`;
    const response = await axios.get(url);

    // filter response to only contain token type currency
    // const updatedResponse = { currencies: [] };
    // for (let currency of response.data.currencies) {
    //   if (currency.type === "token") {
    //     updatedResponse.currencies.push(currency);
    //   }
    // }

    // for (const currency of updatedResponse.currencies) {
    //   const coinData = await axios.get(
    //     `https://thrumming-white-reel.btc.quiknode.pro/c4ba0c80a1d10dfca5420e8a4bdf020a820d4608/addon/748/v1/coins/${currency.id}`
    //   );
    //   currency["logo"] = coinData.data.logo;
    // }
    return res.status(200).json({
      result: true,
      message: "Tokens fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.log("Error while searching tokens : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while searching tokens : " + error.message,
      error: error.message,
    });
  }
};

const fetchChainURLs = async (req, res) => {
  try {
    let { wallet_id, client_public_key } = req.query;
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const deviceId = deviceResponse[0].id;
    const customUrls = await dao.fetchCustomChainUrlsByWallet(deviceId, wallet_id);
    if (!client_public_key) {
      client_public_key = "BEZwUM6CGUGT5TPfNO7KBr8HK37e1Cua2Ct+/j3wRmIlwUpOliifPTK0mZoHdvYqukD22eTyT/Ka+tP+1LXxQgk=";
    }

    const existingCustomUrl = (blockchain_name) => {
      const index = customUrls.findIndex((obj) => obj.blockchain_name === blockchain_name);
      if (index !== -1) {
        const data = {
          id: customUrls[index].id,
          blockchain_name: customUrls[index].blockchain_name,
          node_url: customUrls[index].node_url,
          explorer_url: customUrls[index].explorer_url,
          crypto_currency_ticker: customUrls[index].crypto_currency_ticker,
          chain_id: customUrls[index].chain_id,
        };
        return data;
      } else {
        return null;
      }
    };

    const data = {
      quicknode_btc_test: existingCustomUrl("Bitcoin Testnet") ?? {
        id: null,
        blockchain_name: "Bitcoin Testnet",
        node_url: process.env.QUICKNODE_BTC_TEST_URL,
        explorer_url: process.env.QUICKNODE_BTC_TEST_EXPLORER_URL,
        crypto_currency_ticker: "BTC",
        chain_id: "",
      },
      quicknode_eth_test: existingCustomUrl("Ethereum Testnet") ?? {
        id: null,
        blockchain_name: "Ethereum Testnet",
        node_url: process.env.QUICKNODE_ETH_TEST_URL,
        explorer_url: process.env.QUICKNODE_ETH_TEST_EXPLORER_URL,
        crypto_currency_ticker: "ETH",
        chain_id: "11155111",
      },
      quicknode_bnb_test: existingCustomUrl("Binance Testnet") ?? {
        id: null,
        blockchain_name: "Binance Testnet",
        node_url: process.env.QUICKNODE_BNB_TEST_URL,
        explorer_url: process.env.QUICKNODE_BNB_TEST_EXPLORER_URL,
        crypto_currency_ticker: "BNB",
        chain_id: "97",
      },
      quicknode_sol_test: existingCustomUrl("Solana Testnet") ?? {
        id: null,
        blockchain_name: "Solana Testnet",
        node_url: process.env.QUICKNODE_SOL_TEST_URL,
        explorer_url: process.env.QUICKNODE_SOL_TEST_EXPLORER_URL,
        crypto_currency_ticker: "SOL",
        chain_id: "",
      },
      quicknode_btc_main: existingCustomUrl("Bitcoin Mainnet") ?? {
        id: null,
        blockchain_name: "Bitcoin Mainnet",
        node_url: process.env.QUICKNODE_BTC_MAIN_URL,
        explorer_url: process.env.QUICKNODE_BTC_MAIN_EXPLORER_URL,
        crypto_currency_ticker: "BTC",
        chain_id: "",
      },
      quicknode_eth_main: existingCustomUrl("Ethereum Mainnet") ?? {
        id: null,
        blockchain_name: "Ethereum Mainnet",
        node_url: process.env.QUICKNODE_ETH_MAIN_URL,
        explorer_url: process.env.QUICKNODE_ETH_MAIN_EXPLORER_URL,
        crypto_currency_ticker: "ETH",
        chain_id: "1 (0x1)",
      },
      quicknode_bnb_main: existingCustomUrl("Binance Mainnet") ?? {
        id: null,
        blockchain_name: "Binance Mainnet",
        node_url: process.env.QUICKNODE_BNB_MAIN_URL,
        explorer_url: process.env.QUICKNODE_BNB_MAIN_EXPLORER_URL,
        crypto_currency_ticker: "BNB",
        chain_id: "56 (0x38)",
      },
      quicknode_sol_main: existingCustomUrl("Solana Mainnet") ?? {
        id: null,
        blockchain_name: "Solana Mainnet",
        node_url: process.env.QUICKNODE_SOL_MAIN_URL,
        explorer_url: process.env.QUICKNODE_SOL_MAIN_EXPLORER_URL,
        crypto_currency_ticker: "SOL",
        chain_id: "",
      },
    };

    //encrypt the data
    const server = new ECDH_AES_Server();

    const sharedSecret = server.computeSharedSecret(client_public_key);
    const aesKey = server.deriveAESKey(sharedSecret);
    console.log("sharedSecret", sharedSecret);
    console.log("aesKey", aesKey);
    console.log("client_public_key", client_public_key);
    const encryptedPayload = server.encryptData(JSON.stringify(data), aesKey);

    return res.status(200).json({
      result: true,
      message: "Chain URLs and data fetched successfully",
      data: { encryptedPayload },
    });
  } catch (error) {
    console.log("Error while fetching chain urls : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while retrieving chain urls : " + error.message,
      error: error.message,
    });
  }
};

const getTokenDetails = async (req, res) => {
  try {
    const { blockchain, address } = req.query;
    const tokenResponse = await rango.token({
      blockchain: blockchain === "BNB" || blockchain === "BSC" ? "BSC" : blockchain === "SOL" ? "SOLANA" : blockchain,
      address: address,
    });

    return res.status(200).json({
      result: true,
      message: "Token data fetched successfully",
      data: tokenResponse,
    });
  } catch (error) {
    console.log("Error while fetching token details : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while fetching token details : " + error.message,
      error: error.message,
    });
  }
};

const bookmarkToken = async (req, res) => {
  try {
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const deviceId = deviceResponse[0].id;
    const { token_id, wallet_id, name, symbol, rank, rev, type, chain, address, asset_type } = req.body;
    const tokenDetails = await axios.get(
      `https://thrumming-white-reel.btc.quiknode.pro/c4ba0c80a1d10dfca5420e8a4bdf020a820d4608/addon/748/v1/coins/${token_id}`
    );
    const logo = tokenDetails.data.logo;
    const data = await dao.bookmarkToken(token_id, wallet_id, deviceId, name, symbol, rank, rev, type, chain, address, asset_type, logo);

    return res.status(200).json({
      result: true,
      message: "Token bookmarked successfully",
      data,
    });
  } catch (error) {
    console.log("Error while bookmarking token details : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while bookmarking token details : " + error.message,
      error: error.message,
    });
  }
};

const storeCustomChainUrl = async (req, res) => {
  try {
    const { wallet_id, blockchain_name, node_url, explorer_url, crypto_currency_ticker, chain_id } = req.body;
    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const user_id = deviceResponse[0].id;
    const existingCustomUrl = await dao.checkExistingCustomChainUrl(user_id, wallet_id, blockchain_name);
    // console.log('existingCustomUrl', existingCustomUrl)
    if (existingCustomUrl) {
      const data = await dao.updateCustomChainUrl(existingCustomUrl.id, node_url, explorer_url);
      return res.status(200).json({
        result: true,
        message: "Custom chain url updated successfully",
        data,
      });
    }
    const data = await dao.storeCustomChainUrls(user_id, wallet_id, blockchain_name, node_url, explorer_url, crypto_currency_ticker, chain_id);

    return res.status(200).json({
      result: true,
      message: "Custom chain url stored successfully",
      data,
    });
  } catch (error) {
    console.log("Error while storing custom chain url : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while storing chain url : " + error.message,
      error: error.message,
    });
  }
};

const updateCustomChainUrl = async (req, res) => {
  try {
    const { id, node_url, explorer_url } = req.body;
    const data = await dao.updateCustomChainUrl(id, node_url, explorer_url);

    return res.status(200).json({
      result: true,
      message: "Custom chain url updated successfully",
      data,
    });
  } catch (error) {
    console.log("Error while updating custom chain url : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while updating chain url : " + error.message,
      error: error.message,
    });
  }
};

const removeBookmarkedToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const response = await dao.removeBookmarkedToken(tokenId);
    return res.status(200).json({
      result: true,
      message: "Token removed from bookmarked list successfully",
    });
  } catch (error) {
    console.log("Error while removing bookmarked token : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while removing bookmarked token : " + error.message,
      error: error.message,
    });
  }
};

const deleteCustomChainUrl = async (req, res) => {
  try {
    const { id } = req.params;
    await dao.deleteCustomChainUrl(id);

    return res.status(200).json({
      result: true,
      message: "Custom chain url removed successfully",
    });
  } catch (error) {
    console.log("Error while deleting custom chain url : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while deleting custom chain url : " + error.message,
      error: error.message,
    });
  }
};

const storeDappsList = async (req, res) => {
  try {
    const response = await axios.get(`https://preserver.mytokenpocket.vip/v1/application/category_dapplist?category_id=207&count=500&offset=0`);
    const payload = [];
    response.data.data.dapp_list.map((dapp) => {
      payload.push({
        title: dapp.title,
        icon_url: dapp.icon_url,
        url: dapp.url,
        description: dapp.desc,
        back_url: dapp.back_url,
        tag_info: dapp.tag_info,
      });
    });

    await dao.storeDappsList(payload);

    return res.status(200).json({
      result: true,
      message: "Dapps list stored successfully into DB",
    });
  } catch (error) {
    console.log("Error while storing dapps list : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while storing dapps list : " + error.message,
      error: error.message,
    });
  }
};

const fetchDappsList = async (req, res) => {
  try {
    let { page = 1, limit = 100, key } = req.query;
    if (key === null || key === "null" || !key) {
      key = "";
    }
    const data = await dao.fetchDappsList(parseInt(page), parseInt(limit), key);
    return res.status(200).json({
      result: true,
      message: "Dapps list fetched successfully",
      data,
    });
  } catch (error) {
    console.log("Error while fetching dapps list : ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching dapps list : " + error.message,
      error: error.message,
    });
  }
};

const fetchTransactionNotification = async (req, res) => {
  try {
    const { wallet_id, page = 1, limit = 10 } = req.query;

    const identifier = req.user.identifier;
    const deviceResponse = await service.findDeviceDetails(identifier);
    const user_id = deviceResponse[0].id;

    const response = await dao.fetchTransactionNotification(user_id, wallet_id, parseInt(page), parseInt(limit));

    return res.status(200).json({
      result: true,
      message: "Transaction notifications fetched successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while fetching transaction notifications: ", error);
    return res.status(500).json({
      result: false,
      message: "Error while fetching transaction notifications : " + error.message,
      error: error.message,
    });
  }
};

const deleteWallets = async (req, res) => {
  try {
    const walletIds = req.query.wallet_ids?.split(",").map((id) => id);

    const response = await dao.deleteWallets(walletIds);

    return res.status(200).json({
      result: true,
      message: "Wallet deleted successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error while deleting wallets : ", error);
    return res.status(500).json({
      result: false,
      message: "Error whlie deleting wallets : " + error.message,
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
  changePasswordForNoLoggedUser,
  sendChangePasswordEmail,
  verifyTokenChangePassword,
  generateTotp,
  enable2FA,
  disable2FA,
  verifyOTP,
  deviceLogin,
  insertAddress,
  insertTransaction,
  findAddressBySearchField,
  tatumTransactionWebhook,
  sendTransaction,
  createNewWallet,
  updateWallet,
  fetchWallets,
  filterAddresses,
  fetchAssets,
  updateAddress,
  fetchLookupUrls,
  getPublicKey,
  getTokenMetaData,
  onboardUser,
  storeRangoBlockchainData,
  fetchRangoBlockchainData,
  fetchRangoMetadata,
  initiateSwap,
  getSwapRoutes,
  getTokenBalance,
  checkTxStatus,
  searchTokensUsingQuicknode,
  quicknodeTransactionWebhook,
  fetchChainURLs,
  getTokenDetails,
  bookmarkToken,
  removeBookmarkedToken,
  storeCustomChainUrl,
  updateCustomChainUrl,
  deleteCustomChainUrl,
  storeDappsList,
  fetchDappsList,
  fetchTransactionNotification,
  deleteWallets,
  syncWallets,
};
