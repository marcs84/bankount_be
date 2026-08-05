const admin = require('firebase-admin');
const { loadServiceAccount } = require('./firebaseCredentials');

admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
});

module.exports = admin;
