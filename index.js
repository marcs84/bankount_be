require("dotenv").config();

const utils = require("./src/utils");
const cron = require("node-cron");

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/server/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const { Redis } = require("ioredis");

const { startSolanaCron } = require("./cron/solana-cron");
const { startBinanceCron } = require("./cron/binance-cron");
const { startEthereumCron } = require("./cron/ethereum-cron");
const { syncTokenMetaDataInDB } = require("./src/service");

// ------ DB Connection ------
const connection = utils.mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 60000,
});

const redisClient = new Redis();
(async () => {
  try {
    await redisClient.connect();
    console.log("Connection to Redis successful!");
  } catch (error) {
    console.error("Error while connecting to Redis:", error.message);
  }
})();

connection.connect((error) => {
  if (error) {
    console.error("Errore di connessione al database: " + error.stack);
    return;
  }
  console.log("Connesso al database con id connessione " + connection.threadId);
  global.connection = connection; // Dichiarazione della variabile globale
});

// Configurazione del middleware di parsing del body della richiesta
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// per creare i certificati da terminale eseguire
// openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
// openssl rsa -in keytmp.pem -out key.pem

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

// Importa le rotte dal file routes.js
app.use("/", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Runs every day at 2:40 PM IST
cron.schedule(
  "15 18 * * *",
  async () => {
    console.log("Running daily token metadata sync...");
    await syncTokenMetaDataInDB();
  },
  {
    timezone: "Asia/Kolkata"
  }
);

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
