const express = require('express');
var bodyParser = require('body-parser')
const service = require("../service");
const mailer = require("../mailer");
const auth = require("../auth");
const serverErrors = require('./serverErrors');
const { decryptXpriv } = require('../config/Keystore');
const dao = require("../dao")
const utils = require("../../src/utils");
const router = express.Router();
const crypto = require('crypto');
const speakeasy = require("speakeasy");
const fs = require('fs');
const path = require('path');
const notification = require('../../Helpers/sendNotification')
const smartContract = require("../contracts/smartContractController")
const controllers = require('../controllers/controllers')

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Route di esempio per una richiesta GET alla radice del server
// Example route for a GET request to the server root
router.get('/', (req, res) => {
    res.send('Benvenuto nel server API!');
});

// Route for email verification
router.get('/api/verify', controllers.emailVerification);

// Route to restore the user after retrieving from the mnemonic
router.post('/api/restoreUser', urlencodedParser, auth.authenticateToken, controllers.restoreUser);

//Route per importare un wallet tramite il mnemonic
//Route to import a wallet via the mnemonic
router.post('/api/generateMasternodeFromMmenomnic', urlencodedParser, auth.authenticateTokenApp, controllers.generateMasternodeFromMmenomnic)

// Route per cancellare un utente
router.post('/api/deleteUser', urlencodedParser, auth.authenticateToken, controllers.deleteUser);

// Route to retrieve the user's addresses
router.post('/api/getAddresses', urlencodedParser, auth.authenticateToken, controllers.getAddresses);

// Route to fetch the balance for a given address
router.post('/api/getBalance', urlencodedParser, auth.authenticateToken, controllers.getBalance);

// Route to fetch the balance of all addresses in the wallet
router.post('/api/getAllBalances', urlencodedParser, auth.authenticateToken, controllers.getAllBalances);

// Route to send coins to other address
router.post('/api/exchangeCoinBetweenSameBc', urlencodedParser, auth.authenticateToken, controllers.exchangeCoinBetweenSameBc);

router.post('/api/coin-exchange-utils', jsonParser, auth.authenticateToken, controllers.getUtilsForTransaction)
router.post('/api/transact-coins', jsonParser, auth.authenticateToken, controllers.doTransactionBetweenSameBC)

// Route to add a new account for a specific blockchain
router.post('/api/addCryptoToAccount', urlencodedParser, auth.authenticateToken, controllers.addCryptoToAccount);

// Route to get a user's tokens
router.post('/api/getTokens', jsonParser, auth.authenticateToken, controllers.getTokens);

// Route to exchange tokens within the same blockchain
router.post('/api/exchangeTokenBetweenSameBc', urlencodedParser, auth.authenticateToken, controllers.exchangeTokenBetweenSameBc);

// Route to activate token accounts for Solana
router.post('/api/sol/activateTokenAccounts', urlencodedParser, auth.authenticateToken, controllers.activateTokenAccounts);

// Route to get the list of supported tokens for a specific blockchain (excluding BTC and XMR)
router.post('/api/getListOfSupportedTokens', urlencodedParser, auth.authenticateToken, controllers.getListOfSupportedTokens);

// Route per la restituzione della lista delle transazioni memorizzate
router.post('/api/getTransactions', jsonParser, auth.authenticateToken, controllers.getTransactions);

router.get('/api/filter-transactions', urlencodedParser, auth.authenticateToken, controllers.filterTransactions)

// Route per la restituzione della lista delle transazioni memorizzate per un dato indirizzo
router.post('/api/getTransactionsByAddress', jsonParser, auth.authenticateToken, controllers.getTransactionsByAddress);

/* Pericolosa */
// Route to get all transactions for a user
router.post('/api/getAllTransactions', urlencodedParser, auth.authenticateToken, controllers.getAllTransactions);

// Route to get all transactions for a user
router.post('/api/getLatestTransactionsFromDB', urlencodedParser, auth.authenticateToken, controllers.getLatestTransactionsFromDB );

//Route to get all transaction for an address
router.post('/api/getAllTransactionsForAddress', urlencodedParser, auth.authenticateToken, controllers.getAllTransactionsForAddress);

// Route to change password for a logged-in user
router.post('/api/changePassword', urlencodedParser, auth.authenticateToken, controllers.changePassword);

