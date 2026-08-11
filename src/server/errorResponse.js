const sysLogger = require("../sysLogger");

// I controller costruiscono le risposte di errore concatenando il messaggio
// dell'eccezione: nomi di tabella, frammenti di query e percorsi finivano cosi'
// al chiamante. Il dettaglio serve a chi gestisce il server, non a chi lo
// interroga: viene registrato e sostituito con una risposta neutra.
const MESSAGGIO_NEUTRO = "Internal server error";

const hideInternalErrors = (req, res, next) => {
  const inviaJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 500 || !body || typeof body !== "object") {
      return inviaJson(body);
    }

    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "response.internalDetailWithheld",
      {
        path: req.originalUrl || req.path,
        method: req.method,
        status: res.statusCode,
        message: body.message ?? null,
        error: body.error ?? null,
        code_route: body.code_route ?? null,
      },
      "ERROR"
    );

    return inviaJson({ result: false, message: MESSAGGIO_NEUTRO });
  };

  next();
};

module.exports = { hideInternalErrors, MESSAGGIO_NEUTRO };
