const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const sysLogger = require("../sysLogger");

// `req.path` dentro un router montato e' relativo al punto di innesto: il
// blocco sull'accesso al pannello si registrava come "/api/login", che e'
// anche il percorso di una rotta dell'applicazione. `originalUrl` e' il
// percorso che il chiamante ha davvero chiesto.
const rejection = (action) => (req, res) => {
  sysLogger.logToDb(
    "SYSTEM_EVENT",
    action,
    {
      path: req.originalUrl || req.path,
      ip: req.ip || req.socket.remoteAddress,
    },
    "WARN"
  );
  res.status(429).json({ result: false, message: "Too many requests" });
};

// Tentativi di autenticazione: contati per identificatore, non per IP, cosi' un
// solo dispositivo dietro NAT non blocca gli altri e cambiare IP non aggira il limite.
// Senza identificatore si ricade sull'indirizzo, ridotto alla sua sottorete:
// un singolo IPv6 non e' un'identita', chi ne controlla un intervallo avrebbe
// altrimenti un contatore nuovo per ogni tentativo.
const loginKey = (req) => {
  const identifier = req.body && req.body.identifier;
  return identifier ? String(identifier) : ipKeyGenerator(req.ip);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: loginKey,
  skipSuccessfulRequests: true,
  handler: rejection("rateLimit.login.blocked"),
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejection("rateLimit.api.blocked"),
});

// Accesso al pannello: una sola credenziale, nessun dispositivo dietro NAT da
// tutelare, quindi il conteggio va per indirizzo e non per identificatore come
// nel login dei dispositivi. Dietro quella credenziale c'e' tutto il pannello,
// per cui il limite e' la metà di quello e la finestra la stessa.
//
// I tentativi riusciti non contano: un amministratore che apre e chiude il
// pannello durante una giornata di lavoro non deve chiudersi fuori da solo.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: true,
  handler: rejection("rateLimit.adminLogin.blocked"),
});

module.exports = { loginLimiter, apiLimiter, adminLoginLimiter, loginKey };
