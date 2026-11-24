# app.bankount.com

Copia di cio' che sta sul server OVH (158.69.179.55) sotto `/var/www/bankount`.
Non viene servita da questo backend: sta qui perche' questi file finiscono
dentro l'applicazione pubblicata sui negozi, e una modifica fatta solo sul
server non lascerebbe traccia da nessuna parte.

| file qui | sul server | serve a |
|---|---|---|
| `.well-known/assetlinks.json` | `/var/www/bankount/.well-known/assetlinks.json` | Android App Links: autorizza `com.bankount.wallet` ad aprire i collegamenti del dominio |
| `.well-known/apple-app-site-association` | idem | Universal Links iOS, per `Q969RRV44D.com.bankount.wallet` |
| `brand/bankount-wallet.png` | `/var/www/bankount/brand/bankount-wallet.png` | icona 1024x1024 che WalletConnect mostra alle dapp (campo `icons`) |
| `nginx/bankount` | `/etc/nginx/sites-available/bankount` | il sito; il collegamento in `sites-enabled` va fatto a mano |

Il certificato lo gestisce certbot (`certbot --nginx -d app.bankount.com`), che
aggiunge da se' l'ascolto sulla 443 e il rimando dalla 80: percio' il file qui
sopra e' quello **prima** del passaggio di certbot, non quello in esecuzione.

## Le tre impronte in assetlinks.json

| impronta | chi e' |
|---|---|
| `41:8A:3F:BF:...` | firma dell'app di Google Play. E' quella che portano i telefoni che installano dal negozio, ed e' l'unica che conta in produzione |
| `6E:CE:47:BC:...` | chiave di caricamento (`keystore.jks`, alias `keystore`). Serve alle build installate direttamente dall'AAB o per condivisione interna |
| `BA:7C:07:1B:...` | chiave di debug della macchina di sviluppo. Sta qui per il collaudo e va tolta quando i collegamenti funzionano su una build di Play |

La rotta `GET /.well-known/assetlinks.json` del backend
(`src/server/routes.js`) legge questo stesso file: una copia sola, cosi' le
impronte non possono divergere fra il server e il backend.

## Dopo una modifica

Google tiene in cache la risposta per un'ora (`maxAge: 3600s`). Si controlla
cosa vede lui, non cosa vede `curl`:

    curl -sS 'https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://app.bankount.com&relation=delegate_permission/common.handle_all_urls'

e sul telefono:

    adb shell pm get-app-links com.bankount.wallet
