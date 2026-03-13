import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { Colors } from '../theme';

// Screens
import AILookScreen from '../screens/AILookScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import CommentThreadScreen from '../screens/CommentThreadScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Deep link configuration
const linking = {
  prefixes: [Linking.createURL('/'), 'beautyapp://'],
  config: {
    screens: {
      Main: {
        screens: {
          AILook: 'ai-look',
          Search: 'search',
        },
      },
      AILookResult: 'ai-look/result/:id',
      BookingDetail: 'booking/:bookingId',
      Chat: 'chat/:conversationId',
      PostDetail: 'post/:postId',
      Profile: 'profile/:userId',
    },
  },
};

// Custom navigation theme using primary violet
const BeautyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="AILook"
        component={AILookScreen}
        options={{ title: 'AI Look', tabBarLabel: 'AI Look', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search', tabBarLabel: 'Search', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking} theme={BeautyTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen
          name="CommentThread"
          component={CommentThreadScreen}
          options={{ title: 'Comments' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
