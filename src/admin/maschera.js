// Mascheramento dei dati di persone reali nel visore del registro.
//
// Il registro contiene indirizzi di portafoglio e identificativi di
// dispositivo: non sono segreti - stanno su una catena pubblica - ma sono
// riconducibili a una persona, e un pannello aperto su uno schermo non deve
// mostrarli per forza. `redact` toglie cio' che non deve mai essere scritto;
// questo invece nasconde cio' che non serve *leggere* mentre si guarda il
// registro, e si puo' spegnere con un interruttore quando serve davvero.
//
// Mascherato non vuol dire cancellato: si tengono la testa e la coda, cosi'
// due righe che parlano dello stesso indirizzo restano riconoscibili l'una
// nell'altra senza che l'indirizzo si legga per intero.
const CHIAVI = [
  "address",
  "addresses",
  "from_address",
  "to_address",
  "fromaddress",
  "toaddress",
  "wallet_address",
  "walletaddress",
  "device_id",
  "deviceid",
  "device_identifier",
  // Identificativi di portafoglio: non stanno su nessuna catena pubblica, ma
  // indicano il portafoglio di una persona come un indirizzo indica il suo
  // conto. Mascherati tengono comunque testa e coda, quindi due righe dello
  // stesso portafoglio restano riconoscibili.
  "wallet_id",
  "walletid",
  "uuid",
  "fcm_token",
  "email",
  "phone",
  "phone_number",
  "publickey",
  "public_key",
  "xpub",
];

const PROFONDITA_MASSIMA = 6;
const MINIMA_DA_MASCHERARE = 14;
const TESTA = 6;
const CODA = 4;

const daMascherare = (chiave) => CHIAVI.includes(String(chiave).toLowerCase());

// Una stringa corta non si maschera a meta': diventerebbe illeggibile senza
// nascondere niente. Si sostituisce per intero.
const mascheraStringa = (testo) => {
  const s = String(testo);
  if (s.length < MINIMA_DA_MASCHERARE) return "***";
  return `${s.slice(0, TESTA)}…${s.slice(-CODA)}`;
};

// Un pezzo di percorso che "sembra un identificativo": lungo, senza spazi,
// fatto di sole lettere e cifre. Gli indirizzi compaiono anche dentro gli URL
// (`/api/transactions/1A1zP1...`), e l'azione della riga di registro e'
// appunto metodo + URL.
const PEZZO_IDENTIFICATIVO = /^[A-Za-z0-9_:-]{20,}$/;

// La stringa di interrogazione non si lascia intatta e non si butta via.
//
// Nelle rotte in lettura gli identificativi stanno proprio qui
// (`?wallet_id=…&user_id=191`), quindi lasciarla intera vorrebbe dire
// mascherare le `PUT` e non le `GET`. Ma il resto dei filtri - la rete, la
// valuta, il tipo di moneta - e' spesso l'unico modo di capire cosa cercava
// quella richiesta. Si maschera quindi il valore delle chiavi che portano una
// persona, e si lascia leggibile tutto il resto.
const mascheraQuery = (query) =>
  query
    .split("&")
    .map((coppia) => {
      const uguale = coppia.indexOf("=");
      if (uguale <= 0) return coppia;
      const chiave = coppia.slice(0, uguale);
      const valore = coppia.slice(uguale + 1);
      if (valore === "" || !daMascherare(chiave)) return coppia;
      return `${chiave}=${mascheraStringa(valore)}`;
    })
    .join("&");

const mascheraPercorso = (percorso) => {
  if (typeof percorso !== "string" || percorso === "") return percorso;
  const [prima, ...resto] = percorso.split("?");
  const mascherato = prima
    .split("/")
    .map((pezzo) => (PEZZO_IDENTIFICATIVO.test(pezzo) ? mascheraStringa(pezzo) : pezzo))
    .join("/");
  return resto.length ? `${mascherato}?${mascheraQuery(resto.join("?"))}` : mascherato;
};

// L'azione e' "METODO /percorso": si maschera solo il percorso.
const mascheraAzione = (azione) => {
  if (typeof azione !== "string" || azione === "") return azione;
  const spazio = azione.indexOf(" ");
  if (spazio === -1) return mascheraPercorso(azione);
  return `${azione.slice(0, spazio)} ${mascheraPercorso(azione.slice(spazio + 1))}`;
};

// Sotto una chiave da mascherare puo' esserci una stringa, ma anche un
// elenco: `insertAddress` prende un array di indirizzi, e mascherare solo il
// caso singolo vorrebbe dire mostrarli tutti in chiaro proprio dove sono di
// piu'.
function mascheraSotto(valore, profondita) {
  if (typeof valore === "string") return mascheraStringa(valore);
  if (Array.isArray(valore)) {
    return valore.map((elemento) => mascheraSotto(elemento, profondita + 1));
  }
  return maschera(valore, profondita + 1);
}

function maschera(valore, profondita = 0) {
  if (valore === null || valore === undefined) return valore;
  if (profondita >= PROFONDITA_MASSIMA) return valore;

  if (Array.isArray(valore)) {
    return valore.map((elemento) => maschera(elemento, profondita + 1));
  }

  if (typeof valore === "object") {
    const fuori = {};
    for (const [chiave, dentro] of Object.entries(valore)) {
      if (daMascherare(chiave)) {
        fuori[chiave] = mascheraSotto(dentro, profondita);
      } else if (chiave === "url" || chiave === "percorso" || chiave === "path") {
        fuori[chiave] =
          typeof dentro === "string" ? mascheraPercorso(dentro) : maschera(dentro, profondita + 1);
      } else {
        fuori[chiave] = maschera(dentro, profondita + 1);
      }
    }
    return fuori;
  }

  return valore;
}

module.exports = {
  maschera,
  mascheraAzione,
  mascheraPercorso,
  mascheraStringa,
  CHIAVI,
};
