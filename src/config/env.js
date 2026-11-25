const REQUIRED_VARS = [
  "DB_HOST",
  "DB_USERNAME",
  "DB_DATABASE",
  "JWT_SECRET",

  // Senza questa chiave il fornitore degli scambi risponde 401 a tutto:
  // preventivi, avvii, saldi dei token e il catalogo che la sincronizzazione
  // notturna rifa'. Non era nell'elenco, e l'assenza non si vedeva da nessuna
  // parte -- il catalogo restava quello del giorno prima e il comando a mano
  // usciva senza dire niente.
  "RANGO_API_KEY",
];

const HTTPS_VARS = ["HTTPS_PRIVATEKEY", "HTTPS_CERTIFICATE"];

function findMissing(env) {
  const names =
    env.HTTPS === "true" ? REQUIRED_VARS.concat(HTTPS_VARS) : REQUIRED_VARS;

  return names.filter((name) => !env[name] || env[name].trim() === "");
}

function assertEnv(env = process.env) {
  const missing = findMissing(env);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = { assertEnv, findMissing, REQUIRED_VARS, HTTPS_VARS };
