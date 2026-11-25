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

const token = (blockchain, address, image) => ({ blockchain, address, image });

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

test("un 404 non spegne l'host, cinque di fila si'", async () => {
  // Le immagini sono concentrate su pochi host: il piu' grande ne serve
  // dodicimila. Spegnere al primo fallimento voleva dire perderle tutte per
  // un'immagine mancante -- ed e' quello che accadeva.
  const risposte = { "https://cdn.example/buona.png": { corpo: "ok" } };
  for (let i = 0; i < 8; i++) risposte[`https://cdn.example/x${i}.png`] = { stato: 404 };

  const rete = reteFinta(risposte);
  const disco = discoFinto();

  const elenco = [];
  for (let i = 0; i < 4; i++) elenco.push(token("ETH", `0x${i}`, `https://cdn.example/x${i}.png`));
  elenco.push(token("ETH", "0xbuona", "https://cdn.example/buona.png"));

  const conto = await dao.cacheTokenImages(elenco, {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.fallite, 4);
  assert.equal(conto.scaricate, 1, "la quinta immagine si scarica ancora");
  assert.equal(conto.saltatePerHostSpento, 0);
});

test("dopo cinque fallimenti di fila l'host si spegne", async () => {
  const risposte = {};
  for (let i = 0; i < 8; i++) risposte[`https://cdn.example/x${i}.png`] = { stato: 500 };
  const rete = reteFinta(risposte);
  const disco = discoFinto();

  const elenco = [];
  for (let i = 0; i < 8; i++) elenco.push(token("ETH", `0x${i}`, `https://cdn.example/x${i}.png`));

  const conto = await dao.cacheTokenImages(elenco, {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(conto.fallite, 5);
  assert.equal(conto.saltatePerHostSpento, 3, "le ultime tre non si provano nemmeno");
  assert.equal(rete.chieste.length, 5);
});

test("un nome che non si risolve spegne l'host al primo colpo", async () => {
  // Quel nome non si risolvera' per i prossimi dodicimila token.
  const rete = reteFinta({});
  const disco = discoFinto();

  const elenco = [];
  for (let i = 0; i < 5; i++) elenco.push(token("ETH", `0x${i}`, `https://morto.example/x${i}.png`));

  const conto = await dao.cacheTokenImages(elenco, {
    cartella: CARTELLA,
    scarica: rete.scarica,
    disco,
    parallele: 1,
  });

  assert.equal(rete.chieste.length, 1, "un solo tentativo");
  assert.equal(conto.saltatePerHostSpento, 4);
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
