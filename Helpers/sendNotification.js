const admin = require('./firebase');
const dao = require('../src/dao');
const sysLogger = require('../src/sysLogger');

async function sendNotification(deviceToken, { notificationTitle, notificationBody }, userId = null) {
  
  if (!deviceToken) {
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
        
        try {
          if (userId) {
            await dao.removeInvalidDeviceToken(userId);
          } else {
            await dao.removeDeviceTokenByToken(deviceToken);
          }
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
        
        return { success: false, tokenInvalid: true };
      }
      
      return { success: false, tokenInvalid: false, error: error.message };
  }
}

const sendNotificationToMultipleDevices = async (deviceTokens, { notificationTitle, notificationBody }) => {
  if (!deviceTokens || deviceTokens.length === 0) {
    return [];
  }

  const results = [];
  for (let i = 0; i < deviceTokens.length; i++) {
    const deviceToken = deviceTokens[i];
    const result = await sendNotification(deviceToken, { notificationTitle, notificationBody });
    results.push({ deviceToken, ...result });
  }
  
  const successCount = results.filter(r => r.success).length;
  const invalidTokenCount = results.filter(r => r.tokenInvalid).length;
  const errorCount = results.filter(r => !r.success && !r.tokenInvalid).length;
  
  return results;
};

module.exports = {
  sendNotification,
  sendNotificationToMultipleDevices
};
