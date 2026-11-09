const nodeCron = require("node-cron");
const { improntaValida } = require("./password");

// Configurazione del pannello, letta dall'ambiente e controllata all'avvio.
//
// Il pannello e' spento se non lo si accende: senza `ADMIN_PANEL_ENABLED=true`
// le rotte non vengono nemmeno montate, e non c'e' un `/admin` da sondare. E'
// lo stesso modello della documentazione Swagger, che il server usa gia'.
//
// Quando invece e' acceso, la configurazione deve essere completa e sensata
// *prima* che il server cominci ad ascoltare. Un pannello mezzo configurato
// sarebbe la peggiore delle tre possibilita': raggiungibile e indifeso.
const PREDEFINITI = {
  ttlSessione: "30m",
  lunghezzaMinimaSegreto: 32,
};

const presente = (valore) => typeof valore === "string" && valore.trim() !== "";

// I problemi si raccolgono tutti: chi configura il pannello vuole sapere in
// una volta cosa manca, non scoprirlo una variabile per riavvio.
const problemi = (env) => {
  const elenco = [];

  if (!presente(env.ADMIN_USERNAME)) {
    elenco.push("ADMIN_USERNAME assente");
  }

  if (!presente(env.ADMIN_PASSWORD_HASH)) {
    elenco.push("ADMIN_PASSWORD_HASH assente");
  } else if (!improntaValida(env.ADMIN_PASSWORD_HASH)) {
    elenco.push(
      "ADMIN_PASSWORD_HASH non e' un'impronta valida " +
        "(forse e' stata scritta la password in chiaro: generala con `npm run admin:hash`)"
    );
  }

  if (!presente(env.ADMIN_JWT_SECRET)) {
    elenco.push("ADMIN_JWT_SECRET assente");
  } else {
    if (env.ADMIN_JWT_SECRET.length < PREDEFINITI.lunghezzaMinimaSegreto) {
      elenco.push(
        `ADMIN_JWT_SECRET piu' corto di ${PREDEFINITI.lunghezzaMinimaSegreto} caratteri`
      );
    }

    // Il punto che tiene separate le due autenticazioni. Con lo stesso segreto
    // un token di amministratore passerebbe l'autenticazione dei dispositivi,
    // e un token di dispositivo quella del pannello: la separazione sarebbe
    // scritta nel codice e inesistente nei fatti.
    if (presente(env.JWT_SECRET) && env.ADMIN_JWT_SECRET === env.JWT_SECRET) {
      elenco.push(
        "ADMIN_JWT_SECRET uguale a JWT_SECRET: i token del pannello e quelli " +
          "dei dispositivi non sarebbero piu' distinguibili"
      );
    }
  }

  return elenco;
};

// Restituisce la configurazione, o solleva se il pannello e' acceso e
// configurato male. Chi la chiama all'avvio lascia che l'eccezione fermi il
// processo: e' il comportamento voluto.
const leggiConfigurazione = (env = process.env) => {
  const attivo = env.ADMIN_PANEL_ENABLED === "true";

  if (!attivo) {
    return { attivo: false };
  }

  const guasti = problemi(env);
  if (guasti.length > 0) {
    throw new Error(
      "ADMIN_PANEL_ENABLED=true ma la configurazione del pannello non e' " +
        "utilizzabile:\n  - " +
        guasti.join("\n  - ")
    );
  }

  return {
    attivo: true,
    utente: env.ADMIN_USERNAME,
    impronta: env.ADMIN_PASSWORD_HASH,
    segreto: env.ADMIN_JWT_SECRET,
    ttlSessione: presente(env.ADMIN_SESSION_TTL)
      ? env.ADMIN_SESSION_TTL
      : PREDEFINITI.ttlSessione,

    // I metodi che modificano dati esistono nella consolle di prova, ma
    // restano spenti finche' non li si accende. La capacita' c'e' quando
    // serve, e non c'e' per distrazione.
    distruttivoAmmesso: env.ADMIN_PROBE_DESTRUCTIVE === "true",
  };
};

// La scadenza automatica del registro.
//
// Vive fuori dalla configurazione del pannello, e non per capriccio: la
// conservazione del registro riguarda il database, non la schermata, e deve
// poter funzionare su un server dove il pannello e' spento. Nasce comunque
// spenta anche lei: senza `ADMIN_LOG_RETENTION_DAYS` nessun cron viene
// pianificato e nessuna riga viene mai cancellata da sola.
const RITENZIONE_CRON_PREDEFINITO = "30 3 * * *";

const leggiRitenzione = (env = process.env) => {
  const grezzo = presente(env.ADMIN_LOG_RETENTION_DAYS)
    ? env.ADMIN_LOG_RETENTION_DAYS.trim()
    : "";

  if (grezzo === "" || grezzo === "0") {
    return { attiva: false };
  }

  // Un valore scritto male non diventa una conservazione a caso: ferma
  // l'avvio, come per il pannello. Il caso peggiore sarebbe un refuso che
  // cancella piu' di quanto si voleva.
  if (!/^[1-9][0-9]{0,4}$/.test(grezzo)) {
    throw new Error(
      `ADMIN_LOG_RETENTION_DAYS deve essere un numero intero di giorni maggiore di zero (letto: "${grezzo}")`
    );
  }

  const cron = presente(env.ADMIN_LOG_RETENTION_CRON)
    ? env.ADMIN_LOG_RETENTION_CRON.trim()
    : RITENZIONE_CRON_PREDEFINITO;

  if (!nodeCron.validate(cron)) {
    throw new Error(
      `ADMIN_LOG_RETENTION_CRON non e' una pianificazione valida (letto: "${cron}")`
    );
  }

  return {
    attiva: true,
    giorni: Number.parseInt(grezzo, 10),
    cron,
    // Vuoto vuol dire "tutti i tipi tranne la traccia di controllo": e'
    // `purga` a decidere quali sono, in un posto solo.
    tipi: presente(env.ADMIN_LOG_RETENTION_TYPES)
      ? env.ADMIN_LOG_RETENTION_TYPES.trim()
      : null,
  };
};

module.exports = {
  leggiConfigurazione,
  leggiRitenzione,
  problemi,
  PREDEFINITI,
  RITENZIONE_CRON_PREDEFINITO,
};
