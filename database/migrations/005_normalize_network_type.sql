-- Allinea network_type fra le due sorgenti che scrivono lo stesso movimento.
--
-- L'app etichetta la rete con AppConfig.mainNetwork, il webhook con il valore
-- prodotto dalla filter function di QuickNode. I due non coincidevano: la
-- stessa transazione Sepolia risultava TESTNET dall'app e MAINNET dal webhook.
-- Poiche' network_type entra nella chiave del movimento, l'indice unico non
-- riconosceva le due scritture come lo stesso movimento e la riga veniva
-- duplicata; e poiche' la lettura filtra su TESTNET, le righe MAINNET erano
-- invisibili all'applicazione.
--
-- La filter function e' stata corretta e ora emette TESTNET. Questa migration
-- riallinea i dati gia' scritti: fonde le righe che descrivono lo stesso
-- movimento e porta network_type a TESTNET.
--
-- L'ordine e' obbligato: movement_key e' una colonna generata STORED con
-- indice unico, normalizzare prima di fondere farebbe collidere le chiavi.
--
-- Sul database di sviluppo: 55 righe, 54 movimenti distinti, 1 gruppo da
-- fondere. Tutte le righe sono dati di test.
--
-- La tabella viene copiata in transactions_pre_netfix prima di modificare,
-- quindi il rollback non richiede un backup esterno.

CREATE TABLE `transactions_pre_netfix` LIKE `transactions`;
ALTER TABLE `transactions_pre_netfix` DROP COLUMN `movement_key`;

INSERT INTO `transactions_pre_netfix`
  (`id`, `chain`, `token`, `logo`, `chain_id`, `address_id`, `from_address`,
   `destination_address`, `amount`, `usd_price`, `tx`, `gas`, `gas_price`,
   `block_number`, `type`, `network_type`, `wallet_id`, `id_utente`,
   `data_insert`, `block_hash`, `input`, `tx_status`)
SELECT
   `id`, `chain`, `token`, `logo`, `chain_id`, `address_id`, `from_address`,
   `destination_address`, `amount`, `usd_price`, `tx`, `gas`, `gas_price`,
   `block_number`, `type`, `network_type`, `wallet_id`, `id_utente`,
   `data_insert`, `block_hash`, `input`, `tx_status`
FROM `transactions`;

-- Di ogni gruppo si conserva la riga con i dati on-chain; in mancanza, quella
-- con l'attribuzione valorizzata; altrimenti la piu' vecchia.
CREATE TEMPORARY TABLE `tx_keep` AS
SELECT COALESCE(
         MIN(CASE WHEN `block_number` IS NOT NULL THEN `id` END),
         MIN(CASE WHEN `wallet_id` IS NOT NULL THEN `id` END),
         MIN(`id`)
       ) AS `id`,
       `tx`,
       `from_address`,
       `destination_address`
FROM `transactions`
GROUP BY `tx`, `from_address`, `destination_address`;

-- Quanto sanno le righe scartate viene raccolto prima di eliminarle: nessuna
-- delle due sorgenti conosce il movimento per intero.
CREATE TEMPORARY TABLE `tx_merge` AS
SELECT k.`id`              AS `keep_id`,
       MAX(d.`chain`)      AS `chain`,
       MAX(d.`token`)      AS `token`,
       MAX(d.`logo`)       AS `logo`,
       MAX(d.`chain_id`)   AS `chain_id`,
       MAX(d.`address_id`) AS `address_id`,
       MAX(d.`usd_price`)  AS `usd_price`,
       MAX(d.`gas`)        AS `gas`,
       MAX(d.`gas_price`)  AS `gas_price`,
       MAX(d.`block_number`) AS `block_number`,
       MAX(d.`type`)       AS `type`,
       MAX(d.`wallet_id`)  AS `wallet_id`,
       MAX(d.`id_utente`)  AS `id_utente`,
       MAX(d.`block_hash`) AS `block_hash`,
       MAX(d.`input`)      AS `input`,
       MAX(d.`tx_status`)  AS `tx_status`,
       MIN(d.`data_insert`) AS `data_insert`
FROM `tx_keep` k
JOIN `transactions` d
  ON d.`tx` = k.`tx`
 AND d.`from_address` = k.`from_address`
 AND d.`destination_address` = k.`destination_address`
 AND d.`id` <> k.`id`
GROUP BY k.`id`;

UPDATE `transactions` t
JOIN `tx_merge` m ON m.`keep_id` = t.`id`
SET t.`chain`        = COALESCE(t.`chain`, m.`chain`),
    t.`token`        = COALESCE(t.`token`, m.`token`),
    t.`logo`         = COALESCE(t.`logo`, m.`logo`),
    t.`chain_id`     = COALESCE(t.`chain_id`, m.`chain_id`),
    t.`address_id`   = COALESCE(t.`address_id`, m.`address_id`),
    t.`usd_price`    = COALESCE(t.`usd_price`, m.`usd_price`),
    t.`gas`          = COALESCE(t.`gas`, m.`gas`),
    t.`gas_price`    = COALESCE(t.`gas_price`, m.`gas_price`),
    t.`block_number` = COALESCE(t.`block_number`, m.`block_number`),
    t.`type`         = COALESCE(t.`type`, m.`type`),
    t.`wallet_id`    = COALESCE(t.`wallet_id`, m.`wallet_id`),
    t.`id_utente`    = COALESCE(t.`id_utente`, m.`id_utente`),
    t.`block_hash`   = COALESCE(t.`block_hash`, m.`block_hash`),
    t.`input`        = COALESCE(t.`input`, m.`input`),
    t.`tx_status`    = IF(m.`tx_status` = 'success', 'success', t.`tx_status`),
    t.`data_insert`  = LEAST(t.`data_insert`, m.`data_insert`);

DELETE t FROM `transactions` t
LEFT JOIN `tx_keep` k ON k.`id` = t.`id`
WHERE k.`id` IS NULL;

DROP TEMPORARY TABLE `tx_merge`;
DROP TEMPORARY TABLE `tx_keep`;

UPDATE `transactions` SET `network_type` = 'TESTNET' WHERE `network_type` <> 'TESTNET';
