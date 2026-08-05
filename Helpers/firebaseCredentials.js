const fs = require("fs");

function parseServiceAccount(raw) {
  const value = raw.trim();
  const json = value.startsWith("{")
    ? value
    : Buffer.from(value, "base64").toString("utf8");

  return JSON.parse(json);
}

function loadServiceAccount(env = process.env) {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    return parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    return JSON.parse(
      fs.readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
    );
  }

  throw new Error(
    "Firebase credentials not configured: set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS"
  );
}

module.exports = { loadServiceAccount };
