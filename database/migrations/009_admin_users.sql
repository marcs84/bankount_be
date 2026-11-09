-- Gli amministratori del pannello, piu' di uno.
--
-- Finora l'amministratore era uno solo, scritto in `.env`: nome, impronta
-- della password e segreto delle sessioni. Per averne piu' di uno serve un
-- posto dove tenerli, e questa e' la tabella.
--
-- Quello di `.env` **resta**, e resta sempre valido. Non e' una comodita': se
-- gli unici amministratori stessero qui dentro, il giorno che il database non
-- risponde nessuno potrebbe entrare nel pannello per vedere che il database
-- non risponde. Quello dell'ambiente e' la chiave sotto lo zerbino; questi
-- sono gli ordinari. Per lo stesso motivo non ha una riga qui: nessun
-- amministratore della tabella puo' disabilitarlo.
--
-- Due ruoli. `proprietario` gestisce gli accessi, `operatore` guarda il
-- pannello e cambia la propria password. Senza ruoli, il primo amministratore
-- creato potrebbe crearne altri e cancellare chi l'ha creato.
--
-- La tabella e' nuova e non tocca niente di esistente: il rollback la
-- elimina, e il pannello torna all'amministratore dell'ambiente.

CREATE TABLE `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,

  -- Il confronto di questa collazione non distingue le maiuscole, quindi
  -- l'unicita' impedisce sia `marco` sia `Marco`: due nomi che si leggono
  -- uguali e aprono sessioni diverse sarebbero un modo di sbagliarsi.
  `username` VARCHAR(64) NOT NULL,

  -- Impronta `scrypt` nello stesso formato di `npm run admin:hash`, con i
  -- parametri scritti dentro: alzare il costo in futuro non invalida le
  -- impronte gia' esistenti.
  `password_hash` VARCHAR(255) NOT NULL,

  `role` VARCHAR(20) NOT NULL DEFAULT 'operatore',

  -- Disabilitato non e' cancellato: la sessione si chiude subito, il nome
  -- resta occupato e la riga racconta che quell'accesso e' esistito.
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,

  `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  `created_by` VARCHAR(64) DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,

  -- Il pannello la confronta con quella scritta nella sessione: cambiare la
  -- password chiude le sessioni aperte con la precedente, invece di lasciarle
  -- valide fino alla scadenza.
  `password_changed_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
