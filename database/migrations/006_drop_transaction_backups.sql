-- Elimina le copie di sicurezza lasciate dalle migration 003 e 005.
--
-- transactions_pre_dedupe conserva lo stato precedente alla deduplica (108
-- righe), transactions_pre_netfix quello precedente alla normalizzazione di
-- network_type (55 righe).
--
-- ATTENZIONE: questa migration non e' reversibile. Le due tabelle sono
-- l'unico modo per annullare la 003 e la 005; una volta eliminate, tornare
-- indietro richiede un backup esterno del database.
--
-- Il rollback della 005 va comunque eseguito prima di quello della 003:
-- la 005 ripristina 55 righe, la 003 le riporta a 108.
--
-- Da eseguire solo dopo aver verificato end-to-end che le transazioni si
-- scrivono in una riga sola e compaiono nello storico dell'app.

DROP TABLE IF EXISTS `transactions_pre_netfix`;
DROP TABLE IF EXISTS `transactions_pre_dedupe`;
