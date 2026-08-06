-- Elimina definitivamente le tabelle archiviate da 001.
--
-- NON REVERSIBILE. Eseguire solo dopo che 001 e' in produzione da un periodo
-- di osservazione sufficiente e nulla ha segnalato la loro assenza.
--
-- Fare un backup prima: una volta eseguita, i dati non sono piu' recuperabili
-- se non dal backup.

DROP TABLE `_legacy_utenti`;
DROP TABLE `_legacy_blocchi`;
DROP TABLE `_legacy_token`;
DROP TABLE `_legacy_transactions_old`;
