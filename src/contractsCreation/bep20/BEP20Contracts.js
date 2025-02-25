const bep20Contracts = [
    {
        "address": "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
        "abi": require("../../../contracts-abi/tDAI-abi.json"),
        "decimals": 18,
        "symbol":"DAI",
        "image":"https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png?1687143508",
    },
    {
        "address": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        "abi": require("../../../contracts-abi/tWBNB-abi.json"),
        "decimals": 18,
        "image": "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
        "symbol":"WBNB"
    },
    {
        "address": "0x64544969ed7EBf5f083679233325356EbE738930",
        "abi": require("../../../contracts-abi/tUSDC-abi.json"),
        "decimals": 6,
        "symbol":"USDC",
        "image":"https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    }
];

module.exports = {
    bep20Contracts
}