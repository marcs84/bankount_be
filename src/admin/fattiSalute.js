const os = require("os");

const metricheSistema = require("./metricheSistema");
const metricheDatabase = require("./metricheDatabase");
const { valuta } = require("./salute");

// Raccoglie i fatti che `salute.valuta` trasforma in semafori, piu' i
// contatori dell'applicazione.
//
// La divisione e' voluta: qui si va a prendere, la' si giudica. Le soglie
// restano in un file che si legge senza avere un database davanti.
const interroga = (sql, parametri = []) =>
  new Promise((risolvi, rifiuta) => {
    if (!global.connection) return rifiuta(new Error("pool non disponibile"));
    global.connection.query(sql, parametri, (errore, righe) =>
      errore ? rifiuta(errore) : risolvi(righe)
    );
  });

const unValore = async (sql, parametri = [], campo = "v") => {
  const righe = await interroga(sql, parametri);
  if (!righe.length) return null;
  const valore = righe[0][campo];
  return valore === undefined ? null : valore;
};

const istante = (valore) => (valore ? new Date(valore).toISOString() : null);

// Lo stato della connessione Redis dell'applicazione, non di una aperta qui.
// Si prende con cautela: se un domani `service.js` non la esportasse piu', il
// pannello dira' "ignoto" invece di non partire.
const statoConnessioneRedis = () => {
  try {
    const service = require("../service");
    return service.redisClient ? service.redisClient.status : null;
  } catch (errore) {
    return null;
  }
};

// Quanti pezzi dell'applicazione esistono, in numeri. Non sono metriche di
// salute: sono il contesto che rende leggibile tutto il resto - mille errori
// su dieci dispositivi sono un'altra cosa che mille su diecimila.
const contatori = async () => {
  const [dispositivi, dispositiviAttivi, portafogli, indirizzi, notifiche24h] =
    await Promise.all([
      unValore("SELECT COUNT(*) AS v FROM device"),
      unValore("SELECT COUNT(*) AS v FROM device WHERE is_active = 1"),
      unValore("SELECT COUNT(*) AS v FROM wallet"),
      unValore("SELECT COUNT(*) AS v FROM addresses"),
      unValore(
        "SELECT COUNT(*) AS v FROM transaction_notifications WHERE created_at >= NOW() - INTERVAL 1 DAY"
      ),
    ]);

  return {
    dispositivi: Number(dispositivi) || 0,
    dispositiviAttivi: Number(dispositiviAttivi) || 0,
    portafogli: Number(portafogli) || 0,
    indirizzi: Number(indirizzi) || 0,
    // `transaction_notifications` e' il registro di quelle inviate, non una
    // coda: non esiste un "in attesa" da mostrare, e inventarlo sarebbe peggio
    // che non averlo.
    notificheUltime24h: Number(notifiche24h) || 0,
  };
};

const erroriRecenti = async () => {
  const [ultimaOra, ultime24h] = await Promise.all([
    unValore(
      "SELECT COUNT(*) AS v FROM system_logs WHERE status = 'ERROR' AND created_at >= NOW() - INTERVAL 1 HOUR"
    ),
    unValore(
      "SELECT COUNT(*) AS v FROM system_logs WHERE status = 'ERROR' AND created_at >= NOW() - INTERVAL 1 DAY"
    ),
  ]);

  const perAzione = await interroga(
    `SELECT action, COUNT(*) AS righe, MAX(created_at) AS ultima
     FROM system_logs
     WHERE status = 'ERROR' AND created_at >= NOW() - INTERVAL 1 DAY
     GROUP BY action ORDER BY righe DESC LIMIT 10`
  );

  return {
    ultimaOra: Number(ultimaOra) || 0,
    ultime24h: Number(ultime24h) || 0,
    perAzione: perAzione.map((r) => ({
      azione: r.action,
      righe: Number(r.righe) || 0,
      ultima: istante(r.ultima),
    })),
  };
};

const segniDiVita = async () => {
  const [accesso, webhook, syncRiuscita, syncAvviata, ultimaRiga] = await Promise.all([
    // Il middleware registra la richiesta con stato INFO solo se e' andata a
    // buon fine: un accesso respinto lascia una riga ERROR.
    unValore(
      "SELECT MAX(created_at) AS v FROM system_logs WHERE action = 'POST /api/deviceLogin' AND status = 'INFO'"
    ),
    unValore(
      "SELECT MAX(created_at) AS v FROM system_logs WHERE action LIKE 'POST /api/webhook-quicknode%'"
    ),
    unValore(
      "SELECT MAX(created_at) AS v FROM system_logs WHERE action = 'service.syncTokenMetaDataInDB.success'"
    ),
    // Le due partenze possibili. Guardando solo quella della cron, una
    // sincronizzazione lanciata a mano e rimasta a meta' non accendeva il
    // semaforo "non conclusa": l'avvio a mano si chiama `manualSync.start`.
    unValore(
      `SELECT MAX(created_at) AS v FROM system_logs
        WHERE action IN ('cron.syncTokenMetaDataInDB.start', 'manualSync.start')`
    ),
    unValore("SELECT MAX(created_at) AS v FROM system_logs"),
  ]);

  return {
    ultimoAccessoDispositivo: istante(accesso),
    ultimoWebhook: istante(webhook),
    ultimaSincronizzazioneRiuscita: istante(syncRiuscita),
    ultimaSincronizzazioneAvviata: istante(syncAvviata),
    ultimaRigaRegistro: istante(ultimaRiga),
  };
};

const raccogli = async () => {
  const ping = await metricheDatabase.ping();

  // Senza database si risponde comunque: il pannello deve restare leggibile
  // proprio quando qualcosa non va, che e' l'unico momento in cui serve.
  if (!ping.risponde) {
    const disco = await metricheSistema.spazioDisco();
    const totale = os.totalmem();
    const fatti = {
      database: ping,
      redis: statoConnessioneRedis(),
      disco,
      memoriaPercentualeUsata:
        Math.round(((totale - os.freemem()) / totale) * 1000) / 10,
      cicloEventiP99Ms: metricheSistema.ritardoCicloEventi().p99Ms,
    };
    return { istante: new Date().toISOString(), ...valuta(fatti), fatti, contatori: null };
  }

  const [vita, errori, conteggi, disco, reg] = await Promise.all([
    segniDiVita(),
    erroriRecenti(),
    contatori(),
    metricheSistema.spazioDisco(),
    metricheDatabase.registro(),
  ]);

  const totaleMemoria = os.totalmem();
  const fatti = {
    database: ping,
    redis: statoConnessioneRedis(),
    ...vita,
    erroriUltimaOra: errori.ultimaOra,
    disco,
    memoriaPercentualeUsata:
      Math.round(((totaleMemoria - os.freemem()) / totaleMemoria) * 1000) / 10,
    cicloEventiP99Ms: metricheSistema.ritardoCicloEventi().p99Ms,
    registroRighe: reg.righe,
  };

  return {
    istante: new Date().toISOString(),
    ...valuta(fatti),
    fatti,
    errori,
    contatori: conteggi,
  };
};

module.exports = { raccogli, contatori, erroriRecenti, segniDiVita, statoConnessioneRedis };
