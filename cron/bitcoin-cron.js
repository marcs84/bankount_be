const cron = require("node-cron");
const {getLatestBlock, getLatestTransactionsAll} = require("../lib/bitcoin/bitcoin-core");
const { getLatestBlock: getLatestBlockQuickNode, getLatestTransactionsAll: getLatestTransactionsAllQuickNode, getRawTransaction} = require("../lib/bitcoin/bitcoin-core-quicknode");

const dao = require("../src/dao");

var semaphore = 1;
const network = "TESTNET";

// Esporta la funzione cron.schedule per rendere visibile il cron job ad altre classi
const startBitcoinCron = () => {
  cron.schedule("*/1 * * * * *", async () => {
    if (semaphore == 1) {
      semaphore = 0;

      try {
        
        const addresses = await dao.getAddressesByCointype("BTC");
        for (const addressRow of addresses) {
          const { address } = addressRow
          let startBlock,transactions;
          if (process.env.QUICKNODE_IS_ACTIVE) {
            console.log(address)
            startBlock = await getLatestBlockQuickNode(network);
            transactions = await getLatestTransactionsAllQuickNode(address,network);
            if(!transactions) {
              continue
            }
            for (const transaction of transactions) {
            const { type, chain, token, from_address, destination_address, amount, tx, data_insert, block_number } = transaction;
            let txExists= await dao.transactionExists(tx)
            let userIdFrom = await dao.getUserIdByAddress(from_address);
            let userIdDest = await dao.getUserIdByAddress(destination_address);
            if (!txExists) {
              if(userIdFrom && userIdDest){
                await dao.insertTransaction(type, chain, token, userIdFrom, from_address, tx, destination_address, amount * -1, data_insert, block_number);
              }
              else{
                if (userIdFrom) {
                  await dao.insertTransaction(type, chain, token, userIdFrom, from_address, tx, destination_address, amount * -1, data_insert, block_number);
                }
                if (userIdDest) {
                  await dao.insertTransaction(type, chain, token, userIdDest, from_address, tx, destination_address, amount, data_insert, block_number);
                }
              }
            }
            
          }
            
            
          }
      }
      } catch (error) {
        console.error("Errore durante l'esecuzione del cron Bitcoin:", error);
      } finally {
        // Rilascia il semaforo anche in caso di errore
        semaphore = 1;
      }
    } else {
      console.log("Processo già in esecuzione, salto questa esecuzione.");
    }
  });
};

module.exports = { startBitcoinCron };
