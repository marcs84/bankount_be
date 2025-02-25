require('dotenv').config();

const { startBitcoinCron } = require('./cron/bitcoin-cron');
const utils = require('./src/utils');

// ------ DB Connection ------
const connection = utils.mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 60000
});

connection.connect((error) => {
  if (error) {
    console.error("Errore di connessione al database: " + error.stack);
    return;
  }
  console.log("Connesso al database con id connessione " + connection.threadId);
  
  global.connection = connection; // Dichiarazione della variabile globale
});

startBitcoinCron();