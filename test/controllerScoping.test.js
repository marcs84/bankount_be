const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

// I controller vengono eseguiti davvero: un identificatore rimasto senza
// dichiarazione e' un ReferenceError che nessun controllo sintattico rivela.
const stub = (relativo, exports) => {
  const risolto = require.resolve(path.join(__dirname, "..", relativo));
  require.cache[risolto] = { id: risolto, filename: risolto, loaded: true, exports };
};

const chiamate = { getBalance: [], filterAddresses: [], fetchBookmarkedTokens: [] };

stub("src/dao.js", {
  filterAddresses: async (filtri) => {
    chiamate.filterAddresses.push(filtri);
    return [{ id: 1, coin_type: "ETH", address: "0xmio", wallet_id: "w-1" }];
  },
  fetchBookmarkedTokens: async (user_id, wallet_id) => {
    chiamate.fetchBookmarkedTokens.push({ user_id, wallet_id });
    return [];
  },
  isWalletOwnedByDevice: async () => true,
  getWalletById: async (id) => ({ id }),
  getWalletsByDeviceId: async (device_id) => [{ id: "w-1", device_id }],
});

stub("src/service.js", {
  getLatestCoinRates: async () => ({ ethereum: { usd: 3000 } }),
  getBalance: async (coin_type, address, network, user_id, wallet_id) => {
    chiamate.getBalance.push({ coin_type, address, network, user_id, wallet_id });
    return 1.5;
  },
  convertCoinsToAmount: () => 4500,
});

stub("src/sysLogger.js", { logToDb: () => {} });
// L'invio delle notifiche carica Firebase all'import e senza credenziali
// interrompe il caricamento del modulo.
stub("Helpers/sendNotification.js", { sendNotification: async () => ({}) });

const controllers = require("../src/controllers/controllers");

const fintaRisposta = () => {
  const risposta = { statusCode: null, payload: null };
  risposta.status = (code) => {
    risposta.statusCode = code;
    return risposta;
  };
  risposta.json = (body) => {
    risposta.payload = body;
    return risposta;
  };
  return risposta;
};

test("fetches the addresses of the device in the token, not of the one asked for", async () => {
  chiamate.filterAddresses.length = 0;
  chiamate.getBalance.length = 0;
  const res = fintaRisposta();

  await controllers.filterAddresses(
    { query: { user_id: "999", wallet_id: "w-1", network: "TESTNET" }, device: { id: 42 } },
    res
  );

  assert.equal(res.statusCode, 200, `risposta inattesa: ${JSON.stringify(res.payload)}`);
  assert.equal(chiamate.filterAddresses[0].id_utente, 42, "l'utente deve venire dal token");
  assert.equal(chiamate.getBalance[0].user_id, 42, "anche i nodi personalizzati vanno risolti sul chiamante");
});

test("fetches the assets of the device in the token, not of the one asked for", async () => {
  chiamate.filterAddresses.length = 0;
  chiamate.getBalance.length = 0;
  chiamate.fetchBookmarkedTokens.length = 0;
  const res = fintaRisposta();

  await controllers.fetchAssets(
    { query: { user_id: "999", wallet_id: "w-1", selected_currency: "usd", network: "TESTNET" }, device: { id: 42 } },
    res
  );

  assert.equal(res.statusCode, 200, `risposta inattesa: ${JSON.stringify(res.payload)}`);
  assert.equal(chiamate.filterAddresses[0].id_utente, 42);
  assert.equal(chiamate.getBalance[0].user_id, 42);
  assert.equal(chiamate.fetchBookmarkedTokens[0].user_id, 42, "i preferiti sono quelli del chiamante");
});

test("lists only the wallets of the device in the token", async () => {
  const res = fintaRisposta();

  await controllers.fetchWallets({ query: { user_id: "999", device_id: "999" }, device: { id: 42 } }, res);

  assert.equal(res.statusCode, 200, `risposta inattesa: ${JSON.stringify(res.payload)}`);
  assert.deepEqual(res.payload.data, [{ id: "w-1", device_id: 42 }]);
});

test("keeps the wallet identifier whole when it is asked for by id", async () => {
  const res = fintaRisposta();

  await controllers.fetchWallets(
    { query: { wallet_id: "6f3dc28d-b4bd-431e-8266-87b589ab0ff1" }, device: { id: 42 } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.data.id, "6f3dc28d-b4bd-431e-8266-87b589ab0ff1", "gli uuid non vanno troncati a numero");
});
