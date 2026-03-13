const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // For development / testing, use application default credentials
    admin.initializeApp();
  }

  initialized = true;
}

/**
 * Send a data-only push notification (works for both FCM and background pushes).
 * @param {string} token - FCM device token
 * @param {object} data  - Key/value data payload (must be string values)
 * @param {string} [title] - Optional notification title
 * @param {string} [body]  - Optional notification body
 */
async function sendPush(token, data, title, body) {
  try {
    initFirebase();

    const message = {
      token,
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    // Add foreground notification if title/body provided
    if (title || body) {
      message.notification = { title: title || '', body: body || '' };
      message.apns = {
        payload: { aps: { sound: 'default', badge: 1 } },
      };
      message.android = {
        notification: { sound: 'default', priority: 'high' },
      };
    }

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (err) {
    console.error('FCM send error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send to multiple tokens (multicast).
 */
async function sendMulticast(tokens, data, title, body) {
  try {
    initFirebase();

    const message = {
      tokens,
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    if (title || body) {
      message.notification = { title: title || '', body: body || '' };
    }

    const response = await admin.messaging().sendEachForMulticast(message);
    return response;
  } catch (err) {
    console.error('FCM multicast error:', err.message);
    throw err;
  }
}

module.exports = { sendPush, sendMulticast };
