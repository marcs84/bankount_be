const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const dao = require("../src/dao");

// Un disco finto, in memoria. Le prove non devono dipendere da cosa c'e'
// davvero in public/token -- su una macchina appena clonata e' vuota, su
// questa ci sono quarantamila file -- ne' lasciare file in giro.
const discoFinto = (...presenti) => {
  const file = new Map(presenti.map((n) => [path.normalize(n), Buffer.from("x")]));
  const cartelle = new Set();

  return {
    file,
    cartelle,
    esiste: (p) => file.has(path.normalize(p)),
    creaCartella: (p) => cartelle.add(path.normalize(p)),
    scrivi: (p, dati) => file.set(path.normalize(p), dati),
    elimina: (p) => {
      if (!file.delete(path.normalize(p))) throw new Error("ENOENT");
    },
    elenca: (p) => {
      const prefisso = path.normalize(p) + path.sep;
      const dentro = new Set();
      for (const nome of file.keys()) {
        if (!nome.startsWith(prefisso)) continue;
        const resto = nome.slice(prefisso.length);
        dentro.add(resto.split(path.sep)[0]);
      }
      return [...dentro];
    },
  };
};

// Una rete finta: si dichiara cosa risponde ciascun indirizzo.
const reteFinta = (risposte) => {
  const chieste = [];
  return {
    chieste,
    scarica: async (url) => {
      chieste.push(url);
      const risposta = risposte[url];
      if (!risposta) throw Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" });
      if (risposta.errore) throw risposta.errore;
      return {
        ok: risposta.stato === undefined || (risposta.stato >= 200 && risposta.stato < 300),
        status: risposta.stato || 200,
        headers: { get: (nome) => (nome === "content-type" ? risposta.tipo || null : null) },
        arrayBuffer: async () => Buffer.from(risposta.corpo || "immagine"),
      };
    },
  };
};

// Una rete finta che risponde in modo diverso alla prima e alla seconda
// occasione: serve per le prove sulla pazienza, dove cio' che conta e' il
// numero del tentativo e non l'indirizzo.
const reteAScatti = (esiti) => {
  const chieste = [];
  return {
    chieste,
    scarica: async (url) => {
      chieste.push(url);
      const esito = esiti(chieste.length);
      if (esito.errore) throw esito.errore;
      return {
        ok: esito.stato === undefined || (esito.stato >= 200 && esito.stato < 300),
        status: esito.stato || 200,
        headers: {
          get: (nome) => {
            if (nome === "content-type") return esito.tipo || "image/png";
            if (nome === "retry-after") return esito.riprovaFra === undefined ? null : String(esito.riprovaFra);
            return null;
          },
        },
        arrayBuffer: async () => Buffer.from(esito.corpo || "immagine"),
      };
    },
  };
};

// Un orologio finto: le prove sulla pazienza non devono aspettare davvero.
const orologioFinto = () => {
  const attese = [];
  return { attese, attendi: async (ms) => void attese.push(ms) };
};

// Il registro, raccolto. `sysLogger` scrive attraverso `global.connection`.
const registroFinto = () => {
  const righe = [];
  global.connection = {
    query: (sql, valori, fine) => {
      if (Array.isArray(valori) && valori.length >= 3) {
        righe.push({ azione: valori[1], dettagli: JSON.parse(valori[2]) });
      }
      if (fine) fine(null, {});
    },
  };
  return righe;
};

const token = (blockchain, address, image) => ({ blockchain, address, image });

const quantiToken = (quanti, host) =>
  Array.from({ length: quanti }, (_, i) => token("ETH", `0x${i}`, `https://${host}/x${i}.png`));

const errore = (code) => Object.assign(new Error(code), { code });

const CARTELLA = path.join("/cache", "token");
const dentro = (...pezzi) => path.join(CARTELLA, ...pezzi);

test.beforeEach(() => {
  global.connection = { query: (sql, valori, fine) => (fine ? fine(null, {}) : null) };
});

test.afterEach(() => {
  delete global.connection;
});

