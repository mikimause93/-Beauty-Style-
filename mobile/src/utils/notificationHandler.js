import { useEffect, useRef } from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/**
 * Sets up foreground notification display behavior.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook to initialize FCM push notification handlers.
 * Handles:
 * - Foreground messages
 * - Background/quit state: getInitialNotification
 * - Deep links from tapped notifications
 * - APNs token registration for iOS
 */
export function useNotifications(navigation) {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    requestPermissions();
    setupFCM(navigation);
    setupExpoNotifications(navigation);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [navigation]);
}

async function requestPermissions() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      console.warn('Push notification permission not granted');
    }
  }

  await Notifications.requestPermissionsAsync();
}

async function setupFCM(navigation) {
  // Get FCM token and register with backend
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    console.log('FCM Token:', fcmToken);
    // TODO: Send token to backend user profile endpoint
    await registerTokenWithBackend(fcmToken);
  }

  // Listen for token refresh
  messaging().onTokenRefresh(async (newToken) => {
    await registerTokenWithBackend(newToken);
  });

  // Handle notification when app is opened from QUIT state
  const initialMessage = await messaging().getInitialNotification();
  if (initialMessage) {
    handleNotificationNavigation(initialMessage.data, navigation);
  }

  // Handle notification when app is in BACKGROUND and user taps it
  messaging().onNotificationOpenedApp((remoteMessage) => {
    handleNotificationNavigation(remoteMessage.data, navigation);
  });

  // Handle foreground messages (data-only push)
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground FCM message:', remoteMessage);
    // Show local notification for foreground messages
    if (remoteMessage.notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data || {},
        },
        trigger: null,
      });
    }
  });

  // Background message handler (registered at module level)
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background FCM message:', remoteMessage);
  });
}

function setupExpoNotifications(navigation) {
  // Handle notification response (user taps notification in tray)
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    handleNotificationNavigation(data, navigation);
  });
}

/**
 * Navigate to the correct screen based on deep link data from notification.
 */
function handleNotificationNavigation(data, navigation) {
  if (!data || !navigation) return;

  const { type, targetId, deepLink } = data;

  // Handle by type
  switch (type) {
    case 'AI_LOOK_READY':
      navigation.navigate('AILook', { resultId: targetId });
      break;
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      navigation.navigate('BookingDetail', { bookingId: targetId });
      break;
    case 'NEW_MESSAGE':
      navigation.navigate('Chat', { conversationId: targetId });
      break;
    case 'NEW_COMMENT':
    case 'NEW_LIKE':
    case 'NEW_APPLAUSE':
      navigation.navigate('PostDetail', { postId: targetId });
      break;
    default:
      // Fallback: try to open deep link if provided
      if (deepLink) {
        Linking.openURL(deepLink).catch(console.warn);
      }
  }
}

async function registerTokenWithBackend(token) {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4001';
    // In production, include auth token in headers
    await fetch(`${API_URL}/api/users/fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken: token }),
    });
  } catch (err) {
    console.warn('Failed to register FCM token:', err.message);
  }
}
