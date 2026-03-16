import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { NotificationsScreen } from '../screens/Home/NotificationsScreen';
import { SearchScreen } from '../screens/Home/SearchScreen';
import { ProductDetailScreen } from '../screens/Products/ProductDetailScreen';
import { TutorialDetailScreen } from '../screens/BeautyTips/TutorialDetailScreen';
import { HomeStackParamList } from '../types/navigation';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.primary } }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="TutorialDetail" component={TutorialDetailScreen} />
    </Stack.Navigator>
  );
}