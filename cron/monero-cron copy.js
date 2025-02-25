const dao = require("../src/dao");
const { monerojs } = require("../src/utils");
// Esporta la funzione cron.schedule per rendere visibile il cron job ad altre classi
const fs = require('fs');
const path = require('path');

const folderPath = 'C:/Users/alexc/OneDrive/Documenti/GitHub/wallet_bankount/lib/monero/wallets';


function readAndFilterFiles(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('Errore durante la lettura della cartella:', err);
        reject(err);
      }
    
      const filteredFiles = files.filter((file) => {
        const fileName = path.parse(file).name;
        const fileExt = path.parse(file).ext;
        return (
          fileName.includes('MoneroWallet') &&
          fileExt !== '.keys' &&
          fileExt !== '.txt'
        );
      });
    
      resolve(filteredFiles);
    });
  });
}
async function startMoneroCron() {
    try {
      
    const filteredFiles = await readAndFilterFiles(folderPath);
    console.log('File filtrati senza duplicati:', filteredFiles);

      filteredFiles.forEach(async walletPath => {
        let wallet = await monerojs.openWalletFull({
          path: `./lib/monero/wallets/${walletPath}`,
          password: "MoneroRoot",
          networkType: monerojs.MoneroNetworkType.TESTNET,
          serverUri: "http://127.0.0.1:28081",
        });
  
        let amt = -1 + "%";
        await wallet.sync(
          new (class extends monerojs.MoneroWalletListener {
            async onSyncProgress(
              height,
              startHeight,
              endHeight,
              percentDone,
              message
            ) {
              let progress = Math.round(parseFloat(percentDone.toString()) * 100) + "%";
              if (progress !== amt) {
                amt = progress;
                console.log("Synchronizing", {
                  start: startHeight,
                  height: height,
                  end: endHeight,
                  progress: amt,
                });
              }
            }
          })()
        );
  
        await wallet.save();
        console.log("\nWallet synchronized height: ", await wallet.getHeight());
        
        await wallet.startSyncing(1000);
        console.log("Wallet synchronizing: every second");

        let from_address,
          destination_address,
          tx,
          amount,
          data_insert,
          block_number;
  
        let txExists = await dao.transactionExists(tx);
        let userIdFrom = 237; //await dao.getUserIdByAddress(from_address);
        let userIdDest = await dao.getUserIdByAddress(destination_address);
        await wallet.addListener(
          new (class extends monerojs.MoneroWalletListener {
            async onOutputReceived(output) {
              console.log(output);
              amount = output.state.amount.toString();
              from_address = await wallet.getAddress(
                output.state.accountIndex,
                output.state.subaddressIndex
              );
              destination_address = from_address;
              let timestamp = output.state.tx.state.lastRelayedTimestamp;
              data_insert = new Date(timestamp * 1000);
              block_number = await wallet.getHeight();
              tx = output.state.tx.state.hash;
              console.log(output.state.tx);
              console.log("Transaction-in: ", await output.getAmount());
  
              if (!txExists) {
                if (userIdFrom && userIdDest) {
                  await dao.insertTransaction(
                    "COIN",
                    "XMR",
                    "XMR",
                    userIdFrom,
                    from_address,
                    tx,
                    destination_address,
                    amount * -1,
                    data_insert,
                    block_number
                  );
                } else {
                  if (userIdFrom) {
                    await dao.insertTransaction(
                      "COIN",
                      "XMR",
                      "XMR",
                      userIdFrom,
                      from_address,
                      tx,
                      destination_address,
                      amount * -1,
                      data_insert,
                      block_number
                    );
                  }
                  if (userIdDest) {
                    await dao.insertTransaction(
                      "COIN",
                      "XMR",
                      "XMR",
                      userIdDest,
                      from_address,
                      tx,
                      destination_address,
                      amount,
                      data_insert,
                      block_number
                    );
                  }
                }
              }
            }
            async onOutputSpent(output) {
              console.log(output);
              amount = output.state.amount.toString();
              from_address = await wallet.getAddress(
                output.state.accountIndex,
                output.state.subaddressIndex
              );
              destination_address = from_address;
              let timestamp = output.state.tx.state.lastRelayedTimestamp;
              data_insert = new Date(timestamp * 1000);
              console.log(data_insert)
              block_number = await wallet.getHeight();
              tx = output.state.tx.state.hash;
  
              console.log("Transaction-out: ", await output.getAmount());
  
              if (!txExists) {
                if (userIdFrom && userIdDest) {
                  await dao.insertTransaction(
                    "COIN",
                    "XMR",
                    "XMR",
                    userIdFrom,
                    from_address,
                    tx,
                    destination_address,
                    amount * -1,
                    data_insert,
                    block_number
                  );
                } else {
                  if (userIdFrom) {
                    await dao.insertTransaction(
                      "COIN",
                      "XMR",
                      "XMR",
                      userIdFrom,
                      from_address,
                      tx,
                      destination_address,
                      amount * -1,
                      data_insert,
                      block_number
                    );
                  }
                  if (userIdDest) {
                    await dao.insertTransaction(
                      "COIN",
                      "XMR",
                      "XMR",
                      userIdDest,
                      from_address,
                      tx,
                      destination_address,
                      amount,
                      data_insert,
                      block_number
                    );
                  }
                }
              }
            }
            async onBalancesChanged(newBalance, newUnlockedBalance) {
              console.log(
                "Balance changed: ",
                await newBalance.toString(),
                await newUnlockedBalance.toString()
              );
            }
          })()
        );
  
        // Pausa asincrona per evitare il sovraccarico del ciclo
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      
    } catch (error) {
      console.error("Si è verificato un errore:", error);
      // Gestisci l'errore come preferisci, ad esempio inviando una notifica
    }
  }

startMoneroCron().catch((err) => {
  console.error("Errore fatale:", err);
});

module.exports = { startMoneroCron };
