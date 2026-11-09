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

  // --------------------------------------------------------------- caricamento

  function avviso(messaggio) {
    var nodo = el("avviso");
    if (!messaggio) { nodo.hidden = true; return; }
    nodo.textContent = messaggio;
    nodo.hidden = false;
  }

  var DISEGNA = {
    salute: { percorso: "health", funzione: disegnaSalute },
    sistema: { percorso: "system", funzione: disegnaSistema },
    database: { percorso: "database", funzione: disegnaDatabase },
  };

  function aggiorna() {
    if (!token || inCorso) return Promise.resolve();
    inCorso = true;

    var quale = DISEGNA[vistaCorrente];

    // La testa mostra sempre nome macchina e processo, anche quando si sta
    // guardando un'altra vista: si chiede quindi anche /system.
    var richieste = [chiama(quale.percorso)];
    if (vistaCorrente !== "sistema") richieste.push(chiama("system"));

    return Promise.all(richieste).then(function (risposte) {
      var principale = risposte[0];

      if (principale.stato === 401) { esci(true); return; }

      if (!principale.ok) {
        avviso("lettura di " + quale.percorso + " non riuscita: " +
          ((principale.dati && principale.dati.message) || principale.stato));
        return;
      }

      avviso(null);
      quale.funzione(principale.dati.data);

      if (risposte[1] && risposte[1].ok) {
        var d = risposte[1].dati.data;
        el("nome-macchina").textContent = d.macchina.nome;
        el("riga-processo").textContent =
          d.processo.versioneNode + " · pid " + d.processo.pid + " · su " + d.macchina.piattaforma;
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
    if (!DISEGNA[nome]) nome = "salute";
    vistaCorrente = nome;
    scriviMemoria(CHIAVE_VISTA, nome);

    ["salute", "sistema", "database"].forEach(function (v) {
      el("vista-" + v).hidden = v !== nome;
    });

    var linguette = document.querySelectorAll(".linguetta");
    for (var i = 0; i < linguette.length; i += 1) {
      var attiva = linguette[i].getAttribute("data-vista") === nome;
      linguette[i].className = attiva ? "linguetta attiva" : "linguetta";
    }

    aggiorna();
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
      if (risposta.ok) entra(salvato);
      else esci(false);
    }).catch(function () { esci(false); });
  }
})();
