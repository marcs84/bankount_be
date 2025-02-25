const ATMOSFACTORY_CONTRACT_ABI = require("../../../contracts-abi/AtmosFactory.json")  //inserire quello vero

export const SetAtmosFactoryContract = (web3) => {
    return new web3.eth.Contract(
        ATMOSFACTORY_CONTRACT_ABI,
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    )
}