// Route to change password for a logged-in user
router.post('/api/changePasswordForNoLoggedUser', urlencodedParser, async (req, res) => {
    try {
        const dati = req.body;
        const result = await service.changePasswordForNoLoggedUser(dati.token, dati.new_password);
        res.status(200).json({
            result: true,
            message: result
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while changing password " + error.message,
            error: error.message
        });
    }
});

// Route to change password for a no-logged-in user
router.post('/api/sendChangePasswordEmail', urlencodedParser, auth.authenticateTokenApp, async (req, res) => {
    try {
        const dati = req.body;
        let user = await dao.selectUserByEmail(dati.email);
        if (user) {
            const tokenVerifica = crypto.randomBytes(20).toString('hex');
            mailer.sendEmailRecoverPassword(dati.email, tokenVerifica);
            await dao.saveTokenDataForUser(tokenVerifica, dati.email)
            res.status(200).json({
                result: true,
                message: "Email sent succsessfully"
            });
        } else {
            res.status(500).json({
                result: false,
                message: "The email entered is not present in our system"
            });
        }
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while changing password: " + error.message,
            error: error.message
        });
    }
});

router.get('/api/verifyTokenChangePassword', urlencodedParser, async (req, res) => {
    try {
        const dati = req.query;
        let user = await dao.selectUserByToken(dati.token);
        if (!user) {
            res.status(400).json({
                result: false,
                message: "User not found"
            });
            return
        }
        if (user.token_verifica === null) {
            res.status(400).json({
                result: false,
                message: "The token is not valid"
            });
            return
        }

        if (user.token_verifica === dati.token) {
            if (dati.app != undefined && dati.app === "true") {
                res.status(200).json({
                    result: true,
                    message: "Token verified"
                });
                return
            } else {
                res.redirect(process.env.REACT_APP_BASE_URL + `/recover?token=${dati.token}`);
            }
        } else {
            res.status(400).json({
                result: false,
                message: "The token does not match the user's token"
            });
        }
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while verifying token: " + error.message,
            error: error.message
        });
    }
});

// Route to generate TOTP
router.post('/api/generateTotp', urlencodedParser, auth.authenticateToken, async (req, res) => {
    try {
        let user = await dao.getUserById(req.user.id);

        if (!user) {
            return res.status(400).json({
                result: false,
                message: "User not found"
            });
        }

        // genero il totp per google authenticator
        var secret = speakeasy.generateSecret({ length: 20 });
        let totp = secret.base32;

        // genero l'URL per il QR Code
        var otpAuthUrl = speakeasy.otpauthURL({ secret: totp, encoding: 'base32', label: 'Banckount' });
        await dao.saveUserTotp(user.id, totp)
        res.status(200).json({
            result: true,
            data: {
                totp: totp,
                qrCodeUrl: otpAuthUrl,
            }
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while save TOTP status: " + error.message,
            error: error.message
        });
    }
});

// Route to enable 2FA
router.post('/api/enable2FA', urlencodedParser, auth.authenticateToken, async (req, res) => {
    try {
        let user = await dao.getUserById(req.user.id);
        if (!user) {
            return res.status(400).json({
                result: false,
                message: "User not found"
            });
        }
        await dao.toggleUser2FA(user.id, true)
        res.status(200).json({
            result: true,
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while save 2fa status: " + error.message,
            error: error.message
        });
    }
});

// Route to disable 2FA
router.post('/api/disable2FA', urlencodedParser, auth.authenticateToken, async (req, res) => {
    try {
        let user = await dao.getUserById(req.user.id);
        if (!user) {
            return res.status(400).json({
                result: false,
                message: "User not found"
            });
        }
        await dao.saveUserTotp(user.id, null)
        await dao.toggleUser2FA(user.id, false)
        res.status(200).json({
            result: true,
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while save 2fa status: " + error.message,
            error: error.message
        });
    }
});

// Route to verify OTP
router.post('/api/verifyOTP', urlencodedParser, auth.authenticateToken, async (req, res) => {
    try {
        let user = await dao.getUserById(req.user.id);

        if (!user) {
            return res.status(400).json({
                result: false,
                message: "User not found"
            });
        }

        // Verifico l'OTP
        let isVerified = speakeasy.totp.verify({
            secret: user.totp,
            encoding: 'base32',
            token: req.body.otp
        });

        if (!isVerified) {
            return res.status(400).json({
                result: false,
                message: "Invalid OTP"
            });
        }
        res.status(200).json({
            result: true,
            message: "OTP verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while verifying OTP: " + error.message,
            error: error.message
        });
    }
});

