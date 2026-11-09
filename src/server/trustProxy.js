// Da `TRUST_PROXY` a cio' che Express si aspetta.
//
// L'ambiente da' sempre stringhe, ed Express tratta ogni tipo in modo
// diverso: un numero sono i salti di proxy di cui fidarsi, un booleano e'
// tutto o niente, una stringa e' un elenco di indirizzi o nomi di rete.
//
// Passare la stringa cosi' com'e' non fa quello che sembra. Verificato:
//
//   app.set("trust proxy", "1")    ->  req.ip resta quello della presa
//   app.set("trust proxy", 1)      ->  req.ip e' quello inoltrato
//   app.set("trust proxy", "true") ->  app.set solleva: invalid IP address
//
// "1" non viene letto come un salto: viene letto come un elenco di indirizzi
// che contiene "1", che non combacia con niente. Il guasto e' il peggiore dei
// due, perche' l'impostazione sembra applicata e non lo e'.
const interpretaFiducia = (valore) => {
  if (typeof valore !== "string") return valore;

  const pulito = valore.trim();
  if (pulito === "") return false;

  // Numero di salti di cui fidarsi, contati dal server verso l'esterno.
  if (/^\d+$/.test(pulito)) return Number(pulito);

  if (pulito === "true") return true;
  if (pulito === "false") return false;

  // Tutto il resto e' un elenco di indirizzi, reti o nomi come `loopback`:
  // Express lo sa interpretare da se'.
  return pulito;
};

module.exports = { interpretaFiducia };
