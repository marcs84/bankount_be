const { erc20Contracts } = require("../erc20/ERC20Contracts")
const { SLPtokens } = require("../slp/SLPtokens")

//ETHEREUM AND BINANCE
function getContractData(symbol) {
    const coin = erc20Contracts.find(contract => contract.symbol === symbol);
    if (coin) {
        const { address, abi, decimals } = coin;
        return { address, abi, decimals };
    }
    return null; // Restituisce null se la moneta non è presente
}

function SetTokenContract(web3, address, abi) {
    if (!abi) {
        throw new Error(`ABI not found for address: ${address}`);
    }

    if (!address) {
        throw new Error(`Address not found for contract`);
    }

    return new web3.eth.Contract(
        abi,
        address
    );
};


//SOLANA
function getSolanaTokenObj(coinName) {
    const coin = SLPtokens[coinName];
    if (coin) {
        const { address, mintAuthority, freezeAuthority, decimals } = coin;
        return { address, mintAuthority, freezeAuthority, decimals };
    }
    return null; // Restituisce null se la moneta non è presente n
}


module.exports = {
    getContractData,
    SetTokenContract,
    getSolanaTokenObj,
}