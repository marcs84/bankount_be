-- Rimuove da transactions le colonne address_id, id_utente e wallet_id.
--
-- Erano il residuo del modello in cui ogni dispositivo aveva la propria copia
-- della transazione. Con una riga per movimento non possono piu' descrivere la
-- proprieta': lo stesso indirizzo appartiene a tutti i dispositivi che
-- condividono la seed, e tre colonne ne registrano uno solo, scelto
-- arbitrariamente fra quelli corrispondenti.
--
-- Nessuna query le usa come criterio. La visibilita' passa da addresses:
-- filterTransactions risolve la proprieta' con EXISTS su a.id_utente e
-- a.wallet_id, e transaction_type confronta gli indirizzi del wallet con
-- from_address e destination_address. Le colonne venivano solo scritte e
-- rilette senza che nulla le interrogasse.
--
-- I valori vengono salvati in transactions_ownership_backup prima di
-- eliminarli, cosi' il rollback puo' ricostruirli.

CREATE TABLE `transactions_ownership_backup` (
  `id` INT NOT NULL PRIMARY KEY,
  `address_id` INT NULL,
  `id_utente` INT NULL,
  `wallet_id` VARCHAR(255) NULL
);

INSERT INTO `transactions_ownership_backup` (`id`, `address_id`, `id_utente`, `wallet_id`)
SELECT `id`, `address_id`, `id_utente`, `wallet_id` FROM `transactions`;

ALTER TABLE `transactions`
  DROP COLUMN `address_id`,
  DROP COLUMN `id_utente`,
  DROP COLUMN `wallet_id`;
