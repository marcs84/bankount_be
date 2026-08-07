-- Deduplica le transazioni: una riga per movimento, non una per dispositivo.
--
-- La stessa transazione on-chain e' oggi scritta piu' volte, una per ogni
-- dispositivo che possiede uno degli indirizzi coinvolti; le copie sono
-- identiche salvo wallet_id e id_utente. La duplicazione serviva a stabilire
-- la visibilita', perche' la lettura univa transactions a wallet e device.
-- Con la lettura basata sugli indirizzi quel legame non serve piu'.
--
-- Un movimento e' identificato da tx, from_address, destination_address e
-- network_type: la sola tx non basta, perche' una transazione puo' contenere
-- piu' trasferimenti. Di ogni gruppo si conserva la riga con attribuzione
-- valorizzata e id piu' basso; se nessuna ce l'ha, la piu' vecchia.
--
-- La tabella viene copiata in transactions_pre_dedupe prima di cancellare,
-- quindi il rollback non richiede un backup esterno.
--
-- Provata su una copia del database di sviluppo: 108 righe ridotte a 52,
-- pari ai movimenti distinti, senza duplicati residui.

CREATE TABLE `transactions_pre_dedupe` LIKE `transactions`;
INSERT INTO `transactions_pre_dedupe` SELECT * FROM `transactions`;

CREATE TEMPORARY TABLE `tx_keep` AS
SELECT COALESCE(
         MIN(CASE WHEN `wallet_id` IS NOT NULL THEN `id` END),
         MIN(`id`)
       ) AS `id`
FROM `transactions`
GROUP BY `tx`, `from_address`, `destination_address`, `network_type`;

DELETE FROM `transactions`
WHERE `id` NOT IN (SELECT `id` FROM `tx_keep`);

DROP TEMPORARY TABLE `tx_keep`;

-- tx, from_address e destination_address sono TEXT e non sono indicizzabili
-- direttamente: la chiave del movimento viene materializzata in una colonna
-- generata, cosi' l'unicita' e' esatta e non dipende da un prefisso.
ALTER TABLE `transactions`
  ADD COLUMN `movement_key` CHAR(64)
  GENERATED ALWAYS AS (
    SHA2(CONCAT_WS('|', `tx`, `from_address`, `destination_address`, `network_type`), 256)
  ) STORED;

CREATE UNIQUE INDEX `uq_transactions_movement`
  ON `transactions` (`movement_key`);
