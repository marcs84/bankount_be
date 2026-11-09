const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

const sonda = require("../src/admin/sonda");

const APERTO = { distruttivoAmmesso: true };

test("accepts a plain path on this server", () => {
  const c = sonda.valida({ metodo: "GET", percorso: "/api/health" });

  assert.equal(c.ok, true);
  assert.equal(c.richiesta.percorso, "/api/health");
  assert.equal(c.richiesta.scrive, false);
  assert.equal(c.richiesta.corpo, null);
});

test("keeps the query string of the path", () => {
  const c = sonda.valida({ metodo: "GET", percorso: "/api/addresses?user_id=156" });

  assert.equal(c.richiesta.percorso, "/api/addresses?user_id=156");
});

test("refuses anything that is not a path of this server", () => {
  // La destinazione non si scrive: la consolle prova questo server, e non
  // puo' diventare il modo di raggiungere qualcos'altro da qui.
  for (const percorso of [
    "http://example.com/x",
    "https://example.com/x",
    "//example.com/x",
    "api/health",
    "",
    null,
    "/api/health\r\nX-Finta: 1",
  ]) {
    assert.equal(sonda.valida({ metodo: "GET", percorso }).ok, false, String(percorso));
  }
});

test("refuses a path that still has its placeholders in it", () => {
  const c = sonda.valida({ metodo: "GET", percorso: "/api/wallet/{id}" });

  assert.equal(c.ok, false);
  assert.match(c.motivo, /segnaposti/);
});

test("does not probe the panel from inside the panel", () => {
  assert.equal(sonda.valida({ metodo: "GET", percorso: "/admin" }).ok, false);
  assert.equal(sonda.valida({ metodo: "GET", percorso: "/admin/api/logs" }).ok, false);

  // `/administrators` non e' il pannello: comincia con le stesse lettere e
  // nient'altro.
  assert.equal(sonda.valida({ metodo: "GET", percorso: "/administrators" }).ok, true);
});

test("refuses a method that is not a method", () => {
  assert.equal(sonda.valida({ metodo: "TRACE", percorso: "/x" }).ok, false);
  assert.equal(sonda.valida({ metodo: "CONNECT", percorso: "/x" }).ok, false);
  assert.equal(sonda.valida({ metodo: "qualunque", percorso: "/x" }).ok, false);
});

test("a method that writes needs the word typed in full", () => {
  for (const metodo of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal(sonda.valida({ metodo, percorso: "/x" }, APERTO).ok, false, metodo);
    assert.equal(
      sonda.valida({ metodo, percorso: "/x", conferma: "si" }, APERTO).ok,
      false,
      metodo
    );
    assert.equal(
      sonda.valida({ metodo, percorso: "/x", conferma: metodo.toLowerCase() }, APERTO).ok,
      false,
      metodo
    );
    assert.equal(
      sonda.valida({ metodo, percorso: "/x", conferma: metodo }, APERTO).ok,
      true,
      metodo
    );
  }
});

test("a method that only reads needs no confirmation", () => {
  for (const metodo of ["GET", "HEAD", "OPTIONS"]) {
    assert.equal(sonda.valida({ metodo, percorso: "/x" }).ok, true, metodo);
  }
});

test("DELETE also needs the switch in the environment, confirmation or not", () => {
  const spento = { distruttivoAmmesso: false };

  const c = sonda.valida({ metodo: "DELETE", percorso: "/x", conferma: "DELETE" }, spento);
  assert.equal(c.ok, false);
  assert.match(c.motivo, /ADMIN_PROBE_DESTRUCTIVE/);

  // Due interruttori indipendenti: uno si cambia con un riavvio, l'altro si
  // batte ogni volta. Spento l'uno, l'altro non basta.
  assert.equal(
    sonda.valida({ metodo: "POST", percorso: "/x", conferma: "POST" }, spento).ok,
    true
  );
});

test("refuses the headers that would change where the request goes", () => {
  for (const nome of ["host", "Host", "content-length", "connection", "transfer-encoding"]) {
    const c = sonda.valida({
      metodo: "GET",
      percorso: "/x",
      intestazioni: { [nome]: "qualcosa" },
    });
    assert.equal(c.ok, false, nome);
  }
});

test("allows the usual headers and any x- of your own", () => {
  const c = sonda.valida({
    metodo: "GET",
    percorso: "/x",
    intestazioni: { Authorization: "Bearer abc", "X-Mio": "1", Accept: "application/json" },
  });

  assert.equal(c.ok, true);
  assert.equal(c.richiesta.intestazioni.authorization, "Bearer abc");
  assert.equal(c.richiesta.intestazioni["x-mio"], "1");
});

test("refuses a header value that would smuggle a second line", () => {
  const c = sonda.valida({
    metodo: "GET",
    percorso: "/x",
    intestazioni: { "X-Mio": "uno\r\nX-Finta: due" },
  });

  assert.equal(c.ok, false);
});

test("sets the content type when a body is sent without one", () => {
  const c = sonda.valida(
    { metodo: "POST", percorso: "/x", conferma: "POST", corpo: { a: 1 } },
    APERTO
  );

  assert.equal(c.richiesta.corpo, '{"a":1}');
  assert.equal(c.richiesta.intestazioni["content-type"], "application/json");
});

