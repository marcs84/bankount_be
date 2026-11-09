const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const metricheSistema = require("./metricheSistema");
const metricheDatabase = require("./metricheDatabase");
const fattiSalute = require("./fattiSalute");
const registroVisore = require("./registroVisore");
const purga = require("./purga");
const catalogoApi = require("./catalogoApi");
const sonda = require("./sonda");
const { SOGLIE } = require("./salute");
const { leggiRitenzione } = require("./adminConfig");
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

// La parola della purga. Maiuscola e in chiaro: deve essere scomoda da
// battere per sbaglio e impossibile da battere per abitudine.
const PAROLA_PURGA = "CANCELLA";

// Il corpo mandato dalla consolle finisce nella traccia. Se e' JSON si
// registra come oggetto, cosi' `redact` puo' entrarci dentro e togliere le
// chiavi sensibili; se non lo e' si registra solo quanto era lungo, perche'
// un corpo opaco nella traccia non serve a nessuno e puo' contenere qualunque
// cosa.
const corpoPerLaTraccia = (corpo) => {
  if (corpo === null || corpo === undefined) return null;
  try {
    const dato = JSON.parse(corpo);
    if (dato && typeof dato === "object") return dato;
  } catch (e) {
    /* non e' JSON */
  }
  return { _byte: String(corpo).length };
};

