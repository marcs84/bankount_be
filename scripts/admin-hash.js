#!/usr/bin/env node
//
// Genera l'impronta della password dell'amministratore, da incollare in
// `.env` come ADMIN_PASSWORD_HASH. Genera anche un ADMIN_JWT_SECRET, perche'
// chi configura il pannello ha bisogno di entrambi nello stesso momento.
//
//   npm run admin:hash
//
// La password si batte sul momento e non compare mai a schermo, non finisce
// nella cronologia della shell e non viene scritta in nessun file. Per questo
// non si passa come argomento: un argomento resta nella cronologia e nella
// lista dei processi.
const crypto = require("crypto");
const readline = require("readline");

const { generaImpronta, PARAMETRI } = require("../src/admin/password");

const LUNGHEZZA_MINIMA = 12;

// Legge una riga senza mostrarla. `readline` non ha una modalita' password:
// si intercetta la scrittura sul terminale e si lascia passare solo il
// ritorno a capo.
const chiediNascosto = (domanda) =>
  new Promise((risolvi) => {
    const uscita = process.stdout;
    const lettore = readline.createInterface({ input: process.stdin, output: uscita, terminal: true });

    const scriviOriginale = uscita.write.bind(uscita);
    let nascondi = false;

    uscita.write = (pezzo, ...resto) => {
      if (nascondi && typeof pezzo === "string" && !pezzo.includes("\n")) {
        return true;
      }
      return scriviOriginale(pezzo, ...resto);
    };

    lettore.question(domanda, (risposta) => {
      uscita.write = scriviOriginale;
      lettore.close();
      scriviOriginale("\n");
      risolvi(risposta);
    });

    nascondi = true;
  });

(async () => {
  console.log("Impronta della password di amministrazione del pannello.");
  console.log(
    `Parametri: ${PARAMETRI.ALGORITMO} N=${PARAMETRI.N} r=${PARAMETRI.R} p=${PARAMETRI.P}\n`
  );

  const password = await chiediNascosto("Password: ");
  if (password.length < LUNGHEZZA_MINIMA) {
    console.error(
      `\nLa password deve essere lunga almeno ${LUNGHEZZA_MINIMA} caratteri. ` +
        "Dietro questa credenziale c'e' tutto il pannello."
    );
    process.exit(1);
  }

  const ripetuta = await chiediNascosto("Ripeti:   ");
  if (password !== ripetuta) {
    console.error("\nLe due password non coincidono. Niente e' stato generato.");
    process.exit(1);
  }

  const impronta = await generaImpronta(password);
  const segreto = crypto.randomBytes(48).toString("base64");

  console.log("\nDa aggiungere a .env:\n");
  console.log("ADMIN_PANEL_ENABLED=true");
  console.log("ADMIN_USERNAME=<il nome che vuoi usare>");
  console.log(`ADMIN_PASSWORD_HASH=${impronta}`);
  console.log(`ADMIN_JWT_SECRET=${segreto}`);
  console.log("# ADMIN_SESSION_TTL=30m");
  console.log("# ADMIN_PROBE_DESTRUCTIVE=false");
  console.log(
    "\nADMIN_JWT_SECRET qui sopra e' appena stato generato a caso: deve essere\n" +
      "diverso da JWT_SECRET, altrimenti il server rifiutera' di partire."
  );
})().catch((e) => {
  console.error("\nErrore:", e.message);
  process.exit(1);
});
