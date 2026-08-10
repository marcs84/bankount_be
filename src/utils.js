const crypto = require("crypto");
const { Redis } = require("ioredis");
const bitcoin = require("bitcoinjs-lib");
const bitcore = require("bitcore-lib");
const Web3 = require("web3");
const solanaWeb3 = require("@solana/web3.js");
const ecc = require("tiny-secp256k1");
const { BIP32Factory } = require("bip32");
const { ECPairFactory } = require("ecpair");
const axios = require("axios");

const ECPair = ECPairFactory(ecc);
// Genera le gerarchie di chiavi utilizzando lo standard BIP32.
// Generate key hierarchies using the BIP32 standard.
const bip32 = BIP32Factory(ecc);

setWeb3Provider = (provider) => {
  return new Web3(provider);
};

function createCustomError(originalError, errorText) {
  const customError = new Error();
  customError.error = originalError;
  customError.message = errorText;
  return customError;
}

class ECDH_AES_Server {
  constructor() {
    this.ecdh = crypto.createECDH("secp256k1"); // Using secp256k1 curve
    this.ecdh.generateKeys();
  }

  getPublicKey() {
    return this.ecdh.getPublicKey("base64"); // Send as Base64
  }

  computeSharedSecret(clientPublicKeyBase64) {
    const clientPublicKey = Buffer.from(clientPublicKeyBase64, "base64");
    return this.ecdh.computeSecret(clientPublicKey); // Returns a Buffer
  }

  deriveAESKey(sharedSecret) {
    return crypto.createHash("sha256").update(sharedSecret).digest().slice(0, 32); // AES-256 key
  }

  encryptData(data, aesKey) {
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);

    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");

    return {
      iv: iv.toString("base64"),
      encryptedData: encrypted,
      server_public_key: this.getPublicKey(),
    };
  }
}

function formatNumberRobust(value, maxDecimals = 18) {
    const decimals = Math.max(0, Math.min(maxDecimals, 18));
    if (value === null || value === undefined) return "0";

    const toDecimalString = (s) => {
        s = String(s).trim();
        if (s === "") return "0";
        // Gestione segno
        let sign = "";
        if (s[0] === "-" || s[0] === "+") {
            sign = s[0] === "-" ? "-" : "";
            s = s.slice(1);
        }
        // Espandi notazione scientifica, se presente
        const m = s.toLowerCase().match(/^(\d+)(?:\.(\d+))?e([+-]?\d+)$/);
        if (m) {
            let intPart = m[1];
            let fracPart = m[2] || "";
            const exp = parseInt(m[3], 10);
            if (exp > 0) {
                if (exp >= fracPart.length) {
                    const zeros = "0".repeat(exp - fracPart.length);
                    return sign + intPart + fracPart + zeros;
                } else {
                    const pos = exp;
                    return sign + intPart + fracPart.slice(0, pos) + "." + fracPart.slice(pos);
                }
            } else {
                const k = -exp;
                if (k >= intPart.length) {
                    const zeros = "0".repeat(k - intPart.length);
                    return sign + "0." + zeros + intPart + fracPart;
                } else {
                    const pos = intPart.length - k;
                    return sign + intPart.slice(0, pos) + "." + intPart.slice(pos) + fracPart;
                }
            }
        }
        return sign + s;
    };

    const trimZeros = (s) => {
        if (s.includes(".")) {
            s = s.replace(/0+$/, "");
            s = s.replace(/\.$/, "");
        }
        // Rimuovi zeri iniziali dall'intero (ma lascia almeno uno)
        s = s.replace(/^(-?)0+(?=\d)/, "$1");
        return s === "" || s === "-" ? "0" : s;
    };

    // Se input è una stringa, tronca a maxDecimals senza arrotondare
    if (typeof value === "string") {
        let s = toDecimalString(value);
        const neg = s.startsWith("-");
        if (neg) s = s.slice(1);
        const parts = s.split(".");
        const intPart = parts[0] || "0";
        let fracPart = parts[1] || "";

        if (decimals === 0) {
            // Nessuna parte frazionaria
            return trimZeros((neg ? "-" : "") + intPart);
        }

        // Tronca frazione a maxDecimals (no rounding, elimina rumore)
        fracPart = fracPart.slice(0, decimals);
        let out = intPart + (fracPart ? "." + fracPart : "");
        return trimZeros((neg ? "-" : "") + out);
    }

    // Se input è un number, usa truncation anziché rounding per evitare promozione del rumore
    if (typeof value === "number") {
        if (!Number.isFinite(value)) return "0";
        if (value === 0) return "0";
        const factor = Math.pow(10, decimals);
        const truncated = value >= 0
            ? Math.floor(value * factor) / factor
            : Math.ceil(value * factor) / factor;
        let out = truncated.toFixed(decimals);
        return trimZeros(out);
    }

    // Fallback per tipi non gestiti
    return "0";
}

// I trasferimenti di token arrivano come intero nelle unita' minime del token:
// senza il numero di decimali quel valore non e' interpretabile.
function amountFromRawUnits(rawAmount, decimals) {
  if (rawAmount === null || rawAmount === undefined || decimals === null || decimals === undefined) return null;

  const raw = String(rawAmount).trim();
  if (!/^\d+$/.test(raw)) return null;

  const places = Number(decimals);
  if (!Number.isInteger(places) || places < 0 || places > 36) return null;
  if (places === 0) return raw;

  const padded = raw.padStart(places + 1, "0");
  const whole = padded.slice(0, padded.length - places);
  const fraction = padded.slice(padded.length - places).replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole;
}

async function usdToEurConversion(usdAmount){
  const response = await axios.get(`https://api.frankfurter.app/latest?amount=${usdAmount}&from=USD&to=EUR`)
  return response.data.rates.EUR;
}

module.exports = {
  ECPair,
  crypto,
  bitcoin,
  Web3,
  setWeb3Provider,
  solanaWeb3,
  ecc,
  bip32,
  bitcore,
  axios,
  createCustomError,
  ECDH_AES_Server,
  formatNumberRobust,
  amountFromRawUnits,
  usdToEurConversion
};
