const express = require("express");
const bodyParser = require("body-parser");

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

  // Qualunque altra cosa sotto /admin, autenticata o no, e' un 404 sobrio: il
  // pannello non elenca cio' che non ha.
  router.use((req, res) => res.status(404).json({ result: false, message: "Not found" }));

  return { router, richiedeAmministratore };
};

module.exports = { costruisciRouter, RIFIUTO };
