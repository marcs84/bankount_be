const rateLimit = require("express-rate-limit");
const sysLogger = require("../sysLogger");

const rejection = (action) => (req, res) => {
  sysLogger.logToDb(
    "SYSTEM_EVENT",
    action,
    { path: req.path, ip: req.ip || req.socket.remoteAddress },
    "WARN"
  );
  res.status(429).json({ result: false, message: "Too many requests" });
};

// Tentativi di autenticazione: contati per identificatore, non per IP, cosi' un
// solo dispositivo dietro NAT non blocca gli altri e cambiare IP non aggira il limite.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String((req.body && req.body.identifier) || req.ip),
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

module.exports = { loginLimiter, apiLimiter };
