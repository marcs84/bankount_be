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
const { interpretaFiducia } = require("./src/server/trustProxy");
const { PERCORSO_ICONA, CACHE_ICONA } = require("./src/server/icona");
const { CACHE_ICONA_TOKEN, trovaIcona, cartellaDiCatena } = require("./src/server/iconaToken");
const { hideInternalErrors } = require("./src/server/errorResponse");
const routes = require("./src/server/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const sysLogger = require("./src/sysLogger");
const { leggiConfigurazione, leggiRitenzione } = require("./src/admin/adminConfig");
const { costruisciRouter } = require("./src/admin/routes");
const purgaRegistro = require("./src/admin/purga");

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

// `--force` sostituisce il catalogo anche se e' molto piu' piccolo di quello
// in servizio: serve il giorno in cui il calo e' vero.
//
// `--prune` toglie dalla cache le icone che il catalogo nuovo non riferisce.
// Non e' il comportamento predefinito di proposito: cancellare file e' il
// genere di cosa che si chiede, non che si subisce.
const FORZA_SYNC = process.argv.includes('--force');
const POTA_ICONE = process.argv.includes('--prune');

// Configurazione dell'applicazione Express
const app = express();
const port = process.env.PORT || 3000;

// Dietro la galleria frpc le richieste arrivano da 127.0.0.1 con l'indirizzo
// vero in `X-Forwarded-For`. Senza questa impostazione `req.ip` e' quello
// della presa per tutti: il limitatore dei tentativi di accesso conterebbe
// ogni visitatore nello stesso mucchio, e l'indirizzo nelle tracce sarebbe
// quello del tunnel.
//
// Il valore passa da `interpretaFiducia` perche' l'ambiente da' stringhe ed
// Express tratta la stringa "1" come un elenco di indirizzi, non come un
// salto di proxy.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", interpretaFiducia(process.env.TRUST_PROXY));
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

// L'icona del sito, per tutto il server e non solo per il pannello.
//
// Il browser la chiede qui - alla radice - per ogni pagina che non ne
// dichiari una propria, e senza questa rotta ogni apertura di /api-docs o
// della radice lasciava un 404 nel registro delle API.
//
// Sta **prima** di `app.use("/", routes)`: cosi' la richiesta non attraversa
// il registro delle richieste, che e' il trattamento giusto per un file
// statico, ed e' lo stesso che ricevono i file del pannello.
app.get("/favicon.ico", (req, res) => {
  res.sendFile(PERCORSO_ICONA, { maxAge: CACHE_ICONA }, (errore) => {
    // Se il file non c'e' si risponde 404 senza rumore: un'icona mancante non
    // e' un guasto del server, e sollevare qui farebbe cadere la richiesta in
    // un gestore di errori che non ha niente da dire.
    if (errore && !res.headersSent) res.status(404).end();
  });
});

// L'icona di un token, dalla cache che la sincronizzazione notturna riempie.
//
// Non e' servita come file statico sotto `/public/token` perche' il nome del
// file non si puo' ricostruire da fuori: estensione e maiuscole li decide chi
// ha scaricato l'immagine. Vedi `src/server/iconaToken.js`.
//
// Sta **prima** di `app.use("/", routes)`, come la favicon e per lo stesso
// motivo: un'icona chiesta decine di volte per schermata non deve scrivere
// altrettante righe nel registro delle richieste. Resta pero' **dopo**
// `apiLimiter`: trecento richieste al minuto bastano a una lista di icone, e
// una rotta che legge dal disco senza freno sarebbe un invito.
const serviIcona = (icona, res) => {
  // Un'icona che manca non e' un guasto: il catalogo cambia, la cache insegue,
  // e l'applicazione disegna gia' un segnaposto quando l'immagine non arriva.
  if (!icona) return res.status(404).end();

  // Il tipo lo dichiariamo noi e non lo si lascia indovinare: fra le icone ci
  // sono SVG, che sono documenti e non immagini. Serviti dal nostro dominio e
  // aperti in un browser eseguirebbero cio' che contengono, e il contenuto
  // arriva da terzi. Le due intestazioni qui sotto tolgono quella possibilita'
  // senza togliere l'icona a chi la disegna.
  res.type(icona.tipo);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");

  res.sendFile(icona.percorso, { maxAge: CACHE_ICONA_TOKEN }, (errore) => {
    if (errore && !res.headersSent) res.status(404).end();
  });
};

// Con la catena: e' la forma giusta, perche' lo stesso indirizzo su due catene
// sono due token diversi con due loghi.
//
// Se quella catena non ha l'icona -- o se il nome con cui e' stata chiesta non
// corrisponde a nessuna cartella -- si cerca comunque altrove: questa rotta
// non deve poter rispondere peggio di quella senza catena.
app.get("/api/token-image/:catena/:indirizzo", (req, res) => {
  const catena = cartellaDiCatena(req.params.catena);
  const icona =
    (catena ? trovaIcona(req.params.indirizzo, { catena }) : null) || trovaIcona(req.params.indirizzo);

  serviIcona(icona, res);
});

// Senza la catena: la chiedono cosi' le versioni dell'applicazione gia'
// installate. Si frugano le cartelle delle catene in ordine fisso e per
// ultimo l'archivio piatto di prima, che e' esattamente la risposta che
// davano prima -- una delle due, sempre la stessa -- quindi aggiornare il
// server non lascia nessuno senza icone.
app.get("/api/token-image/:indirizzo", (req, res) =>
  serviIcona(trovaIcona(req.params.indirizzo), res)
);

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
//
// La conservazione del registro si legge qui accanto, e con lo stesso esito
// se e' scritta male: la pianificazione di una cancellazione automatica non
// deve poter partire "quasi giusta".
let configurazionePannello;
let ritenzioneRegistro;
try {
  configurazionePannello = leggiConfigurazione();
  ritenzioneRegistro = leggiRitenzione();
} catch (errore) {
  console.error(`\n[pannello] avvio interrotto: ${errore.message}\n`);
  process.exit(1);
}
if (configurazionePannello.attivo) {
  app.use("/admin", costruisciRouter(configurazionePannello, ritenzioneRegistro).router);
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
    // Ogni giorno a mezzanotte. Il fuso e' quello della macchina se non lo si
    // dichiara: `CRON_TIMEZONE` serve dove la macchina sta a UTC e si vuole
    // l'ora locale.
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
        try {
          await syncTokenMetaDataInDB();
        } catch (errore) {
          // La sincronizzazione registra da se' il motivo e poi solleva, per
          // il comando a mano che deve poter uscire con esito diverso da
          // zero. Qui non c'e' nessuno ad aspettarla: senza questo blocco il
          // rilancio finirebbe fra i rifiuti non raccolti, cioe' in una riga
          // di registro che dice molto meno di quella scritta a monte.
          sysLogger.logToDb(
            "SYSTEM_EVENT",
            "cron.syncTokenMetaDataInDB.aborted",
            {
              error: errore && errore.message ? errore.message : String(errore),
            },
            "WARN"
          );
        }
      },
      process.env.CRON_TIMEZONE ? { timezone: process.env.CRON_TIMEZONE } : undefined
    );

    // La scadenza del registro. Esiste solo se qualcuno l'ha accesa: senza
    // `ADMIN_LOG_RETENTION_DAYS` questo blocco non viene nemmeno letto, e
    // nessuna riga di registro viene mai cancellata da sola.
    if (ritenzioneRegistro.attiva) {
      cron.schedule(ritenzioneRegistro.cron, async () => {
        try {
          await purgaRegistro.purga({
            primaDi: purgaRegistro.primaDiGiorni(ritenzioneRegistro.giorni),
            tipi: ritenzioneRegistro.tipi,
            origine: "cron",
          });
        } catch (errore) {
          // `purga` scrive da se' la riga di esito quando riesce. Questa e'
          // per quando non riesce: una purga automatica che cade in silenzio
          // si scoprirebbe solo dal registro che non smette di crescere.
          sysLogger.logToDb(
            "SYSTEM_ERROR",
            "logPurge.cron.failed",
            {
              error: errore && errore.message ? errore.message : String(errore),
              giorni: ritenzioneRegistro.giorni,
            },
            "ERROR"
          );
        }
      });
      console.log(
        `Scadenza del registro attiva: ${ritenzioneRegistro.giorni} giorni, ` +
          `pianificata "${ritenzioneRegistro.cron}"`
      );
    }
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
//
// Le righe di registro di inizio e fine si **aspettano**: `process.exit` non
// svuota cio' che e' in volo verso il database, e la riga finale e' quella che
// dice com'e' andata. Quella di riuscita e' anche cio' che il pannello legge
// per il semaforo della sincronizzazione.
//
// Su stdout va un resoconto breve, perche' questo comando lo lancia una
// persona: prima non stampava niente, e per sapere se era andato bene si
// doveva andare a leggere `system_logs`.
if (RUN_SYNC) {
  (async () => {
    const inizio = Date.now();
    const durata = () => Math.round((Date.now() - inizio) / 1000);

    console.log("Sincronizzazione del catalogo dei token: avvio.");
    await sysLogger.registraEAttendi(
      "SYSTEM_EVENT",
      "manualSync.start",
      {
        message: "Running manual token metadata sync (manual trigger)...",
      },
      "INFO"
    );

    try {
      const esito = await syncTokenMetaDataInDB({ forza: FORZA_SYNC, pota: POTA_ICONE });

      // Saltata vuol dire che un'altra corsa era gia' dentro: non e' un
      // guasto, ma chi ha lanciato il comando deve sapere che non ha fatto
      // niente, altrimenti crede di avere un catalogo nuovo.
      if (esito && esito.saltata === true) {
        console.log(`Sincronizzazione saltata: ${esito.motivo}`);
        await sysLogger.registraEAttendi(
          "SYSTEM_EVENT",
          "manualSync.skipped",
          { reason: esito.motivo },
          "WARN",
          Date.now() - inizio
        );
        process.exit(0);
      }

      console.log(
        `Sincronizzazione riuscita in ${durata()}s: ` +
          `${esito && esito.tokenCount ? esito.tokenCount : "?"} token nel catalogo` +
          `${esito && esito.scartate ? `, ${esito.scartate} righe scartate` : ""}.`
      );
      await sysLogger.registraEAttendi(
        "SYSTEM_EVENT",
        "manualSync.completed",
        {
          message: "Manual sync completed successfully.",
          ...(esito && typeof esito === "object" ? esito : {}),
        },
        "INFO",
        Date.now() - inizio
      );
      process.exit(0);
    } catch (err) {
      const errorDetails = err && err.stack ? err.stack : String(err);

      console.error(
        `Sincronizzazione FALLITA dopo ${durata()}s: ` +
          `${err && err.message ? err.message : String(err)}`
      );
      await sysLogger.registraEAttendi(
        "SYSTEM_ERROR",
        "manualSync.failed",
        {
          error: errorDetails,
        },
        "ERROR",
        Date.now() - inizio
      );
      process.exit(1);
    }
  })();
} else {
  // Avvio normale dell’app
  bootstrapServer();
}