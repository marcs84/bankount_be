-- Rollback di 010: elimina l'indice.
--
-- La tabella **non** si tocca. 010 la crea solo dove non c'era, e il catalogo
-- che contiene e' trentamila righe che si rifanno in un minuto, ma buttare giu'
-- una tabella non e' l'annullamento di una migrazione additiva: e' una perdita
-- di dati. Se davvero la si vuole via, si fa a mano e sapendo cosa si fa.

DROP INDEX `idx_token_metadata_blockchain` ON `token_metadata`;
