const express = require("express");
var bodyParser = require("body-parser");
const service = require("../service");
const mailer = require("../mailer");
const auth = require("../auth");
const serverErrors = require("./serverErrors");
const { decryptXpriv } = require("../config/Keystore");
const dao = require("../dao");
const utils = require("../../src/utils");
const router = express.Router();
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const fs = require("fs");
const path = require("path");
const notification = require("../../Helpers/sendNotification");
const smartContract = require("../contracts/smartContractController");
const controllers = require("../controllers/controllers");

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Route di esempio per una richiesta GET alla radice del server
// Example route for a GET request to the server root
router.get("/", (req, res) => {
  res.send("Benvenuto nel server API!");
});

// Route for email verification
router.get("/api/verify", controllers.emailVerification);

// Route to restore the user after retrieving from the mnemonic
router.post("/api/restoreUser", urlencodedParser, auth.authenticateToken, controllers.restoreUser);

//Route per importare un wallet tramite il mnemonic
//Route to import a wallet via the mnemonic
router.post("/api/generateMasternodeFromMmenomnic", urlencodedParser, auth.authenticateTokenApp, controllers.generateMasternodeFromMmenomnic);

// Route per cancellare un utente
router.post("/api/deleteUser", urlencodedParser, auth.authenticateToken, controllers.deleteUser);

// Route to retrieve the user's addresses
router.post("/api/getAddresses", urlencodedParser, auth.authenticateToken, controllers.getAddresses);

// Route to fetch the balance for a given address
router.post("/api/getBalance", urlencodedParser, auth.authenticateToken, controllers.getBalance);

// Route to fetch the balance of all addresses in the wallet
router.post("/api/getAllBalances", urlencodedParser, auth.authenticateToken, controllers.getAllBalances);

// Route to send coins to other address
router.post("/api/exchangeCoinBetweenSameBc", urlencodedParser, auth.authenticateToken, controllers.exchangeCoinBetweenSameBc);

router.post("/api/coin-exchange-utils", jsonParser, auth.authenticateToken, controllers.getUtilsForTransaction);
router.post("/api/transact-coins", jsonParser, auth.authenticateToken, controllers.doTransactionBetweenSameBC);

// Route to add a new account for a specific blockchain
router.post("/api/addCryptoToAccount", urlencodedParser, auth.authenticateToken, controllers.addCryptoToAccount);

// Route to get a user's tokens
router.post("/api/getTokens", jsonParser, auth.authenticateToken, controllers.getTokens);

// Route to exchange tokens within the same blockchain
router.post("/api/exchangeTokenBetweenSameBc", urlencodedParser, auth.authenticateToken, controllers.exchangeTokenBetweenSameBc);

// Route to activate token accounts for Solana
router.post("/api/sol/activateTokenAccounts", urlencodedParser, auth.authenticateToken, controllers.activateTokenAccounts);

// Route to get the list of supported tokens for a specific blockchain (excluding BTC and XMR)
router.post("/api/getListOfSupportedTokens", urlencodedParser, auth.authenticateToken, controllers.getListOfSupportedTokens);

// Route per la restituzione della lista delle transazioni memorizzate
router.post("/api/getTransactions", jsonParser, auth.authenticateToken, controllers.getTransactions);

router.get("/api/filter-transactions", urlencodedParser, auth.authenticateToken, controllers.filterTransactions);

// Route per la restituzione della lista delle transazioni memorizzate per un dato indirizzo
router.post("/api/getTransactionsByAddress", jsonParser, auth.authenticateToken, controllers.getTransactionsByAddress);

/* Pericolosa */
// Route to get all transactions for a user
router.post("/api/getAllTransactions", urlencodedParser, auth.authenticateToken, controllers.getAllTransactions);

// Route to get all transactions for a user
router.post("/api/getLatestTransactionsFromDB", urlencodedParser, auth.authenticateToken, controllers.getLatestTransactionsFromDB);

//Route to get all transaction for an address
router.post("/api/getAllTransactionsForAddress", urlencodedParser, auth.authenticateToken, controllers.getAllTransactionsForAddress);

// Route to change password for a logged-in user
router.post("/api/changePassword", urlencodedParser, auth.authenticateToken, controllers.changePassword);

// Route to change password for a logged-in user
router.post("/api/changePasswordForNoLoggedUser", urlencodedParser, controllers.changePasswordForNoLoggedUser);

// Route to change password for a no-logged-in user
router.post("/api/sendChangePasswordEmail", urlencodedParser, auth.authenticateTokenApp, controllers.sendChangePasswordEmail);

