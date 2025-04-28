const express = require("express");
var bodyParser = require("body-parser");
const auth = require("../auth");
const router = express.Router();
const fs = require("fs");
const path = require("path");
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
 *     description: Authenticates a device using identifier, passkey, and device token, returning an authentication token.
 *     tags:
 *       - Device Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - passkey
 *               - device_token
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "user@example.com"
 *               passkey:
 *                 type: string
 *                 example: "securepassword123"
 *               device_token:
 *                 type: string
 *                 example: "device12345"
 *     responses:
 *       200:
 *         description: Successful login
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
 *                       example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                     id:
 *                       type: string
 *                       example: "user123"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/api/deviceLogin", jsonParser, controllers.deviceLogin);

/**
 * @swagger
 * /api/insertAddress:
 *   post:
 *     summary: Insert multiple cryptocurrency addresses
 *     description: Stores multiple cryptocurrency addresses and syncs them with the Tatum API.
 *     tags:
 *       - Addresses
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - coin_type
 *                 - address
 *                 - address_name
 *                 - user_id
 *                 - start_block
 *                 - index
 *                 - wallet_id
 *               properties:
 *                 coin_type:
 *                   type: string
 *                   example: "BNB"
 *                 address:
 *                   type: string
 *                   example: "D45602HqyYmkjD77HH3DdBp9TWtYVoVox6ZmFtyt0"
 *                 address_name:
 *                   type: string
 *                   example: "addressName"
 *                 user_id:
 *                   type: integer
 *                   example: 16
 *                 start_block:
 *                   type: integer
 *                   example: 2550368
 *                 index:
 *                   type: integer
 *                   example: 4
 *                 wallet_id:
 *                   type: integer
 *                   example: 7
 *     responses:
 *       200:
 *         description: Addresses stored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Address stored successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       coin_type:
 *                         type: string
 *                         example: "BSC"
 *                       address:
 *                         type: string
 *                         example: "D45602HqyYmkjD77HH3DdBp9TWtYVoVox6ZmFtyt0"
 *                       address_name:
 *                         type: string
 *                         example: "addressName"
 *                       user_id:
 *                         type: integer
 *                         example: 16
 *                       start_block:
 *                         type: integer
 *                         example: 2550368
 *                       index:
 *                         type: integer
 *                         example: 4
 *                       wallet_id:
 *                         type: integer
 *                         example: 7
 *                       tatumStatus:
 *                         type: string
 *                         example: "SYNCED"
 *       400:
 *         description: Invalid payload format.
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
 *                   example: "Invalid payload format"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <--- Importing predefined 401 response
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <--- Importing predefined 403 response
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/api/insertAddress", jsonParser, auth.authenticateToken, controllers.insertAddress);

/**
 * @swagger
 * /api/insertTransaction:
 *   post:
 *     summary: Insert a new transaction
 *     description: Stores a new transaction in the system, verifying the sender's address before inserting transaction details.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []  # <-- Requires JWT token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - chain
 *               - token
 *               - from_address
 *               - destination_address
 *               - amount
 *               - tx
 *               - block_number
 *               - network_type
 *               - wallet_id
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of transaction (e.g., COIN, TOKEN)
 *                 example: "COIN"
 *               chain:
 *                 type: string
 *                 description: Blockchain network of the transaction (e.g., BTC, ETH)
 *                 example: "BTC"
 *               token:
 *                 type: string
 *                 description: Token symbol being transferred (same as chain for native transactions)
 *                 example: "BTC"
 *               from_address:
 *                 type: string
 *                 description: The sender's blockchain address
 *                 example: "n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd"
 *               destination_address:
 *                 type: string
 *                 description: The recipient's blockchain address
 *                 example: "8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul"
 *               amount:
 *                 type: number
 *                 description: The amount of cryptocurrency being transferred
 *                 example: 0
 *               tx:
 *                 type: string
 *                 description: The transaction hash from the blockchain
 *                 example: "0x307b577620fcd1d657ee3f05c6c58a4ac699e739fbe693ecb82c50a34f724d9c"
 *               block_number:
 *                 type: integer
 *                 description: Block number in which the transaction is included
 *                 example: 12304
 *               network_type:
 *                 type: string
 *                 description: The blockchain network type (e.g., MAINNET, TESTNET)
 *                 example: "TESTNET"
 *               wallet_id:
 *                 type: integer
 *                 description: Wallet ID associated with the transaction
 *                 example: 77
 *     responses:
 *       200:
 *         description: Transaction stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction stored successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction_id:
 *                       type: integer
 *                       example: 12345
 *                     status:
 *                       type: string
 *                       example: "pending"
 *       400:
 *         description: Invalid request payload
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
 *                   example: "Invalid request data"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.post("/api/insertTransaction", jsonParser, auth.authenticateToken, controllers.insertTransaction);

/**
 * @swagger
 * /api/findAddressBySearchField:
 *   post:
 *     summary: Search for addresses by coin type or address
 *     description: Retrieves a list of cryptocurrency addresses based on the provided coin type or address filter.
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []  # <-- Requires JWT token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coin_type
 *               - address
 *             properties:
 *               coin_type:
 *                 type: string
 *                 description: Cryptocurrency type to filter by (e.g., BTC, ETH)
 *                 example: "BTC"
 *               address:
 *                 type: string
 *                 description: Specific address to search for
 *                 example: "n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd"
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       address:
 *                         type: string
 *                         example: "n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd"
 *                       coin_type:
 *                         type: string
 *                         example: "BTC"
 *       400:
 *         description: Invalid request payload
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
 *                   example: "Invalid payload format"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.post("/api/findAddressBySearchField", jsonParser, auth.authenticateToken, controllers.findAddressBySearchField);

router.post("/api/webhook-tatum/transaction", jsonParser, controllers.tatumTransactionWebhook);

// Route to exchange tokens within the same blockchain.
/**
 * @swagger
 * /api/send-transaction:
 *   post:
 *     summary: Send a blockchain transaction
 *     description: Sends a cryptocurrency transaction from one address to another after verifying the sender's details.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []  # <-- Requires JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - senderAddress
 *               - chain
 *               - fromaddress
 *               - toaddress
 *               - amount
 *               - network
 *               - signedTx
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID of the sender
 *                 example: 123
 *               senderAddress:
 *                 type: string
 *                 description: Blockchain address of the sender
 *                 example: "n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd"
 *               chain:
 *                 type: string
 *                 description: Blockchain network (e.g., BTC, ETH)
 *                 example: "ETH"
 *               fromaddress:
 *                 type: string
 *                 description: The sender's blockchain address
 *                 example: "0x123456789abcdef"
 *               toaddress:
 *                 type: string
 *                 description: The recipient's blockchain address
 *                 example: "0xabcdef123456789"
 *               amount:
 *                 type: number
 *                 description: The amount of cryptocurrency to send
 *                 example: 0.5
 *               network:
 *                 type: string
 *                 description: The network type (e.g., MAINNET, TESTNET)
 *                 example: "MAINNET"
 *               signedTx:
 *                 type: string
 *                 description: Signed transaction data
 *                 example: "0xf86b808504a817c80082520894abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a08d8080"
 *     responses:
 *       200:
 *         description: Transaction sent successfully
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
 *                     transactionHash:
 *                       type: string
 *                       description: Hash of the successfully broadcasted transaction
 *                       example: "0x307b577620fcd1d657ee3f05c6c58a4ac699e739fbe693ecb82c50a34f724d9c"
 *       400:
 *         description: Invalid userId or senderAddress
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
 *                   example: "Invalid userId or senderAddress."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         description: Internal server error during transaction processing
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
 *                   example: "An error occurred during token exchange: [error message]"
 *                 error:
 *                   type: string
 *                   example: "[error message]"
 */
