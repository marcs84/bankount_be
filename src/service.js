const utils = require("./utils");
const dao = require("./dao");
const { Redis } = require("ioredis");
const tranasactionType = require("./server/tranasactionType");
const cryptoCores = require("../lib/cryptoCores");
const { RangoClient } = require("rango-sdk-basic");
const rango = new RangoClient(process.env.RANGO_API_KEY);
const sysLogger = require("./sysLogger");
const { PublicKey } = require("@solana/web3.js");
const { default: axios } = require("axios");

// Con la cache irraggiungibile i comandi verrebbero accodati e riprovati per
// decine di secondi, e ogni richiesta resterebbe appesa ad aspettarli: qui
// devono fallire subito, perche' chi li usa ha un'altra strada. La
// riconnessione continua per conto suo, e la cache riprende quando torna.
const redisClient = new Redis({
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 1000,
  retryStrategy: (tentativi) => Math.min(tentativi * 200, 5000),
});

redisClient.on("error", (error) => {
  console.error(`redis non raggiungibile: ${error && error.message ? error.message : error}`);
});

const logServiceDbError = (action, error, meta = {}) => {
  try {
    sysLogger.logToDb(
      "DB_QUERY_ERROR",
      action,
      {
        error: error && error.message ? error.message : String(error),
        ...meta,
      },
      "ERROR"
    );
  } catch (e) {}
};

/// Il saldo come lo danno i nodi: il numero, e accanto le **unita' base**
/// intere -- wei, lamport, satoshi -- che non passano da una virgola
/// mobile.
///
/// Serve perche' con diciotto decimali un double non basta: un saldo di
/// 54147802024792520 wei sta sei volte oltre 2^53, e lo stesso double si
/// scrive in due modi diversi a seconda di come lo si stampa. Il numero
/// resta per chi gia' lo legge; chi vuole il valore esatto ha
/// `unitaBase`.
const leggiSaldo = (cointype, address, network, user_id, wallet_id) => {
  const result = {};
  return new Promise(async (resolve, reject) => {
    let balance = 0;

    try {
      switch (cointype) {
        case "BTC": {
          if (process.env.QUICKNODE_IS_ACTIVE) {
            await fetchLookupUrls(user_id, wallet_id, cointype, result);
            let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
            balance = await cryptoCores.bitcoinCore.btcQuicknodeCore.getBalance(address, network, url);
          } else {
            balance = await cryptoCores.bitcoinCore.btcCore.getBalance(address, network);
          }
          break;
        }

        case "ETH": {
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.ethereumCore.ethCore.getBalance({
            address: address,
            network: network,
            url,
          });
          break;
        }

        case "BNB": {
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.binanceCore.bnbCore.getBalance({
            address: address,
            network: network,
            url,
          });
          break;
        }

        case "SOL": {
          const publicKey = new PublicKey(address);
          await fetchLookupUrls(user_id, wallet_id, cointype, result);
          let url = network === "TESTNET" ? result.quicknode_testnet_url : result.quicknode_mainnet_url;
          balance = await cryptoCores.solanaCore.solCore.getBalance({
            publicKey: publicKey,
            network: network,
            url,
          });
          break;
        }

        // case "XMR": {
        //   let addressDB = await dao.getAddressByAddress(address);
        //   let wallet = await openWallet("MoneroRoot", addressDB.idUtente, addressDB.index, network);
        //   balance = await cryptoCores.moneroCore.xmrCore.getBalance(wallet);
        //   break;
        // }

        default: {
          //coin non valido
          reject(new Error("Coin non valido"));
        }
      }

      resolve(balance);
    } catch (error) {
      reject(error);
    }
  });
};

/* Pericolosa */
/* TO-DO aggiungere pagginazione su database */

