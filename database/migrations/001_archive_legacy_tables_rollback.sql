-- Rollback di 001: riporta le tabelle archiviate ai nomi originali.

RENAME TABLE `_legacy_utenti`           TO `utenti`;
RENAME TABLE `_legacy_blocchi`          TO `blocchi`;
RENAME TABLE `_legacy_token`            TO `token`;
RENAME TABLE `_legacy_transactions_old` TO `transactions_old`;