router.post("/api/send-transaction", jsonParser, auth.authenticateToken, controllers.sendTransaction);

router.post("/api/smart-contract-deploy", jsonParser, smartContract.deploySmartContract);

/**
 * @swagger
 * /api/sync-address:
 *   put:
 *     summary: Synchronize user addresses
 *     description: Updates the status of a user's cryptocurrency addresses, setting unmatched addresses to inactive and syncing new addresses.
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []  # <-- Requires JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - addressList
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID whose addresses need to be synced
 *                 example: 156
 *               addressList:
 *                 type: array
 *                 description: List of addresses to be synced
 *                 items:
 *                   type: object
 *                   required:
 *                     - coin_type
 *                     - address
 *                     - address_name
 *                     - index
 *                     - wallet_id
 *                   properties:
 *                     coin_type:
 *                       type: string
 *                       description: Type of cryptocurrency (e.g., BTC, ETH, BNB)
 *                       example: "ETH"
 *                     address:
 *                       type: string
 *                       description: Cryptocurrency address
 *                       example: "0x8251a0A0813BD153AD3d115581FDE0A55A58a9A2"
 *                     address_name:
 *                       type: string
 *                       description: User-friendly name for the address
 *                       example: "address name"
 *                     start_block:
 *                       type: integer
 *                       description: (Optional) Block number from where transactions should be tracked
 *                       example: 2550371
 *                     index:
 *                       type: integer
 *                       description: Address index in the wallet
 *                       example: 6
 *                     wallet_id:
 *                       type: integer
 *                       description: Wallet ID associated with the address
 *                       example: 1
 *     responses:
 *       200:
 *         description: Address status synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Address status synchronized successfully"
 *                 data:
 *                   type: array
 *                   description: Updated address list
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 45
 *                       coin_type:
 *                         type: string
 *                         example: "ETH"
 *                       address:
 *                         type: string
 *                         example: "0x8251a0A0813BD153AD3d115581FDE0A55A58a9A2"
 *                       address_name:
 *                         type: string
 *                         example: "address name"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *       400:
 *         description: Invalid payload format
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
 *                   example: "Invalid payload format"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.put("/api/sync-address", jsonParser, auth.authenticateToken, controllers.syncAddresses);

/**
 * @swagger
 * /api/wallet/new:
 *   post:
 *     summary: Create a new wallet
 *     description: This API endpoint allows users to create a new wallet.
 *     operationId: createNewWallet
 *     tags:
 *       - Wallet
 *     security:
 *       - bearerAuth: []  # <-- Add this line for JWT authentication
 *     requestBody:
 *       description: Wallet details required for creating a new wallet
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - wallet_type
 *               - is_active
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the wallet
 *               wallet_type:
 *                 type: string
 *                 description: Type of the wallet (e.g., "cryptocurrency", "fiat")
 *               is_active:
 *                 type: boolean
 *                 description: Whether the wallet is active or not
 *               user_id:
 *                 type: integer
 *                 description: ID of the user associated with the wallet
 *     responses:
 *       200:
 *         description: Wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet created successfully"
 *                 data:
 *                   type: object
 *                   description: The wallet object created with the provided details
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.post("/api/wallet/new", jsonParser, auth.authenticateToken, controllers.createNewWallet);

/**
 * @swagger
 * /api/wallet/update:
 *   put:
 *     summary: Update an existing wallet
 *     description: This API endpoint allows users to update an existing wallet.
 *     operationId: updateWallet
 *     tags:
 *       - Wallet
 *     security:
 *       - bearerAuth: []  # <-- Add this line for JWT authentication
 *     requestBody:
 *       description: Wallet details to be updated
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet_id
 *               - updates
 *             properties:
 *               wallet_id:
 *                 type: integer
 *                 description: ID of the wallet to update
 *               updates:
 *                 type: object
 *                 description: The wallet fields to be updated (e.g., name, type, active status)
 *             example:
 *               wallet_id: 1
 *               updates:
 *                 is_active: 0
 *                 name: null
 *                 wallet_type: null
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet updated successfully"
 *                 data:
 *                   type: object
 *                   description: The updated wallet object
 *       400:
 *         description: Bad request - wallet_id is required
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
 *                   example: "wallet_id is required"
 *                 error:
 *                   type: string
 *                   example: "wallet_id is required"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.put("/api/wallet/update", jsonParser, auth.authenticateToken, controllers.updateWallet);

/**
 * @swagger
 * /api/wallet/fetch:
 *   get:
 *     summary: Fetch wallet(s) based on provided parameters
 *     description: Retrieve wallet details using wallet_id, device_id, or user_id.
 *     operationId: fetchWallets
 *     tags:
 *       - Wallet
 *     security:
 *       - bearerAuth: []  # <-- Add this line for JWT authentication
 *     parameters:
 *       - in: query
 *         name: wallet_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the wallet to fetch.
 *       - in: query
 *         name: device_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the device to fetch associated wallets.
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the user to fetch associated wallets.
 *     responses:
 *       200:
 *         description: Wallet(s) fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet(s) fetched successfully"
 *                 data:
 *                   type: array
 *                   description: The fetched wallet(s)
 *       400:
 *         description: Bad request - No valid parameters provided.
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
 *                   example: "Please provide valid parameters to fetch wallet"
 *                 error:
 *                   type: string
 *                   example: "Please provide valid parameters to fetch wallet"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Internal server error response
 */
