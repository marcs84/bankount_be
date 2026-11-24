# Il server

Copia di cio' che gira su `app.bankount.com`, perche' una macchina si
reinstalla e la memoria di com'era fatta no.

| file | dove va | cosa fa |
|---|---|---|
| `bankount.service` | `/etc/systemd/system/` | tiene in piedi il backend sulla 3001 |
| `bankount-dump.sh` | `/usr/local/bin/` | salva il database in `/var/backups/bankount` |
| `bankount-dump.service` | `/etc/systemd/system/` | esegue lo script una volta |
| `bankount-dump.timer` | `/etc/systemd/system/` | lo chiama ogni notte alle 3:10 |

La configurazione di nginx sta accanto, in
`deploy/app.bankount.com/nginx/bankount`, insieme ai file pubblicati.

## Installazione del salvataggio

    sudo install -m 755 deploy/server/bankount-dump.sh /usr/local/bin/bankount-dump.sh
    sudo install -m 644 deploy/server/bankount-dump.service /etc/systemd/system/
    sudo install -m 644 deploy/server/bankount-dump.timer   /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now bankount-dump.timer

Prova subito, senza aspettare la notte:

    sudo systemctl start bankount-dump.service
    journalctl -u bankount-dump -n 10 --no-pager
    sudo ls -l /var/backups/bankount

Quando scatta la prossima volta:

    systemctl list-timers bankount-dump --no-pager

## Ripristino

Il salvataggio contiene le tabelle, non il `CREATE DATABASE`: lo schema
dev'essere gia' li'.

    sudo zcat /var/backups/bankount/<file>.sql.gz \
      | mariadb -h 127.0.0.1 -u bankount -p cryptowallet

## Cose che si dimenticano

- `.env` e `firebase-config.json` **non** stanno nel repository e non si
  recuperano da un `git clone`: vanno copiati a mano e tenuti a `chmod 600`.
  Un backend senza il secondo non parte.
- L'utente del database e' `bankount@127.0.0.1`, non `@localhost`: sono due
  host diversi, e con `skip-name-resolve` acceso (in
  `/etc/mysql/mariadb.conf.d/99-bankount.cnf`) un collegamento dal socket
  non combacia. Dalla riga di comando serve sempre `-h 127.0.0.1`.
- `TRUST_PROXY` vale `1` qui, perche' davanti c'e' il solo nginx. Vale `2`
  sulla macchina di sviluppo, dove c'e' anche il tunnel. Col numero
  sbagliato `req.ip` diventa quello del proxy e il limite sui tentativi di
  accesso al pannello si applica a tutti insieme.
