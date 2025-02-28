const service = require("../service");
const { solanaWeb3 } = require('../../src/utils');
const dao = require("../dao");
const crypto = require("crypto");
const moment = require("moment");

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
    console.log('resData', resData)
    console.log('resData', resData)
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

const fetchLookupUrls = async (req, res) => {
  try {
    const data = {
      quicknode_is_active: process.env.QUICKNODE_IS_ACTIVE == 'true' ? true : false,
    };
    const { coin_type } = req.query;
    switch (coin_type) {
      case "BTC": {
        data["quicknode_testnet_url"] = process.env.QUICKNODE_BTC_TEST_URL;
        data["quicknode_mainnet_url"] = process.env.QUICKNODE_BTC_MAIN_URL;
        data['testnet'] = process.env.BITCORE_TEST_URL;
        data['mainnet'] = process.env.BITCORE_MAIN_URL;
        break;
      }

      case "ETH": {
        data["quicknode_testnet_url"] = process.env.QUICKNODE_ETH_TEST_URL;
        data["quicknode_mainnet_url"] = process.env.QUICKNODE_ETH_MAIN_URL;
        data['testnet'] = process.env.ETH_TEST_URL;
        data['mainnet'] = process.env.ETH_MAIN_URL;
        break;
      }

      case "BNB": {
        data['quicknode_testnet_url'] = process.env.QUICKNODE_BNB_TEST_URL;
        data['quicknode_mainnet_url'] = process.env.QUICKNODE_BNB_MAIN_URL;
        data['testnet'] = process.env.BNB_TEST_URL;
        data['mainnet'] = process.env.BNB_MAIN_URL;
        break;
      }

      case "SOL": {
        data['quicknode_testnet_url'] = process.env.QUICKNODE_SOL_TEST_URL;
        data['quicknode_mainnet_url'] = process.env.QUICKNODE_SOL_MAIN_URL;
        data['testnet'] = process.env.SOL_TEST_URL;
        data['mainnet'] = solanaWeb3.clusterApiUrl('mainnet-beta');
        break;
      }
    }

    return res.status(200).json({
        result: true,
        message: 'Lookup URLs fetched successfully',
        data
    })
  } catch (error) {
    console.log("Error while fetching lookup urls : ", error);
    return res.status(500).json({
      result: false,
      message: "An error occurred while updating address name : " + error.message,
      error: error.message,
    });
  }
};

module.exports = {
  getAddresses,
  getBalance,
  getAllBalances,
  syncAddresses,
  getUtilsForTransaction,
  filterTransactions,
  doTransactionBetweenSameBC,
  fetchLookupUrls,
};
