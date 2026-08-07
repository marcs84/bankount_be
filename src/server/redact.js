const SENSITIVE_KEYS = [
  "passkey",
  "password",
  "old_password",
  "new_password",
  "token",
  "device_token",
  "access_token",
  "refresh_token",
  "authorization",
  "secret",
  "api_key",
  "apikey",
  "private_key",
  "privatekey",
  "mnemonic",
  "seed",
  "xpriv",
  "masternode",
  "client_public_key",
  "signedtx",
  "totp",
  "otp",
  "pin",
];

const REDACTED = "[redacted]";
const MAX_DEPTH = 6;

const isSensitive = (key) => SENSITIVE_KEYS.includes(String(key).toLowerCase());

function redact(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return REDACTED;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = isSensitive(key) ? REDACTED : redact(val, depth + 1);
    }
    return out;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return JSON.stringify(redact(parsed, depth + 1));
      }
    } catch (e) {}
    return value;
  }

  return value;
}

module.exports = { redact, SENSITIVE_KEYS };
