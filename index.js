require("dotenv").config();

const utils = require("./src/utils");
const cron = require("node-cron");
const path = require("path");

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/server/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const { Redis } = require("ioredis");

// const { startSolanaCron } = require("./cron/solana-cron");
// const { startBinanceCron } = require("./cron/binance-cron");
// const { startEthereumCron } = require("./cron/ethereum-cron");
const { syncTokenMetaDataInDB } = require("./src/service");

// Global error handlers to aid debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// ------ DB Connection ------
const connection = utils.mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 60000,
});

connection.connect((error) => {
  if (error) {
    console.error("Errore di connessione al database: " + error.stack);
    return;
  }
  console.log("Connesso al database con id connessione " + connection.threadId);
  global.connection = connection; // Dichiarazione della variabile globale
});

// Top-level: rileva modalità manual sync
const RUN_SYNC = process.argv.includes('--run-sync');

// Configurazione dell'applicazione Express
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
  })
);
app.use(morgan("tiny"));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Importa le rotte dal file routes.js
app.use("/", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Incapsula l'avvio del server e delle integrazioni
async function bootstrapServer() {
  // Avvio Redis solo se non in manual sync
  // if (!RUN_SYNC) {
    // Configurazione della connessione a Redis
    // const redisClient = new Redis();
    // (async () => {
    //   try {
    //     await redisClient.connect();
    //     console.log("Connection to Redis successful!");
    //   } catch (error) {
    //     console.error("Error while connecting to Redis:", error.message);
    //   }
    // })();
  // }

  // Pianifica cron solo in modalità normale
  if (!RUN_SYNC) {
    // Runs every day at 23:59
    cron.schedule(
      "59 23 * * *",
      async () => {
        console.log("Running daily token metadata sync...");
        await syncTokenMetaDataInDB();
      }
    );
  }

  // Avvio Express solo se non in manual sync
  if (!RUN_SYNC) {
    // Avvia il server API
    if (process.env.HTTPS == "true") {
      // configuro le credenziali https
      const privateKey = fs.readFileSync(process.env.HTTPS_PRIVATEKEY, "utf8");
      const certificate = fs.readFileSync(process.env.HTTPS_CERTIFICATE, "utf8");
      const credentials = { key: privateKey, cert: certificate };

      var httpsServer = https.createServer(credentials, app);

      httpsServer.listen(port, () => {
        console.log(`Server in ascolto sulla porta ${port} in HTTPS`);
      });
    } else {
      app.listen(port, () => {
        console.log(`Server in ascolto sulla porta ${port} in HTTP`);
      });
    }
  }
}

// Esecuzione manuale (isolata) e uscita
if (RUN_SYNC) {
  (async () => {
    console.log('Running manual token metadata sync (manual trigger)...');
    console.log('Manual sync start.');
    try {
      await syncTokenMetaDataInDB();
      console.log('Manual sync completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Manual sync failed:', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  })();
} else {
  // Avvio normale dell’app
  bootstrapServer();
}