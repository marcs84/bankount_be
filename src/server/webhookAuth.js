const crypto = require("crypto");
const sysLogger = require("../sysLogger");

const DEFAULT_ALGORITHM = "sha256";

const timingSafeEquals = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
};

const computeSignature = (secret, rawBody, algorithm, encoding) =>
  crypto.createHmac(algorithm, secret).update(rawBody).digest(encoding);

const normalize = (value) => String(value || "").trim().replace(/^(sha256=|sha512=)/i, "");

function verifySignature({ secret, rawBody, signature, algorithm = DEFAULT_ALGORITHM }) {
  if (!secret || !rawBody || !signature) return false;

  const provided = normalize(signature);

  return (
    timingSafeEquals(provided, computeSignature(secret, rawBody, algorithm, "hex")) ||
    timingSafeEquals(provided, computeSignature(secret, rawBody, algorithm, "base64"))
  );
}

function verifyToken({ secret, token }) {
  if (!secret || !token) return false;

  return timingSafeEquals(String(token).trim(), String(secret).trim());
}

// I provider offrono schemi diversi: alcuni firmano il corpo con HMAC, altri si
// limitano a inviare un token statico in un header, eventualmente definito da
// noi fra gli header personalizzati. Il modo si sceglie indicando quale header
// portare: senza segreto o senza header la rotta resta chiusa, perche'
// accettare un payload non verificato equivale a lasciare che chiunque scriva
// movimenti e notifiche.
function webhookVerifier({ name, secretVar, headerVar, algorithmVar, tokenHeaderVar }) {
  const closed = (req, res, action, detail) => {
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
    if (!secret) return closed(req, res, "secretMissing", { hint: `configurare ${secretVar}` });

    const signatureHeader = (process.env[headerVar] || "").toLowerCase();
    const tokenHeader = (process.env[tokenHeaderVar] || "").toLowerCase();

    if (signatureHeader) {
      const algorithm = process.env[algorithmVar] || DEFAULT_ALGORITHM;
      const signature = req.headers[signatureHeader];

      if (!verifySignature({ secret, rawBody: req.rawBody, signature, algorithm })) {
        return rejected(req, res, signature ? "signature mismatch" : "signature missing");
      }
      return next();
    }

    if (tokenHeader) {
      const token = req.headers[tokenHeader];

      if (!verifyToken({ secret, token })) {
        return rejected(req, res, token ? "token mismatch" : "token missing");
      }
      return next();
    }

    return closed(req, res, "headerMissing", { hint: `configurare ${headerVar} oppure ${tokenHeaderVar}` });
  };
}

const captureRawBody = (req, res, buf) => {
  req.rawBody = buf;
};

module.exports = { verifySignature, verifyToken, webhookVerifier, captureRawBody };
