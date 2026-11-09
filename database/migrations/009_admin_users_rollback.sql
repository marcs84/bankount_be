-- Rollback di 009: elimina la tabella degli amministratori.
--
-- Non tocca niente che esistesse prima della 009: la tabella era nuova. Il
-- pannello continua a funzionare con l'amministratore di `.env`, che non ha
-- mai avuto una riga qui dentro, e la linguetta degli utenti torna a dire che
-- la tabella non c'e'.
--
-- Cio' che si perde sono i nomi e le impronte degli amministratori creati dal
-- pannello: le loro azioni restano in `system_logs`, dove il nome e' scritto
-- come testo e non come riferimento a questa tabella.

DROP TABLE `admin_users`;
