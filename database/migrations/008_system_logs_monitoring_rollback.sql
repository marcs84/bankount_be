-- Rollback di 008: elimina gli indici e la colonna aggiunti.
--
-- La colonna contiene solo durate registrate dopo la migrazione: eliminarla
-- non tocca nulla che esistesse prima.

DROP INDEX `idx_system_logs_created` ON `system_logs`;
DROP INDEX `idx_system_logs_type_status_created` ON `system_logs`;
DROP INDEX `idx_system_logs_status_created` ON `system_logs`;

ALTER TABLE `system_logs` DROP COLUMN `duration_ms`;
