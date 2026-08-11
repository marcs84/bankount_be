const dns = require("node:dns/promises");
const net = require("node:net");

// Il nodo indicato dall'utente viene interrogato dal server, e l'explorer viene
// aperto dall'app in una vista web: entrambi vanno trattati come indirizzi
// ostili finche' non e' dimostrato il contrario.
const SCHEMA_AMMESSO = "https:";

const inIntervalloIPv4 = (ip, prefisso, bit) => {
  const numero = (indirizzo) =>
    indirizzo.split(".").reduce((acc, ottetto) => (acc << 8) + Number(ottetto), 0) >>> 0;
  const maschera = bit === 0 ? 0 : (0xffffffff << (32 - bit)) >>> 0;
  return (numero(ip) & maschera) === (numero(prefisso) & maschera);
};

const INTERVALLI_IPV4_RISERVATI = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // include l'indirizzo dei metadati delle piattaforme cloud
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const ipv4Riservato = (ip) => INTERVALLI_IPV4_RISERVATI.some(([rete, bit]) => inIntervalloIPv4(ip, rete, bit));

// L'espansione ai suoi otto gruppi evita di ragionare sui prefissi testuali:
// lo stesso indirizzo si scrive in molti modi e il parser degli URL lo
// riscrive, per esempio trasformando ::ffff:127.0.0.1 in ::ffff:7f00:1.
const espandiIPv6 = (ip) => {
  let resto = ip;
  let codaIPv4 = null;

  const quartetto = resto.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (quartetto) {
    const ottetti = quartetto[1].split(".").map(Number);
    if (ottetti.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return null;
    codaIPv4 = [(ottetti[0] << 8) | ottetti[1], (ottetti[2] << 8) | ottetti[3]];
    resto = resto.slice(0, -quartetto[1].length).replace(/:$/, ":");
  }

  const [testa, coda] = resto.split("::");
  const pezzi = (parte) => (parte ? parte.split(":").filter((g) => g !== "") : []);

  let gruppi;
  if (coda === undefined) {
    gruppi = pezzi(testa);
  } else {
    const sinistra = pezzi(testa);
    const destra = pezzi(coda);
    const mancanti = 8 - sinistra.length - destra.length - (codaIPv4 ? 2 : 0);
    if (mancanti < 0) return null;
    gruppi = [...sinistra, ...Array(mancanti).fill("0"), ...destra];
  }

  const numeri = gruppi.map((g) => parseInt(g, 16));
  if (numeri.some((n) => Number.isNaN(n) || n < 0 || n > 0xffff)) return null;
  if (codaIPv4) numeri.push(...codaIPv4);
  return numeri.length === 8 ? numeri : null;
};

const ipv6Riservato = (ip) => {
  const gruppi = espandiIPv6(ip.toLowerCase().replace(/^\[|\]$/g, ""));
  if (!gruppi) return true; // se non e' interpretabile non lo si lascia passare

  const tuttiZero = gruppi.every((g) => g === 0);
  if (tuttiZero) return true; // ::
  if (gruppi.slice(0, 7).every((g) => g === 0) && gruppi[7] === 1) return true; // ::1

  // ::ffff:0:0/96, cioe' un indirizzo IPv4 travestito
  if (gruppi.slice(0, 5).every((g) => g === 0) && gruppi[5] === 0xffff) {
    const a = gruppi[6];
    const b = gruppi[7];
    return ipv4Riservato([a >> 8, a & 0xff, b >> 8, b & 0xff].join("."));
  }

  if ((gruppi[0] & 0xfe00) === 0xfc00) return true; // fc00::/7, indirizzi locali unici
  if ((gruppi[0] & 0xffc0) === 0xfe80) return true; // fe80::/10, collegamento locale
  return false;
};

const indirizzoRiservato = (host) => {
  const versione = net.isIP(host);
  if (versione === 4) return ipv4Riservato(host);
  if (versione === 6) return ipv6Riservato(host);
  return false;
};

const NOMI_LOCALI = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.home\.arpa)$/i;

const rifiuta = (motivo) => ({ ok: false, motivo });

// Restituisce l'esito invece di lanciare: chi chiama decide come rispondere.
// Il risolutore e' un parametro per poter provare il controllo sui nomi senza
// dipendere dal DNS reale.
const verificaUrlEsterno = async (valore, { risolvi = (host) => dns.lookup(host, { all: true }) } = {}) => {
  if (valore === null || valore === undefined || valore === "") {
    return { ok: true, assente: true };
  }
  if (typeof valore !== "string") {
    return rifiuta("URL non valido");
  }

  let url;
  try {
    url = new URL(valore.trim());
  } catch (e) {
    return rifiuta("URL non valido");
  }

  if (url.protocol !== SCHEMA_AMMESSO) {
    return rifiuta("Sono ammessi solo indirizzi https");
  }
  if (url.username || url.password) {
    return rifiuta("L'indirizzo non puo' contenere credenziali");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host) {
    return rifiuta("URL non valido");
  }
  if (NOMI_LOCALI.test(host)) {
    return rifiuta("L'indirizzo deve essere raggiungibile pubblicamente");
  }
  if (indirizzoRiservato(host)) {
    return rifiuta("L'indirizzo deve essere raggiungibile pubblicamente");
  }

  // Un nome pubblico puo' comunque puntare alla rete interna: si risolve prima
  // di accettarlo. Se il nome non si risolve l'indirizzo viene respinto,
  // perche' non e' possibile stabilire dove porti.
  if (net.isIP(host) === 0) {
    let indirizzi;
    try {
      indirizzi = await risolvi(host);
    } catch (e) {
      return rifiuta("Impossibile risolvere l'indirizzo");
    }
    if (!indirizzi.length) {
      return rifiuta("Impossibile risolvere l'indirizzo");
    }
    if (indirizzi.some((voce) => indirizzoRiservato(voce.address))) {
      return rifiuta("L'indirizzo deve essere raggiungibile pubblicamente");
    }
  }

  return { ok: true, url: url.toString() };
};

module.exports = { verificaUrlEsterno };
