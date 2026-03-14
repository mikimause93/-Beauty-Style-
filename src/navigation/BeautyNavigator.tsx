import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BeautyHubScreen } from '../screens/BeautyTips/BeautyHubScreen';
import { TutorialDetailScreen } from '../screens/BeautyTips/TutorialDetailScreen';
import { MakeupGuideScreen } from '../screens/Makeup/MakeupGuideScreen';
import { MakeupLookScreen } from '../screens/Makeup/MakeupLookScreen';
import { SkincareScreen } from '../screens/Skincare/SkincareScreen';
import { SkincareRoutineScreen } from '../screens/Skincare/SkincareRoutineScreen';
import { HairstyleScreen } from '../screens/Hairstyle/HairstyleScreen';
import { HairstyleDetailScreen } from '../screens/Hairstyle/HairstyleDetailScreen';
import { ProductsScreen } from '../screens/Products/ProductsScreen';
import { ProductDetailScreen } from '../screens/Products/ProductDetailScreen';
import { StyleQuizScreen } from '../screens/StyleQuiz/StyleQuizScreen';
import { QuizResultScreen } from '../screens/StyleQuiz/QuizResultScreen';
import { VirtualTryOnScreen } from '../screens/VirtualTryOn/VirtualTryOnScreen';
import { BeautyDiaryScreen } from '../screens/BeautyDiary/BeautyDiaryScreen';
import { DiaryEntryScreen } from '../screens/BeautyDiary/DiaryEntryScreen';
import { BeautyStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<BeautyStackParamList>();

export function BeautyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BeautyHub" component={BeautyHubScreen} />
      <Stack.Screen name="TutorialDetail" component={TutorialDetailScreen} />
      <Stack.Screen name="MakeupGuide" component={MakeupGuideScreen} />
      <Stack.Screen name="MakeupLook" component={MakeupLookScreen} />
      <Stack.Screen name="Skincare" component={SkincareScreen} />
      <Stack.Screen name="SkincareRoutine" component={SkincareRoutineScreen} />
      <Stack.Screen name="Hairstyle" component={HairstyleScreen} />
      <Stack.Screen name="HairstyleDetail" component={HairstyleDetailScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="StyleQuiz" component={StyleQuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="BeautyDiary" component={BeautyDiaryScreen} />
      <Stack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
    </Stack.Navigator>
  );
}