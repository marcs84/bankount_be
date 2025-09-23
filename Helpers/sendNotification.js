const admin = require('./firebase');

async function sendNotification(deviceToken, { notificationTitle, notificationBody }) {
  const message = {
      notification: {
          title: notificationTitle,
          body: notificationBody,
      },
      token: deviceToken,
  };
  try {
      await admin.messaging().send(message);
      console.log(`Notification sent to ${deviceToken}`);
  } catch (error) {
      console.error('Error sending notification:', error);
  }
}

// Aggiungere una nuova funzione per dispositivi multipli
const sendNotificationToMultipleDevices = async (deviceTokens, { notificationTitle, notificationBody }) => {
  if (!deviceTokens || deviceTokens.length === 0) {
    console.log('No device tokens provided');
    return;
  }

  const promises = deviceTokens.map(deviceToken => 
    sendNotification(deviceToken, { notificationTitle, notificationBody })
  );

  try {
    await Promise.all(promises);
    console.log(`Notifications sent to ${deviceTokens.length} devices`);
  } catch (error) {
    console.error('Error sending notifications to multiple devices:', error);
  }
};

module.exports = {
  sendNotification,
  sendNotificationToMultipleDevices
};
