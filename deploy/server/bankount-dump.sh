#!/bin/bash
#
# Salvataggio del database, una volta per notte.
#
# Le credenziali le legge dal `.env` del backend: una sola copia da
# aggiornare, e nessuna password scritta due volte in due posti che poi si
# allontanano fra loro.
#
# Si installa in /usr/local/bin/bankount-dump.sh insieme alle due unita'
# systemd che stanno in questa stessa cartella.

set -euo pipefail

RADICE="${RADICE:-/home/debian/crypto-wallet-backend}"
DESTINAZIONE="${DESTINAZIONE:-/var/backups/bankount}"
GIORNI="${GIORNI:-14}"

if [ ! -r "$RADICE/.env" ]; then
  echo "non trovo $RADICE/.env" >&2
  exit 1
fi

# Si legge il valore, non si esegue il file: un `.env` sorgente eseguirebbe
# qualunque cosa ci sia scritta dentro.
valore() {
  sed -n "s/^$1=//p" "$RADICE/.env" | head -n1 | tr -d '\r' \
    | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/"
}

HOST="$(valore DB_HOST)"
UTENTE="$(valore DB_USERNAME)"
PAROLA="$(valore DB_PASSWORD)"
SCHEMA="$(valore DB_DATABASE)"

for v in HOST UTENTE PAROLA SCHEMA; do
  if [ -z "${!v}" ]; then
    echo "manca DB_${v} nel .env" >&2
    exit 1
  fi
done

# La password in un file temporaneo a 600 e non sulla riga di comando: la
# riga di comando la vede chiunque possa leggere /proc.
CNF="$(mktemp)"
chmod 600 "$CNF"
trap 'rm -f "$CNF"' EXIT INT TERM
printf '[client]\nhost=%s\nuser=%s\npassword=%s\n' "$HOST" "$UTENTE" "$PAROLA" > "$CNF"

mkdir -p "$DESTINAZIONE"
chmod 700 "$DESTINAZIONE"

FILE="$DESTINAZIONE/$SCHEMA-$(date +%Y%m%d-%H%M%S).sql.gz"

# Si scrive con un nome provvisorio e si rinomina solo a fine corsa: un dump
# interrotto a meta' non deve mai avere l'aspetto di un salvataggio buono.
# `--single-transaction` basta perche' tutte le tabelle sono InnoDB: la
# fotografia e' coerente senza bloccare nessuno.
mysqldump --defaults-extra-file="$CNF" \
  --single-transaction --quick --no-tablespaces \
  --default-character-set=utf8mb4 \
  "$SCHEMA" | gzip -9 > "$FILE.parziale"

mv "$FILE.parziale" "$FILE"
chmod 600 "$FILE"

# Un dump buono non e' mai minuscolo: se lo e', qualcosa e' andato storto in
# silenzio e e' meglio accorgersene stanotte che il giorno del ripristino.
DIMENSIONE="$(stat -c %s "$FILE")"
if [ "$DIMENSIONE" -lt 102400 ]; then
  echo "salvataggio sospetto: $FILE e' di soli $DIMENSIONE byte" >&2
  exit 1
fi

find "$DESTINAZIONE" -maxdepth 1 -name "$SCHEMA-*.sql.gz" -mtime +"$GIORNI" -delete

echo "salvato $FILE ($DIMENSIONE byte), conservo gli ultimi $GIORNI giorni"
