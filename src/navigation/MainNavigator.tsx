import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeNavigator } from './HomeNavigator';
import { BeautyNavigator } from './BeautyNavigator';
import { AppointmentNavigator } from './AppointmentNavigator';
import { CommunityNavigator } from './CommunityNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { COLORS } from '../utils/constants';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BeautyTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'AppointmentTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'CommunityTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="BeautyTab" component={BeautyNavigator} options={{ title: 'Beauty' }} />
      <Tab.Screen name="AppointmentTab" component={AppointmentNavigator} options={{ title: 'Book' }} />
      <Tab.Screen name="CommunityTab" component={CommunityNavigator} options={{ title: 'Community' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