test("passes a body typed as text through unchanged", () => {
  // La consolle serve anche a provare cosa fa il server con un corpo
  // malformato: riscriverlo sarebbe togliere la prova.
  const c = sonda.valida(
    { metodo: "POST", percorso: "/x", conferma: "POST", corpo: '{"a": ' },
    APERTO
  );

  assert.equal(c.richiesta.corpo, '{"a": ');
});

test("refuses a body on a method that does not carry one", () => {
  assert.equal(
    sonda.valida({ metodo: "GET", percorso: "/x", corpo: { a: 1 } }).ok,
    false
  );
});

test("refuses a body bigger than the limit", () => {
  const grosso = "x".repeat(sonda.MASSIMO_CORPO + 1);
  const c = sonda.valida(
    { metodo: "POST", percorso: "/x", conferma: "POST", corpo: grosso },
    APERTO
  );

  assert.equal(c.ok, false);
  assert.match(c.motivo, /troppo grande/);
});

// ---------------------------------------------------------------- esecuzione
//
// Un server vero su una porta effimera: la sonda parla sempre con
// 127.0.0.1, e queste prove le danno qualcosa con cui parlare.

const avvia = (gestore) =>
  new Promise((risolvi) => {
    const server = http.createServer(gestore);
    server.listen(0, "127.0.0.1", () => risolvi({ server, porta: server.address().port }));
  });

test("sends the request and brings back status, body and duration", async () => {
  const { server, porta } = await avvia((req, res) => {
    res.writeHead(201, { "content-type": "application/json", "x-prova": "si" });
    res.end(JSON.stringify({ visto: req.method + " " + req.url }));
  });

  try {
    const c = sonda.valida({ metodo: "GET", percorso: "/api/qualcosa?a=1" });
    const r = await sonda.esegui(c.richiesta, { porta, protocollo: "http" });

    assert.equal(r.ok, true);
    assert.equal(r.stato, 201);
    assert.deepEqual(JSON.parse(r.corpo), { visto: "GET /api/qualcosa?a=1" });
    assert.equal(r.intestazioni["x-prova"], "si");
    assert.equal(typeof r.durataMs, "number");
    assert.equal(r.troncata, false);
  } finally {
    server.close();
  }
});

test("goes to the loopback address whatever the path says", async () => {
  let vistoHost = null;
  const { server, porta } = await avvia((req, res) => {
    vistoHost = req.headers.host;
    res.end("ok");
  });

  try {
    const c = sonda.valida({ metodo: "GET", percorso: "/x" });
    await sonda.esegui(c.richiesta, { porta, protocollo: "http" });

    assert.equal(vistoHost, `127.0.0.1:${porta}`);
  } finally {
    server.close();
  }
});

test("leaves a mark the log can be read by", async () => {
  let intestazioni = null;
  const { server, porta } = await avvia((req, res) => {
    intestazioni = req.headers;
    res.end("ok");
  });

  try {
    const c = sonda.valida({ metodo: "GET", percorso: "/x" });
    await sonda.esegui(c.richiesta, { porta, protocollo: "http" });

    // La riga di API_REQUEST che nasce da questa chiamata e' per tutto il
    // resto identica a una vera.
    assert.equal(intestazioni["x-admin-probe"], "1");
  } finally {
    server.close();
  }
});

test("sends the body and the length it really has", async () => {
  let ricevuto = "";
  let lunghezza = null;
  const { server, porta } = await avvia((req, res) => {
    lunghezza = req.headers["content-length"];
    req.on("data", (p) => { ricevuto += p; });
    req.on("end", () => res.end("ok"));
  });

  try {
    const c = sonda.valida(
      { metodo: "POST", percorso: "/x", conferma: "POST", corpo: { nome: "però" } },
      APERTO
    );
    await sonda.esegui(c.richiesta, { porta, protocollo: "http" });

    assert.equal(ricevuto, '{"nome":"però"}');
    // In byte e non in caratteri: con una lettera accentata dentro, i due
    // numeri non coincidono e il server resterebbe in attesa.
    assert.equal(Number(lunghezza), Buffer.byteLength(c.richiesta.corpo));
  } finally {
    server.close();
  }
});

test("truncates a huge response instead of swallowing it whole", async () => {
  const { server, porta } = await avvia((req, res) => {
    res.writeHead(200);
    res.end("x".repeat(sonda.MASSIMO_RISPOSTA + 50000));
  });

  try {
    const c = sonda.valida({ metodo: "GET", percorso: "/x" });
    const r = await sonda.esegui(c.richiesta, { porta, protocollo: "http" });

    assert.equal(r.troncata, true);
    assert.ok(r.corpo.length <= sonda.MASSIMO_RISPOSTA);
    assert.ok(r.byte > sonda.MASSIMO_RISPOSTA);
  } finally {
    server.close();
  }
});

test("reports a refused connection as a failure, not as an exception", async () => {
  // Una porta su cui non ascolta nessuno: la sonda deve rispondere, non
  // sollevare, o un errore di rete diventerebbe un guasto del pannello.
  const c = sonda.valida({ metodo: "GET", percorso: "/x" });
  const r = await sonda.esegui(c.richiesta, { porta: 1, protocollo: "http" });

  assert.equal(r.ok, false);
  assert.equal(typeof r.motivo, "string");
  assert.equal(typeof r.durataMs, "number");
});