// Define the route for the assetlinks.json file
router.get('/.well-known/assetlinks.json', (req, res) => {
    // Costruisci il percorso completo al file assetlinks.json
    const assetlinksPath = path.join(__dirname, '..', '..', 'assetlinks.json');

    // Leggi il file JSON da disco
    fs.readFile(assetlinksPath, 'utf8', (err, data) => {
        if (err) {
            // Se si verifica un errore nella lettura del file, restituisci un errore HTTP 500 (Internal Server Error)
            res.status(500).json({ error: 'Internal Server Error' });
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
router.post('/api/deviceLogin', jsonParser, async (req, res) => {
    const dati = req.body;
    const {identifier, passkey, device_token} = dati;
    console.log('dati', dati)
    const token = auth.generateToken({
        identifier,
        device_token
    });
    console.log('token', token)
    await service.devicelogin(dati.identifier, dati.passkey, dati.device_token)
        .then((responseId) => {
            res.json({
                result: true,
                data: {
                    token: token,
                    id: responseId
                }
            });
        })
        .catch((error) => {
            res.status(500).json({
                result: false,
                message: error.message ? error.message : error,
                error: error.message,
                code_route: serverErrors.ERROR_DEVICE_LOGIN,
                code: error.code,
            });
        });
});

router.post('/api/insertAddress', jsonParser, auth.authenticateToken, async (req, res) => {
    const addresses = req.body;
    let arr = [];
    if (!Array.isArray(addresses)) {
        return res.status(400).json({
            result: false,
            message: "Invalid payload format"
        });
    }

    for (const address of addresses) {
        const newCoinType = (address.coin_type == "BNB") ? "BSC" : address.coin_type;
        const tatumResponse = await service.registerTatumAddress(newCoinType, address.address);
        console.log('tatumResponse', tatumResponse.body)
        address.tatumStatus = (tatumResponse.body.id) ? "SYNCED" : "NOT-SYNCED";
    }

    await service.insertAddress(addresses)
        .then(async (data) => {
            const addressDetails = await dao.findMultipleAddressesByIds(data);
            res.json({
                result: true,
                message: "Address stored successfully",
                data: addressDetails
            });
        })
        .catch(async (error) => {
            console.log('Error while inserting addresses : ', error)
            res.status(500).json({
                result: false,
                message: error.message ? error.message : error,
                error: error.message,
                code_route: serverErrors.ERROR_CREATE_ADDRESS,
                code: error.code,
            });
        });
});

router.post('/api/insertTransaction', jsonParser, auth.authenticateToken, async (req, res) => {
    const dati = req.body;
    await service.checkAddressDetails(dati.from_address)
        .then(async (addressDetails) => {
            const addresId = addressDetails.id;
            const userID = addressDetails.idUtente;
            dati.address_id = addresId;
            dati.idUtente = userID;
            await service.insertTransactionDetails(dati)
                .then(async (data) => {
                    res.json({
                        result: true,
                        message: "Transaction stored successfully",
                        data: data
                    });
                })
                .catch(async (error) => {
                    res.status(500).json({
                        result: false,
                        message: error.message ? error.message : error,
                        error: error.message,
                        code_route: serverErrors.ERROR_CREATE_ADDRESS,
                        code: error.code,
                    });
                });
        })
        .catch((error) => {
            res.status(500).json({
                result: false,
                message: error.message ? error.message : error,
                error: error.message,
                code_route: serverErrors.ERROR_CREATE_ADDRESS,
                code: error.code,
            });
        })
});

router.post('/api/findAddressBySearchField', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const dati = req.body;
        const identifier = req.user.identifier;
        const deviceResponse = await service.findDeviceDetails(identifier);
        const deviceId = deviceResponse[0].id;
        if (!req.body.coin_type && !req.body.address) {
            return res.status(400).json({
                result: false,
                message: "Invalid payload format"
            });
        }
        const coin_type = req.body.coin_type || '';
        const address = req.body.address || '';
        let resultData = await service.findAddressBySearchField(deviceId, coin_type, address);
        const replaceKey = (arrObj) => {
            return arrObj.map(item => {
                const { cointype, ...rest } = item;
                return {
                    ...rest,
                    coin_type: cointype
                };
            });
        }
        const updatedArray = replaceKey(resultData);
        //    console.log(updatedArray);
        res.status(200).json({
            result: true,
            data: updatedArray
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while retrieving list of transactions by address: " + error.message,
            error: error.message
        });
    }
});

router.post('/api/webhook-tatum/transaction', jsonParser, async (req, res) => {
    try {
        let reqData = req.body;
        const addressDetails = await service.checkAddressDetails(reqData.counterAddress);
        const objLength = Object.keys(addressDetails).length;
        const addresId = (objLength > 0) ? addressDetails.id : null;
        const userID = (objLength > 0) ? addressDetails.idUtente : 0;
        reqData.tx = reqData.txId;
        reqData.address_id = addresId;
        reqData.idUtente = userID;
        reqData.chain = reqData.asset;
        reqData.token = reqData.asset;
        reqData.from_address = reqData.counterAddress;
        reqData.destination_address = reqData.address;
        reqData.block_number = reqData.blockNumber;
        reqData.type = (reqData.type == "native") ? "COIN" : "TOKEN";
        reqData.network_type = "TESTNET";

        if (reqData.subscriptionType == "ADDRESS_EVENT") {

            const responseData = await service.insertTransactionDetails(reqData);
            console.log("responseData", responseData)
            const fromAddress = await service.getDeviceTokenByFromAddress(responseData.from_address);
            const designationAddress = await service.getDeviceTokenByFromAddress(responseData.destination_address);

            if (fromAddress) {
                notification.sendNotification(fromAddress, {
                    notificationTitle: 'Transaction Sent',
                    notificationBody: `The transaction successfully sent ${responseData.amount} ${responseData.chain} to address ${responseData.destination_address}.
                                               Transaction ID: ${responseData.tx}`,
                });
            }

            if (designationAddress) {
                notification.sendNotification(designationAddress, {
                    notificationTitle: 'Transaction Received',
                    notificationBody: `The transaction successfully received ${responseData.amount} ${responseData.chain} from address ${responseData.from_address}.
                                               Transaction ID: ${responseData.tx}.`,
                });
            }

            res.json({
                result: true,
                message: "Transaction stored successfully",
                data: responseData
            });
        }
        else {
            res.status(500).json({
                result: false,
                message: "Transaction not stored successfully",
            });

            notification.sendNotification(fromAddress, {
                notificationTitle: 'Transaction Failed',
                notificationBody: 'Your transaction could not be completed.'
            });
        }

    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred while retrieving list of transactions by address: ",
            error: "An error occurred while retrieving list of transactions by address: "
        });
    }
});

// Route to exchange tokens within the same blockchain
router.post('/api/send-transaction', jsonParser, auth.authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const userAddress = await dao.getAddressByUserIdAndAddress(data.userId, data.senderAddress);
        if (!userAddress) {
            return res.status(400).json({
                result: false,
                message: "Invalid userId or senderAddress."
            });
        } else {
            const exchangeResult = await service.sendTransaction(data.chain, data.fromaddress, data.toaddress, data.amount, data.network, data.signedTx);
            res.status(200).json({
                result: true,
                data: exchangeResult
            });
        }

    } catch (error) {
        res.status(500).json({
            result: false,
            message: "An error occurred during token exchange: " + error.message,
            error: error.message
        });
    }
});

