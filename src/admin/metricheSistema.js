const os = require("os");
const fs = require("fs/promises");
const { monitorEventLoopDelay } = require("perf_hooks");

// Metriche della macchina e del processo.
//
// Tutto viene dal nucleo di node: `os`, `fs.statfs` per lo spazio su disco,
// `perf_hooks` per il ritardo del ciclo di eventi. Nessuna dipendenza nuova e
// nessun comando esterno da lanciare.

// Il ritardo del ciclo di eventi: quanto tardi arriva un timer rispetto a
// quando era previsto. E' la metrica che dice se node e' in sofferenza, e il
// carico medio non la sostituisce: la macchina puo' essere scarica mentre
// questo processo e' bloccato in un calcolo sincrono, e viceversa.
//
// L'istogramma si accende una volta e non si azzera mai, cosi' i numeri hanno
// un significato stabile - "da quando il processo e' partito" - e due persone
// che guardano il pannello insieme non si rubano le misure a vicenda.
//
// La risoluzione va sottratta dai valori letti. `monitorEventLoopDelay`
// campiona ogni `resolution` millisecondi e registra quando il campione e'
// arrivato davvero: su un ciclo completamente libero il valore registrato e'
// quindi circa la risoluzione stessa. Lasciandolo dentro, un server inattivo
// mostrerebbe venti millisecondi di "ritardo" che non esistono, e le soglie
// misurerebbero quel fondo invece del ritardo vero.
const RISOLUZIONE_MS = 10;
const istogramma = monitorEventLoopDelay({ resolution: RISOLUZIONE_MS });
istogramma.enable();

// `os.cpus()` restituisce tempi cumulativi dall'avvio della macchina: da soli
// non dicono quanto la CPU stia lavorando *adesso*. La percentuale si ottiene
// confrontando due campioni, quindi si tiene quello precedente. La prima
// lettura non ha niente con cui confrontarsi e restituisce null: meglio di un
// numero inventato.
let campionePrecedente = null;

const campionaCpu = () => {
  const nuclei = os.cpus().map((nucleo) => {
    const t = nucleo.times;
    return {
      inattivo: t.idle,
      occupato: t.user + t.nice + t.sys + t.irq,
    };
  });
  return { istante: Date.now(), nuclei };
};

const percentualiCpu = () => {
  const adesso = campionaCpu();
  const prima = campionePrecedente;
  campionePrecedente = adesso;

  if (!prima || prima.nuclei.length !== adesso.nuclei.length) {
    return { perNucleo: null, media: null, finestraMs: null };
  }

  const perNucleo = adesso.nuclei.map((nucleo, i) => {
    const dInattivo = nucleo.inattivo - prima.nuclei[i].inattivo;
    const dOccupato = nucleo.occupato - prima.nuclei[i].occupato;
    const totale = dInattivo + dOccupato;
    if (totale <= 0) return null;
    return Math.round((dOccupato / totale) * 1000) / 10;
  });

  const validi = perNucleo.filter((v) => v !== null);
  const media = validi.length
    ? Math.round((validi.reduce((a, b) => a + b, 0) / validi.length) * 10) / 10
    : null;

  return { perNucleo, media, finestraMs: adesso.istante - prima.istante };
};

// Spazio sul disco che ospita il processo: e' dove finiscono i file di
// registro di scorta e le immagini dei token, quindi e' il disco che conta.
const spazioDisco = async (percorso = process.cwd()) => {
  try {
    const s = await fs.statfs(percorso);
    const blocco = Number(s.bsize);
    const totale = Number(s.blocks) * blocco;
    const disponibile = Number(s.bavail) * blocco;

    return {
      percorso,
      totale,
      disponibile,
      usato: totale - disponibile,
      percentualeUsata: totale > 0
        ? Math.round(((totale - disponibile) / totale) * 1000) / 10
        : null,
    };
  } catch (errore) {
    // Un disco che non si riesce a interrogare non deve far cadere la
    // schermata: si dice che non si sa, e il resto si vede comunque.
    return { percorso, errore: errore.message };
  }
};

// Da nanosecondi a millisecondi, meno il fondo della risoluzione. Mai sotto
// zero: un campione arrivato in anticipo rispetto alla risoluzione non e' un
// ritardo negativo, e' nessun ritardo.
const inMillisecondi = (nanosecondi) => {
  const ms = nanosecondi / 1e6 - RISOLUZIONE_MS;
  return Math.round(Math.max(0, ms) * 100) / 100;
};

const ritardoCicloEventi = () => {
  // Un istogramma senza campioni restituisce NaN sulla media. Nei primi
  // millisecondi di vita del processo e' lo stato normale, e serve dire "non
  // lo so ancora" invece di un numero che non significa niente.
  if (istogramma.count === 0) {
    return { mediaMs: null, massimoMs: null, p99Ms: null, campioni: 0, risoluzioneMs: RISOLUZIONE_MS };
  }

  return {
    mediaMs: inMillisecondi(istogramma.mean),
    massimoMs: inMillisecondi(istogramma.max),
    p99Ms: inMillisecondi(istogramma.percentile(99)),
    campioni: istogramma.count,
    risoluzioneMs: RISOLUZIONE_MS,
  };
};

const memoria = () => {
  const processo = process.memoryUsage();
  const totale = os.totalmem();
  const libera = os.freemem();

  return {
    macchina: {
      totale,
      libera,
      usata: totale - libera,
      percentualeUsata: Math.round(((totale - libera) / totale) * 1000) / 10,
    },
    processo: {
      rss: processo.rss,
      heapTotale: processo.heapTotal,
      heapUsato: processo.heapUsed,
      esterna: processo.external,
      arrayBuffer: processo.arrayBuffers,
    },
  };
};

const raccogli = async () => {
  const carico = os.loadavg();

  return {
    istante: new Date().toISOString(),
    macchina: {
      nome: os.hostname(),
      piattaforma: os.platform(),
      versione: os.release(),
      architettura: os.arch(),
      uptimeSecondi: Math.round(os.uptime()),
      // Su Windows `loadavg` restituisce sempre [0,0,0]: si dice, invece di
      // mostrare tre zeri che sembrano una macchina ferma.
      caricoMedio: os.platform() === "win32" ? null : carico,
    },
    processo: {
      versioneNode: process.version,
      pid: process.pid,
      uptimeSecondi: Math.round(process.uptime()),
      ambiente: process.env.NODE_ENV || null,
    },
    cpu: {
      nuclei: os.cpus().length,
      modello: os.cpus().length ? os.cpus()[0].model : null,
      ...percentualiCpu(),
    },
    memoria: memoria(),
    disco: await spazioDisco(),
    cicloEventi: ritardoCicloEventi(),
  };
};

// Solo per le prove: la percentuale della CPU ha memoria, e due prove di
// seguito non devono influenzarsi.
const azzeraCampione = () => {
  campionePrecedente = null;
};

module.exports = {
  raccogli,
  percentualiCpu,
  spazioDisco,
  ritardoCicloEventi,
  memoria,
  azzeraCampione,
  // Esportata per poterla provare con valori noti: sull'istogramma vero il
  // risultato dipende da quanto e' carica la macchina, e una prova che
  // dipende da quello non prova il codice.
  inMillisecondi,
  RISOLUZIONE_MS,
};
