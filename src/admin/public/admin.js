/* Pannello di monitoraggio: tutto il comportamento della pagina.
 *
 * Sta in un file a se' e non dentro la pagina perche' `helmet` imposta
 * `script-src 'self'`: uno <script> incorporato non verrebbe eseguito.
 *
 * Il token sta in sessionStorage, non in un cookie. Due motivi: muore con la
 * scheda, e non viene allegato alle richieste da solo, cosi' non esiste il
 * problema delle richieste contraffatte da un altro sito - che conta, perche'
 * la consolle di prova potra' chiamare anche i metodi che modificano dati.
 */
(function () {
  "use strict";

  var CHIAVE_TOKEN = "bankount.admin.token";
  var CHIAVE_VISTA = "bankount.admin.vista";
  var ATTESA_MS = 5000;

  var token = null;
  var cadenza = null;
  var vistaCorrente = "salute";
  var inCorso = false;

  // Lo dice il server all'accesso: la consolle mostra subito se i metodi
  // distruttivi sono accesi, invece di farlo scoprire con un rifiuto dopo
  // aver scritto la richiesta.
  var distruttivoAmmesso = false;

  // ---------------------------------------------------------------- memoria
  //
  // sessionStorage puo' sollevare: finestra privata, dati del sito bloccati.
  // La pagina deve funzionare comunque, chiedendo di nuovo le credenziali.

  function leggiMemoria(chiave) {
    try { return window.sessionStorage.getItem(chiave); } catch (e) { return null; }
  }

  function scriviMemoria(chiave, valore) {
    try {
      if (valore === null) window.sessionStorage.removeItem(chiave);
      else window.sessionStorage.setItem(chiave, valore);
    } catch (e) { /* si continua senza ricordare */ }
  }

  // ------------------------------------------------------------- formattazione

  function byte(n) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    var unita = ["B", "KB", "MB", "GB", "TB"];
    var i = 0;
    var v = Number(n);
    while (v >= 1024 && i < unita.length - 1) { v /= 1024; i += 1; }
    return (i === 0 ? v : v.toFixed(v < 10 ? 2 : 1)) + " " + unita[i];
  }

  function numero(n) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return Number(n).toLocaleString("it-IT");
  }

  // I millisecondi possono essere null: il ritardo del ciclo di eventi non si
  // conosce finche' non c'e' un campione. "null ms" a schermo sarebbe peggio
  // di un trattino.
  function ms(n) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return n + " ms";
  }

  function durata(secondi) {
    if (secondi === null || secondi === undefined || !isFinite(secondi)) return "—";
    var s = Math.floor(secondi);
    var g = Math.floor(s / 86400);
    var o = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (g > 0) return g + "g " + o + "h";
    if (o > 0) return o + "h " + m + "m";
    if (m > 0) return m + "m " + (s % 60) + "s";
    return s + "s";
  }

  // "3 minuti fa". Un istante assoluto costringe a fare il conto a mente, che
  // e' esattamente il lavoro che un pannello deve togliere.
  function quandoFa(iso) {
    if (!iso) return "mai";
    var quando = new Date(iso).getTime();
    if (!isFinite(quando)) return "—";
    var delta = Math.round((Date.now() - quando) / 1000);
    if (delta < 0) return "adesso";
    if (delta < 60) return delta + "s fa";
    if (delta < 3600) return Math.round(delta / 60) + "m fa";
    if (delta < 86400) return Math.round(delta / 3600) + "h fa";
    return Math.round(delta / 86400) + "g fa";
  }

  function oraLocale(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("it-IT");
  }

  // ------------------------------------------------------------------- rete

  function chiama(percorso, opzioni) {
    var o = opzioni || {};
    var intestazioni = { Accept: "application/json" };
    if (token) intestazioni.Authorization = "Bearer " + token;
    if (o.corpo) intestazioni["Content-Type"] = "application/json";

    return fetch("api/" + percorso, {
      method: o.metodo || "GET",
      headers: intestazioni,
      body: o.corpo ? JSON.stringify(o.corpo) : undefined,
      cache: "no-store",
    }).then(function (risposta) {
      return risposta.text().then(function (testo) {
        var dati = null;
        try { dati = testo ? JSON.parse(testo) : null; } catch (e) { /* non JSON */ }
        return { stato: risposta.status, ok: risposta.ok, dati: dati, testo: testo };
      });
    });
  }

  // --------------------------------------------------------------- elementi

  function el(id) { return document.getElementById(id); }

  function crea(tag, classe, testo) {
    var nodo = document.createElement(tag);
    if (classe) nodo.className = classe;
    if (testo !== undefined && testo !== null) nodo.textContent = String(testo);
    return nodo;
  }

  function svuota(nodo) {
    while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
  }

  function riquadro(titolo, valore, nota, stato) {
    // La classe dello stato porta sia il colore del numero sia il bordo del
    // riquadro quando c'e' qualcosa da guardare: vedi `.riquadro.stato-*`.
    var fuori = crea("div", "riquadro stato-" + (stato || "ok"));

    var testa = crea("div", "riquadro-titolo");
    if (stato) testa.appendChild(crea("span", "pallino pallino-" + stato));
    testa.appendChild(crea("span", null, titolo));
    fuori.appendChild(testa);

    fuori.appendChild(crea("div", "riquadro-valore", valore));
    if (nota) fuori.appendChild(crea("div", "riquadro-nota", nota));
    return fuori;
  }

  function righe(tabella, coppie) {
    var corpo = tabella.tBodies[0];
    svuota(corpo);
    coppie.forEach(function (coppia) {
      var tr = corpo.insertRow();
      tr.insertCell().textContent = coppia[0];
      var td = tr.insertCell();
      td.className = "numero";
      td.textContent = coppia[1];
    });
  }

  // ------------------------------------------------------------ vista salute

  // I nomi delle chiavi che arrivano dal server, resi leggibili.
  var NOMI = {
    "database": "Database",
    "redis": "Cache (Redis)",
    "sincronizzazione": "Sincronizzazione metadati",
    "sincronizzazione-incompleta": "Sincronizzazione non conclusa",
    "errori-ultima-ora": "Errori nell'ultima ora",
    "disco": "Disco",
    "memoria": "Memoria",
    "ciclo-eventi": "Ciclo di eventi",
    "registro": "Registro",
    "ultimo-accesso-dispositivo": "Ultimo accesso da telefono",
    "ultimo-webhook": "Ultimo webhook",
    "ultima-riga-di-registro": "Ultima riga di registro",
  };

  // Alcune voci portano un istante, altre un numero: si formattano diverso.
  var ISTANTI = {
    "sincronizzazione": true,
    "sincronizzazione-incompleta": true,
    "ultimo-accesso-dispositivo": true,
    "ultimo-webhook": true,
    "ultima-riga-di-registro": true,
  };

  var UNITA = {
    "database": " ms",
    "disco": "%",
    "memoria": "%",
    "ciclo-eventi": " ms",
  };

  function disegnaSalute(dati) {
    var contenitore = el("semafori");
    svuota(contenitore);

    (dati.voci || []).forEach(function (voce) {
      var valore;
      if (ISTANTI[voce.chiave]) {
        valore = quandoFa(voce.valore);
      } else if (voce.valore === null || voce.valore === undefined) {
        valore = "—";
      } else if (typeof voce.valore === "number") {
        valore = numero(voce.valore) + (UNITA[voce.chiave] || "");
      } else {
        valore = String(voce.valore);
      }

      var nota = voce.dettaglio || "";
      if (ISTANTI[voce.chiave] && voce.valore) nota = oraLocale(voce.valore);

      contenitore.appendChild(
        riquadro(NOMI[voce.chiave] || voce.chiave, valore, nota, voce.stato)
      );
    });

    var pallino = el("semaforo-complessivo");
    pallino.className = "pallino pallino-" + (dati.complessivo || "ignoto");
    pallino.title = "stato complessivo: " + (dati.complessivo || "ignoto");

    var c = dati.contatori;
    righe(el("tabella-contatori"), c ? [
      ["dispositivi attivi", numero(c.dispositiviAttivi) + " su " + numero(c.dispositivi)],
      ["portafogli", numero(c.portafogli)],
      ["indirizzi", numero(c.indirizzi)],
      ["notifiche (24h)", numero(c.notificheUltime24h)],
    ] : [["", "non disponibili senza database"]]);

    var errori = dati.errori;
    el("sommario-errori").textContent = errori
      ? numero(errori.ultime24h) + " nelle ultime 24 ore, " +
        numero(errori.ultimaOra) + " nell'ultima ora"
      : "non disponibili senza database";

    var corpo = el("tabella-errori").tBodies[0];
    svuota(corpo);
    var elenco = (errori && errori.perAzione) || [];
    if (!elenco.length) {
      var tr = corpo.insertRow();
      var td = tr.insertCell();
      td.colSpan = 3;
      td.className = "vuoto";
      td.textContent = "nessun errore nelle ultime 24 ore";
    } else {
      elenco.forEach(function (riga) {
        var tr = corpo.insertRow();
        var n = tr.insertCell();
        n.className = "numero";
        n.textContent = numero(riga.righe);
        tr.insertCell().textContent = riga.azione;
        var q = tr.insertCell();
        q.className = "numero";
        q.textContent = quandoFa(riga.ultima);
        q.title = oraLocale(riga.ultima);
      });
    }
  }

  // ----------------------------------------------------------- vista sistema

  function disegnaSistema(dati) {
    el("nome-macchina").textContent = dati.macchina.nome;
    el("riga-processo").textContent =
      dati.processo.versioneNode + " · pid " + dati.processo.pid +
      " · su " + dati.macchina.piattaforma;

    var contenitore = el("riquadri-sistema");
    svuota(contenitore);

    contenitore.appendChild(riquadro(
      "CPU",
      dati.cpu.media === null ? "prima lettura" : dati.cpu.media + "%",
      dati.cpu.nuclei + " nuclei" +
        (dati.cpu.finestraMs ? " · finestra " + Math.round(dati.cpu.finestraMs / 1000) + "s" : ""),
      dati.cpu.media === null ? "ignoto" :
        dati.cpu.media >= 90 ? "guasto" : dati.cpu.media >= 70 ? "attenzione" : "ok"
    ));

    var m = dati.memoria.macchina;
    contenitore.appendChild(riquadro(
      "Memoria macchina",
      m.percentualeUsata + "%",
      byte(m.usata) + " di " + byte(m.totale),
      m.percentualeUsata >= 95 ? "guasto" : m.percentualeUsata >= 85 ? "attenzione" : "ok"
    ));

    contenitore.appendChild(riquadro(
      "Memoria processo",
      byte(dati.memoria.processo.rss),
      "heap " + byte(dati.memoria.processo.heapUsato) +
        " di " + byte(dati.memoria.processo.heapTotale),
      "ok"
    ));

    var d = dati.disco;
    if (d && d.errore) {
      contenitore.appendChild(riquadro("Disco", "—", d.errore, "ignoto"));
    } else if (d) {
      contenitore.appendChild(riquadro(
        "Disco",
        d.percentualeUsata + "%",
        byte(d.disponibile) + " liberi di " + byte(d.totale),
        d.percentualeUsata >= 95 ? "guasto" : d.percentualeUsata >= 85 ? "attenzione" : "ok"
      ));
    }

    contenitore.appendChild(riquadro(
      "Processo in piedi da", durata(dati.processo.uptimeSecondi),
      "macchina da " + durata(dati.macchina.uptimeSecondi), "ok"
    ));

    var c = dati.cicloEventi;
    contenitore.appendChild(riquadro(
      "Ciclo di eventi (p99)", ms(c.p99Ms),
      "media " + ms(c.mediaMs) + " · massimo " + ms(c.massimoMs),
      c.p99Ms === null ? "ignoto" :
        c.p99Ms >= 500 ? "guasto" : c.p99Ms >= 100 ? "attenzione" : "ok"
    ));

    el("sommario-cpu").textContent = dati.cpu.modello || "—";

    var nuclei = el("nuclei");
    svuota(nuclei);
    var valori = dati.cpu.perNucleo;
    if (!valori) {
      nuclei.appendChild(crea("p", "vuoto",
        "la percentuale si ottiene confrontando due letture: al prossimo aggiornamento"));
    } else {
      valori.forEach(function (valore, i) {
        var riga = crea("div", "nucleo");
        riga.appendChild(crea("span", "nucleo-etichetta", "#" + i));
        var barra = crea("div", "barra");
        var piena = crea("div", "barra-piena");
        var v = valore === null ? 0 : valore;
        piena.style.width = Math.max(0, Math.min(100, v)) + "%";
        if (v >= 90) piena.className += " altissima";
        else if (v >= 70) piena.className += " alta";
        barra.appendChild(piena);
        riga.appendChild(barra);
        riga.appendChild(crea("span", "nucleo-valore", valore === null ? "—" : valore + "%"));
        nuclei.appendChild(riga);
      });
    }

    righe(el("tabella-ciclo"), [
      ["media", ms(c.mediaMs)],
      ["99esimo percentile", ms(c.p99Ms)],
      ["massimo", ms(c.massimoMs)],
      ["campioni", numero(c.campioni)],
      ["risoluzione", ms(c.risoluzioneMs) + " (sottratta)"],
    ]);
  }

  // ---------------------------------------------------------- vista database

  function disegnaDatabase(dati) {
    var contenitore = el("riquadri-database");
    svuota(contenitore);

    contenitore.appendChild(riquadro(
      "Ping",
      dati.ping.risponde ? dati.ping.latenzaMs + " ms" : "non risponde",
      dati.ping.risponde ? "SELECT 1" : (dati.ping.errore || ""),
      !dati.ping.risponde ? "guasto" :
        dati.ping.latenzaMs >= 1000 ? "guasto" :
          dati.ping.latenzaMs >= 100 ? "attenzione" : "ok"
    ));

    if (!dati.ping.risponde) {
      righe(el("tabella-pool"), [["", "database non raggiungibile"]]);
      el("sommario-registro").textContent = "non disponibile senza database";
      svuota(el("istogramma-registro"));
      svuota(el("tabella-tabelle").tBodies[0]);
      return;
    }

    contenitore.appendChild(riquadro("Versione", dati.versione || "—", dati.schema || "", "ok"));

    var s = dati.server || {};
    contenitore.appendChild(riquadro(
      "Server in piedi da", durata(s.Uptime),
      numero(s.Queries) + " interrogazioni da allora", "ok"
    ));

    contenitore.appendChild(riquadro(
      "Connessioni al server", numero(s.Threads_connected),
      "massimo raggiunto " + numero(s.Max_used_connections), "ok"
    ));

    contenitore.appendChild(riquadro(
      "Interrogazioni lente", numero(s.Slow_queries),
      "da quando il server e' partito",
      s.Slow_queries > 0 ? "attenzione" : "ok"
    ));

    contenitore.appendChild(riquadro(
      "Spazio delle tabelle", byte(dati.tabelle.totaleByte),
      dati.tabelle.quante + " tabelle" + (dati.tabelle.dallaCache ? " · letto fino a 30s fa" : ""),
      "ok"
    ));

    var p = dati.pool;
    righe(el("tabella-pool"), p ? [
      ["aperte", numero(p.aperte) + (p.limite ? " di " + p.limite : "")],
      ["libere", numero(p.libere)],
      ["occupate", numero(p.occupate)],
      ["in acquisizione", numero(p.inAcquisizione)],
      ["in coda", numero(p.inCoda)],
      ["chiuso", p.chiuso ? "si" : "no"],
    ] : [["", "contatori del pool non leggibili"]]);

    var r = dati.registro;
    el("sommario-registro").textContent =
      numero(r.righe) + " righe, " + byte(r.byteDettagli) + " di dettagli, " +
      "dal " + oraLocale(r.prima).split(",")[0];

    var ist = el("istogramma-registro");
    svuota(ist);
    var massimo = r.perGiorno.reduce(function (a, g) { return Math.max(a, g.righe); }, 1);
    if (!r.perGiorno.length) {
      ist.appendChild(crea("p", "vuoto", "nessuna riga negli ultimi 14 giorni"));
    }
    r.perGiorno.forEach(function (g) {
      var riga = crea("div", "istogramma-riga");
      riga.appendChild(crea("span", "istogramma-giorno", g.giorno));
      var barra = crea("div", "barra");
      var piena = crea("div", "barra-piena");
      piena.style.width = Math.round((g.righe / massimo) * 100) + "%";
      barra.appendChild(piena);
      riga.appendChild(barra);
      riga.appendChild(crea("span", "istogramma-numero", numero(g.righe)));
      ist.appendChild(riga);
    });

    var corpo = el("tabella-tabelle").tBodies[0];
    svuota(corpo);
    dati.tabelle.elenco.forEach(function (t) {
      var tr = corpo.insertRow();
      tr.insertCell().textContent = t.nome;
      [numero(t.righeStimate), byte(t.byteDati), byte(t.byteIndici), byte(t.byte)]
        .forEach(function (valore) {
          var td = tr.insertCell();
          td.className = "numero";
          td.textContent = valore;
        });
    });
  }

  // ---------------------------------------------------------- vista registro

  var filtri = { tipi: [], stati: [], pagina: 1 };
  var vociPronte = false;
  var ultimaAnteprima = null;

  function classeStato(stato) {
    if (stato === "ERROR") return "etichetta-errore";
    if (stato === "WARN") return "etichetta-avviso";
    if (stato === "SUCCESS") return "etichetta-ok";
    return null;
  }

  function etichetta(testo, classe) {
    return crea("span", "etichetta" + (classe ? " " + classe : ""), testo || "—");
  }

  function disegnaPastiglie(contenitore, voci, selezionati, quando) {
    svuota(contenitore);
    voci.forEach(function (v) {
      var bottone = crea("button", "pastiglia", v.valore + " · " + numero(v.righe));
      bottone.type = "button";
      if (selezionati.indexOf(v.valore) !== -1) bottone.className += " attiva";
      bottone.addEventListener("click", function () {
        var i = selezionati.indexOf(v.valore);
        if (i === -1) selezionati.push(v.valore);
        else selezionati.splice(i, 1);
        bottone.className =
          selezionati.indexOf(v.valore) === -1 ? "pastiglia" : "pastiglia attiva";
        quando();
      });
      contenitore.appendChild(bottone);
    });
  }

  function caricaVoci() {
    return chiama("logs/facets").then(function (r) {
      if (!r.ok) return;
      var d = r.dati.data;

      var finestre = el("f-finestra");
      svuota(finestre);
      d.finestre.forEach(function (f) {
        var o = crea("option", null, f === "tutto" ? "tutto il registro" : "ultime " + f);
        o.value = f;
        if (f === "24h") o.selected = true;
        finestre.appendChild(o);
      });

      disegnaPastiglie(el("f-tipi"), d.tipi, filtri.tipi, function () { cercaRegistro(1); });
      disegnaPastiglie(el("f-stati"), d.stati, filtri.stati, function () { cercaRegistro(1); });
      vociPronte = true;
    });
  }

  function queryRegistro(pagina) {
    var pezzi = [];
    function aggiungi(chiave, valore) {
      if (valore === null || valore === undefined || valore === "") return;
      pezzi.push(chiave + "=" + encodeURIComponent(valore));
    }
    aggiungi("finestra", el("f-finestra").value);
    aggiungi("tipo", filtri.tipi.join(","));
    aggiungi("stato", filtri.stati.join(","));
    aggiungi("azione", el("f-azione").value.trim());
    aggiungi("testo", el("f-testo").value.trim());
    aggiungi("durataMinMs", el("f-durata").value);
    aggiungi("limite", el("f-limite").value);
    aggiungi("pagina", pagina);
    if (!el("f-maschera").checked) aggiungi("maschera", "false");
    return pezzi.join("&");
  }

  function disegnaRighe(d) {
    var corpo = el("tabella-registro").tBodies[0];
    svuota(corpo);

    if (!d.righe.length) {
      var tr = corpo.insertRow();
      var td = tr.insertCell();
      td.colSpan = 5;
      td.className = "vuoto";
      td.textContent = "nessuna riga con questi filtri";
    }

    d.righe.forEach(function (r) {
      var tr = corpo.insertRow();
      tr.className = "riga-registro";
      tr.insertCell().textContent = oraLocale(r.istante);
      tr.insertCell().appendChild(etichetta(r.tipo, null));
      tr.insertCell().appendChild(etichetta(r.stato, classeStato(r.stato)));

      var cella = tr.insertCell();
      cella.className = "azione";
      cella.textContent = r.azione || "—";

      var durataCella = tr.insertCell();
      durataCella.className = "numero";
      durataCella.textContent = r.durataMs === null ? "—" : r.durataMs + " ms";

      // I dettagli si aprono sotto la riga. Mostrarli tutti aperti renderebbe
      // illeggibile l'elenco; non mostrarli affatto costringerebbe a
      // interrogare il database a mano.
      var aperta = null;
      tr.addEventListener("click", function () {
        if (aperta) {
          corpo.deleteRow(aperta.sectionRowIndex);
          aperta = null;
          return;
        }
        aperta = corpo.insertRow(tr.sectionRowIndex + 1);
        var td = aperta.insertCell();
        td.colSpan = 5;
        td.className = "cella-dettagli";
        var testo =
          r.dettagli === null || r.dettagli === undefined
            ? "nessun dettaglio"
            : typeof r.dettagli === "string"
              ? r.dettagli
              : JSON.stringify(r.dettagli, null, 2);
        var pre = crea("pre", "corpo", "#" + r.id + "  " + r.tipo + "\n\n" + testo);
        td.appendChild(pre);
      });
    });

    el("pagina-stato").textContent = "pagina " + d.pagina + " di " + d.pagine;
    el("pagina-prima").disabled = d.pagina <= 1;
    el("pagina-dopo").disabled = d.pagina >= d.pagine;
    el("nota-lenta").hidden = !d.interrogazioneLenta;

    el("sommario-ricerca").textContent =
      (d.totaleEsatto ? "" : "piu' di ") + numero(d.totale) + " righe · " +
      (d.mascherato ? "mascherate" : "in chiaro") +
      (d.interrogazioneLenta ? " · scansione dei dettagli" : "");
  }

  function disegnaStatistiche(s) {
    var ore = el("istogramma-ore");
    svuota(ore);
    var massimo = s.perOra.reduce(function (a, o) { return Math.max(a, o.righe); }, 1);
    if (!s.perOra.length) {
      ore.appendChild(crea("p", "vuoto", "nessuna riga in questa finestra"));
    }
    s.perOra.forEach(function (o) {
      var riga = crea("div", "istogramma-riga ora");
      riga.appendChild(crea("span", "istogramma-giorno", o.ora.slice(5)));
      var barra = crea("div", "barra-doppia");
      var totale = crea("div", "barra-totale");
      totale.style.width = Math.round((o.righe / massimo) * 100) + "%";
      var errori = crea("div", "barra-errori");
      errori.style.width = Math.round((o.errori / massimo) * 100) + "%";
      barra.appendChild(totale);
      barra.appendChild(errori);
      riga.appendChild(barra);
      riga.appendChild(crea("span", "istogramma-numero doppio",
        numero(o.righe) + (o.errori ? " / " + numero(o.errori) : "")));
      ore.appendChild(riga);
    });

    var frequenti = el("tabella-frequenti").tBodies[0];
    svuota(frequenti);
    s.frequenti.forEach(function (f) {
      var tr = frequenti.insertRow();
      var a = tr.insertCell();
      a.className = "azione";
      a.textContent = f.azione || "—";
      [numero(f.righe), f.errori ? numero(f.errori) : "—", ms(f.durataMedia)]
        .forEach(function (v) {
          var td = tr.insertCell();
          td.className = "numero";
          td.textContent = v;
        });
    });

    var lente = el("tabella-lente").tBodies[0];
    svuota(lente);
    s.lente.forEach(function (l) {
      var tr = lente.insertRow();
      var a = tr.insertCell();
      a.className = "azione";
      a.textContent = l.azione || "—";
      [numero(l.righe), ms(l.durataMedia), ms(l.durataMassima)].forEach(function (v) {
        var td = tr.insertCell();
        td.className = "numero";
        td.textContent = v;
      });
    });
  }

  function cercaRegistro(pagina) {
    if (!token) return;
    filtri.pagina = pagina || 1;
    var q = queryRegistro(filtri.pagina);
    el("sommario-ricerca").textContent = "cerco…";

    chiama("logs?" + q).then(function (r) {
      if (r.stato === 401) { esci(true); return; }
      if (!r.ok) {
        el("sommario-ricerca").textContent =
          "ricerca non riuscita: " + ((r.dati && r.dati.message) || r.stato);
        return;
      }
      disegnaRighe(r.dati.data);
    }).catch(function () {
      el("sommario-ricerca").textContent = "il server non risponde";
    });

    chiama("logs/stats?" + q).then(function (r) {
      if (r.ok) disegnaStatistiche(r.dati.data);
    }).catch(function () {});
  }

  function caricaRitenzione() {
    return chiama("retention").then(function (r) {
      if (!r.ok) return;
      var d = r.dati.data;
      el("stato-ritenzione").textContent = d.attiva
        ? "Scadenza automatica attiva: conserva " + d.giorni + " giorni, pianificata \"" +
          d.cron + "\". La traccia del pannello (" + d.tipiProtetti.join(", ") +
          ") non viene toccata."
        : "Scadenza automatica spenta: nessuna riga viene cancellata da sola. " +
          "La traccia del pannello (" + d.tipiProtetti.join(", ") + ") resta fuori anche dalla purga a mano.";
    });
  }

  function anteprimaPurga() {
    ultimaAnteprima = null;
    el("p-conferma-riga").hidden = true;
    el("p-conferma").value = "";
    el("p-esegui").disabled = true;
    el("p-esito").textContent = "conto…";

    chiama("purge/preview", {
      metodo: "POST",
      corpo: { giorni: Number(el("p-giorni").value) },
    }).then(function (r) {
      if (!r.ok) {
        el("p-esito").textContent = (r.dati && r.dati.message) || "anteprima non riuscita";
        return;
      }
      var d = r.dati.data;
      ultimaAnteprima = d;
      el("p-esito").textContent =
        numero(d.righe) + " righe su " + numero(d.righeTotali) +
        " verrebbero cancellate" +
        (d.prima ? " (dal " + oraLocale(d.prima) + " al " + oraLocale(d.ultima) + ")" : "") +
        ", tutte scritte prima del " + oraLocale(d.primaDi) + ".";
      el("p-conferma-riga").hidden = d.righe === 0;
    }).catch(function () {
      el("p-esito").textContent = "il server non risponde";
    });
  }

  function eseguiPurga() {
    el("p-esegui").disabled = true;
    el("p-esito").textContent = "cancello…";

    chiama("purge", {
      metodo: "POST",
      corpo: {
        giorni: Number(el("p-giorni").value),
        conferma: el("p-conferma").value,
      },
    }).then(function (r) {
      el("p-conferma").value = "";
      el("p-conferma-riga").hidden = true;
      if (!r.ok) {
        el("p-esito").textContent = (r.dati && r.dati.message) || "purga non riuscita";
        return;
      }
      var d = r.dati.data;
      el("p-esito").textContent =
        numero(d.righe) + " righe cancellate in " + d.lotti + " lotti (" + d.durataMs + " ms)" +
        (d.incompleta ? " — fermata al tetto dei lotti, rilanciala per finire" : "") + ".";
      cercaRegistro(1);
    }).catch(function () {
      el("p-esito").textContent = "il server non risponde";
    });
  }

  function apriRegistro() {
    var prima = vociPronte ? Promise.resolve() : caricaVoci();
    prima.then(function () {
      caricaRitenzione();
      cercaRegistro(filtri.pagina);
    });
  }

  // ---------------------------------------------------------- vista consolle

  var catalogo = null;

  function serveConferma(metodo) {
    return ["POST", "PUT", "PATCH", "DELETE"].indexOf(metodo) !== -1;
  }

  function aggiornaConferma() {
    var metodo = el("c-metodo").value;
    var serve = serveConferma(metodo);
    el("c-conferma-riga").hidden = !serve;
    el("c-conferma-etichetta").textContent = "battere " + metodo + " per confermare";
    if (!serve) el("c-conferma").value = "";

    if (metodo === "DELETE" && !distruttivoAmmesso) {
      el("c-avviso").textContent =
        "DELETE e' spento su questo server: ADMIN_PROBE_DESTRUCTIVE=true e un riavvio";
    } else {
      el("c-avviso").textContent = serve
        ? "il metodo modifica dati: la conferma si batte per intero"
        : "—";
    }
  }

  function caricaCatalogo() {
    return chiama("catalog").then(function (r) {
      if (!r.ok) {
        el("sommario-catalogo").textContent = "catalogo non disponibile";
        return;
      }
      catalogo = r.dati.data;

      var scelta = el("c-rotta");
      svuota(scelta);
      var vuota = crea("option", null, "— percorso battuto a mano —");
      vuota.value = "";
      scelta.appendChild(vuota);

      var gruppi = {};
      catalogo.rotte.forEach(function (rotta, i) {
        var tag = rotta.tag || "senza gruppo";
        if (!gruppi[tag]) {
          gruppi[tag] = document.createElement("optgroup");
          gruppi[tag].label = tag;
          scelta.appendChild(gruppi[tag]);
        }
        var o = crea("option", null, rotta.metodo + "  " + rotta.percorso +
          (rotta.sommario ? "  —  " + rotta.sommario : ""));
        o.value = String(i);
        gruppi[tag].appendChild(o);
      });

      el("sommario-catalogo").textContent =
        catalogo.quante + " rotte documentate, dalla stessa descrizione che genera /api-docs. " +
        "Una rotta senza commento di documentazione non compare: il percorso si puo' battere a mano.";
    });
  }

  function scegliRotta() {
    var valore = el("c-rotta").value;
    if (valore === "" || !catalogo) return;
    var rotta = catalogo.rotte[Number(valore)];
    if (!rotta) return;

    el("c-metodo").value = rotta.metodo;
    el("c-percorso").value = rotta.percorso;
    el("c-corpo").value = rotta.corpoEsempio
      ? JSON.stringify(rotta.corpoEsempio, null, 2)
      : "";

    if (rotta.richiedeToken && !el("c-intestazioni").value.trim()) {
      el("c-intestazioni").value = "Authorization: Bearer ";
    }

    aggiornaConferma();

    if (rotta.segnaposti.length) {
      el("c-avviso").textContent =
        "da sostituire nel percorso: " + rotta.segnaposti.join(", ");
    }
  }

  // "Nome: valore" per riga. Un oggetto JSON da battere a mano sarebbe
  // un'occasione in piu' di sbagliare una virgola e non capire perche'.
  function leggiIntestazioni() {
    var fuori = {};
    var righeTesto = el("c-intestazioni").value.split("\n");
    for (var i = 0; i < righeTesto.length; i += 1) {
      var riga = righeTesto[i].trim();
      if (riga === "") continue;
      var due = riga.indexOf(":");
      if (due <= 0) return { errore: "riga " + (i + 1) + ": manca il due punti" };
      fuori[riga.slice(0, due).trim()] = riga.slice(due + 1).trim();
    }
    return { intestazioni: fuori };
  }

  function mandaSonda() {
    var lette = leggiIntestazioni();
    if (lette.errore) {
      el("c-avviso").textContent = lette.errore;
      return;
    }

    var metodo = el("c-metodo").value;
    var richiesta = {
      metodo: metodo,
      percorso: el("c-percorso").value.trim(),
      intestazioni: lette.intestazioni,
    };

    var corpo = el("c-corpo").value.trim();
    if (corpo !== "") richiesta.corpo = corpo;
    if (serveConferma(metodo)) richiesta.conferma = el("c-conferma").value.trim();

    el("c-manda").disabled = true;
    el("c-esito").textContent = "mando…";
    el("c-risposta").textContent = "";
    el("c-intestazioni-risposta").textContent = "—";

    chiama("probe", { metodo: "POST", corpo: richiesta }).then(function (r) {
      if (r.stato === 401) { esci(true); return; }

      if (!r.ok) {
        el("c-esito").textContent = "rifiutata";
        el("c-risposta").textContent = (r.dati && r.dati.message) || r.testo || String(r.stato);
        return;
      }

      var d = r.dati.data;
      el("c-esito").textContent =
        d.stato + " " + (d.messaggioStato || "") + " · " + d.durataMs + " ms · " + byte(d.byte) +
        (d.troncata ? " · risposta troncata" : "");

      var testo = d.corpo;
      try {
        testo = JSON.stringify(JSON.parse(d.corpo), null, 2);
      } catch (e) { /* non JSON: si mostra com'e' */ }
      el("c-risposta").textContent = testo === "" ? "(corpo vuoto)" : testo;

      var intestazioni = Object.keys(d.intestazioni || {})
        .map(function (k) { return k + ": " + d.intestazioni[k]; })
        .join("\n");
      el("c-intestazioni-risposta").textContent = intestazioni || "—";

      // La conferma si ribatte a ogni invio: tenerla dentro farebbe del
      // secondo DELETE un clic solo.
      el("c-conferma").value = "";
    }).catch(function (errore) {
      el("c-esito").textContent = "guasto";
      el("c-risposta").textContent = errore && errore.message ? errore.message : String(errore);
    }).then(function () {
      el("c-manda").disabled = false;
    });
  }

  function apriConsolle() {
    aggiornaConferma();
    if (!catalogo) caricaCatalogo();
  }

  // ------------------------------------------------------------ vista utenti

  var mioNome = null;
  var mioRuolo = null;
  var miaFonte = null;
  var inResetDi = null;
  var inEliminazioneDi = null;

  function avvisoUtenti(messaggio) {
    var nodo = el("utenti-avviso");
    if (!messaggio) { nodo.hidden = true; return; }
    nodo.textContent = messaggio;
    nodo.hidden = false;
  }

  function nascondiModuli() {
    inResetDi = null;
    inEliminazioneDi = null;
    el("scheda-reset").hidden = true;
    el("scheda-elimina").hidden = true;
    el("r-password").value = "";
    el("r-password2").value = "";
    el("e-conferma").value = "";
    el("e-esegui").disabled = true;
  }

  function apriReset(nome) {
    nascondiModuli();
    inResetDi = nome;
    el("r-nome-visto").textContent = nome;
    el("r-esito").textContent = "—";
    el("scheda-reset").hidden = false;
    el("r-password").focus();
  }

  function apriEliminazione(nome) {
    nascondiModuli();
    inEliminazioneDi = nome;
    el("e-nome-visto").textContent = nome;
    el("e-esito").textContent = "—";
    el("scheda-elimina").hidden = false;
    el("e-conferma").focus();
  }

  function bottoneRiga(testo, classe, quando) {
    var b = crea("button", "minuto" + (classe ? " " + classe : ""), testo);
    b.type = "button";
    b.addEventListener("click", quando);
    return b;
  }

  function disegnaUtenti(d) {
    var corpo = el("tabella-utenti").tBodies[0];
    svuota(corpo);

    // L'amministratore di .env non ha una riga nella tabella, e si mostra a
    // parte: chi guarda l'elenco deve sapere che esiste e che nessuno di qui
    // dentro puo' toccarlo.
    var tr = corpo.insertRow();
    tr.insertCell().textContent = d.ambiente.nome;
    tr.insertCell().appendChild(etichetta(d.ambiente.ruolo, "etichetta-ok"));
    tr.insertCell().appendChild(etichetta("da .env", null));
    tr.insertCell().textContent = "—";
    tr.insertCell().textContent = "—";
    var nota = tr.insertCell();
    nota.className = "sottile";
    nota.textContent = "si cambia con npm run admin:hash";

    d.utenti.forEach(function (u) {
      var riga = corpo.insertRow();
      riga.insertCell().textContent = u.nome;
      riga.insertCell().appendChild(
        etichetta(u.ruolo, u.ruolo === "proprietario" ? "etichetta-ok" : null)
      );
      riga.insertCell().appendChild(
        u.abilitato
          ? etichetta("abilitato", null)
          : etichetta("disabilitato", "etichetta-errore")
      );

      var creato = riga.insertCell();
      creato.textContent = oraLocale(u.creatoIl).split(",")[0];
      creato.title = (u.creatoDa ? "da " + u.creatoDa + " · " : "") + oraLocale(u.creatoIl);

      var accesso = riga.insertCell();
      accesso.textContent = u.ultimoAccesso ? quandoFa(u.ultimoAccesso) : "mai";
      accesso.title = oraLocale(u.ultimoAccesso);

      var azioni = riga.insertCell();
      azioni.className = "azioni";

      var suDiMe = u.nome.toLowerCase() === String(mioNome).toLowerCase();

      azioni.appendChild(bottoneRiga("password", null, function () {
        apriReset(u.nome);
      }));

      // Con due soli ruoli il cambio e' un interruttore, e l'etichetta dice
      // dove si va a finire invece di dove si e'.
      var altroRuolo = u.ruolo === "proprietario" ? "operatore" : "proprietario";
      var ruolo = bottoneRiga("→ " + altroRuolo, null, function () {
        cambiaRuolo(u.nome, altroRuolo);
      });
      if (suDiMe && altroRuolo === "operatore") ruolo.disabled = true;
      azioni.appendChild(ruolo);

      var cambia = bottoneRiga(
        u.abilitato ? "disabilita" : "abilita",
        null,
        function () { cambiaAbilitazione(u.nome, !u.abilitato); }
      );
      // Disabilitare se stessi chiuderebbe la propria sessione: il server lo
      // rifiuta, e qui il bottone non si offre nemmeno.
      if (suDiMe && u.abilitato) cambia.disabled = true;
      azioni.appendChild(cambia);

      var elimina = bottoneRiga("elimina", "pericolo", function () {
        apriEliminazione(u.nome);
      });
      if (suDiMe) elimina.disabled = true;
      azioni.appendChild(elimina);
    });

    el("sommario-utenti").textContent =
      d.utenti.length === 0
        ? "nessun amministratore nella tabella: per ora entra solo quello di .env"
        : d.utenti.length + " nella tabella, piu' quello di .env";

    var ruoli = el("u-ruolo");
    if (!ruoli.options.length) {
      d.ruoli.forEach(function (r) {
        var o = crea("option", null, r);
        o.value = r;
        if (r === "operatore") o.selected = true;
        ruoli.appendChild(o);
      });
    }

    el("nota-nuovo-utente").textContent =
      "La password deve essere lunga almeno " + d.lunghezzaMinimaPassword +
      " caratteri. Nasce operatore: il proprietario e' l'unico che gestisce gli accessi.";
  }

  function caricaUtenti() {
    el("sommario-utenti").textContent = "leggo…";

    return chiama("admins").then(function (r) {
      if (r.stato === 401) { esci(true); return; }

      if (r.stato === 403) {
        el("scheda-elenco-utenti").hidden = true;
        el("scheda-nuovo-utente").hidden = true;
        avvisoUtenti("La gestione degli amministratori spetta al proprietario.");
        return;
      }

      if (!r.ok) {
        avvisoUtenti("lettura non riuscita: " + ((r.dati && r.dati.message) || r.stato));
        return;
      }

      var d = r.dati.data;

      if (!d.tabella) {
        // Senza la tabella il pannello funziona: entra l'amministratore di
        // .env. Si dice cos'altro serve, invece di mostrare un guasto.
        el("scheda-elenco-utenti").hidden = true;
        el("scheda-nuovo-utente").hidden = true;
        avvisoUtenti(
          "La tabella degli amministratori non esiste ancora: va applicata la " +
          "migrazione database/migrations/009_admin_users.sql. Fino ad allora " +
          "entra solo l'amministratore scritto in .env."
        );
        return;
      }

      avvisoUtenti(null);
      el("scheda-elenco-utenti").hidden = false;
      el("scheda-nuovo-utente").hidden = false;
      disegnaUtenti(d);
    }).catch(function () {
      avvisoUtenti("il server non risponde");
    });
  }

  function creaUtente(evento) {
    evento.preventDefault();
    var esito = el("u-esito");

    if (el("u-password").value !== el("u-password2").value) {
      esito.textContent = "le due password non coincidono";
      return;
    }

    esito.textContent = "creo…";
    chiama("admins", {
      metodo: "POST",
      corpo: {
        nome: el("u-nome").value.trim(),
        password: el("u-password").value,
        ruolo: el("u-ruolo").value,
      },
    }).then(function (r) {
      if (!r.ok) {
        esito.textContent = (r.dati && r.dati.message) || "non riuscita";
        return;
      }
      esito.textContent = "creato: " + r.dati.data.nome + " (" + r.dati.data.ruolo + ")";
      el("u-nome").value = "";
      el("u-password").value = "";
      el("u-password2").value = "";
      caricaUtenti();
    }).catch(function () {
      esito.textContent = "il server non risponde";
    });
  }

  function cambiaRuolo(nome, ruolo) {
    chiama("admins/" + encodeURIComponent(nome) + "/role", {
      metodo: "POST",
      corpo: { ruolo: ruolo },
    }).then(function (r) {
      if (!r.ok) {
        avvisoUtenti((r.dati && r.dati.message) || "non riuscita");
        return;
      }
      avvisoUtenti(null);
      caricaUtenti();
    }).catch(function () {
      avvisoUtenti("il server non risponde");
    });
  }

  function cambiaAbilitazione(nome, acceso) {
    chiama("admins/" + encodeURIComponent(nome) + "/enabled", {
      metodo: "POST",
      corpo: { acceso: acceso },
    }).then(function (r) {
      if (!r.ok) {
        avvisoUtenti((r.dati && r.dati.message) || "non riuscita");
        return;
      }
      avvisoUtenti(null);
      caricaUtenti();
    }).catch(function () {
      avvisoUtenti("il server non risponde");
    });
  }

  function resetPassword(evento) {
    evento.preventDefault();
    if (!inResetDi) return;
    var esito = el("r-esito");

    if (el("r-password").value !== el("r-password2").value) {
      esito.textContent = "le due password non coincidono";
      return;
    }

    esito.textContent = "cambio…";
    chiama("admins/" + encodeURIComponent(inResetDi) + "/password", {
      metodo: "POST",
      corpo: { password: el("r-password").value },
    }).then(function (r) {
      if (!r.ok) {
        esito.textContent = (r.dati && r.dati.message) || "non riuscita";
        return;
      }
      nascondiModuli();
      caricaUtenti();
    }).catch(function () {
      esito.textContent = "il server non risponde";
    });
  }

  function eliminaUtente(evento) {
    evento.preventDefault();
    if (!inEliminazioneDi) return;
    var esito = el("e-esito");

    esito.textContent = "elimino…";
    chiama("admins/" + encodeURIComponent(inEliminazioneDi), {
      metodo: "DELETE",
      corpo: { conferma: el("e-conferma").value.trim() },
    }).then(function (r) {
      if (!r.ok) {
        esito.textContent = (r.dati && r.dati.message) || "non riuscita";
        return;
      }
      nascondiModuli();
      caricaUtenti();
    }).catch(function () {
      esito.textContent = "il server non risponde";
    });
  }

  function cambiaMiaPassword(evento) {
    evento.preventDefault();
    var esito = el("m-esito");

    if (el("m-nuova").value !== el("m-nuova2").value) {
      esito.textContent = "le due password non coincidono";
      return;
    }

    esito.textContent = "cambio…";
    chiama("me/password", {
      metodo: "POST",
      corpo: {
        passwordAttuale: el("m-attuale").value,
        passwordNuova: el("m-nuova").value,
      },
    }).then(function (r) {
      if (!r.ok) {
        esito.textContent = (r.dati && r.dati.message) || "non riuscita";
        return;
      }
      // La sessione in corso e' nata con la password di prima: il cancello la
      // rifiuta dal prossimo aggiornamento. Si esce da qui, dicendolo, invece
      // di farlo sembrare una scadenza arrivata per caso.
      esito.textContent = "cambiata. Entra di nuovo con quella nuova.";
      el("m-attuale").value = "";
      el("m-nuova").value = "";
      el("m-nuova2").value = "";
      chiama("logout", { metodo: "POST" }).catch(function () {}).then(function () {
        esci(false);
        var errore = el("errore-accesso");
        errore.textContent = "Password cambiata. Entra con quella nuova.";
        errore.hidden = false;
      });
    }).catch(function () {
      esito.textContent = "il server non risponde";
    });
  }

  function apriUtenti() {
    nascondiModuli();

    var daTabella = miaFonte === "tabella";
    el("scheda-mia-password").hidden = false;
    el("mia-riga").hidden = !daTabella;
    el("m-esito").textContent = "—";
    el("mia-nota").textContent = daTabella
      ? "Sei " + mioNome + " (" + mioRuolo + "), dalla tabella."
      : "Sei " + mioNome + ", l'amministratore scritto in .env: la sua password " +
        "si cambia con `npm run admin:hash` e un riavvio, non da qui.";

    if (mioRuolo !== "proprietario") {
      el("scheda-elenco-utenti").hidden = true;
      el("scheda-nuovo-utente").hidden = true;
      avvisoUtenti("La gestione degli amministratori spetta al proprietario.");
      return;
    }

    caricaUtenti();
  }

  // --------------------------------------------------------------- caricamento

  function avviso(messaggio) {
    var nodo = el("avviso");
    if (!messaggio) { nodo.hidden = true; return; }
    nodo.textContent = messaggio;
    nodo.hidden = false;
  }

  // Due famiglie di viste. Le prime tre si ridisegnano da sole: sono numeri
  // che cambiano da soli, e guardarli vecchi di dieci minuti e' peggio che non
  // guardarli. Le ultime due sono a richiesta, perche' rifare una ricerca nel
  // registro ogni cinque secondi vorrebbe dire ripetere la stessa scansione
  // mentre si legge il risultato, e una richiesta della consolle non la si
  // rimanda certo per conto di chi l'ha scritta.
  var VISTE = {
    salute: { percorso: "health", funzione: disegnaSalute },
    sistema: { percorso: "system", funzione: disegnaSistema },
    database: { percorso: "database", funzione: disegnaDatabase },
    registro: { manuale: true, apri: apriRegistro },
    consolle: { manuale: true, apri: apriConsolle },
    utenti: { manuale: true, apri: apriUtenti },
  };

  // Chi sono: lo dice il server all'accesso e lo ripete alla verifica della
  // sessione. La pagina non lo decide e non lo tiene fra un giro e l'altro -
  // un ruolo ricordato dalla pagina sarebbe un ruolo che il server non ha
  // confermato.
  function ricordaChiSono(d) {
    distruttivoAmmesso = Boolean(d.destructive_enabled);
    mioNome = d.username || null;
    mioRuolo = d.ruolo || null;
    miaFonte = d.fonte || null;
  }

  function intestazione(d) {
    el("nome-macchina").textContent = d.macchina.nome;
    el("riga-processo").textContent =
      d.processo.versioneNode + " · pid " + d.processo.pid + " · su " + d.macchina.piattaforma;
  }

  function aggiorna() {
    if (!token || inCorso) return Promise.resolve();
    inCorso = true;

    var quale = VISTE[vistaCorrente];

    // La testa mostra sempre nome macchina e processo, anche quando si sta
    // guardando un'altra vista: si chiede quindi anche /system.
    var percorso = quale.manuale ? "system" : quale.percorso;
    var richieste = [chiama(percorso)];
    if (!quale.manuale && vistaCorrente !== "sistema") richieste.push(chiama("system"));

    return Promise.all(richieste).then(function (risposte) {
      var principale = risposte[0];

      if (principale.stato === 401) { esci(true); return; }

      if (!principale.ok) {
        avviso("lettura di " + percorso + " non riuscita: " +
          ((principale.dati && principale.dati.message) || principale.stato));
        return;
      }

      avviso(null);

      if (quale.manuale) {
        intestazione(principale.dati.data);
      } else {
        quale.funzione(principale.dati.data);
        if (risposte[1] && risposte[1].ok) intestazione(risposte[1].dati.data);
      }

      el("istante-lettura").textContent = "letto alle " +
        new Date().toLocaleTimeString("it-IT");
    }).catch(function (errore) {
      avviso("il server non risponde: " + (errore && errore.message ? errore.message : errore));
    }).then(function () {
      inCorso = false;
    });
  }

  function pianifica() {
    if (cadenza) { clearInterval(cadenza); cadenza = null; }
    if (!el("aggiornamento").checked) return;
    cadenza = setInterval(function () {
      // Con la scheda in fondo non serve chiedere niente: sono richieste che
      // nessuno sta guardando, e ogni una e' lavoro per il database.
      if (!document.hidden) aggiorna();
    }, ATTESA_MS);
  }

  function mostraVista(nome) {
    if (!VISTE[nome]) nome = "salute";
    vistaCorrente = nome;
    scriviMemoria(CHIAVE_VISTA, nome);

    Object.keys(VISTE).forEach(function (v) {
      el("vista-" + v).hidden = v !== nome;
    });

    var linguette = document.querySelectorAll(".linguetta");
    for (var i = 0; i < linguette.length; i += 1) {
      var attiva = linguette[i].getAttribute("data-vista") === nome;
      linguette[i].className = attiva ? "linguetta attiva" : "linguetta";
    }

    aggiorna();
    if (VISTE[nome].apri) VISTE[nome].apri();
  }

  // ---------------------------------------------------------------- sessione

  function entra(nuovoToken) {
    token = nuovoToken;
    scriviMemoria(CHIAVE_TOKEN, nuovoToken);
    el("accesso").hidden = true;
    el("pannello").hidden = false;
    mostraVista(leggiMemoria(CHIAVE_VISTA) || "salute");
    pianifica();
  }

  function esci(scaduta) {
    token = null;
    richiudiPassword();
    scriviMemoria(CHIAVE_TOKEN, null);
    if (cadenza) { clearInterval(cadenza); cadenza = null; }
    el("pannello").hidden = true;
    el("accesso").hidden = false;
    avviso(null);
    var errore = el("errore-accesso");
    if (scaduta) {
      errore.textContent = "La sessione non e' piu' valida. Entra di nuovo.";
      errore.hidden = false;
    } else {
      errore.hidden = true;
    }
  }

  // ------------------------------------------------------------- occhiolino
  //
  // Mostra la password battuta. Serve soprattutto su una password lunga
  // presa da un gestore o copiata da un foglio: senza, l'unico modo di
  // capire perche' l'accesso non passa e' ribatterla.
  //
  // Il mestiere e' tutto nel tipo del campo: `password` o `text`. Cambiarlo
  // sposta il cursore in fondo nella maggior parte dei browser, quindi si
  // tiene da parte la selezione e si rimette dov'era - altrimenti scoprire la
  // password nel mezzo di una correzione la manderebbe a capo.

  function scambia(nodo, visibile) {
    if (visibile) nodo.removeAttribute("hidden");
    else nodo.setAttribute("hidden", "");
  }

  function mostraPassword(mostrare) {
    var campo = el("password");
    var bottone = el("mostra-password");
    var inizio = null;
    var fine = null;

    try {
      inizio = campo.selectionStart;
      fine = campo.selectionEnd;
    } catch (e) { /* non tutti i browser danno la selezione di un campo password */ }

    campo.type = mostrare ? "text" : "password";
    bottone.setAttribute("aria-pressed", mostrare ? "true" : "false");

    var etichetta = mostrare ? "Nascondi la password" : "Mostra la password";
    bottone.setAttribute("aria-label", etichetta);
    bottone.title = etichetta;

    // Con l'attributo e non con la proprieta': `hidden` come proprieta' sta
    // su HTMLElement, e questi sono due SVG. `svg.hidden = true` creerebbe
    // una proprieta' che non fa niente, e si vedrebbero entrambi gli occhi.
    scambia(el("occhio-aperto"), !mostrare);
    scambia(el("occhio-chiuso"), mostrare);

    if (inizio !== null) {
      try { campo.setSelectionRange(inizio, fine); } catch (e) { /* pazienza */ }
    }
  }

  // Chiudendo la sessione il campo torna coperto: la schermata di accesso
  // resta a volte aperta su uno schermo che guardano in due.
  function richiudiPassword() {
    if (el("password").type === "text") mostraPassword(false);
  }

  // ------------------------------------------------------------------ eventi

  el("modulo-accesso").addEventListener("submit", function (evento) {
    evento.preventDefault();
    var bottone = el("bottone-accesso");
    var errore = el("errore-accesso");
    errore.hidden = true;
    bottone.disabled = true;
    bottone.textContent = "verifico…";

    chiama("login", {
      metodo: "POST",
      corpo: { username: el("utente").value, password: el("password").value },
    }).then(function (risposta) {
      if (risposta.ok && risposta.dati && risposta.dati.data) {
        el("password").value = "";
        richiudiPassword();
        ricordaChiSono(risposta.dati.data);
        entra(risposta.dati.data.token);
        return;
      }
      errore.textContent = risposta.stato === 429
        ? "Troppi tentativi. Riprova fra un quarto d'ora."
        : "Credenziali non valide.";
      errore.hidden = false;
    }).catch(function () {
      errore.textContent = "Il server non risponde.";
      errore.hidden = false;
    }).then(function () {
      bottone.disabled = false;
      bottone.textContent = "Entra";
    });
  });

  el("mostra-password").addEventListener("click", function () {
    mostraPassword(el("password").type === "password");
    // Il fuoco torna dove si stava scrivendo: l'occhiolino si preme per
    // guardare, non per smettere di battere.
    el("password").focus();
  });

  el("bottone-uscita").addEventListener("click", function () {
    // Si avvisa il server, cosi' la sessione viene ritirata davvero e non
    // resta valida fino alla scadenza in mano a chi avesse copiato il token.
    chiama("logout", { metodo: "POST" }).catch(function () {}).then(function () {
      esci(false);
    });
  });

  el("bottone-ora").addEventListener("click", function () { aggiorna(); });
  el("aggiornamento").addEventListener("change", function () {
    pianifica();
    if (el("aggiornamento").checked) aggiorna();
  });

  var linguette = document.querySelectorAll(".linguetta");
  for (var i = 0; i < linguette.length; i += 1) {
    linguette[i].addEventListener("click", function (evento) {
      mostraVista(evento.currentTarget.getAttribute("data-vista"));
    });
  }

  // ------------------------------------------------- eventi del registro

  el("filtri-registro").addEventListener("submit", function (evento) {
    evento.preventDefault();
    cercaRegistro(1);
  });

  el("f-azzera").addEventListener("click", function () {
    filtri.tipi.length = 0;
    filtri.stati.length = 0;
    el("f-azione").value = "";
    el("f-testo").value = "";
    el("f-durata").value = "";
    el("f-finestra").value = "24h";
    el("f-maschera").checked = true;
    vociPronte = false;
    caricaVoci().then(function () { cercaRegistro(1); });
  });

  el("f-finestra").addEventListener("change", function () { cercaRegistro(1); });
  el("f-limite").addEventListener("change", function () { cercaRegistro(1); });
  el("f-maschera").addEventListener("change", function () { cercaRegistro(filtri.pagina); });

  el("pagina-prima").addEventListener("click", function () {
    if (filtri.pagina > 1) cercaRegistro(filtri.pagina - 1);
  });
  el("pagina-dopo").addEventListener("click", function () {
    cercaRegistro(filtri.pagina + 1);
  });

  el("p-anteprima").addEventListener("click", anteprimaPurga);

  // Il bottone si accende solo con la parola intera. E se i giorni cambiano
  // dopo l'anteprima, l'anteprima non vale piu': si ricomincia, perche'
  // confermare un numero e cancellarne un altro e' il modo piu' facile di
  // cancellare troppo.
  el("p-conferma").addEventListener("input", function () {
    el("p-esegui").disabled = el("p-conferma").value.trim() !== "CANCELLA";
  });

  el("p-giorni").addEventListener("input", function () {
    if (!ultimaAnteprima) return;
    ultimaAnteprima = null;
    el("p-conferma-riga").hidden = true;
    el("p-conferma").value = "";
    el("p-esegui").disabled = true;
    el("p-esito").textContent = "i giorni sono cambiati: ricontare prima di cancellare";
  });

  el("p-esegui").addEventListener("click", eseguiPurga);

  // ------------------------------------------------- eventi della consolle

  el("c-rotta").addEventListener("change", scegliRotta);
  el("c-metodo").addEventListener("change", aggiornaConferma);
  el("c-manda").addEventListener("click", mandaSonda);

  // ------------------------------------------------- eventi degli utenti

  el("modulo-nuovo-utente").addEventListener("submit", creaUtente);
  el("modulo-reset").addEventListener("submit", resetPassword);
  el("modulo-elimina").addEventListener("submit", eliminaUtente);
  el("modulo-mia-password").addEventListener("submit", cambiaMiaPassword);
  el("r-annulla").addEventListener("click", nascondiModuli);
  el("e-annulla").addEventListener("click", nascondiModuli);

  // Il bottone si accende solo col nome ribattuto per intero.
  el("e-conferma").addEventListener("input", function () {
    el("e-esegui").disabled =
      el("e-conferma").value.trim() !== String(inEliminazioneDi || "");
  });

  // Tornando sulla scheda si aggiorna subito: i numeri fermi da dieci minuti
  // sono peggio di nessun numero, perche' sembrano attuali.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && token) aggiorna();
  });

  // ------------------------------------------------------------------- avvio
  //
  // Se c'e' un token in memoria si verifica che valga ancora, invece di
  // mostrare il pannello e scoprirlo al primo 401.

  var salvato = leggiMemoria(CHIAVE_TOKEN);
  if (!salvato) {
    esci(false);
  } else {
    token = salvato;
    chiama("session").then(function (risposta) {
      if (risposta.ok) {
        if (risposta.dati && risposta.dati.data) ricordaChiSono(risposta.dati.data);
        entra(salvato);
      } else {
        esci(false);
      }
    }).catch(function () { esci(false); });
  }
})();
