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

const logToDb = (type, action, details, status = 'INFO') => {
  const payload = { log_type: type, action, details, status };

  if (!global.connection) {
    console.error('Database connection not available for logging');
    writeFallbackLog({
      ...payload,
      db_error: 'NO_GLOBAL_CONNECTION',
    });
    return;
  }

  const query = 'INSERT INTO system_logs (log_type, action, details, status) VALUES (?, ?, ?, ?)';

  let detailsStr = details;
  try {
    if (typeof details === 'object') {
      detailsStr = JSON.stringify(details);
    }
  } catch (e) {
    detailsStr = String(details);
  }

  global.connection.query(query, [type, action, detailsStr, status], (err) => {
    if (err) {
      console.error('Failed to write to system_logs', err);
      writeFallbackLog({
        ...payload,
        db_error: err && err.message ? err.message : String(err),
      });
    }
  });
};

module.exports = { logToDb };