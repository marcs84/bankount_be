const crypto = require("crypto");
const sysLogger = require("../sysLogger");

const DEFAULT_ALGORITHM = "sha256";

const timingSafeEqualHex = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
};

const computeSignature = (secret, rawBody, algorithm = DEFAULT_ALGORITHM, encoding = "hex") =>
  crypto.createHmac(algorithm, secret).update(rawBody).digest(encoding);

const normalize = (value) => String(value || "").trim().replace(/^(sha256=|sha512=)/i, "");

function verifySignature({ secret, rawBody, signature, algorithm = DEFAULT_ALGORITHM }) {
  if (!secret || !rawBody || !signature) return false;

  const provided = normalize(signature);
  const hex = computeSignature(secret, rawBody, algorithm, "hex");
  const base64 = computeSignature(secret, rawBody, algorithm, "base64");

  return timingSafeEqualHex(provided, hex) || timingSafeEqualHex(provided, base64);
}

// Il segreto e il nome dell'header dipendono da come il provider e' configurato,
// quindi arrivano dall'ambiente: senza segreto la rotta resta chiusa, perche'
// accettare un payload non firmato equivale a lasciare che chiunque scriva
// movimenti e notifiche.
function webhookVerifier({ name, secretVar, headerVar, algorithmVar }) {
  return (req, res, next) => {
    const secret = process.env[secretVar];

    if (!secret) {
      sysLogger.logToDb(
        "SYSTEM_ERROR",
        `webhook.${name}.secretMissing`,
        { hint: `configurare ${secretVar}` },
        "ERROR"
      );
      return res.status(503).json({ result: false, message: "Webhook not configured" });
    }

    const headerName = (process.env[headerVar] || "").toLowerCase();
    if (!headerName) {
      sysLogger.logToDb(
        "SYSTEM_ERROR",
        `webhook.${name}.headerMissing`,
        { hint: `configurare ${headerVar}` },
        "ERROR"
      );
      return res.status(503).json({ result: false, message: "Webhook not configured" });
    }

    const signature = req.headers[headerName];
    const algorithm = process.env[algorithmVar] || DEFAULT_ALGORITHM;

    if (!verifySignature({ secret, rawBody: req.rawBody, signature, algorithm })) {
      sysLogger.logToDb(
        "SYSTEM_EVENT",
        `webhook.${name}.rejected`,
        {
          reason: signature ? "signature mismatch" : "signature missing",
          ip: req.ip || req.socket.remoteAddress,
        },
        "WARN"
      );
      return res.status(401).json({ result: false, message: "Invalid signature" });
    }

    next();
  };
}

const captureRawBody = (req, res, buf) => {
  req.rawBody = buf;
};

module.exports = { verifySignature, webhookVerifier, captureRawBody };