const devicelogin = (identifier, passkey, device_token, selected_language) => {
  return new Promise((resolve, reject) => {
    dao
      .verifyDevice(identifier, passkey, device_token, selected_language)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const insertAddress = (userData) => {
  return new Promise((resolve, reject) => {
    dao
      .insertUserAddress(userData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const findDeviceDetails = (id) => {
  return new Promise((resolve, reject) => {
    dao
      .verifyDeviceDetails(id)
      .then((deviceDetails) => {
        resolve(deviceDetails);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// const insertTransactionDetails = (data) => {
//   return new Promise((resolve, reject) => {
//     let date = new Date();
//     dao
//       .insertTransactionNew(
//         data.chain,
//         data.token,
//         data.address_id,
//         data.from_address,
//         data.tx,
//         data.destination_address,
//         data.amount,
//         date,
//         data.block_number,
//         data.idUtente,
//         data.network_type,
//         data.wallet_id
//       )
//       .then((transactionDetails) => {
//         resolve(transactionDetails);
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };

const DURATA_CACHE_PREZZI = 300;

const registraGuasto = (evento, dettagli) => {
  sysLogger.logToDb("SYSTEM_ERROR", evento, dettagli, "ERROR");
};

// La chiave demo vale sull'indirizzo aperto, quella a pagamento sul suo:
// mandare l'intestazione dell'una all'altro equivale a non mandarla, e si
// resta ai limiti di chi non ha chiave.
const intestazioneCoinGecko = () => {
  const chiave = process.env.COIN_GECKO_API_KEY;
  if (!chiave) return {};

  return String(process.env.COIN_GECKO_COIN_PRICE_URI || "").includes("pro-api.coingecko.com")
    ? { "x-pro-cg-api-key": chiave }
    : { "x-cg-demo-api-key": chiave };
};

// La cache accelera, non decide: se non risponde si interroga la fonte.
const leggiPrezziInCache = async (chiave) => {
  try {
    const valori = await redisClient.get(chiave);
    return valori ? JSON.parse(valori) : null;
  } catch (error) {
    registraGuasto("service.getLatestCoinRates.cacheUnavailable", {
      chiave,
      error: error && error.message ? error.message : String(error),
    });
    return null;
  }
};

const scriviPrezziInCache = async (chiave, prezzi) => {
  try {
    const durata = Number.parseInt(process.env.COIN_GECKO_CACHE_INTERVAL, 10);
    await redisClient.set(chiave, JSON.stringify(prezzi), "EX", Number.isFinite(durata) && durata > 0 ? durata : DURATA_CACHE_PREZZI);
  } catch (error) {
    registraGuasto("service.getLatestCoinRates.cacheNotWritten", {
      chiave,
      error: error && error.message ? error.message : String(error),
    });
  }
};

/// Il saldo nella forma che le applicazioni **gia' installate** leggono:
/// un oggetto per Bitcoin, un numero per le altre catene.
///
/// I core restituiscono ormai tutti un oggetto, e quella forma si
/// ricompone qui. Cambiarla significherebbe rompere ogni telefono gia' in
/// giro, che da `/api/getBalance` si aspetta ancora un numero.
const getBalance = async (cointype, address, network, user_id, wallet_id) => {
  const saldo = await leggiSaldo(cointype, address, network, user_id, wallet_id);
  return cointype === "BTC" ? saldo : saldo.balance;
};

const getLatestCoinRates = async (currency) => {
  const valuta = String(currency || "").toLowerCase();
  if (!valuta) return null;

  const chiaveCache = `cached_coin_prices_${valuta}`;
  const inCache = await leggiPrezziInCache(chiaveCache);
  if (inCache) return inCache;

  try {
    const response = await axios.get(`${process.env.COIN_GECKO_COIN_PRICE_URI}?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=${valuta}`, {
      headers: {
        accept: "application/json",
        ...intestazioneCoinGecko(),
      },
    });

    await scriviPrezziInCache(chiaveCache, response.data);
    return response.data;
  } catch (error) {
    registraGuasto("service.getLatestCoinRates.failed", {
      currency,
      error: error && error.message ? error.message : String(error),
    });
    return null;
  }
};

const COIN_GECKO_IDS = {
  Ethereum: "ethereum",
  ETH: "ethereum",
  Solana: "solana",
  SOL: "solana",
  Bitcoin: "bitcoin",
  BTC: "bitcoin",
  Binance: "binancecoin",
  BNB: "binancecoin",
  BSC: "binancecoin",
};

// Restituisce null, non un valore assente, quando la conversione non e'
// possibile: una catena senza quotazione o un importo mancante non devono
// propagare undefined o NaN a chi consuma l'API.
const convertCoinsToAmount = (coinType, coins, currency, coinRates) => {
  const id = COIN_GECKO_IDS[coinType];
  if (!id || !coinRates || !Number.isFinite(coins)) return null;

  const quote = coinRates[id];
  const rate = quote ? quote[String(currency || "").toLowerCase()] : undefined;
  if (!Number.isFinite(rate)) return null;

  const converted = rate * coins;
  return Number.isFinite(converted) ? converted : null;
};

const storeAddressInQuicknode = async (address) => {
  try {
    const response = await axios.post(
      "https://api.quicknode.com/kv/rest/v1/lists",
      {
        key: "registered-addresses",
        items: [address],
      },
      { headers: { Accept: "application/json", "Content-Type": "application/json", "x-api-key": process.env.QUICKNODE_API_KEY } }
    );
    if (response.data.code === 200) {
      return true;
    }
  } catch (error) {
    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "service.storeAddressInQuicknode.failed",
      {
        address,
        error: error && error.message ? error.message : String(error),
      },
      "ERROR"
    );
    return false;
  }
};

const fetchLookupUrls = async (user_id, wallet_id, coin_type, data) => {
  const customUrls = await dao.fetchCustomChainUrlsByWallet(user_id, wallet_id);

  const existigNodeUrl = (blockchain_name) => {
    const index = customUrls.findIndex((obj) => obj.blockchain_name === blockchain_name);
    if (index !== -1) {
      return customUrls[index].node_url;
    } else {
      return null;
    }
  };

  const existingExplorerUrl = (blockchain_name) => {
    const index = customUrls.findIndex((obj) => obj.blockchain_name === blockchain_name);
    if (index !== -1) {
      return customUrls[index].explorer_url;
    } else {
      return null;
    }
  };

  if (coin_type) {
    data["quicknode_is_active"] = process.env.QUICKNODE_IS_ACTIVE == "true" ? true : false;
    switch (coin_type) {
      case "BTC": {
        data["quicknode_testnet_url"] = existigNodeUrl("Bitcoin Testnet") ?? process.env.QUICKNODE_BTC_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Bitcoin Mainnet") ?? process.env.QUICKNODE_BTC_MAIN_URL;
        data["explorer_testnet_url"] = existingExplorerUrl("Bitcoin Testnet") ?? process.env.QUICKNODE_BTC_TEST_EXPLORER_URL;
        data["explorer_mainnet_url"] = existingExplorerUrl("Bitcoin Mainnet") ?? process.env.QUICKNODE_BTC_MAIN_EXPLORER_URL;
        data["testnet"] = process.env.BITCORE_TEST_URL ?? null;
        data["mainnet"] = process.env.BITCORE_MAIN_URL ?? null;
        break;
      }

      case "ETH": {
        data["quicknode_testnet_url"] = existigNodeUrl("Ethereum Testnet") ?? process.env.QUICKNODE_ETH_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Ethereum Mainnet") ?? process.env.QUICKNODE_ETH_MAIN_URL;
        data["explorer_testnet_url"] = existingExplorerUrl("Ethereum Testnet") ?? process.env.QUICKNODE_ETH_TEST_EXPLORER_URL;
        data["explorer_mainnet_url"] = existingExplorerUrl("Ethereum Mainnet") ?? process.env.QUICKNODE_ETH_MAIN_EXPLORER_URL;
        data["testnet"] = process.env.ETH_TEST_URL ?? null;
        data["mainnet"] = process.env.ETH_MAIN_URL ?? null;
        break;
      }

      case "BNB": {
        data["quicknode_testnet_url"] = existigNodeUrl("Binance Testnet") ?? process.env.QUICKNODE_BNB_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Binance Mainnet") ?? process.env.QUICKNODE_BNB_MAIN_URL;
        data["explorer_testnet_url"] = existingExplorerUrl("Binance Testnet") ?? process.env.QUICKNODE_BNB_TEST_EXPLORER_URL;
        data["explorer_mainnet_url"] = existingExplorerUrl("Binance Mainnet") ?? process.env.QUICKNODE_BNB_MAIN_EXPLORER_URL;
        data["testnet"] = process.env.BNB_TEST_URL ?? null;
        data["mainnet"] = process.env.BNB_MAIN_URL ?? null;
        break;
      }

      case "SOL": {
        data["quicknode_testnet_url"] = existigNodeUrl("Solana Testnet") ?? process.env.QUICKNODE_SOL_TEST_URL;
        data["quicknode_mainnet_url"] = existigNodeUrl("Solana Mainnet") ?? process.env.QUICKNODE_SOL_MAIN_URL;
        data["explorer_testnet_url"] = existingExplorerUrl("Solana Testnet") ?? process.env.QUICKNODE_SOL_TEST_EXPLORER_URL;
        data["explorer_mainnet_url"] = existingExplorerUrl("Solana Mainnet") ?? process.env.QUICKNODE_SOL_MAIN_EXPLORER_URL;
        data["testnet"] = process.env.SOL_TEST_URL ?? null;
        data["mainnet"] = process.env.SOL_MAIN_URL ?? null;
        break;
      }
    }
  }
};

// Le catene di cui si tiene il catalogo. Sono i nomi di Rango, e sono gli
// stessi che l'applicazione rimanda indietro quando chiede i token di una
// catena: `rango_blockchains` li conserva cosi' come sono.
const CATENE_CATALOGO = ["ETH", "BSC", "SOLANA", "BTC"];

// L'axios dentro la SDK di Rango e' creato senza scadenza. Senza questo numero
// una connessione che resta appesa tiene appesa la sincronizzazione per sempre,
// e la corsa della notte dopo le si siede accanto. La risposta e' grande --
// una quindicina di megabyte per queste quattro catene -- quindi la scadenza
// deve stare larga: misura l'intera risposta, non il tempo di collegarsi.
const SCADENZA_META_MS = 120000;

/// Rifa' il catalogo dei token da Rango.
///
/// Solleva quando non ce l'ha fatta, **dopo** aver registrato il motivo: chi
/// la chiama deve poter distinguere una corsa riuscita da una fallita. Prima
/// inghiottiva tutto, e il comando a mano usciva con esito zero anche quando
/// non aveva sincronizzato niente.
const syncTokenMetaDataInDB = async (opzioni = {}) => {
  const inizio = Date.now();
  try {
    const response = await rango.meta(
      {
        blockchains: CATENE_CATALOGO,
        excludeNonPopulars: false,
      },
      { timeout: SCADENZA_META_MS }
    );

    if (!response.tokens || response.tokens.length === 0) {
      throw new Error("No tokens found in Rango response");
    }
    const esito = await dao.syncTokenMetaDataInDB(response.tokens, opzioni);
    await sysLogger.registraEAttendi(
      "SYSTEM_EVENT",
      "service.syncTokenMetaDataInDB.success",
      {
        tokenCount: response.tokens.length,
        ...(esito && typeof esito === "object" ? esito : { esito }),
      },
      "INFO",
      Date.now() - inizio
    );
    return { tokenCount: response.tokens.length, ...(esito && typeof esito === "object" ? esito : {}) };
  } catch (error) {
    await sysLogger.registraEAttendi(
      "SYSTEM_ERROR",
      "service.syncTokenMetaDataInDB.failed",
      {
        error: error && error.message ? error.message : String(error),
      },
      "ERROR",
      Date.now() - inizio
    );
    throw error;
  }
};

const txUtilsForExchangeCoinBetweenSameBc = (cointype, fromAddress, toAddress, amount, network) => {
  return new Promise(async (resolve, reject) => {
    try {
      let txid;

      let userAddress = await dao.getAddressByAddress(cointype, fromAddress);

      // `reject` non interrompe l'esecuzione: senza il `return` si proseguiva
      // con un indirizzo assente e si leggevano campi indefiniti.
      if (!userAddress || !userAddress.address) {
        return reject("Indirizzo non valido");
      }
      let response;
      switch (cointype) {
        // case "BTC": {
        //     if (process.env.QUICKNODE_IS_ACTIVE) {
        //         response = await cryptoCores.bitcoinCore.btcQuicknodeCore.transactionUtils(userAddress.address, toAddress, amount, network);
        //     } else {
        //         response = await cryptoCores.bitcoinCore.btcCore.transactionUtils(userAddress.address, toAddress, amount * -1);
        //     }

        //     let date = new Date()
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);
        //     break;
        // }
        case "ETH": {
          response = await cryptoCores.ethereumCore.ethCore.transactionUtils(userAddress.address, toAddress, amount, network);
          break;
        }

        case "BNB": {
          response = await cryptoCores.binanceCore.bnbCore.transactionUtils(userAddress.address, toAddress, amount, network);
          break;
        }

        // case "SOL": {
        //     const buffer = Buffer.from(childPrivateKey, 'hex');
        //     const uint8SecretKey = new Uint8Array(buffer);
        //     const KeypairAccount = utils.solanaWeb3.Keypair.fromSeed(uint8SecretKey)
        //     txid = await cryptoCores.solanaCore.solCore.signAndSendTransaction(userAddress.address, toAddress, amount, KeypairAccount, network);
        //     let date = new Date()
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, date, 0);

        //     break;
        // }

        // case "XMR": {
        //     let { date: blockTime, block_number: blockNumber, hash: tx } = await cryptoCores.moneroCore.xmrCore.signAndSendTransaction(userAddress.idUtente, toAddress, amount, userAddress.index, network);
        //     txid = tx
        //     await dao.insertTransaction(tranasactionType.COIN, cointype, cointype, userAddress.id, fromAddress, txid, toAddress, amount * -1, blockTime, blockNumber);

        //     break;
        // }

        default: {
          //coin non valido
          reject("Coin non valido");
        }
      }
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  txUtilsForExchangeCoinBetweenSameBc,

  getBalance,
  leggiSaldo,

  devicelogin,
  insertAddress,
  findDeviceDetails,

  // insertTransactionDetails,
  getLatestCoinRates,
  convertCoinsToAmount,
  storeAddressInQuicknode,
  fetchLookupUrls,
  syncTokenMetaDataInDB,

  // Il pannello di monitoraggio legge lo stato di *questa* connessione. Una
  // aperta per l'occasione potrebbe rispondere benissimo mentre quella che
  // l'applicazione usa davvero e' caduta.
  redisClient,
};
