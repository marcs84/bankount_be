const fs = require("fs");

// La credenziale di servizio contiene una chiave privata: resta in un file
// fuori dal repository e l'ambiente ne indica solo il percorso.
function loadServiceAccount(env = process.env) {
  const percorso = env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!percorso || !percorso.trim()) {
    throw new Error(
      "Firebase credentials not configured: set GOOGLE_APPLICATION_CREDENTIALS to the service account file"
    );
  }

  let contenuto;
  try {
    contenuto = fs.readFileSync(percorso.trim(), "utf8");
  } catch (error) {
    throw new Error(`Firebase credentials not readable at ${percorso.trim()}: ${error.message}`);
  }

  try {
    return JSON.parse(contenuto);
  } catch (error) {
    throw new Error(`Firebase credentials at ${percorso.trim()} are not valid JSON`);
  }
}

module.exports = { loadServiceAccount };
