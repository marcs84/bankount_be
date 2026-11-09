const path = require("path");

// L'icona del sito, servita su /favicon.ico per tutto il server.
//
// Il file e' uno solo, e sta nella cartella del pannello perche' e' li' che
// serve per prima: la pagina lo chiede come `logo.png` accanto a se'. Da qui
// lo raggiunge anche la rotta di radice, invece di tenerne una seconda copia
// che il giorno che il logo cambia resterebbe indietro in silenzio.
//
// E' una copia di crypto-wallet-app/assets/images/icon.png, l'icona di
// lancio dell'app dichiarata nel pubspec. Le due vivono in depositi diversi,
// quindi allinearle e' un gesto a mano: `test/icona.test.js` controlla almeno
// che questa esista e sia un'immagine, cosi' spostarla non passa inosservato.
const PERCORSO_ICONA = path.join(__dirname, "..", "admin", "public", "logo.png");

// Un giorno di cache: e' un'immagine che non cambia mai, e il browser la
// chiede a ogni pagina.
const CACHE_ICONA = "1d";

module.exports = { PERCORSO_ICONA, CACHE_ICONA };
