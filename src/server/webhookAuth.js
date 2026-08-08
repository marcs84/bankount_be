const crypto = require("crypto");
const sysLogger = require("../sysLogger");

const DEFAULT_ALGORITHM = "sha256";
const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;

const timingSafeEquals = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
};

const digest = (secret, payload, algorithm, encoding) =>
  crypto.createHmac(algorithm, Buffer.from(secret)).update(payload).digest(encoding);

const normalize = (value) => String(value || "").trim().replace(/^(sha256=|sha512=)/i, "");

function verifySignature({ secret, signedPayload, signature, algorithm = DEFAULT_ALGORITHM }) {
  if (!secret || !signedPayload || !signature) return false;

  const provided = normalize(signature);

  return (
    timingSafeEquals(provided, digest(secret, signedPayload, algorithm, "hex")) ||
    timingSafeEquals(provided, digest(secret, signedPayload, algorithm, "base64"))
  );
}

// Quicknode Streams firma la concatenazione di nonce, timestamp e corpo, non il
// solo corpo: verificare l'HMAC del payload da solo non validerebbe mai le loro
// richieste. Il corpo e' quello decompresso, che e' cio' che body-parser
// consegna alla callback di verifica.
const SCHEMES = {
  raw: ({ rawBody }) => rawBody,
  quicknode: ({ rawBody, headers }) => {
    const nonce = headers["x-qn-nonce"];
    const timestamp = headers["x-qn-timestamp"];
    if (!nonce || !timestamp) return null;

    return Buffer.concat([Buffer.from(String(nonce)), Buffer.from(String(timestamp)), rawBody]);
  },
};

function timestampWithinTolerance(timestamp, toleranceMs) {
  if (!timestamp) return true;

  const value = Number(timestamp);
  if (!Number.isFinite(value)) return true;

  const millis = value > 1e12 ? value : value * 1000;
  return Math.abs(Date.now() - millis) <= toleranceMs;
}

function webhookVerifier({ name, secretVar, headerVar, algorithmVar, schemeVar, toleranceVar }) {
  const closed = (res, action, detail) => {
    sysLogger.logToDb("SYSTEM_ERROR", `webhook.${name}.${action}`, detail, "ERROR");
    return res.status(503).json({ result: false, message: "Webhook not configured" });
  };

  const rejected = (req, res, reason) => {
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      `webhook.${name}.rejected`,
      { reason, ip: req.ip || req.socket.remoteAddress },
      "WARN"
    );
    return res.status(401).json({ result: false, message: "Invalid signature" });
  };

  return (req, res, next) => {
    const secret = process.env[secretVar];
    if (!secret) return closed(res, "secretMissing", { hint: `configurare ${secretVar}` });

    const signatureHeader = (process.env[headerVar] || "").toLowerCase();
    if (!signatureHeader) return closed(res, "headerMissing", { hint: `configurare ${headerVar}` });

    const schemeName = process.env[schemeVar] || "raw";
    const buildPayload = SCHEMES[schemeName];
    if (!buildPayload) return closed(res, "schemeUnknown", { scheme: schemeName });

    const toleranceMs = Number(process.env[toleranceVar]) || DEFAULT_TOLERANCE_MS;
    if (!timestampWithinTolerance(req.headers["x-qn-timestamp"], toleranceMs)) {
      return rejected(req, res, "timestamp outside tolerance");
    }

    const signedPayload = buildPayload({ rawBody: req.rawBody, headers: req.headers });
    if (!signedPayload) return rejected(req, res, "signature components missing");

    const algorithm = process.env[algorithmVar] || DEFAULT_ALGORITHM;
    const signature = req.headers[signatureHeader];

    if (!verifySignature({ secret, signedPayload, signature, algorithm })) {
      return rejected(req, res, signature ? "signature mismatch" : "signature missing");
    }

    next();
  };
}

const captureRawBody = (req, res, buf) => {
  req.rawBody = buf;
};

module.exports = { verifySignature, webhookVerifier, captureRawBody, SCHEMES };
