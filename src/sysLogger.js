const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'logs');
const FALLBACK_LOG_FILE = path.join(LOG_DIR, 'system_logs_fallback.log');

const ensureLogDir = () => {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (e) {
    console.error('Failed to create log directory', e);
  }
};

const writeFallbackLog = (payload) => {
  try {
    ensureLogDir();
    const line = JSON.stringify({
      ...payload,
      created_at: new Date().toISOString(),
    }) + '\n';
    fs.appendFile(FALLBACK_LOG_FILE, line, (err) => {
      if (err) {
        console.error('Failed to write fallback log', err);
      }
    });
  } catch (e) {
    console.error('Unexpected error in writeFallbackLog', e);
  }
};

const CON_DURATA =
  'INSERT INTO system_logs (log_type, action, details, status, duration_ms) VALUES (?, ?, ?, ?, ?)';
const SENZA_DURATA =
  'INSERT INTO system_logs (log_type, action, details, status) VALUES (?, ?, ?, ?)';

// `duration_ms` arriva con la migrazione 008, che si lancia a mano. Se questo
// codice entrasse in servizio prima, ogni riga di registro fallirebbe con
// ER_BAD_FIELD_ERROR e finirebbe nel file di scorta: il registro tacerebbe
// tutto in una volta, e proprio mentre si sta mettendo mano al server. Quindi
// si tenta con la colonna e, al primo rifiuto per colonna assente, si passa
// alla forma di prima e non si riprova piu'.
//
// Il verso e' solo questo: una volta scesi alla forma senza durata non si
// risale. Dopo aver lanciato la migrazione serve un riavvio perche' le durate
// tornino a essere registrate.
let colonnaDurata = true;

const logToDb = (type, action, details, status = 'INFO', durationMs = null) => {
  const durata =
    typeof durationMs === 'number' && Number.isFinite(durationMs)
      ? Math.round(durationMs)
      : null;

  const payload = { log_type: type, action, details, status, duration_ms: durata };

  if (!global.connection) {
    console.error('Database connection not available for logging');
    writeFallbackLog({
      ...payload,
      db_error: 'NO_GLOBAL_CONNECTION',
    });
    return;
  }

  let detailsStr = details;
  try {
    if (typeof details === 'object') {
      detailsStr = JSON.stringify(details);
    }
  } catch (e) {
    detailsStr = String(details);
  }

  const scrivi = (conDurata) => {
    const query = conDurata ? CON_DURATA : SENZA_DURATA;
    const valori = conDurata
      ? [type, action, detailsStr, status, durata]
      : [type, action, detailsStr, status];

    global.connection.query(query, valori, (err) => {
      if (!err) return;

      if (conDurata && err.code === 'ER_BAD_FIELD_ERROR') {
        colonnaDurata = false;
        scrivi(false);
        return;
      }

      console.error('Failed to write to system_logs', err);
      writeFallbackLog({
        ...payload,
        db_error: err && err.message ? err.message : String(err),
      });
    });
  };

  scrivi(colonnaDurata);
};

// Solo per le prove: riporta il rilevamento della colonna allo stato iniziale.
const reimpostaColonnaDurata = () => {
  colonnaDurata = true;
};

module.exports = { logToDb, reimpostaColonnaDurata };