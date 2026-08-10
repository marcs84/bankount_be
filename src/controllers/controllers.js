const service = require("../service");
const { ECDH_AES_Server } = require("../../src/utils");
const dao = require("../dao");
const sysLogger = require("../sysLogger");
const { notFound } = require("../server/deviceContext");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const mailer = require("../mailer");
const auth = require("../auth");
const serverErrors = require("../server/serverErrors");
const utils = require("../../src/utils");
const notification = require("../../Helpers/sendNotification");
const { RangoClient } = require("rango-sdk-basic");
const rango = new RangoClient(process.env.RANGO_API_KEY);
const COINPAPRIKA_BASE_URL = process.env.COINPAPRIKA_BASE_URL || "https://api.coinpaprika.com/v1";
const coinPaprikaAuthConfig = process.env.COINPAPRIKA_USERNAME && process.env.COINPAPRIKA_PASSWORD
  ? {
      auth: {
        username: process.env.COINPAPRIKA_USERNAME,
        password: process.env.COINPAPRIKA_PASSWORD,
      },
    }
  : {};

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

const getBalance = async (req, res) => {
  const data = req.body;

  try {
    const balance = await service.getBalance(data.coin_type, data.address, data.network);
    res.status(200).json({
      result: true,
      data: balance,
    });
  } catch (error) {
    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "controllers.getBalance.failed",
      {
        coin_type: data.coin_type,
        address: data.address,
        network: data.network,
        error: error && error.message ? error.message : String(error),
      },
      "ERROR"
    );
    res.status(500).json({
      result: false,
      message: "An error occurred while fetching the balance" + error.message,
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
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "controllers.syncWallets.existingWallets",
      {
        user_id: userId,
        existing_wallets_count: Array.isArray(existingWallets) ? existingWallets.length : null,
      },
      "INFO"
    );
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
      sysLogger.logToDb(
        "SYSTEM_EVENT",
        "controllers.syncWallets.newWalletList",
        {
          user_id: userId,
          new_wallets_count: newWalletList.length,
        },
        "INFO"
      );
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
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "controllers.getUtilsForTransaction.requestBody",
      {
        body: req.body,
      },
      "INFO"
    );
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
    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "controllers.getUtilsForTransaction.failed",
      {
        body: req.body,
        error: error && error.message ? error.message : String(error),
      },
      "ERROR"
    );
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
    for (const transaction of transactions) {
      if (transaction.token && transaction.usd_price) {
        if (selected_currency === "USD" || selected_currency === "usd") {
          transaction.converted_amount = transaction.usd_price * transaction.amount;
        } else if (selected_currency === "EUR" || selected_currency === "eur") {
          const amountToConvert = transaction.amount * transaction.usd_price;
          if (amountToConvert > 0) {
            try {
              const response = await axios.get(`https://api.frankfurter.app/latest?amount=${amountToConvert}&from=USD&to=EUR`);
              transaction.converted_amount = response.data.rates["EUR"];
            } catch (error) {
              sysLogger.logToDb(
                "SYSTEM_EVENT",
                "controllers.filterTransactions.currencyConversionFailed",
                {
                  transaction_id: transaction.tx || transaction.hash || null,
                  selected_currency,
                  error: error && error.message ? error.message : String(error),
                },
                "WARN"
              );
              transaction.converted_amount = 0;
            }
          } else {
            transaction.converted_amount = 0;
          }
        }
      } else {
        transaction.converted_amount = service.convertCoinsToAmount(transaction.chain, parseFloat(transaction.amount), selected_currency, coinRates);
      }
    }
    return res.status(200).json({
      result: true,
      data: { totalCount, transactions },
    });
  } catch (error) {
    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "controllers.filterTransactions.failed",
      {
        error: error && error.message ? error.message : String(error),
      },
      "ERROR"
    );
    res.status(500).json({
      result: false,
      message: "An error occurred while retrieving list of transactions: " + error.message,
      error: error.message,
    });
  }
};

