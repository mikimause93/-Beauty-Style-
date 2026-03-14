import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { PostDetailScreen } from '../screens/Community/PostDetailScreen';
import { CreatePostScreen } from '../screens/Community/CreatePostScreen';
import { UserProfileScreen } from '../screens/Community/UserProfileScreen';
import { HashtagScreen } from '../screens/Community/HashtagScreen';
import { CommunityStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export function CommunityNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Hashtag" component={HashtagScreen} />
    </Stack.Navigator>
  );
}