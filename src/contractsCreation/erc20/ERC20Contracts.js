const erc20Contracts = [
    {
        "address": "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
        "abi": require("../../../contracts-abi/tDAI-abi.json"),
        "decimals": 18,
        "image":"https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png?1687143508",
        "symbol":"DAI"
    },
    {
        "address": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        "abi": require("../../../contracts-abi/tDAI-abi.json"),
        "decimals": 18,
        "image":"https://assets.coingecko.com/coins/images/2518/large/weth.png?1628852295",
        "symbol":"WETH"
    },
    {
        "address": "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
        "abi": require("../../../contracts-abi/tUSDC-abi.json"),
        "decimals": 6,
        "image":"https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
        "symbol":"USDC"
    },
    {
        "address": "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
        "abi": require("../../../contracts-abi/tLINK-abi.json"),
        "decimals": 9,
        "image":"https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700",
        "symbol":"LINK" 
    },
];

module.exports = {
    erc20Contracts
}