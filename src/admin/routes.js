const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const metricheSistema = require("./metricheSistema");
const metricheDatabase = require("./metricheDatabase");
const fattiSalute = require("./fattiSalute");
const { SOGLIE } = require("./salute");
const { adminLoginLimiter } = require("../server/rateLimit");
const { registraAccesso, registraAzione } = require("./auditTrail");
const { revoca } = require("./revoche");
const {
  verificaCredenziali,
  generaToken,
  verificaToken,
  soloBearer,
} = require("./adminAuth");

// Il pannello di monitoraggio: per ora solo il cancello.
//
// Questo router viene montato unicamente se `ADMIN_PANEL_ENABLED=true` e la
// configurazione passa i controlli di `adminConfig`. Altrimenti `/admin` non
// esiste: non e' protetto, non c'e'.
//
// Le risposte di rifiuto sono tutte identiche - 401 e "Unauthorized" - senza
// dire se e' il nome, la password, il token o la scadenza. Chi prova non deve
// imparare nulla da cio' che gli si risponde.
const RIFIUTO = { result: false, message: "Unauthorized" };

const costruisciRouter = (configurazione) => {
  const router = express.Router();
  const jsonParser = bodyParser.json({ limit: "64kb" });

  // Il cancello. Da qui in poi ogni rotta lo attraversa.
  const richiedeAmministratore = (req, res, next) => {
    const token = soloBearer(req.headers.authorization);
    const dati = token ? verificaToken(configurazione, token) : null;

    if (!dati) {
      registraAccesso(
        "admin.sessione.rifiutata",
        req,
        { path: req.originalUrl, con_token: Boolean(token) },
        "WARN"
      );
      return res.status(401).json(RIFIUTO);
    }

    req.amministratore = { utente: dati.sub, sessione: dati.jti, scade: dati.exp };
    next();
  };

  router.post("/api/login", adminLoginLimiter, jsonParser, async (req, res) => {
    const corpo = req.body || {};
    const utente = corpo.username;

    let ammesso = false;
    try {
      ammesso = await verificaCredenziali(configurazione, utente, corpo.password);
    } catch (e) {
      // Un guasto nella verifica non e' un permesso: resta un rifiuto, e il
      // motivo finisce nella traccia e non nella risposta.
      registraAccesso(
        "admin.accesso.guasto",
        req,
        { error: e && e.message ? e.message : String(e) },
        "ERROR"
      );
      return res.status(401).json(RIFIUTO);
    }

    if (!ammesso) {
      // Il nome tentato si registra: serve a distinguere un errore di battitura
      // da qualcuno che prova nomi diversi. La password no, mai, in nessun caso.
      registraAccesso(
        "admin.accesso.respinto",
        req,
        { username_tentato: typeof utente === "string" ? utente : null },
        "WARN"
      );
      return res.status(401).json(RIFIUTO);
    }

    const token = generaToken(configurazione, configurazione.utente);
    registraAccesso("admin.accesso.riuscito", req, { username: configurazione.utente });

    res.json({
      result: true,
      data: {
        token,
        ttl: configurazione.ttlSessione,
        destructive_enabled: configurazione.distruttivoAmmesso,
      },
    });
  });

  // Dice alla pagina se la sessione e' ancora buona, senza doverle far
  // indovinare la scadenza.
  router.get("/api/session", richiedeAmministratore, (req, res) => {
    res.json({
      result: true,
      data: {
        username: req.amministratore.utente,
        expires_at: new Date(req.amministratore.scade * 1000).toISOString(),
        destructive_enabled: configurazione.distruttivoAmmesso,
      },
    });
  });

  router.post("/api/logout", richiedeAmministratore, (req, res) => {
    const ritirata = revoca(req.amministratore.sessione, req.amministratore.scade);
    registraAccesso("admin.uscita", req, {
      sessione_ritirata: ritirata,
      username: req.amministratore.utente,
    });
    res.json({ result: true });
  });

  // Appiglio per le fasi successive: dimostra che oltre il cancello si passa,
  // e che quel passaggio lascia una traccia.
  router.get("/api/ping", richiedeAmministratore, (req, res) => {
    registraAzione("admin.ping", req);
    res.json({ result: true, data: { pong: true } });
  });

  // ------------------------------------------------------------------
  // le viste di sola lettura
  // ------------------------------------------------------------------
  //
  // Nessuna di queste rotte lascia una traccia di controllo: sono letture, il
  // pannello le chiama da se' ogni pochi secondi, e registrarle vorrebbe dire
  // riempire il registro di righe che dicono "qualcuno sta guardando". Cio'
  // che l'amministratore *fa* passa da `registraAzione`; cio' che guarda, no.
  //
  // Un guasto dentro un raccoglitore non deve svuotare la schermata: si
  // risponde 503 con il motivo, e la pagina mostra il riquadro in rosso
  // lasciando leggibili gli altri.
  const vista = (nome, raccogli) => async (req, res) => {
    try {
      res.json({ result: true, data: await raccogli() });
    } catch (errore) {
      registraAzione(
        `admin.vista.${nome}.guasto`,
        req,
        { error: errore && errore.message ? errore.message : String(errore) },
        "ERROR"
      );
      res.status(503).json({
        result: false,
        message: errore && errore.message ? errore.message : "lettura non riuscita",
      });
    }
  };

  router.get("/api/system", richiedeAmministratore,
    vista("system", () => metricheSistema.raccogli()));

  router.get("/api/database", richiedeAmministratore,
    vista("database", () => metricheDatabase.raccogli()));

  router.get("/api/health", richiedeAmministratore,
    vista("health", () => fattiSalute.raccogli()));

  // Le soglie con cui si accendono i semafori. La pagina le mostra accanto ai
  // valori: un semaforo giallo senza la soglia accanto costringe a cercarla
  // nel codice.
  router.get("/api/thresholds", richiedeAmministratore, (req, res) => {
    res.json({ result: true, data: SOGLIE });
  });

  // ------------------------------------------------------------------
  // la pagina
  // ------------------------------------------------------------------
  //
  // Serviti come file a se', non incorporati: `helmet` imposta una politica
  // dei contenuti con `script-src 'self'`, e uno `<script>` dentro la pagina
  // non verrebbe eseguito. Tenerli separati e' anche piu' ordinato.
  //
  // `index: false` perche' la radice la serve la rotta qui sotto, che e'
  // l'unica cosa a cui si arriva senza token: il modulo di accesso.
  // La barra finale non e' una finezza.
  //
  // Il browser risolve gli indirizzi relativi rispetto a quello che ha nella
  // barra. Con `/admin` la base e' `/`, quindi `admin.css` diventa
  // `/admin.css` e - molto peggio - `api/login` diventa `/api/login`, che e'
  // lo spazio delle rotte dell'applicazione: la pagina arriverebbe senza
  // stile e il modulo di accesso parlerebbe al posto sbagliato. Verificato:
  // senza barra quei due file danno 404.
  //
  // Sta **prima** di `express.static` per una ragione precisa. Messo dopo, il
  // reindirizzamento lo fa comunque `serve-static`, che redirige le directory
  // per conto suo, e questo codice non viene mai eseguito: si era visto dalla
  // risposta, 301 invece del 302 scritto qui. Dipendere di quell'effetto
  // collaterale vorrebbe dire che spostare o togliere lo static rimette il
  // guasto senza che niente lo dica.
  //
  // 302 e non 301: un reindirizzamento permanente resta nella cache del
  // browser e si porterebbe dietro questo punto di innesto anche dopo averlo
  // cambiato.
  router.get("/", (req, res, next) => {
    const pezzi = req.originalUrl.split("?");
    if (pezzi[0].endsWith("/")) return next();
    const query = pezzi.length > 1 ? `?${pezzi.slice(1).join("?")}` : "";
    res.redirect(302, `${pezzi[0]}/${query}`);
  });

  router.use(
    express.static(path.join(__dirname, "public"), { index: false, maxAge: 0 })
  );

  router.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "public", "index.html"))
  );

  // Qualunque altra cosa sotto /admin, autenticata o no, e' un 404 sobrio: il
  // pannello non elenca cio' che non ha.
  router.use((req, res) => res.status(404).json({ result: false, message: "Not found" }));

  return { router, richiedeAmministratore };
};

module.exports = { costruisciRouter, RIFIUTO };
