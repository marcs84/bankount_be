-- Rollback di 003: ripristina le transazioni come erano prima della deduplica.
--
-- Richiede che transactions_pre_dedupe esista ancora: e' la copia creata dalla
-- migration. Una volta eliminata quella tabella il rollback non e' piu'
-- possibile senza un backup esterno.

DROP INDEX `uq_transactions_movement` ON `transactions`;
ALTER TABLE `transactions` DROP COLUMN `movement_key`;

DELETE FROM `transactions`;
INSERT INTO `transactions` SELECT * FROM `transactions_pre_dedupe`;

DROP TABLE `transactions_pre_dedupe`;
