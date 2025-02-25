const btcCore =require("./bitcoin/bitcoin-core")
const ethCore =require("./ethereum/ethereum-core")
const ERC20Core =require("./ethereum/erc20-core")
const bnbCore =require("./binance/binance-core")
const BEP20Core =require("./binance/bep20-core")
const solCore =require("./solana/solana-core")
const SLPCore = require("./solana/slp-core")
const xmrCore =require("./monero/monero-core")
const mnemonicGen =require("./monero/mnemonic")

const btcQuicknodeCore =require("./bitcoin/bitcoin-core-quicknode")

const cryptoCores = {
    bitcoinCore: {
      btcCore,
      btcQuicknodeCore
    },
    ethereumCore: {
      ethCore,
      ERC20Core
    },
    binanceCore:{
      bnbCore,
      BEP20Core
    },
    solanaCore: {
      solCore,
      SLPCore
    },
    moneroCore: {
      xmrCore,
      mnemonicGen
    }
}
  
module.exports = cryptoCores;

