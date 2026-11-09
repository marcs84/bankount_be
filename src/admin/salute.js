// I semafori: "l'applicazione sta girando come deve?"
//
// Le metriche di sistema e di database dicono *come sta* il server. Questo
// file risponde a una domanda diversa e piu' utile al mattino: i pezzi che
// compongono il servizio stanno funzionando? L'ultimo accesso da un telefono,
// l'ultimo webhook arrivato, l'ultima sincronizzazione andata a buon fine.
//
// La valutazione e' separata dalla raccolta: `valuta` e' una funzione pura che
// prende i fatti e restituisce i colori, e si puo' provare senza un database.
// Cosi' le soglie sono leggibili e discutibili, invece di stare sparse dentro
// le interrogazioni.
const ORA = 60 * 60 * 1000;

const SOGLIE = {
  // Il database e' l'unica dipendenza da cui non si prescinde: qualunque
  // lentezza oltre il decimo di secondo su un `SELECT 1` e' un segnale.
  pingDatabaseMs: { attenzione: 100, guasto: 1000 },

  // La sincronizzazione dei metadati gira una volta al giorno a mezzanotte.
  // Ventisei ore lasciano margine a un'esecuzione lenta senza accendere
  // l'allarme per nulla; oltre le due giornate manca davvero.
  sincronizzazione: { attenzione: 26 * ORA, guasto: 50 * ORA },

  // Gli errori nell'ultima ora. Qualcuno c'e' sempre - una richiesta malformata,
  // una rete che cade - ma una decina in un'ora vuol dire che qualcosa insiste.
  erroriUltimaOra: { attenzione: 10, guasto: 50 },

  // Il disco: sotto il 10% libero si fa in fretta a non poterci piu' scrivere.
  discoPercentualeUsata: { attenzione: 85, guasto: 95 },

  // La memoria della macchina.
  memoriaPercentualeUsata: { attenzione: 85, guasto: 95 },

  // Il ritardo del ciclo di eventi: oltre questi valori le richieste cominciano
  // ad aspettare il processo invece della rete o del database.
  cicloEventiP99Ms: { attenzione: 100, guasto: 500 },

  // Il registro: quando supera questa soglia vale la pena lanciare la purga.
  registroRighe: { attenzione: 200000, guasto: 1000000 },
};

const OK = "ok";
const ATTENZIONE = "attenzione";
const GUASTO = "guasto";
const IGNOTO = "ignoto";

// Soglie crescenti: piu' alto il valore, peggio sta.
const perEccesso = (valore, soglie) => {
  if (valore === null || valore === undefined || !Number.isFinite(valore)) return IGNOTO;
  if (valore >= soglie.guasto) return GUASTO;
  if (valore >= soglie.attenzione) return ATTENZIONE;
  return OK;
};

const eta = (istante, adesso) => {
  if (!istante) return null;
  const quando = istante instanceof Date ? istante.getTime() : new Date(istante).getTime();
  if (!Number.isFinite(quando)) return null;
  return adesso - quando;
};

// `ioredis` passa per sette stati; solo "ready" vuol dire utilizzabile.
//
// Redis spento non e' un guasto del servizio: la cache dei prezzi ha una
// strada alternativa e l'applicazione continua a funzionare, piu' lenta e
// facendo piu' chiamate all'esterno. Chiamarlo "guasto" vorrebbe dire
// accendere un allarme rosso su un server che sta servendo le richieste, e un
// pannello che grida al lupo si impara a ignorarlo.
const statoRedis = (stato) => {
  if (!stato) return IGNOTO;
  return stato === "ready" ? OK : ATTENZIONE;
};

