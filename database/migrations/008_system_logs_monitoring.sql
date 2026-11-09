-- Indici e colonna di durata su system_logs, a supporto del pannello di
-- monitoraggio.
--
-- system_logs e' oggi la tabella piu' grande del database (19.208 righe,
-- 11,5 MB) e ha un solo indice, la chiave primaria. Finora non si notava,
-- perche' nessuno la interrogava: ci si scriveva soltanto. Il pannello la
-- legge con filtri per intervallo di tempo, tipo e stato, e raggruppa per ora
-- e per rotta; senza indici ogni schermata sarebbe una scansione completa, e
-- il costo crescerebbe con l'archivio che il pannello serve a tenere d'occhio.
--
-- La durata della richiesta e' registrata dentro `details` come stringa con
-- l'unita' (`"duration": "123ms"`): per calcolarne medie e massimi andrebbe
-- estratta e convertita riga per riga, su una colonna di testo che nessun
-- indice puo' coprire. La colonna dedicata la rende una somma.
--
-- Tutte le istruzioni sono additive: non modificano ne' cancellano dati, e si
-- annullano eliminando indici e colonna. Le righe esistenti restano con
-- `duration_ms` a NULL, che il pannello distingue da uno zero.

-- Letture per intervallo di tempo senza altri filtri, e l'ordinamento
-- decrescente con cui il visore apre sempre.
CREATE INDEX `idx_system_logs_created` ON `system_logs` (`created_at`);

-- La combinazione di filtri del visore: tipo piu' stato piu' intervallo.
-- Serve anche le interrogazioni sul solo `log_type`, come prefisso sinistro.
CREATE INDEX `idx_system_logs_type_status_created`
  ON `system_logs` (`log_type`, `status`, `created_at`);

-- "Gli errori delle ultime ore", che e' la prima domanda che si fa a un
-- pannello e attraversa tutti i tipi di registro.
CREATE INDEX `idx_system_logs_status_created`
  ON `system_logs` (`status`, `created_at`);

-- Durata della richiesta in millisecondi, riempita da qui in avanti dal
-- registro delle API. Nulla per gli eventi che non sono richieste.
ALTER TABLE `system_logs`
  ADD COLUMN `duration_ms` INT NULL DEFAULT NULL AFTER `status`;
