const sysLogger = require("../sysLogger");
const { redact } = require("../server/redact");

// La traccia di controllo del pannello.
//
// Le richieste a `/admin` sono tenute fuori dal registro delle API (vedi
// `server/requestLog.js`), perche' un pannello che si aggiorna da se'
// riempirebbe la tabella che sta mostrando. Il rovescio e' che **questa e'
// l'unica traccia che resta** di cio' che l'amministratore ha fatto: se non
// viene scritta qui, non viene scritta da nessuna parte.
//
// Due tipi, cosi' il visore li separa a colpo d'occhio:
//
//   ADMIN_AUTH    - accessi riusciti e respinti, uscite, sessioni rifiutate
//   ADMIN_ACTION  - cio' che l'amministratore ha fatto una volta entrato
//
// `redact` e' lo stesso dell'API: i dettagli passano da la' prima di toccare
// il database, cosi' una password o un token finiti per sbaglio in un corpo
// non si depositano nel registro.
const TIPO_ACCESSO = "ADMIN_AUTH";
const TIPO_AZIONE = "ADMIN_ACTION";

const origine = (req) => {
  if (!req) return {};
  return {
    ip: req.ip || (req.socket && req.socket.remoteAddress) || null,
    user_agent: req.headers ? req.headers["user-agent"] || null : null,
  };
};

const registraAccesso = (azione, req, dettagli = {}, stato = "INFO") => {
  sysLogger.logToDb(
    TIPO_ACCESSO,
    azione,
    redact({ ...origine(req), ...dettagli }),
    stato
  );
};

const registraAzione = (azione, req, dettagli = {}, stato = "INFO", durataMs = null) => {
  sysLogger.logToDb(
    TIPO_AZIONE,
    azione,
    redact({
      ...origine(req),
      amministratore: req && req.amministratore ? req.amministratore.utente : null,
      ...dettagli,
    }),
    stato,
    durataMs
  );
};

module.exports = { registraAccesso, registraAzione, TIPO_ACCESSO, TIPO_AZIONE };