router.get("/api/wallet", jsonParser, auth.authenticateToken, controllers.fetchWallets);

router.delete("/api/delete-wallets", jsonParser, auth.authenticateToken, controllers.deleteWallets);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Fetch filtered addresses
 *     description: Retrieve addresses based on filters like user_id, wallet_id, coin_type, etc.
 *     operationId: filterAddresses
 *     tags:
 *       - Address
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the user to fetch addresses for.
 *       - in: query
 *         name: wallet_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the wallet to fetch addresses for.
 *       - in: query
 *         name: coin_type
 *         schema:
 *           type: string
 *         required: false
 *         description: Coin type (e.g., BTC, ETH) to filter addresses.
 *       - in: query
 *         name: has_positive_address
 *         schema:
 *           type: boolean
 *         required: false
 *         description: If true, only returns addresses with a positive balance.
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *         required: false
 *         description: Blockchain network (e.g., Ethereum, Binance Smart Chain).
 *       - in: query
 *         name: selected_currency
 *         schema:
 *           type: string
 *         required: false
 *         description: Convert balance to this currency (e.g., USD, EUR).
 *     responses:
 *       200:
 *         description: Addresses fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Addresses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     addresses:
 *                       type: array
 *                       description: List of filtered addresses.
 *                       items:
 *                         type: object
 *                         properties:
 *                           address:
 *                             type: string
 *                             example: "0x1234abcd..."
 *                           coin_type:
 *                             type: string
 *                             example: "ETH"
 *                           balance:
 *                             type: number
 *                             example: 1.234
 *                     coins_sum:
 *                       type: number
 *                       example: 10.5
 *                     coins_sum_converted:
 *                       type: number
 *                       example: 105.0
 *                     coin_type:
 *                       type: string
 *                       example: "ETH"
 *       400:
 *         description: Invalid filters provided.
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
 *                   example: "Invalid filters"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Internal server error response
 */
