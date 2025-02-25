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


module.exports = { sendNotification };
