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

module.exports = { leggiConfigurazione, problemi, PREDEFINITI };