router.post('/api/smart-contract-deploy', jsonParser, smartContract.deploySmartContract);

router.put('/api/sync-address', jsonParser, auth.authenticateToken, controllers.syncAddresses);

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
router.post('/api/wallet/new', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const { name, wallet_type, is_active, user_id } = req.body;
        const deviceDetails = await dao.verifyDeviceDetails(req.user.identifier)
        const response = await dao.createWallet(name, wallet_type, is_active, deviceDetails[0].id, user_id)
        const data = await dao.getWalletById(response.insertId)
        return res.status(200).json({
            result: true,
            message: 'Wallet created successfully',
            data
        })
    } catch (error) {
        console.log('Error while creating new wallet : ', error)
        return res.status(500).json({
            result: false,
            message: "Error while creating new wallet : " + error.message,
            error: error.message
        })
    }
})

router.put('/api/wallet/update', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const { wallet_id, updates } = req.body;
        if (!wallet_id) {
            throw new Error('wallet_id is required')
        }
        await dao.updateWallet(wallet_id, updates)
        const updatedWallet = await dao.getWalletById(wallet_id)
        return res.status(200).json({
            result: true,
            message: 'Wallet updated successfully',
            data: { updatedWallet }
        })
    } catch (error) {
        return res.status(500).json({
            result: false,
            message: "An error occurred while updating wallet : " + error.message,
            error: error.message
        });
    }
})

