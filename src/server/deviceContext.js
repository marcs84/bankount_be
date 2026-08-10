const dao = require("../dao");
const sysLogger = require("../sysLogger");

// Il token dice quale dispositivo sta chiamando. Ogni endpoint che agisce su
// oggetti di un utente parte da qui, non dall'identificatore inviato nella
// richiesta: quello lo sceglie il chiamante e non prova nulla.
const resolveDevice = async (req, res, next) => {
  try {
    const devices = await dao.verifyDeviceDetails(req.user.identifier);
    req.device = devices[0];
    return next();
  } catch (error) {
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "deviceContext.resolveDevice.failed",
      {
        path: req.path,
        error: error && error.message ? error.message : String(error),
      },
      "WARN"
    );
    return res.sendStatus(401);
  }
};

// Un oggetto che non appartiene al chiamante viene trattato come inesistente:
// distinguere "non tuo" da "non c'e'" direbbe a chi sonda quali identificativi
// sono validi.
const notFound = (res, message) =>
  res.status(404).json({
    result: false,
    message,
  });

module.exports = { resolveDevice, notFound };