router.get("/api/addresses", jsonParser, auth.authenticateToken, controllers.filterAddresses);

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Fetch wallet assets and their balances
 *     description: Retrieves the balances of various cryptocurrency addresses associated with a user's wallet, converts them to a selected currency, and calculates total balances.
 *     tags: [Assets]
 *     security:
 *       - BearerAuth: []  # <-- This ensures JWT authentication is required
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *         example: "156"
 *       - in: query
 *         name: wallet_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the wallet
 *         example: "1"
 *       - in: query
 *         name: selected_currency
 *         required: true
 *         schema:
 *           type: string
 *         description: The currency to convert the balances into (e.g., USD, EUR)
 *         example: "usd"
 *       - in: query
 *         name: network
 *         required: true
 *         schema:
 *           type: string
 *         description: The blockchain network to query (e.g., mainnet, testnet)
 *         example: "TESTNET"
 *     responses:
 *       200:
 *         description: Assets fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Assets fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_balance:
 *                       type: number
 *                       description: Total balance across all assets in their native units
 *                       example: 1.038438121889324
 *                     converted_total_balance:
 *                       type: number
 *                       description: Total balance converted to the selected currency
 *                       example: 204.30158454786385
 *                     assets:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           coin_type:
 *                             type: string
 *                             example: "ETH"
 *                           coin_name:
 *                             type: string
 *                             example: "Ethereum"
 *                           coin_balance:
 *                             type: number
 *                             description: Total balance for this coin type
 *                             example: 0.039553121889324
 *                           converted_amount:
 *                             type: number
 *                             description: Balance converted to the selected currency
 *                             example: 77.11355749786385
 *               example:
 *                 result: true
 *                 message: "Assets fetched successfully"
 *                 data:
 *                   total_balance: 1.038438121889324
 *                   converted_total_balance: 204.30158454786385
 *                   assets:
 *                     Binance:
 *                       coin_type: "BNB"
 *                       coin_name: "Binance"
 *                       coin_balance: 0
 *                       converted_amount: 0
 *                     Bitcoin:
 *                       coin_type: "BTC"
 *                       coin_name: "Bitcoin"
 *                       coin_balance: 0
 *                       converted_amount: 0
 *                     Solana:
 *                       coin_type: "SOL"
 *                       coin_name: "Solana"
 *                       coin_balance: 0.998885
 *                       converted_amount: 127.18802705
 *                     Ethereum:
 *                       coin_type: "ETH"
 *                       coin_name: "Ethereum"
 *                       coin_balance: 0.039553121889324
 *                       converted_amount: 77.11355749786385
 *       400:
 *         description: Invalid parameters provided
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
 *                   example: "Invalid Parameters"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Reusing predefined 401 response
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Reusing predefined 403 response
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/api/assets", jsonParser, auth.authenticateToken, controllers.fetchAssets);

