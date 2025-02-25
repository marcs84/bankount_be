const cron = require('node-cron');
const { getLatestTransactionsAll, getLatestBlock} = require('../lib/ethereum/ethereum-core');
const dao = require('../src/dao');
// Esporta la funzione cron.schedule per rendere visibile il cron job ad altre classi
var semaphore = 1;

const startEthereumCron = () => {
  cron.schedule('*/1 * * * *', async () => {
    if (semaphore == 1) {

      semaphore = 0;

      try {
        const blockFirst = await dao.getLastSynchronizedBlock("ethereum");
        const startBlock = await getLatestBlock(process.env.NETWORK_TYPE);
        const transactions = await getLatestTransactionsAll(startBlock,blockFirst, process.env.NETWORK_TYPE);
        
        for (const transaction of transactions) {
          const { type, chain, token, from_address, destination_address, amount, tx, data_insert, block_number } = transaction;
          
          console.log("Transaction:", tx);
          
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
  
        let resultUpdate = await dao.updateBlocks("ethereum", startBlock);
        if(resultUpdate) {
          console.log("Last Block Updated")
        }
      } catch (error) {
        console.error('Errore durante l\'esecuzione del cron Ethereum:', error);
      } finally {
        // Rilascia il semaforo anche in caso di errore
        semaphore = 1;
      }
    } else {
      console.log('Processo già in esecuzione, salto questa esecuzione.');
    }    
  });
};

module.exports = { startEthereumCron };
