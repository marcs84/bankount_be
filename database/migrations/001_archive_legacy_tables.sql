-- Archivia le tabelle del percorso custodiale legacy.
--
-- Le tabelle non sono lette ne' scritte da alcun percorso raggiungibile
-- dall'app: il codice che le usava (registrazione utente, derivazione del
-- masternode, 2FA, reset password, tracking dei blocchi per i cron) e' stato
-- rimosso. Al momento della stesura risultano tutte e quattro vuote.
--
-- La migration rinomina invece di eliminare: i dati restano recuperabili e il
-- rollback e' immediato. Il DROP definitivo e' in 002, da eseguire solo dopo
-- un periodo di osservazione.
--
-- utenti  contiene le colonne compromettenti password (SHA-1 non salato) e
--         masternode (xpriv cifrato con chiave co-locata): F-002 e F-011.

RENAME TABLE `utenti`           TO `_legacy_utenti`;
RENAME TABLE `blocchi`          TO `_legacy_blocchi`;
RENAME TABLE `token`            TO `_legacy_token`;
RENAME TABLE `transactions_old` TO `_legacy_transactions_old`;