/**
 * @swagger
 * /api/addresses/update:
 *   put:
 *     summary: Update an address name
 *     description: Allows users to update the name of an existing address.
 *     operationId: updateAddress
 *     tags:
 *       - Address
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     requestBody:
 *       description: Address details to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - wallet_id
 *               - address_id
 *               - address_name
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user who owns the address
 *               wallet_id:
 *                 type: integer
 *                 description: ID of the wallet containing the address
 *               address_id:
 *                 type: integer
 *                 description: ID of the address to be updated
 *               address_name:
 *                 type: string
 *                 description: New name for the address
 *             example:
 *               user_id: 156
 *               wallet_id: 1
 *               address_id: 10
 *               address_name: "Address 2"
 *     responses:
 *       200:
 *         description: Address name updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Address name updated successfully"
 *                 data:
 *                   type: object
 *                   description: Updated address details
 *       400:
 *         description: Bad request - Invalid parameters.
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
 *                   example: "Invalid parameters"
 *                 error:
 *                   type: string
 *                   example: "Invalid parameters"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Internal server error response
 */
router.put("/api/addresses/update", jsonParser, auth.authenticateToken, controllers.updateAddress);

router.post("/api/lookup-urls", jsonParser, auth.authenticateToken, controllers.fetchLookupUrls);
router.get("/api/public-key", auth.authenticateToken, controllers.getPublicKey);
router.get("/api/token-metadata", jsonParser, auth.authenticateToken, controllers.getTokenMetaData);

/**
 * @swagger
 * /api/onboard-user:
 *   put:
 *     summary: Onboard a user
 *     description: This API onboards a user based on the identifier extracted from the authenticated request.
 *     operationId: onboardUser
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     responses:
 *       200:
 *         description: User onboarded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User onboarded successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Internal server error response
 */
router.put("/api/onboard-user", jsonParser, auth.authenticateToken, controllers.onboardUser);

/**
 * @swagger
 * /api/store-rango-bc-data:
 *   post:
 *     summary: Store Rango blockchain data
 *     description: Fetches blockchain data from Rango API, filters selected blockchains (SOLANA, BNB, ETH, BSC, BTC), and stores them into the database.
 *     operationId: storeRangoBlockchainData
 *     tags:
 *       - Rango Blockchain
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *           description: No input data required. Just trigger the API to fetch and store data.
 *     responses:
 *       200:
 *         description: Rango blockchain data stored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rango data stored in DB successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: SOLANA
 *                       defaultDecimals:
 *                         type: integer
 *                         example: 9
 *                       type:
 *                         type: string
 *                         example: EVM
 *                       chainId:
 *                         type: integer
 *                         example: 101
 *                       logo:
 *                         type: string
 *                         example: "https://cdn.rango.exchange/blockchains/solana/logo.svg"
 *                       displayName:
 *                         type: string
 *                         example: Solana
 *                       shortName:
 *                         type: string
 *                         example: SOL
 *                       info:
 *                         type: string
 *                         example: "Additional blockchain information"
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Internal server error response
 */
router.post("/api/store-rango-bc-data", jsonParser, controllers.storeRangoBlockchainData);