const costruisciRouter = (configurazione, ritenzione = leggiRitenzione()) => {
  const router = express.Router();
  const jsonParser = bodyParser.json({ limit: "64kb" });

  // La consolle puo' mandare un corpo fino a 64kb: il contenitore che lo
  // avvolge deve starci piu' largo, o il limite vero sarebbe questo e il
  // rifiuto arriverebbe da un posto che non lo spiega.
  const jsonGrande = bodyParser.json({ limit: "128kb" });

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
      res.json({ result: true, data: await raccogli(req) });
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
  // il visore del registro
  // ------------------------------------------------------------------
  //
  // Anche queste sono letture e non lasciano traccia. La purga, che e' l'unica
  // cosa qui dentro che cancella, la lascia due volte: una riga di
  // `SYSTEM_EVENT` scritta da `purga` subito dopo aver cancellato, e una di
  // `ADMIN_ACTION` con il nome di chi l'ha chiesta.

  router.get("/api/logs/stats", richiedeAmministratore,
    vista("logs.stats", (req) => registroVisore.statistiche(req.query)));

  router.get("/api/logs/facets", richiedeAmministratore,
    vista("logs.facets", () => registroVisore.voci()));

  // Togliere la maschera e' l'unica lettura che lascia una traccia. Le altre
  // sono il pannello che si aggiorna da se'; questa e' una persona che ha
  // deciso di guardare in chiaro indirizzi e identificativi, e di quella
  // decisione resta scritto cosa stava guardando.
  const tracciaSeInChiaro = (req) => {
    if (registroVisore.vuoleMaschera(req.query.maschera)) return;
    registraAzione("admin.registro.inChiaro", req, {
      finestra: req.query.finestra || null,
      tipo: req.query.tipo || null,
      stato: req.query.stato || null,
      azione: req.query.azione || null,
      testo: req.query.testo || null,
      pagina: req.query.pagina || null,
    });
  };

  router.get("/api/logs", richiedeAmministratore, async (req, res) => {
    try {
      tracciaSeInChiaro(req);
      res.json({ result: true, data: await registroVisore.cerca(req.query) });
    } catch (errore) {
      registraAzione("admin.vista.logs.guasto", req,
        { error: errore && errore.message ? errore.message : String(errore) }, "ERROR");
      res.status(503).json({ result: false, message: "lettura del registro non riuscita" });
    }
  });

  router.get("/api/logs/:id", richiedeAmministratore, async (req, res) => {
    try {
      tracciaSeInChiaro(req);
      const riga = await registroVisore.unaRiga(req.params.id, {
        maschera: req.query.maschera,
      });
      if (!riga) return res.status(404).json({ result: false, message: "Not found" });
      res.json({ result: true, data: riga });
    } catch (errore) {
      res.status(503).json({ result: false, message: "lettura della riga non riuscita" });
    }
  });

  // Quanto porterebbe via la purga, prima di chiederla. La conferma si batte
  // sopra questo numero.
  router.post("/api/purge/preview", richiedeAmministratore, jsonParser, async (req, res) => {
    const corpo = req.body || {};
    try {
      const primaDi = corpo.primaDi
        ? corpo.primaDi
        : purga.primaDiGiorni(corpo.giorni);
      res.json({
        result: true,
        data: await purga.anteprima({ primaDi, tipi: corpo.tipi }),
      });
    } catch (errore) {
      res.status(400).json({
        result: false,
        message: errore && errore.message ? errore.message : "anteprima non riuscita",
      });
    }
  });

  router.post("/api/purge", richiedeAmministratore, jsonParser, async (req, res) => {
    const corpo = req.body || {};

    // La parola si batte per intero. Un bottone "sei sicuro?" si clicca senza
    // leggere; questa no.
    if (String(corpo.conferma || "") !== PAROLA_PURGA) {
      registraAzione("admin.purga.senzaConferma", req, { conferma_mancante: true }, "WARN");
      return res.status(400).json({
        result: false,
        message: `per cancellare serve la conferma: battere ${PAROLA_PURGA}`,
      });
    }

    try {
      const primaDi = corpo.primaDi ? corpo.primaDi : purga.primaDiGiorni(corpo.giorni);
      const esito = await purga.purga({ primaDi, tipi: corpo.tipi, origine: "pannello" });
      registraAzione("admin.purga.eseguita", req, esito, esito.incompleta ? "WARN" : "INFO");
      res.json({ result: true, data: esito });
    } catch (errore) {
      const motivo = errore && errore.message ? errore.message : String(errore);
      registraAzione("admin.purga.guasto", req, { error: motivo }, "ERROR");
      res.status(400).json({ result: false, message: motivo });
    }
  });

  // Lo stato della scadenza automatica: accesa o spenta, ogni quanto, con
  // quanti giorni di conservazione. Sta a schermo accanto al bottone della
  // purga manuale, cosi' non si cancella a mano cio' che sarebbe andato via
  // da solo stanotte.
  router.get("/api/retention", richiedeAmministratore, (req, res) => {
    res.json({ result: true, data: { ...ritenzione, tipiProtetti: purga.TIPI_PROTETTI } });
  });

  // ------------------------------------------------------------------
  // la consolle di prova
  // ------------------------------------------------------------------

  router.get("/api/catalog", richiedeAmministratore,
    vista("catalog", async () => catalogoApi.catalogo()));

  router.post("/api/probe", richiedeAmministratore, jsonGrande, async (req, res) => {
    const corpo = req.body || {};

    const controllo = sonda.valida(corpo, {
      distruttivoAmmesso: configurazione.distruttivoAmmesso,
    });

    if (!controllo.ok) {
      // Anche un rifiuto si registra: un tentativo di DELETE respinto perche'
      // l'interruttore e' spento e' esattamente il genere di cosa che si vuole
      // ritrovare nel registro.
      registraAzione(
        "admin.sonda.rifiutata",
        req,
        { metodo: corpo.metodo || null, percorso: corpo.percorso || null, motivo: controllo.motivo },
        "WARN"
      );
      return res.status(400).json({ result: false, message: controllo.motivo });
    }

    const preparata = controllo.richiesta;

    // La destinazione non arriva dal corpo: e' la presa su cui e' entrata
    // questa stessa richiesta.
    const risposta = await sonda.esegui(preparata, {
      porta: (req.socket && req.socket.localPort) || process.env.PORT || null,
      protocollo: req.protocol,
    });

    registraAzione(
      "admin.sonda.chiamata",
      req,
      {
        metodo: preparata.metodo,
        percorso: preparata.percorso,
        // Il corpo passa da `redact` dentro `registraAzione`: una password
        // battuta nella consolle per provare l'accesso non si deposita qui.
        corpo: corpoPerLaTraccia(preparata.corpo),
        stato: risposta.ok ? risposta.stato : null,
        esito: risposta.ok ? "risposta" : "guasto",
        motivo: risposta.ok ? null : risposta.motivo,
        durata_ms: risposta.durataMs,
      },
      risposta.ok && risposta.stato < 400 ? "INFO" : "WARN",
      risposta.durataMs
    );

    if (!risposta.ok) {
      return res.status(502).json({ result: false, message: risposta.motivo });
    }

    res.json({ result: true, data: risposta });
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
