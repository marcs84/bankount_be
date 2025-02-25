const {Web3} = require('../../src/utils');
const {getContractData,SetTokenContract} = require("../../src/contractsCreation/utils/contract-utils")

const web3Mainet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_ETH_MAIN_URL
    );
  } else {
    return new Web3(
      "https://mainnet.infura.io/v3/7c4cec27d7954603b6833e7e585d1565"
    );
  }
};

const web3Testnet = () => {
  if (process.env.QUICKNODE_IS_ACTIVE) {
    return new Web3(
      process.env.QUICKNODE_ETH_TEST_URL
    );
  } else {
    return new Web3(
      "https://goerli.infura.io/v3/7c4cec27d7954603b6833e7e585d1565"
    );
  }
};

function setWeb3Instance(network) {
  let web3;

  if (network === "TESTNET") {
      web3 = web3Testnet();
  } else {
      web3 = web3Mainet();
  }

  return web3;
}


// Check if the provided Web3 instance is valid
function isValidWeb3Instance(web3Instance) {
  return web3Instance && typeof web3Instance === "object" && web3Instance.eth && typeof web3Instance.eth === "object";
}

// Check if the provided Binance address is valid
function isValidEthereumAddress(address) {
  const web3 = new Web3();
  return web3.utils.isAddress(address);
}

async function getTokenBalance(symbol, account,network) {
  try {
      let web3
      web3= setWeb3Instance(network)
      if (!isValidWeb3Instance(web3)) {
          throw new Error("Invalid web3 instance for Testnet");
      }

      if (!isValidEthereumAddress(account)) {
          throw new Error("Invalid Binance address");
      }

      const contractData = getContractData(symbol);
      if (!contractData) {
          throw new Error("Contract data not found for the specified token name");
      }

      const { address, abi, decimals } = contractData;
      const ERC20Contract = SetTokenContract(web3, address, abi);

      console.log("Contract............ ", ERC20Contract.methods.balanceOf(account))
      try {
        const balance = await ERC20Contract.methods.balanceOf(account).call();
        const balanceStr = geBalanceInDecimals(balance, decimals,web3);
        console.log("balanceStr................", balanceStr);
        return balanceStr;
      } catch (error) {
        return "0"
      } 
  } catch (error) {
      console.error("Error while getting token balance:", error);
      throw error;
  }
}

async function transferToken(symbol, toAccount, fromAccount, amount, privateKey, network) {
  try {
      let web3
      web3= setWeb3Instance(network)
      if (!isValidWeb3Instance(web3)) {
          throw new Error("Invalid web3 instance for Testnet");
      }

      if (!isValidEthereumAddress(toAccount) || !isValidEthereumAddress(fromAccount)) {
          throw new Error("Invalid Binance address");
      }

      console.log(symbol)
      const contractData = getContractData(symbol);
      if (!contractData) {
          throw new Error("Contract data not found for the specified token name");
      }

      const { address, abi, decimals } = contractData;
      const ERC20Contract = SetTokenContract(web3, address, abi);

      const amountInDecimals = getAmountToSendInDecimals(amount, decimals,web3);

      const gas = await ERC20Contract.methods.transfer(toAccount, amountInDecimals).estimateGas();
      const gasPrice = await web3.eth.getGasPrice();

      if (!gas) {
          throw new Error("Gas estimation failed");
      }

      if (!gasPrice) {
          throw new Error("Gas price retrieval failed");
      }

      // Verifica i fondi dell'account del mittente
      const balance = await web3.eth.getBalance(fromAccount);
      const transactionCost = gas * gasPrice;

      if (parseFloat(balance) < parseFloat(transactionCost)) {
          throw new Error("Insufficient balance to cover transaction cost");
      }

      // Crea la transazione
      const data = await ERC20Contract.methods.transfer(toAccount, amountInDecimals).encodeABI();
      const rawTransaction = {
          to: address,
          gas,
          gasPrice,
          data
      };

      let signedTx = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
      let obj = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      return obj;
  } catch (error) {
      throw error;
  }
}

function getAmountToSendInDecimals(amount,decimals,web3){
  let amountToSend
  if (decimals === 18) {
    amountToSend = web3.utils.toWei(amount.toString(), 'ether');
  }
  if (decimals === 8) {
    amountToSend = web3.utils.toWei(amount.toString(), 'gwi');
  }
  if (decimals === 6) {
    amountToSend = web3.utils.toWei(amount.toString(), 'mwei');
  }
  return amountToSend.toString()
}


function geBalanceInDecimals(amount,decimals,web3){
  console.log(web3.utils)
  let divisor = web3.utils.toBN('10').pow(web3.utils.toBN(decimals)); 

  if (decimals === 18) {
    divisor = web3.utils.toBN('10').pow(web3.utils.toBN(decimals)); 
  }
  if (decimals === 8) {
    divisor = web3.utils.toBN('10').pow(web3.utils.toBN(decimals)); 
  }
  if (decimals === 6) {
    divisor = web3.utils.toBN(amount).div(divisor);
  }
  let convertedBalance= web3.utils.toBN(amount).div(divisor);
  return convertedBalance.toString(10)
}



module.exports={
  getTokenBalance,
  transferToken
}