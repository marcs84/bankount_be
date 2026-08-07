-- Indici a supporto delle letture piu' frequenti.
--
-- Nessuna tabella ha oggi indici oltre alla chiave primaria: ogni ricerca per
-- indirizzo, per dispositivo o per wallet e' una scansione completa. Con i
-- volumi attuali non si nota, ma la lettura delle transazioni passa a
-- risolvere la proprieta' attraverso gli indirizzi, quindi la scansione
-- diventerebbe il costo dominante.
--
-- address, from_address e destination_address sono colonne TEXT e richiedono
-- una lunghezza di prefisso. I valori piu' lunghi presenti misurano 44
-- caratteri (Solana); 64 copre con margine anche gli indirizzi Bitcoin bech32
-- e gli hash Ethereum, restando ben sotto il limite di chiave di InnoDB.
--
-- Tutte le istruzioni sono additive: non modificano dati e si annullano
-- eliminando gli indici.

-- Risoluzione della proprieta' di una transazione a partire dagli indirizzi
-- del dispositivo, con lo scope su wallet e stato usato dalla lettura.
CREATE INDEX `idx_addresses_owner` ON `addresses` (`id_utente`, `wallet_id`, `addressStatus`);
CREATE INDEX `idx_addresses_address` ON `addresses` (`address`(64));

-- Incrocio fra transazione e indirizzi, nei due versi.
CREATE INDEX `idx_transactions_from` ON `transactions` (`from_address`(64));
CREATE INDEX `idx_transactions_dest` ON `transactions` (`destination_address`(64));

-- Ordinamento e filtro per data nella lista transazioni.
CREATE INDEX `idx_transactions_inserted` ON `transactions` (`data_insert`);

-- Autenticazione: verifyDevice cerca per identificatore a ogni login.
CREATE INDEX `idx_device_identifier` ON `device` (`identifier`(64), `is_active`);

-- Elenco dei wallet di un dispositivo, usato dalla sincronizzazione.
CREATE INDEX `idx_wallet_device` ON `wallet` (`device_id`, `is_active`);

-- Lettura dei token preferiti, filtrata per dispositivo e wallet.
CREATE INDEX `idx_bookmarked_owner` ON `bookmarked_tokens` (`user_id`, `wallet_id`);
