-- Rollback di 004: elimina gli indici aggiunti.

DROP INDEX `idx_addresses_owner` ON `addresses`;
DROP INDEX `idx_addresses_address` ON `addresses`;
DROP INDEX `idx_transactions_from` ON `transactions`;
DROP INDEX `idx_transactions_dest` ON `transactions`;
DROP INDEX `idx_transactions_inserted` ON `transactions`;
DROP INDEX `idx_device_identifier` ON `device`;
DROP INDEX `idx_wallet_device` ON `wallet`;
DROP INDEX `idx_bookmarked_owner` ON `bookmarked_tokens`;
