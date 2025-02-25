const ATMOSROUTER_CONTRACT_ABI = require("../../../contracts-abi/AtmosRouter.json") //inserire quello vero
const factoryAddress="0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"  //factoryAddress for Goerli
const WETHAddress="0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"    //WETHAddress for Goerli
const SetAtmosRouterContract = (web3) => {
    return new web3.eth.Contract(
        ATMOSROUTER_CONTRACT_ABI,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        {
            data: ATMOSROUTER_CONTRACT_ABI.bytecode,
            arguments: [factoryAddress, WETHAddress]
        }
    )
}

module.exports={
    SetAtmosRouterContract
}