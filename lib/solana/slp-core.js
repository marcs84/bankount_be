
const { SLPtokens } = require('../../src/contractsCreation/slp/SLPtokens');
const { getSolanaTokenObj } = require('../../src/contractsCreation/utils/contract-utils');
const { solanaWeb3 } = require('../../src/utils');
const { solanaSPLtoken } = require("../../src/utils")
const dao = require("../../src/dao")
// Seleziona la rete di test
const web3Testnet = new solanaWeb3.Connection("https://solitary-orbital-ensemble.solana-testnet.discover.quiknode.pro/a7809f2bdc64d5246dbf41ebb95a62e8bb2cab69/");
const web3Mainnet = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'))
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl('testnet'),
  'confirmed'
);



async function createAssociatedTokenAccount(address, keyPairPayer, keyPairOwner) {
  try {
    const mint = new solanaWeb3.PublicKey(address);
    console.log("MINT:")
    console.log(mint)


    let tokenAccount = await solanaSPLtoken.getAssociatedTokenAddress(
      mint,
      keyPairOwner.publicKey,
      false,
    )
    console.log(tokenAccount)
    const tx = new solanaWeb3.Transaction()
    tx.add(
      solanaSPLtoken.createAssociatedTokenAccountInstruction(
        keyPairPayer.publicKey,
        tokenAccount,
        keyPairOwner.publicKey, // owner
        mint, // mint
        solanaSPLtoken.TOKEN_PROGRAM_ID
      )
    );
    const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
    tx.feePayer = keyPairOwner.publicKey;
    tx.recentBlockhash = blockHash
    tx.partialSign(keyPairOwner, keyPairPayer)
    console.log(tx)

    let txHash = await connection.sendRawTransaction(tx.serialize())
    console.log(`TxHash: ${txHash}`);

    return (tokenAccount)
  }
  catch (e) {
    console.log(new Error(e))
  }

}


async function getTokenBalance(tokenName) {
  try {
    const { address } = getSolanaTokenObj(tokenName)
    const token = new solanaWeb3.PublicKey(address);
    console.log(token)
    let tokenAccountBalance = await connection.getTokenAccountBalance(token)
    console.log(`decimals: ${tokenAccountBalance.value.decimals}, amount: ${tokenAccountBalance.value.amount}`);
    let convertedBalance = getBalanceInDecimals(tokenAccountBalance.value.amount)
    return convertedBalance
  }
  catch (e) {
    return ("Error: " + e)
  }
}

async function transferToken(coinName, ownerAddress, fromAccount, fromTokenAccount, toTokenAccount, amount) {
  try {
    const { address, abi, decimals } = getContractData(coinName);
    const mint = new solanaWeb3.PublicKey(address);
    const myAccount = new solanaWeb3.PublicKey(ownerAddress);
    const fromPublicKey = new solanaWeb3.PublicKey(fromAccount);
    let tx = new Transaction();
    tx.add(
      createTransferCheckedInstruction(
        fromTokenAccount, // from
        mint, // mint
        toTokenAccount, // to
        fromPublicKey, // from's owner
        amount, // amount
        decimals // decimals
      )
    );
    console.log(`txhash: ${await connection.sendRawTransaction(tx, [feePayer, alice])}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const activateTokenHandle = (id, KeypairAccountPayer, KeypairAccount) => {
  try {
    Object.keys(SLPtokens).forEach(async (tokenName) => {
      const { address, decimals } = getSolanaTokenObj(tokenName)
      console.log(`Processing token: ${tokenName}`);

      let associatedTokenAccount = await createAssociatedTokenAccount(address, KeypairAccountPayer, KeypairAccount);
      let results = await dao.insertAssociatedTokenAccount(id, tokenName, decimals, associatedTokenAccount)
      console.log(results)
    });
    return true
  } catch (error) {
    throw ("Error: " + error)
  }
}


function getAmountToSendInDecimals(amount, decimals) {
  let amountToSend = amount * Math.pow(10, decimals);
  return amountToSend.toString();
}

function getBalanceInDecimals(amount, decimals) {
  let divisor = Math.pow(10, decimals);
  let convertedBalance = amount / divisor;
  return convertedBalance.toString();
}


module.exports = {
  createAssociatedTokenAccount,
  transferToken,
  getTokenBalance,
  activateTokenHandle
}