/**
 * @swagger
 * /api/rango-blockchain-data:
 *   get:
 *     summary: Fetch Rango Blockchain Data
 *     description: Retrieves blockchain metadata stored in the database from the Rango API.
 *     operationId: fetchRangoBlockchainData
 *     tags:
 *       - Blockchain
 *     security:
 *       - bearerAuth: []  # JWT Bearer Token Authentication
 *     responses:
 *       200:
 *         description: Blockchain data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Blockchain data fetched successfully"
 *                 data:
 *                   type: array
 *                   description: List of blockchain data stored in the database
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "ETH"
 *                       defaultDecimals:
 *                         type: integer
 *                         example: 18
 *                       type:
 *                         type: string
 *                         example: "EVM"
 *                       chainId:
 *                         type: string
 *                         example: "1"
 *                       logo:
 *                         type: string
 *                         example: "https://example.com/eth-logo.png"
 *                       displayName:
 *                         type: string
 *                         example: "Ethereum"
 *                       shortName:
 *                         type: string
 *                         example: "ETH"
 *                       info:
 *                         type: object
 *                         description: Additional blockchain info
 *                         example:
 *                           explorerUrl: "https://etherscan.io"
 *                           networkStatus: "Active"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # Server error response
 */
router.get("/api/rango-blockchain-data", jsonParser, auth.authenticateToken, controllers.fetchRangoBlockchainData);

router.get("/api/rango-metadata", jsonParser, auth.authenticateToken, controllers.fetchRangoMetadata);

router.post("/api/initiate-swap", jsonParser, auth.authenticateToken, controllers.initiateSwap);
router.get("/api/swap-routes", jsonParser, auth.authenticateToken, controllers.getSwapRoutes);

router.post("/api/check-swap-status", jsonParser, auth.authenticateToken, controllers.checkTxStatus);

/**
 * @swagger
 * /api/token-balance:
 *   get:
 *     summary: Fetch token balance
 *     description: Retrieves the balance of a specific token for a given wallet address and blockchain.
 *     operationId: getTokenBalance
 *     tags:
 *       - Token
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wallet_address
 *         required: true
 *         schema:
 *           type: string
 *         description: The wallet address to fetch token balance for.
 *       - in: query
 *         name: blockchain
 *         required: true
 *         schema:
 *           type: string
 *         description: The blockchain network (e.g., Ethereum, Binance Smart Chain).
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: The symbol of the token (e.g., ETH, BNB).
 *       - in: query
 *         name: token_address
 *         required: false
 *         schema:
 *           type: string
 *         description: The contract address of the token (if applicable).
 *     responses:
 *       200:
 *         description: Token balance fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token balance fetched successfully"
 *                 data:
 *                   type: object
 *                   description: The token balance details
 *       400:
 *         description: Bad request - Missing required parameters
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
 *                   example: "wallet_address, blockchain, symbol are required"
 *                 error:
 *                   type: string
 *                   example: "wallet_address, blockchain, symbol are required"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'  # <-- Unauthorized (Missing/Invalid token)
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'  # <-- Forbidden (Not enough permissions)
 *       500:
 *         $ref: '#/components/responses/ServerError'  # <-- Server error response
 */
router.get("/api/token-balance", jsonParser, auth.authenticateToken, controllers.getTokenBalance);

/**
 * @swagger
 * /api/search-token:
 *   get:
 *     summary: Search tokens using Quicknode
 *     description: Searches for tokens using the Quicknode addon API based on the provided query parameter.
 *     operationId: searchTokensUsingQuicknode
 *     tags:
 *       - Token
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for tokens (e.g., token symbol or name)
 *     responses:
 *       200:
 *         description: Tokens fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tokens fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currencies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "ethereum"
 *                           name:
 *                             type: string
 *                             example: "Ethereum"
 *                           symbol:
 *                             type: string
 *                             example: "ETH"
 *                           type:
 *                             type: string
 *                             example: "token"
 *                           logo:
 *                             type: string
 *                             example: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
 *     401:
 *       $ref: '#/components/responses/UnauthorizedError'
 *     403:
 *       $ref: '#/components/responses/ForbiddenError'
 *     500:
 *       $ref: '#/components/responses/ServerError'
 */
router.get("/api/search-token", jsonParser, auth.authenticateToken, controllers.searchTokensUsingQuicknode);

router.post("/api/webhook-quicknode/transaction", jsonParser, controllers.quicknodeTransactionWebhook);

