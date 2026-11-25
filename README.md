## Per testare l'applicativo

 - Esegui npm install
 - Inizializzare DB su mysql
 - Simulare la registrazione degli utenti decommentando in index.js la parte relativa alla *userRegistration* e commentando quella relativa al *UserLogin*
 - Lanciato i metodi si avranno 5 utenti , ognuno con un Masternode inizializzato con un account per ogni blockchain.
 - Decommenta il codice riferito a *userRegistration* perchè ora vogliamo fare il login e commenta la parte di *UserLogin* appunto passando la giusta email e la giusta password
 - Una volta fatto ciò, il sistema attraverso crittografia AES, permetterà di decrittografare il Masternode salvato nel db in maniera cifrata e di accedere agli address specifici.
 - Per visualizzare i propri address è possibile richiamare la funzione *useProva* dopo aver fatto il login per verificare se è effettivamente un wallet deterministico. Questa funzione ha 3 parametri: Il masternode,un indice (che rappresenta la foglia del key derivation tree della nostra stuttura BIP32: Ad ogni indice corrisponde un nuovo address per quella determinata blockchain, se si incrementa verrà generato un nuovo set di address) e il tipo di network, se testnet, se stagenet o mainent (settato su testnet già)
 - Visualizzare ora che Gli address che useProva fornisce siano conformi a quelli generati per il Login. Se sono uguali, allora lo standard BIP32 è a tutti gli effetti funzionante e deterministico per le blockchain. 

 *N.B* Per Monero si genera un mnemonic a parte in quanto per sua logica by design non permette di usare lo stesso mnemonic dello standard BIP32, quindi attraverso un codice coperto da copyright in monero_core.js è possibile derivare comunque gli address generando in background un'altro mnemonic attraverso la chiave privata del nodo foglio dell'albero riferito alla blockchain Monero.
## Sincronizzazione del catalogo dei token

```
npm run sync-metadata            # rifa' il catalogo adesso
npm run sync-metadata -- --prune # e toglie dalla cache le icone non piu' riferite
npm run sync-metadata -- --force # sostituisce anche un catalogo molto piu' piccolo
```

Il catalogo dei token -- quello che l'applicazione sfoglia per scegliere cosa
scambiare -- vive nella tabella `token_metadata` e si rifa' da Rango. La cron
lo rifa' ogni giorno a mezzanotte (`CRON_TIMEZONE` per dichiarare il fuso);
questo comando fa la stessa cosa subito, senza avviare il server.

Come lavora, perche' quello che stampa si possa leggere:

 - chiede a Rango i token di ETH, BSC, SOLANA e BTC: circa trentamila, una
   quindicina di megabyte;
 - prende un lucchetto nel database, cosi' due corse non si pestano i piedi.
   Se un'altra e' in corso non fa niente e lo dice;
 - rifiuta di sostituire il catalogo in servizio con uno che abbia meno di
   sette decimi dei suoi token (`TOKEN_METADATA_MIN_RATIO` per cambiare la
   soglia, `--force` per il giorno in cui il calo e' vero);
 - riempie una tabella di scorta a lotti da 500 e poi la scambia con quella in
   servizio in un colpo solo: chi legge non vede mai il catalogo a meta'. Una
   riga che il database rifiuta viene saltata e contata, non butta via la
   corsa;
 - scarica le icone che mancano in `public/token/<catena>/<indirizzo>.<est>`,
   otto per volta. Non e' un passaggio critico: un'icona che manca si riprende
   la notte dopo.

Sulle icone c'e' una cosa da sapere, perche' e' costata cinquemila immagini.
Sono concentrate su pochi host -- tre ne servono il novanta per cento, il piu'
grande dodicimila -- quindi smettere con un host e' una decisione pesante, e
si prende cosi':

 - un 404, un 403 o un 410 riguardano quell'indirizzo e non l'host: non
   contano, e azzerano i fallimenti accumulati prima. Il tredici per cento
   degli indirizzi di `raw.githubusercontent.com` risponde 404, misurato: sono
   loghi di token che non esistono piu';
 - un 429 o un 503 vogliono dire "non adesso": si aspetta quanto chiede
   `Retry-After` (al massimo quindici secondi) e si riprova, fino a tre volte;
 - si smette solo per un guasto di rete, o per uno di quegli stati che dopo
   tre tentativi dice ancora no, e dopo un numero di volte che pesa quanto
   l'host: l'uno per cento delle sue immagini, fra cinque e sessanta. Un nome
   che non si risolve basta da solo;
 - in coda alla corsa, cio' che era rimasto fuori per un host spento si
   riprova una seconda volta, piu' piano. Se l'host aveva solo fretta rientra
   tutto; se e' morto muore di nuovo in pochi secondi.

La riga `dao.cacheTokenImages.completed` nel registro porta il campo `motivi`:
per ciascun host, quali stati HTTP e quali codici di errore ha risposto. Serve
per non dover sondare la produzione a mano quando mancano delle immagini.

Esce 0 se ha sincronizzato o se ha trovato il lucchetto occupato, 1 se e'
fallito, e in entrambi i casi stampa il motivo. Nel pannello: il semaforo
*Sincronizzazione metadati* nella pagina Salute, e nel visore del registro
filtrando l'azione per `syncTokenMetaDataInDB` o `manualSync`.

Serve `RANGO_API_KEY` nel `.env`: senza quella chiave il fornitore risponde
401 a tutto, e il server non parte nemmeno.