test("ogni catena ha la sua cartella", async () => {
  // Lo stesso indirizzo su due catene sono due token diversi con due loghi:
  // 0x26d3...bdf e' Mantle su Ethereum e Mynth su BSC. In un archivio piatto
  // ne stava uno solo, e l'altro mostrava il logo sbagliato.
  const indirizzo = "0x26d3C0D9F4cC4C130097b6afDeBE4f5e497E6bdf";
  const rete = reteFinta({
    "https://a.example/mantle.png": { corpo: "mantle" },
    "https://b.example/mynth.png": { corpo: "mynth" },
  });
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(
    [token("ETH", indirizzo, "https://a.example/mantle.png"), token("BSC", indirizzo, "https://b.example/mynth.png")],
    { cartella: CARTELLA, scarica: rete.scarica, disco, parallele: 1 }
  );

  assert.equal(conto.scaricate, 2);
  assert.equal(disco.file.get(dentro("eth", `${indirizzo.toLowerCase()}.png`)).toString(), "mantle");
  assert.equal(disco.file.get(dentro("bsc", `${indirizzo.toLowerCase()}.png`)).toString(), "mynth");
});

test("nessuna quantita' di 404 spegne l'host", async () => {
  // Il difetto, e il suo costo misurato: le immagini sono concentrate su
  // pochi host -- il piu' grande ne serve dodicimila -- e un 404 arrivava al
  // contatore dei guasti come se fosse stata la rete. Cinque indirizzi morti
  // di fila, che su GitHub stanno a grappoli perche' il catalogo e' ordinato
  // per repository, e l'host spariva: una corsa in produzione ne ha saltate
  // 4992 dopo 58 tentativi.
  const risposte = { "https://cdn.example/buona.png": { corpo: "ok" } };
  for (let i = 0; i < 10; i++) risposte[`https://cdn.example/x${i}.png`] = { stato: 404 };

  const rete = reteFinta(risposte);
  const disco = discoFinto();

  const elenco = quantiToken(10, "cdn.example");
  elenco.push(token("ETH", "0xbuona", "https://cdn.example/buona.png"));

  const conto = await dao.cacheTokenImages(elenco, {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.fallite, 10);
  assert.equal(conto.scaricate, 1, "l'undicesima immagine si scarica ancora");
  assert.equal(conto.saltatePerHostSpento, 0, "nessun 404 ha spento l'host");
});

test("un host che insiste a dire no dopo i tentativi si spegne", async () => {
  // Il verso opposto: 500 e 429 si riprovano, ma se resistono ai tentativi
  // non e' quell'immagine che non c'e', e' l'host. Senza questo, un host
  // rotto si riprova tre volte per ciascuna delle sue dodicimila immagini.
  const risposte = {};
  for (let i = 0; i < 8; i++) risposte[`https://cdn.example/x${i}.png`] = { stato: 500 };
  const rete = reteFinta(risposte);
  const disco = discoFinto();
  const orologio = orologioFinto();

  const conto = await dao.cacheTokenImages(quantiToken(8, "cdn.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
    attendi: orologio.attendi,
    ripesca: false,
  });

  assert.equal(conto.fallite, 5);
  assert.equal(conto.saltatePerHostSpento, 3, "le ultime tre non si provano nemmeno");
  assert.equal(rete.chieste.length, 15, "tre tentativi per ciascuna delle cinque");
  assert.equal(conto.rallentate, 10, "due pause per ciascuna");
});

test("un nome che non si risolve spegne l'host al primo colpo", async () => {
  // Quel nome non si risolvera' per i prossimi dodicimila token.
  const rete = reteFinta({});
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(quantiToken(5, "morto.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.saltatePerHostSpento, 4);
  // Uno nella prima passata, due nella seconda: la ripescata ha due operai e
  // il secondo e' gia' partito quando il primo scopre che l'host e' morto.
  // Tre richieste per un host che non esiste e' il prezzo della seconda
  // occasione, ed e' quello che si paga -- non cresce coi token.
  assert.equal(rete.chieste.length, 3);
  assert.equal(conto.ripesca.saltatePerHostSpento, 2);
});

test("un 429 si aspetta e si riprova", async () => {
  // 429 non e' un no: e' un no *adesso*. Contarlo come fallimento vuol dire
  // spegnere l'host proprio quando dice che basta andare piu' piano.
  const rete = reteAScatti((n) => (n === 1 ? { stato: 429, riprovaFra: 2 } : { corpo: "ok" }));
  const disco = discoFinto();
  const orologio = orologioFinto();

  const conto = await dao.cacheTokenImages([token("ETH", "0xa", "https://cdn.example/a.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    attendi: orologio.attendi,
  });

  assert.equal(conto.scaricate, 1);
  assert.equal(conto.fallite, 0);
  assert.equal(conto.rallentate, 1);
  assert.deepEqual(orologio.attese, [2000], "i due secondi che ha chiesto");
});

test("senza Retry-After l'attesa raddoppia, e con un tetto", async () => {
  const rete = reteAScatti(() => ({ stato: 429 }));
  const disco = discoFinto();
  const orologio = orologioFinto();

  const conto = await dao.cacheTokenImages([token("ETH", "0xa", "https://cdn.example/a.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    attendi: orologio.attendi,
    ripesca: false,
  });

  assert.deepEqual(orologio.attese, [1000, 2000]);
  assert.equal(rete.chieste.length, 3, "tre tentativi, poi basta");
  assert.equal(conto.fallite, 1);
});

test("un Retry-After esagerato si tronca", async () => {
  // Dieci minuti, per un'icona, con trentamila token in fila dietro: no.
  const rete = reteAScatti((n) => (n === 1 ? { stato: 503, riprovaFra: 600 } : { corpo: "ok" }));
  const disco = discoFinto();
  const orologio = orologioFinto();

  await dao.cacheTokenImages([token("ETH", "0xa", "https://cdn.example/a.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    attendi: orologio.attendi,
  });

  assert.deepEqual(orologio.attese, [15000]);
});

test("una data al posto dei secondi, e una data illeggibile", async () => {
  const fra = new Date(Date.now() + 3000).toUTCString();
  const rete = reteAScatti((n) => {
    if (n === 1) return { stato: 429, riprovaFra: fra };
    if (n === 2) return { stato: 429, riprovaFra: "domani forse" };
    return { corpo: "ok" };
  });
  const disco = discoFinto();
  const orologio = orologioFinto();

  const conto = await dao.cacheTokenImages([token("ETH", "0xa", "https://cdn.example/a.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    attendi: orologio.attendi,
  });

  assert.equal(conto.scaricate, 1);
  assert.equal(orologio.attese.length, 2);
  assert.ok(orologio.attese[0] >= 2000 && orologio.attese[0] <= 3000, "la data letta come attesa");
  assert.equal(orologio.attese[1], 2000, "illeggibile vale come assente: raddoppia e basta");
});

test("la soglia pesa quanto l'host", async () => {
  // Cinque guasti vanno bene per un host che serve dieci immagini. Per uno
  // che ne serve tremila, cinque sono un minuto sfortunato e spegnerlo costa
  // le altre 2995.
  const rete = reteAScatti(() => ({ errore: errore("ECONNRESET") }));
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(quantiToken(3000, "grande.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
    ripesca: false,
  });

  assert.equal(conto.fallite, 30, "l'uno per cento delle sue immagini");
  assert.equal(conto.saltatePerHostSpento, 2970);
});

test("la soglia ha un tetto: nemmeno il piu' grande merita trecento tentativi", async () => {
  const rete = reteAScatti(() => ({ errore: errore("ECONNRESET") }));
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(quantiToken(12000, "enorme.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
    ripesca: false,
  });

  assert.equal(conto.fallite, 60);
});

test("la seconda passata ripesca cio' che l'host aveva fatto saltare", async () => {
  // Un host spento si porta dietro tutte le sue immagini, e mentre corre non
  // c'e' modo di sapere se l'ha spento un guasto vero o un minuto
  // sfortunato. Qui il guasto passa dopo cinque richieste.
  const rete = reteAScatti((n) => (n <= 5 ? { errore: errore("ECONNRESET") } : { corpo: "ok" }));
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(quantiToken(10, "cdn.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.fallite, 5);
  assert.equal(conto.saltatePerHostSpento, 5);
  assert.equal(conto.ripesca.provate, 5);
  assert.equal(conto.ripesca.scaricate, 5, "le cinque rimaste fuori rientrano tutte");
  assert.deepEqual(conto.ripesca.hostSpentiPrima, ["cdn.example"]);
  assert.ok(disco.esiste(dentro("eth", "0x9.png")));
});

test("la ripescata si puo' spegnere, e allora non si riprova niente", async () => {
  const rete = reteAScatti(() => ({ errore: errore("ECONNRESET") }));
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(quantiToken(10, "cdn.example"), {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
    ripesca: false,
  });

  assert.equal(conto.ripesca, undefined);
  assert.equal(rete.chieste.length, 5);
});

test("il registro dice perche' sono fallite", async () => {
  // Senza questo, una corsa che salta cinquemila immagini lascia detto
  // soltanto *che* le ha saltate, e il motivo si va a cercare sondando la
  // produzione a mano con quarantotto richieste parallele.
  const righe = registroFinto();
  const risposte = {
    "https://a.example/x0.png": { stato: 404 },
    "https://a.example/x1.png": { stato: 404 },
    "https://a.example/x2.png": { stato: 403 },
  };
  const rete = reteFinta(risposte);
  const disco = discoFinto();

  await dao.cacheTokenImages(
    [...quantiToken(3, "a.example"), token("ETH", "0xz", "https://b.example/z.png")],
    { cartella: CARTELLA, scarica: rete.scarica, disco, parallele: 1 }
  );

  const riga = righe.find((r) => r.azione === "dao.cacheTokenImages.completed");
  assert.ok(riga, "la riga c'e'");
  assert.deepEqual(riga.dettagli.motivi["a.example"], { "HTTP 404": 2, "HTTP 403": 1 });
  assert.deepEqual(riga.dettagli.motivi["b.example"], { ENOTFOUND: 1 });
});

test("l'estensione viene dall'indirizzo e, se non c'e', dal tipo dichiarato", async () => {
  // Qualche centinaio di immagini ha un indirizzo senza estensione: prima
  // venivano salvate .png qualunque cosa fossero.
  const rete = reteFinta({
    "https://a.example/logo": { tipo: "image/webp" },
    "https://a.example/altro": { tipo: "image/svg+xml; charset=utf-8" },
  });
  const disco = discoFinto();

  await dao.cacheTokenImages(
    [token("ETH", "0xaaa", "https://a.example/logo"), token("ETH", "0xbbb", "https://a.example/altro")],
    { cartella: CARTELLA, scarica: rete.scarica, disco, parallele: 1 }
  );

  assert.ok(disco.esiste(dentro("eth", "0xaaa.webp")));
  assert.ok(disco.esiste(dentro("eth", "0xbbb.svg")));
});

test("cio' che non si saprebbe servire non si scrive", async () => {
  // Un'estensione copiata dall'indirizzo della sorgente: in archivio c'era un
  // file `.infra_icon`, che la rotta delle icone non puo' servire.
  const rete = reteFinta({
    "https://a.example/logo.infra_icon": { tipo: "application/octet-stream" },
  });
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages([token("ETH", "0xaaa", "https://a.example/logo.infra_icon")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.tipoIgnoto, 1);
  assert.equal(conto.scaricate, 0);
  assert.equal(disco.file.size, 0);
});

test("un'icona gia' in archivio non si riscarica", async () => {
  const rete = reteFinta({ "https://a.example/logo.png": { corpo: "nuovo" } });
  const disco = discoFinto(dentro("eth", "0xaaa.png"));

  const conto = await dao.cacheTokenImages([token("ETH", "0xAAA", "https://a.example/logo.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.presenti, 1);
  assert.equal(rete.chieste.length, 0);
});

test("se la sorgente cambia formato il file vecchio se ne va", async () => {
  // Diecimila indirizzi avevano due file, .jpg e .png, perche' il controllo
  // guardava solo l'estensione nuova. Chi legge prova .png per prima, quindi
  // serviva per sempre il vecchio.
  const rete = reteFinta({ "https://a.example/logo.jpg": { corpo: "nuovo" } });
  const disco = discoFinto(dentro("eth", "0xaaa.png"));

  const conto = await dao.cacheTokenImages([token("ETH", "0xaaa", "https://a.example/logo.jpg")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.scaricate, 1);
  assert.equal(conto.sostituite, 1);
  assert.ok(disco.esiste(dentro("eth", "0xaaa.jpg")));
  assert.ok(!disco.esiste(dentro("eth", "0xaaa.png")), "il doppione non resta");
});

test("un indirizzo che non puo' diventare un nome di file non lo diventa", async () => {
  const rete = reteFinta({ "https://a.example/logo.png": {} });
  const disco = discoFinto();

  const conto = await dao.cacheTokenImages(
    [
      token("ETH", "../../../index.js", "https://a.example/logo.png"),
      token("../etc", "0xaaa", "https://a.example/logo.png"),
    ],
    { cartella: CARTELLA, scarica: rete.scarica, disco, parallele: 1 }
  );

  assert.equal(conto.nonArchiviabili, 2);
  assert.equal(disco.file.size, 0);
  assert.equal(rete.chieste.length, 0);
});

test("la moneta nativa si chiama native dentro la sua cartella", async () => {
  const rete = reteFinta({ "https://a.example/btc.png": {} });
  const disco = discoFinto();

  await dao.cacheTokenImages([token("BTC", null, "https://a.example/btc.png")], {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.ok(disco.esiste(dentro("btc", "native.png")));
});

test("otto per volta, non una", async () => {
  let insieme = 0;
  let massimo = 0;
  const risposte = {};
  const elenco = [];
  for (let i = 0; i < 40; i++) {
    risposte[`https://a.example/${i}.png`] = {};
    elenco.push(token("ETH", `0x${i}`, `https://a.example/${i}.png`));
  }

  const disco = discoFinto();
  const scarica = async (url) => {
    insieme++;
    massimo = Math.max(massimo, insieme);
    await new Promise((fatto) => setImmediate(fatto));
    insieme--;
    return {
      ok: true,
      status: 200,
      headers: { get: () => "image/png" },
      arrayBuffer: async () => Buffer.from("x"),
    };
  };

  await dao.cacheTokenImages(elenco, { cartella: CARTELLA, scarica, disco });

  assert.equal(massimo, 8, "il parallelismo predefinito");
  assert.equal(disco.file.size, 40);
});

// ---------------------------------------------------------------------------
// La potatura. Si lancia solo a richiesta e solo a scambio riuscito.
// ---------------------------------------------------------------------------

test("la potatura toglie le icone che il catalogo non riferisce piu'", async () => {
  const disco = discoFinto(
    dentro("eth", "0xviva.png"),
    dentro("eth", "0xmorta.png"),
    dentro("eth", "strana.infra_icon"),
    dentro("bsc", "0xviva.png")
  );

  const conto = dao.potaIconeOrfane([token("ETH", "0xviva", "https://a/x.png")], { cartella: CARTELLA, disco });

  assert.equal(conto.orfane, 1, "0xmorta");
  assert.equal(conto.estraneeAlFormato, 1);
  assert.ok(disco.esiste(dentro("eth", "0xviva.png")));
  assert.ok(
    disco.esiste(dentro("bsc", "0xviva.png")),
    "la cartella di una catena che non e' nel catalogo di questa corsa non si tocca"
  );
});

test("l'archivio piatto si pota solo dove la nuova icona c'e' davvero", async () => {
  // Finche' l'icona non e' stata riscaricata nella cartella della sua catena,
  // il file piatto e' cio' che le versioni gia' installate stanno leggendo.
  const disco = discoFinto(
    dentro("0xriscaricata.png"),
    dentro("0xancorano.png"),
    dentro("eth", "0xriscaricata.png")
  );

  const conto = dao.potaIconeOrfane(
    [token("ETH", "0xriscaricata", "https://a/x.png"), token("ETH", "0xancorano", "https://a/y.png")],
    { cartella: CARTELLA, disco }
  );

  assert.equal(conto.pianoVecchio, 1);
  assert.ok(!disco.esiste(dentro("0xriscaricata.png")));
  assert.ok(disco.esiste(dentro("0xancorano.png")), "senza sostituto non si tocca");
});

test("senza richiesta non si pota niente", async () => {
  const rete = reteFinta({});
  const disco = discoFinto(dentro("eth", "0xmorta.png"));

  await dao.cacheTokenImages([], { cartella: CARTELLA, scarica: rete.scarica, disco });

  assert.ok(disco.esiste(dentro("eth", "0xmorta.png")));
});
