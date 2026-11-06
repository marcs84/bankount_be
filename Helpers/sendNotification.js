const admin = require('./firebase');
const dao = require('../src/dao');
const sysLogger = require('../src/sysLogger');

async function sendNotification(deviceToken, { notificationTitle, notificationBody }, userId = null) {
  
  if (!deviceToken) {
    // Chi chiama controlla già il token, quindi arrivare qui vuol dire che una
    // riga di dispositivo e' incoerente: va detto, non ingoiato.
    sysLogger.logToDb(
      "SYSTEM_ERROR",
      "notification.failed",
      { userId, notificationTitle, errorCode: 'NO_DEVICE_TOKEN' },
      "ERROR"
    );
    return { success: false, tokenInvalid: false, error: 'Device token is null' };
  }

  // Usa DATA-ONLY: sposta title/body in data e aggiungi configurazioni per bg
  const message = {
    data: {
      id: String(Date.now()),        // usa un id univoco (o un requestId se ne hai uno)
      title: notificationTitle,
      body: notificationBody,
      type: 'generic'                // opzionale: tipo notifica
    },
    token: deviceToken,
    android: {
      priority: 'high',              // consegna rapida su Android
    },
    apns: {
      headers: {
        'apns-priority': '5',        // background su iOS
      },
      payload: {
        aps: {
          'content-available': 1     // consegna al bg handler iOS
        }
      }
    }
  };

  try {
    await admin.messaging().send(message);
    sysLogger.logToDb(
      "SYSTEM_EVENT",
      "notification.sent",
      {
        deviceToken,
        userId,
        notificationTitle,
        notificationBody,
      },
      "INFO"
    );
    return { success: true };
  } catch (error) {
      // Gestione specifica per token non validi
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        
        let tokenRimosso = false;
        try {
          if (userId) {
            await dao.removeInvalidDeviceToken(userId);
          } else {
            await dao.removeDeviceTokenByToken(deviceToken);
          }
          tokenRimosso = true;
        } catch (dbError) {
          sysLogger.logToDb(
            "SYSTEM_ERROR",
            "notification.removeInvalidDeviceToken.failed",
            {
              userId,
              deviceToken,
              error: dbError && dbError.message ? dbError.message : String(dbError),
            },
            "ERROR"
          );
        }
        
        // Il token non e' piu' valido: app disinstallata o reinstallata. E'
        // un evento atteso, ma **cancella un dato**, e finora non lasciava
        // traccia: in una sola chiamata dodici righe di dispositivo sono state
        // svuotate senza che nulla lo dicesse.
        sysLogger.logToDb(
          "SYSTEM_EVENT",
          "notification.tokenRemoved",
          {
            deviceToken,
            userId,
            notificationTitle,
            errorCode: error.code,
            tokenRimosso,
          },
          "WARN"
        );

        return { success: false, tokenInvalid: true };
      }

      // Qualunque altro motivo: quota, messaggio malformato, credenziali
      // scadute. Il codice d'errore e' l'unica cosa che distingue un guasto
      // del singolo token da una configurazione rotta per tutti, e senza
      // questa voce la differenza non si vedeva da nessuna parte.
      sysLogger.logToDb(
        "SYSTEM_ERROR",
        "notification.failed",
        {
          deviceToken,
          userId,
          notificationTitle,
          errorCode: error.code || null,
          error: error.message,
        },
        "ERROR"
      );

      return { success: false, tokenInvalid: false, error: error.message };
  }
}

module.exports = {
  sendNotification,
};