router.get("/api/verifyTokenChangePassword", urlencodedParser, controllers.verifyTokenChangePassword);

// Route to generate TOTP
router.post("/api/generateTotp", urlencodedParser, auth.authenticateToken, controllers.generateTotp);

// Route to enable 2FA
router.post("/api/enable2FA", urlencodedParser, auth.authenticateToken, controllers.enable2FA);

// Route to disable 2FA
router.post("/api/disable2FA", urlencodedParser, auth.authenticateToken, controllers.disable2FA);

// Route to verify OTP
router.post("/api/verifyOTP", urlencodedParser, auth.authenticateToken, controllers.verifyOTP);

// Define the route for the assetlinks.json file
router.get("/.well-known/assetlinks.json", (req, res) => {
  // Costruisci il percorso completo al file assetlinks.json
  const assetlinksPath = path.join(__dirname, "..", "..", "assetlinks.json");

  // Leggi il file JSON da disco
  fs.readFile(assetlinksPath, "utf8", (err, data) => {
    if (err) {
      // Se si verifica un errore nella lettura del file, restituisci un errore HTTP 500 (Internal Server Error)
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Se la lettura del file ha avuto successo, restituisci il contenuto JSON
      res.json(JSON.parse(data));
    }
  });
});

/**
 * @swagger
 * /api/deviceLogin:
 *   post:
 *     summary: Device Login
 *     description: Login a device and generate an authentication token.
 *     tags:
 *       - Device Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: The identifier for the device.
 *               passkey:
 *                 type: string
 *                 description: The passkey used for login.
 *               device_token:
 *                 type: string
 *                 description: The device token for the login session.
 *             required:
 *               - identifier
 *               - passkey
 *               - device_token
 *     responses:
 *       200:
 *         description: Successful login with a generated token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: The generated token.
 *                     id:
 *                       type: string
 *                       description: The ID of the logged-in device.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: string
 *                   description: Detailed error information
 *                 code_route:
 *                   type: string
 *                   description: The error route code
 *                 code:
 *                   type: integer
 *                   description: Error code
 */
router.post("/api/deviceLogin", jsonParser, controllers.deviceLogin);

router.post("/api/insertAddress", jsonParser, auth.authenticateToken, controllers.insertAddress);

router.post("/api/insertTransaction", jsonParser, auth.authenticateToken, controllers.insertTransaction);

router.post("/api/findAddressBySearchField", jsonParser, auth.authenticateToken, controllers.findAddressBySearchField);

router.post("/api/webhook-tatum/transaction", jsonParser, controllers.tatumTransactionWebhook);

// Route to exchange tokens within the same blockchain
router.post("/api/send-transaction", jsonParser, auth.authenticateToken, controllers.sendTransaction);

router.post("/api/smart-contract-deploy", jsonParser, smartContract.deploySmartContract);

router.put("/api/sync-address", jsonParser, auth.authenticateToken, controllers.syncAddresses);

// Wallet
/**
 * @swagger
 * /api/wallet/new:
 *   get:
 *     summary: Create a new wallet
 *     description: New Wallet Creation for Device.
 *     responses:
 *       200:
 *         description: Success Response of wallet creation.
 */
router.post("/api/wallet/new", jsonParser, auth.authenticateToken, controllers.createNewWallet);

router.put("/api/wallet/update", jsonParser, auth.authenticateToken, controllers.updateWallet);

router.get("/api/wallet", jsonParser, auth.authenticateToken, controllers.fetchWallets);

router.get("/api/addresses", jsonParser, auth.authenticateToken, controllers.filterAddresses);

router.get("/api/assets", jsonParser, auth.authenticateToken, controllers.fetchAssets);

router.put("/api/addresses/update", jsonParser, auth.authenticateToken, controllers.updateAddress);

router.post("/api/lookup-urls", jsonParser, auth.authenticateToken, controllers.fetchLookupUrls);
router.get("/api/public-key", auth.authenticateToken, controllers.getPublicKey);
router.get("/api/token-metadata", jsonParser, auth.authenticateToken, controllers.getTokenMetaData);
router.put("/api/onboard-user", jsonParser, auth.authenticateToken, controllers.onboardUser);

router.post("/api/store-rango-bc-data", jsonParser, controllers.storeRangoBlockchainData);
router.get("/api/rango-blockchain-data", jsonParser, auth.authenticateToken, controllers.fetchRangoBlockchainData);
router.get("/api/rango-metadata", jsonParser, auth.authenticateToken, controllers.fetchRangoMetadata);

module.exports = router;