const valuta = (fatti, adesso = Date.now()) => {
  const voci = [];
  const aggiungi = (chiave, stato, valore, dettaglio) =>
    voci.push({ chiave, stato, valore, dettaglio });

  // --- database ---
  if (!fatti.database || fatti.database.risponde !== true) {
    aggiungi("database", GUASTO, null,
      fatti.database && fatti.database.errore ? fatti.database.errore : "non risponde");
  } else {
    aggiungi("database", perEccesso(fatti.database.latenzaMs, SOGLIE.pingDatabaseMs),
      fatti.database.latenzaMs, "latenza di SELECT 1 in millisecondi");
  }

  // --- cache ---
  aggiungi("redis", statoRedis(fatti.redis), fatti.redis,
    "la cache dei prezzi; spenta l'applicazione funziona, piu' lenta");

  // --- sincronizzazione dei metadati ---
  const etaSync = eta(fatti.ultimaSincronizzazioneRiuscita, adesso);
  if (etaSync === null) {
    aggiungi("sincronizzazione", IGNOTO, null, "nessuna sincronizzazione riuscita in archivio");
  } else {
    aggiungi("sincronizzazione", perEccesso(etaSync, SOGLIE.sincronizzazione),
      fatti.ultimaSincronizzazioneRiuscita,
      "ultima riuscita; gira una volta al giorno a mezzanotte");
  }

  // Un avvio piu' recente dell'ultimo successo vuol dire che l'ultima corsa
  // non e' arrivata in fondo. Non e' un guasto del servizio, ma e' la cosa
  // che un pannello deve far notare invece di mostrare solo l'ultimo successo.
  const etaAvvio = eta(fatti.ultimaSincronizzazioneAvviata, adesso);
  if (etaAvvio !== null && (etaSync === null || etaAvvio < etaSync - 60 * 1000)) {
    aggiungi("sincronizzazione-incompleta", ATTENZIONE, fatti.ultimaSincronizzazioneAvviata,
      "l'ultima sincronizzazione e' partita e non risulta conclusa");
  }

  // --- errori recenti ---
  aggiungi("errori-ultima-ora", perEccesso(fatti.erroriUltimaOra, SOGLIE.erroriUltimaOra),
    fatti.erroriUltimaOra, "righe di registro con stato ERROR nell'ultima ora");

  // --- risorse ---
  if (fatti.disco && Number.isFinite(fatti.disco.percentualeUsata)) {
    aggiungi("disco", perEccesso(fatti.disco.percentualeUsata, SOGLIE.discoPercentualeUsata),
      fatti.disco.percentualeUsata, "percentuale usata del disco del processo");
  } else {
    aggiungi("disco", IGNOTO, null, "spazio su disco non leggibile");
  }

  aggiungi("memoria", perEccesso(fatti.memoriaPercentualeUsata, SOGLIE.memoriaPercentualeUsata),
    fatti.memoriaPercentualeUsata, "percentuale usata della memoria della macchina");

  aggiungi("ciclo-eventi", perEccesso(fatti.cicloEventiP99Ms, SOGLIE.cicloEventiP99Ms),
    fatti.cicloEventiP99Ms, "ritardo del ciclo di eventi, 99esimo percentile");

  // --- registro ---
  aggiungi("registro", perEccesso(fatti.registroRighe, SOGLIE.registroRighe),
    fatti.registroRighe, "righe in system_logs; la purga si lancia a mano");

  // --- segni di vita, senza giudizio ---
  //
  // Questi non hanno una soglia sensata: quanto tempo passa fra due accessi o
  // fra due webhook dipende da chi usa l'applicazione e da cosa succede sulle
  // catene, non dalla salute del server. Si mostrano, non si colorano.
  const informativi = [
    ["ultimo-accesso-dispositivo", fatti.ultimoAccessoDispositivo],
    ["ultimo-webhook", fatti.ultimoWebhook],
    ["ultima-riga-di-registro", fatti.ultimaRigaRegistro],
  ];
  for (const [chiave, valore] of informativi) {
    aggiungi(chiave, valore ? OK : IGNOTO, valore || null, "informativo, senza soglia");
  }

  const peggiore = voci.reduce((acc, voce) => {
    const ordine = { [OK]: 0, [IGNOTO]: 1, [ATTENZIONE]: 2, [GUASTO]: 3 };
    return ordine[voce.stato] > ordine[acc] ? voce.stato : acc;
  }, OK);

  return { complessivo: peggiore, voci };
};

module.exports = { valuta, perEccesso, statoRedis, eta, SOGLIE, OK, ATTENZIONE, GUASTO, IGNOTO };
