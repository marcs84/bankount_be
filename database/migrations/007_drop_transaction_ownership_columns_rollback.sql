-- Rollback di 007: ripristina le colonne di attribuzione su transactions.
--
-- Richiede che transactions_ownership_backup esista ancora: e' la copia creata
-- dalla migration.
--
-- Le colonne vengono ricreate con la definizione originale e ripopolate dai
-- valori salvati; le righe inserite dopo la 007 restano a NULL, non avendo mai
-- avuto un'attribuzione.

ALTER TABLE `transactions`
  ADD COLUMN `address_id` INT NULL,
  ADD COLUMN `id_utente` INT NULL,
  ADD COLUMN `wallet_id` VARCHAR(255) NULL;

UPDATE `transactions` t
JOIN `transactions_ownership_backup` b ON b.`id` = t.`id`
SET t.`address_id` = b.`address_id`,
    t.`id_utente`  = b.`id_utente`,
    t.`wallet_id`  = b.`wallet_id`;

DROP TABLE `transactions_ownership_backup`;
