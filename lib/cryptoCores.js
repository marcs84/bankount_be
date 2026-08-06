const btcCore =require("./bitcoin/bitcoin-core")
const ethCore =require("./ethereum/ethereum-core")
const bnbCore =require("./binance/binance-core")
const solCore =require("./solana/solana-core")

const btcQuicknodeCore =require("./bitcoin/bitcoin-core-quicknode")

const cryptoCores = {
    bitcoinCore: {
      btcCore,
      btcQuicknodeCore
    },
    ethereumCore: {
      ethCore
    },
    binanceCore:{
      bnbCore
    },
    solanaCore: {
      solCore
    }
}
  
module.exports = cryptoCores;

