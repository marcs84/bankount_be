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
const utenti = require("./utenti");
const {
  verificaCredenziali,
  generaToken,
  verificaToken,
  soloBearer,
  FONTI,
  RUOLI,
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
  const richiedeAmministratore = async (req, res, next) => {
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

    let ruolo = dati.ruolo;

    // L'amministratore dell'ambiente si ferma qui: il suo nome e la sua
    // password stanno in `.env`, e il token che li porta vale per quello che
    // c'e' scritto. Quello della tabella no: la sua riga puo' essere stata
    // disabilitata, cambiata di ruolo o cancellata da quando ha fatto
    // l'accesso, e di quelle tre cose deve accorgersi subito.
    if (dati.fonte === FONTI.TABELLA) {
      let stato;
      try {
        stato = await utenti.stato(dati.sub);
      } catch (errore) {
        // Database non raggiungibile: non si entra. La via d'ingresso quando
        // il database e' fermo e' l'amministratore dell'ambiente, che e'
        // esattamente il motivo per cui esiste.
        registraAccesso(
          "admin.sessione.nonVerificabile",
          req,
          { path: req.originalUrl, error: errore && errore.message ? errore.message : String(errore) },
          "WARN"
        );
        return res.status(401).json(RIFIUTO);
      }

      const passwordCambiata =
        stato.passwordCambiataIl !== null &&
        stato.passwordCambiataIl !== undefined &&
        dati.pwd !== stato.passwordCambiataIl;

      if (!stato.esiste || !stato.abilitato || passwordCambiata) {
        registraAccesso(
          "admin.sessione.decaduta",
          req,
          {
            username: dati.sub,
            motivo: !stato.esiste
              ? "eliminato"
              : !stato.abilitato
                ? "disabilitato"
                : "password cambiata",
          },
          "WARN"
        );
        return res.status(401).json(RIFIUTO);
      }

      // Il ruolo lo dice il database, non il token: togliere a qualcuno la
      // gestione degli accessi ha effetto sulla sessione che ha aperto.
      ruolo = stato.ruolo;
    }

    req.amministratore = {
      utente: dati.sub,
      ruolo,
      fonte: dati.fonte,
      sessione: dati.jti,
      scade: dati.exp,
    };
    next();
  };

  // Le rotte che toccano gli accessi. Qui il rifiuto e' 403 e dice perche':
  // la sessione e' buona, e' l'azione che non spetta a quel ruolo. Il 401
  // muto serve a non far imparare niente a chi prova a entrare; a chi e' gia'
  // dentro per lavoro, nascondere il motivo sarebbe solo scortese.
  const richiedeProprietario = (req, res, next) => {
    if (req.amministratore.ruolo !== RUOLI.PROPRIETARIO) {
      registraAzione(
        "admin.utenti.nonAutorizzato",
        req,
        { path: req.originalUrl, ruolo: req.amministratore.ruolo },
        "WARN"
      );
      return res.status(403).json({
        result: false,
        message: "la gestione degli amministratori spetta al proprietario",
      });
    }
    next();
  };

  // L'accesso prova due depositi, in questo ordine.
  //
  // Prima quello dell'ambiente, che e' sempre valido e non ha bisogno del
  // database. Poi la tabella, se esiste. Il rifiuto e' identico in tutti i
  // casi - nome sconosciuto, password sbagliata, accesso disabilitato - e non
  // dice da quale dei due depositi non e' passato.
  const identifica = async (utente, password) => {
    if (await verificaCredenziali(configurazione, utente, password)) {
      return {
        nome: configurazione.utente,
        fonte: FONTI.AMBIENTE,
        ruolo: RUOLI.PROPRIETARIO,
      };
    }

    const esito = await utenti.verifica({ nome: utente, password });
    if (!esito.ok) return null;

    return {
      nome: esito.utente.nome,
      fonte: FONTI.TABELLA,
      ruolo: esito.utente.ruolo,
      passwordCambiataIl: esito.utente.passwordCambiataIl,
    };
  };

  router.post("/api/login", adminLoginLimiter, jsonParser, async (req, res) => {
    const corpo = req.body || {};
    const utente = corpo.username;

    let identita = null;
    try {
      identita = await identifica(utente, corpo.password);
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

    if (!identita) {
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

    const token = generaToken(configurazione, identita.nome, identita);

    if (identita.fonte === FONTI.TABELLA) utenti.segnaAccesso(identita.nome);

    registraAccesso("admin.accesso.riuscito", req, {
      username: identita.nome,
      fonte: identita.fonte,
      ruolo: identita.ruolo,
    });

    res.json({
      result: true,
      data: {
        token,
        ttl: configurazione.ttlSessione,
        destructive_enabled: configurazione.distruttivoAmmesso,
        username: identita.nome,
        ruolo: identita.ruolo,
        fonte: identita.fonte,
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
        ruolo: req.amministratore.ruolo,
        fonte: req.amministratore.fonte,
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
  // gli amministratori
  // ------------------------------------------------------------------
  //
  // Queste rotte sono le uniche del pannello che cambiano chi puo' entrare,
  // quindi lasciano tutte una traccia, compresi i rifiuti. Nella traccia
  // vanno il nome, il ruolo e l'esito: la password non ci passa nemmeno
  // accanto, perche' il corpo della richiesta non viene mai registrato
  // com'e'.
  const operazione = (nome, esegui) => async (req, res) => {
    try {
      const esito = await esegui(req);
      registraAzione(`admin.utenti.${nome}`, req, esito.traccia || {}, "INFO");
      res.json({ result: true, data: esito.dati });
    } catch (errore) {
      const suo = Boolean(errore && errore.perLUtente);
      const motivo = errore && errore.message ? errore.message : String(errore);

      registraAzione(
        `admin.utenti.${nome}.rifiutata`,
        req,
        { error: motivo },
        suo ? "WARN" : "ERROR"
      );

      res.status(suo ? 400 : 503).json({
        result: false,
        message: suo ? motivo : "operazione non riuscita",
      });
    }
  };

  // L'elenco risponde anche senza la tabella, dicendo che non c'e': e' cio'
  // che permette alla pagina di spiegare che manca la migrazione invece di
  // mostrare un guasto.
  router.get("/api/admins", richiedeAmministratore, richiedeProprietario,
    async (req, res) => {
      try {
        const presente = await utenti.tabellaPresente();
        res.json({
          result: true,
          data: {
            tabella: presente,
            utenti: presente ? await utenti.elenco() : [],
            // L'amministratore dell'ambiente non ha una riga: si mostra a
            // parte, perche' chi guarda l'elenco deve sapere che esiste e che
            // nessuno di qui dentro puo' toccarlo.
            ambiente: { nome: configurazione.utente, ruolo: RUOLI.PROPRIETARIO },
            ruoli: Object.values(RUOLI),
            lunghezzaMinimaPassword: utenti.PASSWORD_MINIMA,
          },
        });
      } catch (errore) {
        res.status(503).json({ result: false, message: "lettura non riuscita" });
      }
    });

  router.post("/api/admins", richiedeAmministratore, richiedeProprietario, jsonParser,
    operazione("creato", async (req) => {
      const corpo = req.body || {};
      const creato = await utenti.crea({
        nome: corpo.nome,
        password: corpo.password,
        ruolo: corpo.ruolo,
        creatoDa: req.amministratore.utente,
        utenteAmbiente: configurazione.utente,
      });
      return { dati: creato, traccia: { nome: creato.nome, ruolo: creato.ruolo } };
    }));

  router.post("/api/admins/:nome/password", richiedeAmministratore, richiedeProprietario,
    jsonParser,
    operazione("passwordCambiata", async (req) => {
      const esito = await utenti.cambiaPassword({
        nome: req.params.nome,
        password: (req.body || {}).password,
      });
      return { dati: esito, traccia: { nome: esito.nome } };
    }));

  router.post("/api/admins/:nome/enabled", richiedeAmministratore, richiedeProprietario,
    jsonParser,
    operazione("abilitazione", async (req) => {
      const acceso = (req.body || {}).acceso === true;
      const esito = await utenti.abilita({
        nome: req.params.nome,
        acceso,
        chiLoChiede: req.amministratore.utente,
      });
      return { dati: esito, traccia: { nome: esito.nome, abilitato: esito.abilitato } };
    }));

  // Il nome si ribatte per confermare. Eliminare un accesso e' l'unica cosa
  // qui dentro che non si annulla, e un elenco di righe tutte uguali e' il
  // posto piu' facile per cliccare quella sbagliata.
  router.delete("/api/admins/:nome", richiedeAmministratore, richiedeProprietario,
    jsonParser,
    operazione("eliminato", async (req) => {
      const conferma = (req.body || {}).conferma;
      if (String(conferma || "") !== String(req.params.nome)) {
        throw Object.assign(
          new Error("per eliminare serve la conferma: ribattere il nome"),
          { perLUtente: true }
        );
      }
      const esito = await utenti.elimina({
        nome: req.params.nome,
        chiLoChiede: req.amministratore.utente,
      });
      return { dati: esito, traccia: { nome: esito.nome } };
    }));

  // La propria password. Vale per gli amministratori della tabella: quella
  // dell'ambiente sta in `.env` e si cambia con `npm run admin:hash`.
  router.post("/api/me/password", richiedeAmministratore, jsonParser,
    operazione("passwordPropria", async (req) => {
      if (req.amministratore.fonte !== FONTI.TABELLA) {
        throw Object.assign(
          new Error(
            "la password dell'amministratore di .env si cambia con `npm run admin:hash`"
          ),
          { perLUtente: true }
        );
      }
      const corpo = req.body || {};
      const esito = await utenti.cambiaPasswordDaSe({
        nome: req.amministratore.utente,
        passwordAttuale: corpo.passwordAttuale,
        passwordNuova: corpo.passwordNuova,
      });
      return { dati: esito, traccia: { nome: esito.nome, daSe: true } };
    }));

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