router.get('/api/wallet', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const { wallet_id, device_id, user_id } = req.query
        if (!(wallet_id || device_id || user_id)) {
            throw new Error('Please provide valid parameters to fetch wallet')
        }
        if (wallet_id) {
            const response = await dao.getWalletById(parseInt(wallet_id))
            return res.status(200).json({
                result: true,
                message: 'Wallet fetched successfully',
                data: response
            })
        }
        if (device_id) {
            const response = await dao.getWalletsByDeviceId(parseInt(device_id))
            return res.status(200).json({
                result: true,
                message: 'Wallets fetched successfully',
                data: response
            })
        }
        if (user_id) {
            const response = await dao.getWalletsByUserId(parseInt(user_id))
            return res.status(200).json({
                result: true,
                message: 'Wallets fetched successfully',
                data: response
            })
        }
    } catch (error) {
        console.log('Error while fetching wallet : ', error)
        return res.status(500).json({
            result: false,
            message: "An Error occurred whlie fetching wallet : " + error.message,
            error: error.message
        })
    }
})

router.get('/api/addresses', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const filters = Object.keys(req.query).length === 0 ? null : req.query
        const validFilters = ['user_id', 'wallet_id', 'coin_type', 'has_positive_address', 'network', 'selected_currency']
        if (filters) {
            const areValidFilters = Object.keys(filters).every((key) => validFilters.includes(key))
            if (!areValidFilters) {
                return res.status(400).json({
                    result: false,
                    message: 'Invalid filters'
                })
            }
        }
        const { user_id, wallet_id, coin_type, has_positive_address, network, selected_currency } = req.query;
        const filter1 = {};
        if (user_id) { filter1.id_utente = user_id }
        if (wallet_id) { filter1.wallet_id = wallet_id }
        if (coin_type) { filter1.cointype = coin_type }

        const addresses = await dao.filterAddresses(filter1)

        for (const address of addresses) {
            const balance = await service.getBalance(address.coin_type, address.address, network)
            address.balance = balance?.balance ?? balance
        }
        const data = { addresses }

        if (coin_type && selected_currency) {
            let coinsSum = 0;
            for (const address of addresses) {
                coinsSum += address.balance;
            }
            const coinRates = await service.getLatestCoinRates(selected_currency)
            data.coins_sum = coinsSum;
            data.coins_sum_converted = await service.convertCoinsToAmount(coin_type, coinsSum, selected_currency, coinRates)
            data.coin_type = coin_type
        }
        if (has_positive_address && has_positive_address == 'true') {
            const positiveBalanceAddresses = addresses.filter(address => address.balance > 0)
            data.addresses = positiveBalanceAddresses;
        }

        return res.status(200).json({
            result: true,
            message: 'Addresses fetched successfully',
            data: data
        })
    } catch (error) {
        console.log('Error while fetching addresses : ', error)
        return res.status(500).json({
            result: false,
            message: 'An error occurred while fetching adderesses : ' + error.message,
            error: error.message
        })
    }
})

