-- Rollback di 005: ripristina le transazioni come erano prima della
-- normalizzazione di network_type.
--
-- Richiede che transactions_pre_netfix esista ancora: e' la copia creata dalla
-- migration. Una volta eliminata quella tabella il rollback non e' piu'
-- possibile senza un backup esterno.
--
-- movement_key non viene ripristinata perche' e' una colonna generata: si
-- ricalcola da sola dai valori reinseriti.

DELETE FROM `transactions`;

INSERT INTO `transactions`
  (`id`, `chain`, `token`, `logo`, `chain_id`, `address_id`, `from_address`,
   `destination_address`, `amount`, `usd_price`, `tx`, `gas`, `gas_price`,
   `block_number`, `type`, `network_type`, `wallet_id`, `id_utente`,
   `data_insert`, `block_hash`, `input`, `tx_status`)
SELECT
   `id`, `chain`, `token`, `logo`, `chain_id`, `address_id`, `from_address`,
   `destination_address`, `amount`, `usd_price`, `tx`, `gas`, `gas_price`,
   `block_number`, `type`, `network_type`, `wallet_id`, `id_utente`,
   `data_insert`, `block_hash`, `input`, `tx_status`
FROM `transactions_pre_netfix`;

DROP TABLE `transactions_pre_netfix`;