const deviceLogin = async (req, res) => {
  const dati = req.body;
  const { identifier, passkey, device_token, selected_language } = dati;

  if (!identifier || !passkey) {
    return res.status(400).json({
      result: false,
      message: "Missing credentials",
      code_route: serverErrors.ERROR_DEVICE_LOGIN,
    });
  }

  sysLogger.logToDb(
    "SYSTEM_EVENT",
    "controllers.deviceLogin.request",
    {
      identifier,
      has_device_token: !!device_token,
    },
    "INFO"
  );

  try {
    const responseId = await service.devicelogin(identifier, passkey, device_token, selected_language);

    const token = auth.generateToken({
      identifier,
      device_token,
    });

    res.json({
      result: true,
      data: {
        token: token,
        id: responseId,
      },
    });
  } catch (error) {
    if (error && error.code === "ER_INVALID_CREDENTIALS") {
      sysLogger.logToDb(
        "SYSTEM_EVENT",
        "controllers.deviceLogin.rejected",
        { identifier, ip: req.ip || req.socket.remoteAddress },
        "WARN"
      );

      return res.status(401).json({
        result: false,
        message: "Invalid credentials",
        code_route: serverErrors.ERROR_DEVICE_LOGIN,
      });
    }

    res.status(500).json({
      result: false,
      message: error.message ? error.message : error,
      error: error.message,
      code_route: serverErrors.ERROR_DEVICE_LOGIN,
      code: error.code,
    });
  }
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
    const quicknodeResponse = await service.storeAddressInQuicknode(address.address);
    address.tatumStatus = quicknodeResponse ? "SYNCED" : "NOT-SYNCED";
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
    const response = await dao.insertTransactionNew({
      isHistoryReceivedFromWebhook: false,
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

    if (transactions && transactions.length) {
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        const fromAddresses = await dao.getAllMatchingAddresses(transaction.from, transaction.chain);
        const destinationAddresses = await dao.getAllMatchingAddresses(transaction.to, transaction.chain);

        //check if from address exists in our db/application or not
        const doesFromAddressExist = fromAddresses.length > 0;
        const doesToAddressExist = destinationAddresses.length > 0;

        // Il movimento e' uno solo anche quando piu' dispositivi condividono
        // l'indirizzo: la riga si scrive una volta, le notifiche restano per
        // dispositivo.
        if (doesFromAddressExist || doesToAddressExist) {
          await dao.insertTransactionNew({
            isHistoryReceivedFromWebhook: true,
            chain: transaction.chain,
            chain_id: transaction.chainId ?? null,
            network_type: transaction.network ?? null,
            block_number: transaction.blockNumber ?? null,
            gas: transaction.gas ?? null,
            gas_price: transaction.gasPrice ?? null,
            type: transaction.type ?? null,
            block_hash: transaction.blockHash ?? null,
            tx: transaction.hash,
            input: transaction.input,
            from_address: transaction.from,
            destination_address: transaction.to,
            amount: transaction.amount,
            token: null,
            logo: null,
            usd_price: null,
          });
        }

        if (doesFromAddressExist) {
          const notificationTitle = "Transaction Sent";
          const notificationTitleItalian = "Transazione inviata";
          const notificationBody = `You have sent ${utils.formatNumberRobust(transaction.amount)} ${transaction.chain} to address ${
            transaction.to
          }. Transaction ID: ${transaction.hash}`;
          const notificationBodyItalian = `Hai inviato ${utils.formatNumberRobust(transaction.amount)} ${transaction.chain} all'indirizzo ${
            transaction.to
          }. ID transazione: ${transaction.hash}`;

          for (const fromAddressDetails of fromAddresses) {
            await dao.insertTransactionNotification(
              fromAddressDetails.id_utente,
              fromAddressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              transaction.chain
            );
            try {
              if (fromAddressDetails.device_token) {
                const result = await notification.sendNotification(
                  fromAddressDetails.device_token,
                  {
                    notificationTitle: fromAddressDetails.selected_language === "en" ? notificationTitle : notificationTitleItalian,
                    notificationBody: fromAddressDetails.selected_language === "en" ? notificationBody : notificationBodyItalian,
                  },
                  fromAddressDetails.id_utente
                );
              }
            } catch (error) {
              console.error(`[WEBHOOK] ERROR: Exception in FROM address notification:`, error);
            }
          }
        }

        if (doesToAddressExist) {
          const notificationTitle = "Transaction Received";
          const notficationTitleItalian = `Transazione ricevuta`;
          const notificationBody = `You have received ${utils.formatNumberRobust(transaction.amount)} ${transaction.chain} from address ${
            transaction.from
          }. Transaction ID: ${transaction.hash}.`;
          const notficationBodyItalian = `Hai ricevuto ${utils.formatNumberRobust(transaction.amount)} ${transaction.chain} dall'indirizzo ${
            transaction.from
          }. ID transazione: ${transaction.hash}.`;
          for (const destinationAddressDetails of destinationAddresses) {
            await dao.insertTransactionNotification(
              destinationAddressDetails.id_utente,
              destinationAddressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              transaction.chain
            );

            try {
              if (destinationAddressDetails.device_token) {
                const result = await notification.sendNotification(
                  destinationAddressDetails.device_token,
                  {
                    notificationTitle: destinationAddressDetails.selected_language === "en" ? notificationTitle : notficationTitleItalian,
                    notificationBody: destinationAddressDetails.selected_language === "en" ? notificationBody : notficationBodyItalian,
                  },
                  destinationAddressDetails.id_utente
                );
              }
            } catch (error) {
              console.error(`[WEBHOOK] ERROR: Exception in TO address notification:`, error);
            }
          }
        }
      }
    }

    if (receipts && receipts.length) {
      for (let i = 0; i < receipts.length; i++) {
        const receipt = receipts[i];
        const fromAddresses = await dao.getAllMatchingAddresses(receipt.from, receipt.chain);
        const destinationAddresses = await dao.getAllMatchingAddresses(receipt.to, receipt.chain);

        const doesToAddressExist = destinationAddresses.length > 0;
        const doesFromAddressExist = fromAddresses.length > 0;

        let decimals = receipt.decimals ?? null;

        if (receipt.chain === "ETH" || receipt.chain === "BNB") {
          try {
            const tokenDetails = await rango.token({ blockchain: receipt.chain, address: receipt.tokenAddress });

            // Controllo se tokenDetails e token esistono prima di accedere alle proprietà
            if (tokenDetails && tokenDetails.token) {
              receipt.token = tokenDetails.token.symbol || null;
              receipt.logo = tokenDetails.token.image || null;
              receipt.usd_price = tokenDetails.token.usdPrice || null;
              decimals = decimals ?? tokenDetails.token.decimals ?? null;
            } else {
              console.warn(`Token details not found for ${receipt.chain} address: ${receipt.tokenAddress}`);
              receipt.token = null;
              receipt.logo = null;
              receipt.usd_price = null;
            }
          } catch (error) {
            console.error(`Error fetching token details for ${receipt.chain} address ${receipt.tokenAddress}:`, error);
            receipt.token = null;
            receipt.logo = null;
            receipt.usd_price = null;
          }
        }

        // La sorgente non conosce i decimali di ogni token e in quel caso manda
        // l'importo grezzo: senza ricostruirlo il movimento resterebbe senza
        // valore.
        if (receipt.amount === null || receipt.amount === undefined) {
          const recovered = utils.amountFromRawUnits(receipt.rawAmount, decimals);
          if (recovered !== null) {
            receipt.amount = recovered;
          } else {
            sysLogger.logToDb(
              "SYSTEM_EVENT",
              "controllers.quicknodeTransactionWebhook.amountUnresolved",
              {
                tx: receipt.hash || null,
                chain: receipt.chain || null,
                token_address: receipt.tokenAddress || null,
                raw_amount: receipt.rawAmount || null,
                decimals,
              },
              "WARN"
            );
          }
        }

        if (doesFromAddressExist || doesToAddressExist) {
          await dao.insertTransactionNew({
            isHistoryReceivedFromWebhook: true,
            chain: receipt.chain,
            chain_id: receipt.chainId ?? null,
            network_type: receipt.network ?? null,
            block_number: receipt.blockNumber ?? null,
            gas: receipt.gas ?? null,
            gas_price: receipt.gasPrice ?? null,
            type: receipt.type ?? null,
            block_hash: receipt.blockHash ?? null,
            tx: receipt.hash,
            input: receipt.input,
            from_address: receipt.from,
            destination_address: receipt.to,
            amount: receipt.amount,
            token: receipt.token ?? null,
            logo: receipt.logo ?? null,
            usd_price: receipt.usd_price ?? null,
          });
        }

        if (doesFromAddressExist) {
          const notificationTitle = "Transaction Sent";
          const notificationTitleItalian = "Transazione inviata";
          const notificationBody = `You sent ${utils.formatNumberRobust(receipt.amount)} ${
            receipt.token ? receipt.token : receipt.chain
          } to address ${receipt.to}.
Transaction ID: ${receipt.hash}`;
          const notificationBodyItalian = `Hai inviato ${utils.formatNumberRobust(receipt.amount)} ${
            receipt.token ? receipt.token : receipt.chain
          } all'indirizzo ${receipt.to}.
ID transazione: ${receipt.hash}`;

          for (const fromAddressDetails of fromAddresses) {
            await dao.insertTransactionNotification(
              fromAddressDetails.id_utente,
              fromAddressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              receipt.chain
            );

            try {
              if (fromAddressDetails.device_token) {
                const result = await notification.sendNotification(
                  fromAddressDetails.device_token,
                  {
                    notificationTitle: fromAddressDetails.selected_language === "en" ? notificationTitle : notificationTitleItalian,
                    notificationBody: fromAddressDetails.selected_language === "en" ? notificationBody : notificationBodyItalian,
                  },
                  fromAddressDetails.id_utente
                );
              }
            } catch (error) {
              console.error(`[WEBHOOK] ERROR: Exception in receipts FROM address notification:`, error);
            }
          }
        }

        if (doesToAddressExist) {
          const notificationTitle = "Transaction Received";
          const notificationTitleItalian = "Transazione ricevuta";
          const notificationBody = `The transaction successfully received ${utils.formatNumberRobust(receipt.amount)} ${
            receipt.token ? receipt.token : receipt.chain
          } from address ${receipt.from}.
Transaction ID: ${receipt.hash}.`;
          const notificationBodyItalian = `La transazione ha ricevuto correttamente ${utils.formatNumberRobust(receipt.amount)} ${
            receipt.token ? receipt.token : receipt.chain
          } dall'indirizzo ${receipt.from}.
ID transazione: ${receipt.hash}.
`;

          for (const destinationAddressDetails of destinationAddresses) {
            await dao.insertTransactionNotification(
              destinationAddressDetails.id_utente,
              destinationAddressDetails.wallet_id,
              notificationTitle,
              notificationBody,
              receipt.chain
            );
            try {
              if (destinationAddressDetails.device_token) {
                const result = await notification.sendNotification(
                  destinationAddressDetails.device_token,
                  {
                    notificationTitle: destinationAddressDetails.selected_language === "en" ? notificationTitle : notificationTitleItalian,
                    notificationBody: destinationAddressDetails.selected_language === "en" ? notificationBody : notificationBodyItalian,
                  },
                  destinationAddressDetails.id_utente
                );
              }
            } catch (error) {
              console.error(`[WEBHOOK] ERROR: Exception in receipts TO address notification:`, error);
            }
          }
        }
      }
    }

    res.status(200).json({
      result: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while processing webhook: " + error.message,
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
        sysLogger.logToDb(
          "SYSTEM_ERROR",
          "controllers.fetchAssets.getBalanceFailed",
          {
            address: addresses[index].address,
            coin_type: addresses[index].coin_type,
            error: error && error.message ? error.message : String(error),
          },
          "ERROR"
        );
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
          if (selected_currency === "USD" || selected_currency === "usd") {
            token.balance.converted_balance = tokenDetails.token.usdPrice ? tokenDetails.token.usdPrice * token.balance.balance : null;
          } else if (selected_currency === "EUR" || selected_currency === "eur") {
            if (tokenDetails.token.usdPrice) {
              try {
                const response = await axios.get(`https://api.frankfurter.app/latest?amount=${token.balance.balance}&from=USD&to=EUR`);
                token.balance.converted_balance = response.data.rates["EUR"];
              } catch (error) {
                sysLogger.logToDb(
                  "SYSTEM_EVENT",
                  "controllers.fetchAssets.tokenCurrencyConversionFailed",
                  {
                    token_symbol: token.symbol,
                    blockchain,
                    error: error && error.message ? error.message : String(error),
                  },
                  "WARN"
                );
                token.balance.converted_balance = 0;
              }
            } else {
              token.balance.converted_balance = 0;
            }
          }

          if (token.balance.converted_balance) {
            convertedTotalAmount += token.balance.converted_balance;
          }
        }
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
      const possibleTypes = ["wallet_connect", "coin_gecko", "moralis"];
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
    const { blockchains, search = "", page = 1, limit = 20 } = req.query;

    if (!blockchains) {
      return res.status(400).json({
        result: false,
        message: "blockchain query param is required",
      });
    }

    const chains = blockchains.split(",").map((c) => c.trim().toUpperCase());
    const offset = (page - 1) * limit;

    // Fetch metadata from DB (WITHOUT eurPrice)
    const { data, total } = await dao.fetchTokenMetadata({
      chains,
      search,
      limit: Number(limit),
      offset,
    });

    // ----------------------------------------------------
    // ⭐ Fetch USD → EUR conversion rate only once
    // ----------------------------------------------------
    let eurRate = 0.92; // fallback
    try {
      const resRate = await axios.get("https://api.frankfurter.app/latest?from=USD&to=EUR");
      eurRate = resRate.data.rates.EUR;
    } catch (e) {
      console.warn("EUR conversion API failed, using fallback 0.92");
    }

    // ----------------------------------------------------
    // ⭐ Safely convert USD → EUR (skip tiny floating values)
    // ----------------------------------------------------
    const safeConvertToEUR = (usdPrice) => {
      if (!usdPrice || usdPrice <= 0) return null;

      // too small price → skip to avoid 422 / Infinity
      if (usdPrice < 0.000001) return null;

      try {
        return Number((usdPrice * eurRate).toFixed(12));
      } catch {
        return null;
      }
    };

    // attach eurPrice to each row
    const finalData = data.map((token) => ({
      ...token,
      eurPrice: safeConvertToEUR(token.usdPrice),
    }));

    return res.status(200).json({
      result: true,
      message: "Token metadata fetched successfully",
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: finalData,
    });
  } catch (error) {
    console.log("Error while fetching token metadata:", error);

    return res.status(500).json({
      result: false,
      message: "Error while fetching token metadata: " + error.message,
      error: error.message,
    });
  }
};

const initiateSwap = async (req, res) => {
  try {
    const { from_blockchain, from_token_address, to_blockchain, to_token_address, amount, from_wallet_address, to_wallet_address, slippage } = req.body;
    let response;
    try {
      // Gestisci gli indirizzi vuoti convertendoli in null per i token nativi
      const processedFromTokenAddress = from_token_address && from_token_address.trim() !== "" ? from_token_address : null;
      const processedToTokenAddress = to_token_address && to_token_address.trim() !== "" ? to_token_address : null;

      // Costruisci i parametri dello swap
      const swapParams = {
        from: { blockchain: from_blockchain, address: processedFromTokenAddress },
        to: { blockchain: to_blockchain, address: processedToTokenAddress },
        amount: amount,
        fromAddress: from_wallet_address,
        toAddress: to_wallet_address,
        slippage: slippage,
        disableEstimate: true
      };

      // Referral Rango: aggiungi referrerAddress/referrerFee se configurati in .env
      const referrerAddressEnv = process.env.RANGO_REFERRER_ADDRESS;
      const referrerFeeEnv = process.env.RANGO_REFERRER_FEE;

      if (referrerAddressEnv) {
        swapParams.referrerAddress = referrerAddressEnv;
        const feeNumber = referrerFeeEnv ? Number(referrerFeeEnv) : undefined;
        if (feeNumber != null && Number.isFinite(feeNumber)) {
          swapParams.referrerFee = feeNumber;
        }
      }

      response = await rango.swap(swapParams);
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
      const processedFromAddress = from_address && from_address.trim() !== "" ? from_address : null;
      const processedToAddress = to_address && to_address.trim() !== "" ? to_address : null;

      // Costruisci i parametri della richiesta quote
      const quoteParams = {
        from: { blockchain: from_blockchain, address: processedFromAddress },
        to: { blockchain: to_blockchain, address: processedToAddress },
        amount: amount,
        slippage: slippage,
      };

      // Se configurato l'indirizzo referral, aggiungi la fee al quote
      const referrerAddressEnv = process.env.RANGO_REFERRER_ADDRESS;
      const referrerFeeEnv = process.env.RANGO_REFERRER_FEE;

      if (referrerAddressEnv) {
        const feeNumber = referrerFeeEnv ? Number(referrerFeeEnv) : undefined;
        if (feeNumber != null && Number.isFinite(feeNumber)) {
          quoteParams.referrerFee = feeNumber;
        }
      }

      response = await rango.quote(quoteParams);
      response.route.outputAmountEur = (await utils.usdToEurConversion(response.route.outputAmountUsd)) || null;
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
        address: token_address === "" ? null : token_address || null,
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
        message: "request_id and tx_id are required",
        error: "request_id and tx_id are required",
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

const searchTokensUsingCoinpaprika = async (req, res) => {
  try {
    const { q } = req.query;
    const url = `${COINPAPRIKA_BASE_URL}/search?q=${encodeURIComponent(q)}&limit=250&c=currencies`;
    const response = await axios.get(url, coinPaprikaAuthConfig);

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
      `${COINPAPRIKA_BASE_URL}/coins/${token_id}`,
      coinPaprikaAuthConfig
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
      const data = await dao.updateCustomChainUrl(existingCustomUrl.id, user_id, node_url, explorer_url);
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
    const data = await dao.updateCustomChainUrl(id, req.device.id, node_url, explorer_url);
    if (!data) {
      return notFound(res, "Custom chain url not found");
    }

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
    const removed = await dao.deleteCustomChainUrl(id, req.device.id);
    if (!removed) {
      return notFound(res, "Custom chain url not found");
    }

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

const updateDeviceLanguage = async (req, res) => {
  const { user_id, selected_language } = req.body;
  try {
    if (!user_id || !selected_language) {
      return res.status(400).json({
        result: false,
        message: "device_id and selected_language are mandate fields",
      });
    }
    await dao.updateDeviceLanguage(user_id, selected_language);
    return res.status(200).json({
      result: true,
      message: "Language updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error while updating user language",
      error: error.message,
    });
  }
};

const updateDeviceToken = async (req, res) => {
  const { user_id, device_token } = req.body;
  try {
    if (!user_id || !device_token) {
      return res.status(400).json({
        result: false,
        message: "user_id and device_token are mandate fields",
      });
    }
    await dao.udpateDeviceToken(user_id, device_token);
    return res.status(200).json({
      result: true,
      message: "Device token updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error while updating device token",
      error: error.message,
    });
  }
};

module.exports = {
  emailVerification,

  getBalance,

  syncAddresses,
  getUtilsForTransaction,
  filterTransactions,

  deviceLogin,
  insertAddress,
  insertTransaction,

  createNewWallet,
  updateWallet,
  fetchWallets,
  filterAddresses,
  fetchAssets,
  updateAddress,
  fetchLookupUrls,

  getTokenMetaData,

  fetchRangoBlockchainData,
  fetchRangoMetadata,
  initiateSwap,
  getSwapRoutes,
  getTokenBalance,
  checkTxStatus,
  searchTokensUsingCoinpaprika,
  quicknodeTransactionWebhook,
  fetchChainURLs,
  getTokenDetails,
  bookmarkToken,
  removeBookmarkedToken,
  storeCustomChainUrl,
  updateCustomChainUrl,
  deleteCustomChainUrl,

  fetchDappsList,
  fetchTransactionNotification,
  deleteWallets,
  syncWallets,
  updateDeviceLanguage,
  updateDeviceToken,
};