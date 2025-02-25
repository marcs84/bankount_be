const configurationAtmosPair  = require("../../../contracts-abi/AtmosPair.json") //inserire quello vero
const ATMOSPAIR_CONTRACT_ABI = configurationAtmosPair.abi

export const SetAtmosPairContract = (web3,address) => {
    return new web3.eth.Contract(
        ATMOSPAIR_CONTRACT_ABI,
        address
    )
}