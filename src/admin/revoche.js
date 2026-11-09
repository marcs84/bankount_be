// Sessioni revocate.
//
// I token sono senza stato: una volta firmati valgono fino alla scadenza, e il
// server non ha modo di ritirarli. Per un pannello raggiungibile da fuori, con
// la consolle che puo' modificare dati, un "esci" che non invalida nulla
// sarebbe una bugia: la sessione resterebbe aperta per tutta la sua durata in
// mano a chiunque abbia copiato il token.
//
// Si tiene allora l'elenco degli identificativi ritirati, in memoria. Due
// conseguenze da sapere, entrambe accettabili:
//
//   - un riavvio del server svuota l'elenco. Ma un riavvio non *allunga* la
//     vita di nessun token: la scadenza e' dentro il token e resta quella.
//   - l'elenco vive nel processo. Con piu' processi dietro un bilanciatore
//     servirebbe uno spazio condiviso; oggi il server e' uno.
//
// L'elenco non cresce senza limite: ogni voce porta la propria scadenza e
// viene buttata quando il token sarebbe comunque scaduto.
const revocate = new Map();

const adesso = () => Math.floor(Date.now() / 1000);

const pulisci = () => {
  const ora = adesso();
  for (const [identificativo, scadenza] of revocate) {
    if (scadenza <= ora) revocate.delete(identificativo);
  }
};

const revoca = (identificativo, scadenza) => {
  if (typeof identificativo !== "string" || identificativo === "") return false;

  pulisci();

  // Senza scadenza leggibile si tiene un'ora, che e' piu' della durata
  // massima prevista per una sessione: meglio ricordare troppo che troppo poco.
  const fino = Number.isFinite(scadenza) ? scadenza : adesso() + 3600;
  if (fino <= adesso()) return false;

  revocate.set(identificativo, fino);
  return true;
};

const revocato = (identificativo) => {
  if (typeof identificativo !== "string" || identificativo === "") return false;

  const scadenza = revocate.get(identificativo);
  if (scadenza === undefined) return false;

  if (scadenza <= adesso()) {
    revocate.delete(identificativo);
    return false;
  }

  return true;
};

// Solo per le prove e per il pannello, che mostra quante sessioni ha ritirato.
const quante = () => {
  pulisci();
  return revocate.size;
};

const svuota = () => revocate.clear();

module.exports = { revoca, revocato, quante, svuota };