/**
 * @swagger
 * /api/chain-urls:
 *   get:
 *     summary: Fetch chain URLs and details
 *     description: Retrieves the blockchain node URLs, explorer URLs, and other details for different chains based on the user's device and wallet.
 *     operationId: fetchChainURLs
 *     tags:
 *       - Blockchain
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     parameters:
 *       - in: query
 *         name: wallet_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Wallet ID to fetch associated custom chain URLs.
 *     responses:
 *       200:
 *         description: Chain URLs and data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chain URLs and data fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quicknode_btc_test:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_eth_test:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_bnb_test:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_sol_test:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_btc_main:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_eth_main:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_bnb_main:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *                     quicknode_sol_main:
 *                       $ref: '#/components/schemas/ChainUrlData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error while retrieving chain URLs.
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
 *                   example: "An error occurred while retrieving chain urls : <error details>"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get("/api/chain-urls", jsonParser, auth.authenticateToken, controllers.fetchChainURLs);

/**
 * @swagger
 * /api/token-details:
 *   get:
 *     summary: Fetch token details from Rango
 *     description: Retrieves detailed token information for a given blockchain and token address.
 *     operationId: getTokenDetails
 *     tags:
 *       - Token
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     parameters:
 *       - in: query
 *         name: blockchain
 *         schema:
 *           type: string
 *         required: true
 *         description: Blockchain name (e.g., ETH, BNB, SOL, BTC, etc.)
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Token contract address.
 *     responses:
 *       200:
 *         description: Token data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token data fetched successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     name: "Tether USD"
 *                     symbol: "USDT"
 *                     decimals: 6
 *                     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
 *                     logo: "https://example.com/logo.png"
 *                     blockchain: "ETH"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: An error occurred while fetching token details.
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
 *                   example: "An error occurred while fetching token details : <error details>"
 *                 error:
 *                   type: string
 *                   example: "Invalid blockchain name"
 */
router.get("/api/token-details", jsonParser, auth.authenticateToken, controllers.getTokenDetails);

/**
 * @swagger
 * /api/bookmark-token:
 *   post:
 *     summary: Bookmark a token
 *     description: Bookmarks a token to the user's wallet based on provided token and wallet information.
 *     operationId: bookmarkToken
 *     tags:
 *       - Token
 *     security:
 *       - bearerAuth: []  # <-- JWT authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token_id
 *               - wallet_id
 *               - name
 *               - symbol
 *               - rank
 *               - rev
 *               - type
 *               - chain
 *               - address
 *               - asset_type
 *             properties:
 *               token_id:
 *                 type: string
 *                 example: "eth-ethereum"
 *               wallet_id:
 *                 type: integer
 *                 example: 123
 *               name:
 *                 type: string
 *                 example: "Ethereum"
 *               symbol:
 *                 type: string
 *                 example: "ETH"
 *               rank:
 *                 type: integer
 *                 example: 2
 *               rev:
 *                 type: string
 *                 example: "1"
 *               type:
 *                 type: string
 *                 example: "token"
 *               chain:
 *                 type: string
 *                 example: "ETH"
 *               address:
 *                 type: string
 *                 example: "0x0000000000000000000000000000000000000000"
 *               asset_type:
 *                 type: string
 *                 example: "crypto"
 *     responses:
 *       200:
 *         description: Token bookmarked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token bookmarked successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 45
 *                     wallet_id: 123
 *                     token_id: "eth-ethereum"
 *                     name: "Ethereum"
 *                     symbol: "ETH"
 *                     logo: "https://example.com/logo.png"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: An error occurred while bookmarking token details.
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
 *                   example: "An error occurred while bookmarking token details : <error details>"
 *                 error:
 *                   type: string
 *                   example: "Database insert failed"
 */
router.post("/api/bookmark-token", jsonParser, auth.authenticateToken, controllers.bookmarkToken);

router.delete("/api/remove-bookmarked-token/:tokenId", jsonParser, auth.authenticateToken, controllers.removeBookmarkedToken);

router.post("/api/custom-chain-url", jsonParser, auth.authenticateToken, controllers.storeCustomChainUrl);

router.put("/api/edit-custom-chain-url", jsonParser, auth.authenticateToken, controllers.updateCustomChainUrl);

router.delete("/api/delete-custom-chain-url/:id", jsonParser, auth.authenticateToken, controllers.deleteCustomChainUrl);

router.post("/api/dapps-list", jsonParser, controllers.storeDappsList);

router.get("/api/dapps-list", jsonParser, auth.authenticateToken, controllers.fetchDappsList);

router.get("/api/transaction-notifications", jsonParser, auth.authenticateToken, controllers.fetchTransactionNotification);

module.exports = router;
