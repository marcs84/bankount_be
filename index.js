require("dotenv").config();

const { assertEnv } = require("./src/config/env");

assertEnv();

const utils = require("./src/utils");
const cron = require("node-cron");
const path = require("path");

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiLimiter } = require("./src/server/rateLimit");
const { hideInternalErrors } = require("./src/server/errorResponse");
const routes = require("./src/server/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const { Redis } = require("ioredis");
const sysLogger = require("./src/sysLogger");
const { leggiConfigurazione } = require("./src/admin/adminConfig");
const { costruisciRouter } = require("./src/admin/routes");

// const { startSolanaCron } = require("./cron/solana-cron");
// const { startBinanceCron } = require("./cron/binance-cron");
// const { startEthereumCron } = require("./cron/ethereum-cron");
const { syncTokenMetaDataInDB } = require("./src/service");

// Global error handlers to aid debugging
process.on('uncaughtException', (err) => {
  const errorDetails = err && err.stack ? err.stack : String(err);
  sysLogger.logToDb(
    "SYSTEM_ERROR",
    "process.uncaughtException",
    {
      error: errorDetails,
    },
    "ERROR"
  );
});

process.on('unhandledRejection', (reason, promise) => {
  const reasonDetails = reason && reason.stack ? reason.stack : String(reason);
  sysLogger.logToDb(
    "SYSTEM_ERROR",
    "process.unhandledRejection",
    {
      reason: reasonDetails,
      promise: String(promise),
    },
    "ERROR"
  );
});

// ------ DB Connection Pool ------
const pool = require("./src/config/database");
global.connection = pool;
sysLogger.logToDb(
  "SYSTEM_EVENT",
  "database.pool.initialized",
  {
    message: "Database pool initialized and assigned to global.connection",
  },
  "INFO"
);

// Top-level: rileva modalità manual sync
const RUN_SYNC = process.argv.includes('--run-sync');

// Configurazione dell'applicazione Express
const app = express();
const port = process.env.PORT || 3000;

if (process.env.TRUST_PROXY) {
  app.set("trust proxy", process.env.TRUST_PROXY);
}

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
  })
);
app.use(apiLimiter);
app.use(morgan("tiny"));
app.use(hideInternalErrors);
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Importa le rotte dal file routes.js
app.use("/", routes);

// La documentazione descrive ogni rotta e ogni payload accettato: e' una mappa
// dell'API per chi la sonda, e all'applicazione non serve. Si attiva solo dove
// la si vuole davvero.
if (process.env.SWAGGER_ENABLED === "true") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Documentazione API esposta su /api-docs");
}

// Il pannello di monitoraggio, con lo stesso interruttore della documentazione.
//
// Spento, le rotte non vengono montate e `/admin` non esiste. Acceso ma
// configurato male, l'avvio si deve fermare: un pannello mezzo configurato
// sarebbe la peggiore delle tre possibilita', raggiungibile e indifeso.
//
// "Fermare l'avvio" qui vuol dire uscire, non sollevare. Il gestore di
// `uncaughtException` registrato piu' sopra non termina il processo, e il
// keepalive del pool tiene vivo il ciclo di eventi: lasciando salire
// l'eccezione il server resterebbe in piedi senza ascoltare su nessuna porta,
// e il guasto si vedrebbe solo in una riga di registro. Verificato.
//
// Il motivo va su stderr e non nel registro: in quel momento potrebbe essere
// il database stesso a non rispondere, e questo messaggio e' l'unica cosa che
// deve arrivare comunque a chi sta avviando il server.
let configurazionePannello;
try {
  configurazionePannello = leggiConfigurazione();
} catch (errore) {
  console.error(`\n[pannello] avvio interrotto: ${errore.message}\n`);
  process.exit(1);
}
if (configurazionePannello.attivo) {
  app.use("/admin", costruisciRouter(configurazionePannello).router);
  sysLogger.logToDb(
    "SYSTEM_EVENT",
    "adminPanel.mounted",
    {
      path: "/admin",
      ttl_sessione: configurazionePannello.ttlSessione,
      distruttivo_ammesso: configurazionePannello.distruttivoAmmesso,
    },
    "INFO"
  );
  console.log(
    "Pannello di monitoraggio esposto su /admin" +
      (configurazionePannello.distruttivoAmmesso
        ? " (consolle con i metodi distruttivi ABILITATI)"
        : "")
  );
}

// Incapsula l'avvio del server e delle integrazioni
async function bootstrapServer() {
  // Pianifica cron solo in modalità normale
  if (!RUN_SYNC) {
    // Runs every day at 23:59
    cron.schedule(
      "0 0 * * *",
      async () => {
        sysLogger.logToDb(
          "SYSTEM_EVENT",
          "cron.syncTokenMetaDataInDB.start",
          {
            message: "Running daily token metadata sync...",
          },
          "INFO"
        );
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
        sysLogger.logToDb(
          "SYSTEM_EVENT",
          "server.start.https",
          {
            port,
            protocol: "https",
          },
          "INFO"
        );
      });
    } else {
      app.listen(port, () => {
        sysLogger.logToDb(
          "SYSTEM_EVENT",
          "server.start.http",
          {
            port,
            protocol: "http",
          },
          "INFO"
        );
      });
    }
  }
}

// Esecuzione manuale (isolata) e uscita
if (RUN_SYNC) {
  (async () => {
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "manualSync.start",
      {
        message: "Running manual token metadata sync (manual trigger)...",
      },
      "INFO"
    );
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "manualSync.progress",
      {
        message: "Manual sync start.",
      },
      "INFO"
    );
    try {
      await syncTokenMetaDataInDB();
      sysLogger.logToDb(
        "SYSTEM_EVENT",
        "manualSync.completed",
        {
          message: "Manual sync completed successfully.",
        },
        "INFO"
      );
      process.exit(0);
    } catch (err) {
      const errorDetails = err && err.stack ? err.stack : String(err);
      sysLogger.logToDb(
        "SYSTEM_ERROR",
        "manualSync.failed",
        {
          error: errorDetails,
        },
        "ERROR"
      );
      process.exit(1);
    }
  })();
} else {
  // Avvio normale dell’app
  bootstrapServer();
}