router.get('/api/assets', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const { user_id, wallet_id, selected_currency, network } = req.query;
        if (!(user_id && wallet_id && selected_currency && network)) {
            return res.status(400).json({
                result: false,
                message: 'Invalid Parameters'
            })
        }
        const filters = { id_utente: user_id, wallet_id: wallet_id }
        const addresses = await dao.filterAddresses(filters)
        const assets = {};
        for (const index in addresses) {
            let balance;
            console.log('addresses[index]', addresses[index])
            try{
                balance = await service.getBalance(addresses[index].coin_type, addresses[index].address, network)
            }catch(error){
                console.log('Error while fetching balance for address : '+addresses[index].address, error)
                addresses.splice(index, 1)
                continue;
            }
            addresses[index].balance = balance?.balance ?? balance
            if (addresses[index].coin_type === 'ETH') {
                if (!assets['Ethereum']) {
                    assets['Ethereum'] = { addresses: [] }
                }
                assets['Ethereum']['addresses'].push(addresses[index])
                assets['Ethereum']['coin_type'] = 'ETH';
                assets['Ethereum']['coin_name'] = 'Ethereum'
            } else if (addresses[index].coin_type === 'BNB') {
                if (!assets['Binance']) {
                    assets['Binance'] = { addresses: [] }
                }
                assets['Binance']['addresses'].push(addresses[index])
                assets['Binance']['coin_type'] = 'BNB';
                assets['Binance']['coin_name'] = 'Binance'
            } else if (addresses[index].coin_type === 'BTC') {
                if (!assets['Bitcoin']) {
                    assets['Bitcoin'] = { addresses: [] }
                }
                assets['Bitcoin']['addresses'].push(addresses[index])
                assets['Bitcoin']['coin_type'] = 'BTC';
                assets['Bitcoin']['coin_name'] = 'Bitcoin'
            } else if (addresses[index].coin_type === 'SOL') {
                if (!assets['Solana']) {
                    assets['Solana'] = { addresses: [] }
                }
                assets['Solana']['addresses'].push(addresses[index])
                assets['Solana']['coin_type'] = 'SOL';
                assets['Solana']['coin_name'] = 'Solana'
            }
        }

        let walletTotalBalance = 0;         //wallet total balance
        let convertedTotalAmount = 0;
        const coinRates = await service.getLatestCoinRates(selected_currency)
        for (let key in assets) {
            let coinWiseTotal = 0;        //coin total balance
            for (const add of assets[key]['addresses']) {
                coinWiseTotal += add.balance;
                walletTotalBalance += add.balance;
            }
            assets[key]['coin_balance'] = coinWiseTotal
            const converted_amount = await service.convertCoinsToAmount(key, coinWiseTotal, selected_currency, coinRates)
            assets[key]['converted_amount'] = converted_amount
            convertedTotalAmount += converted_amount
            delete assets[key]['addresses']   //remove addresses field in response as not required in frontend
        }
        const data = {
            total_balance: walletTotalBalance,
            converted_total_balance: convertedTotalAmount,
            assets
        }


        return res.status(200).json({
            result: true,
            message: 'Assets fetched successfully',
            data: data
        })

    } catch (error) {
        console.log('Error while fetching assets : ', error)
        return res.status(500).json({
            result: false,
            message: 'An error occurred while fetching assets : ' + error.message,
            error: error.message
        })
    }
})

router.put('/api/addresses/update', jsonParser, auth.authenticateToken, async (req, res) => {
    try {
        const { user_id, wallet_id, address_id, address_name } = req.body;
        // if(!(address_id && address_name)){
        //     return res.status(400).json({
        //         result: false,
        //         message: 'Invalid parameters',
        //         error: 'Invalid parameters'
        //     })
        // }
        const data = await dao.updateAddressName(user_id, wallet_id, address_id, address_name)
        return res.status(200).json({
            result: true,
            message: 'Address name updated successfully',
            data
        })
    } catch (error) {
        console.log('Error while updating address name : ', error)
        return res.status(500).json({
            result: false,
            message: 'An error occurred while updating address name : ' + error.message,
            error: error.message
        })
    }
})

router.post('/api/lookup-urls', jsonParser, auth.authenticateToken, controllers.fetchLookupUrls)
router.get("/api/public-key", auth.authenticateToken,controllers.getPublicKey );
router.get('/api/token-metadata', jsonParser, auth.authenticateToken, controllers.getTokenMetaData)
router.put('/api/onboard-user', jsonParser,auth.authenticateToken, controllers.onboardUser)

router.post('/api/store-rango-bc-data', jsonParser, controllers.storeRangoBlockchainData)
router.get('/api/rango-blockchain-data', jsonParser, auth.authenticateToken, controllers.fetchRangoBlockchainData)
router.get('/api/rango-metadata', jsonParser, auth.authenticateToken, controllers.fetchRangoMetadata)



module.exports = router;
