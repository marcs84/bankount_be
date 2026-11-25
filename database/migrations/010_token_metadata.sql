-- Il catalogo dei token: la tabella, e un indice per come si legge.
--
-- Due cose indipendenti, in un file solo perche' riguardano la stessa tabella.
-- Entrambe sono additive: non toccano nessun dato.
--
--
-- 1. LA TABELLA NON ERA SCRITTA DA NESSUNA PARTE
--
-- `token_metadata` esisteva solo nel database vivo. La sincronizzazione la
-- rifa' ogni notte con `CREATE TABLE token_metadata_staging LIKE
-- token_metadata`, cioe' presuppone che ci sia gia': su un'installazione
-- pulita `npm run sync-metadata` non parte, e dal codice non si poteva sapere
-- quali colonne e quali indici avesse.
--
-- La definizione qui sotto e' quella della tabella in servizio, letta con
-- `SHOW CREATE TABLE`. `IF NOT EXISTS` perche' dove la tabella c'e' questa
-- parte non deve fare niente.
--
-- `isNative` non la legge ne' la scrive nessuno: la sincronizzazione non la
-- riempie, quindi dopo ogni corsa vale zero per tutte le righe, comprese le
-- quattro monete native. Sta qui perche' sta nella tabella vera, e togliere
-- una colonna e' un'altra migrazione, da decidere a parte.

CREATE TABLE IF NOT EXISTS `token_metadata` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `blockchain` varchar(50) NOT NULL,
  `symbol` varchar(128) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `isPopular` tinyint(1) NOT NULL DEFAULT 0,
  `isNative` tinyint(4) NOT NULL DEFAULT 0,
  `chainId` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `decimals` int(11) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `blockchainImage` varchar(500) DEFAULT NULL,
  `usdPrice` decimal(30,10) DEFAULT NULL,
  `supportedSwappers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`supportedSwappers`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2. L'INDICE
--
-- La tabella non ha indici oltre alla chiave primaria, e sono trentamila
-- righe. Ogni pagina della ricerca token ne fa due scansioni complete: una
-- per le righe e una per il `COUNT(*)` che riempie il contatore delle pagine.
--
-- L'indice serve il filtro -- `WHERE blockchain IN (?)`, e l'applicazione
-- chiede una catena per volta -- e il conteggio. L'ordinamento resta un
-- sort: va per `isPopular` in discesa e per simbolo in salita, e due versi
-- opposti nella stessa chiave non si servono con un indice solo.
--
-- `symbol` non entra: la ricerca e' `LIKE '%testo%'`, e con il jolly davanti
-- nessun indice si puo' usare.
--
-- La sincronizzazione notturna non lo perde: `CREATE TABLE ... LIKE` copia
-- anche gli indici, quindi la tabella nuova nasce con questo.

CREATE INDEX `idx_token_metadata_blockchain` ON `token_metadata` (`blockchain`, `isPopular`);
