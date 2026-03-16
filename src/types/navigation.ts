export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  BeautyTab: undefined;
  AppointmentTab: undefined;
  CommunityTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Search: undefined;
  ProductDetail: { productId: string };
  TutorialDetail: { tutorialId: string };
};

export type BeautyStackParamList = {
  BeautyHub: undefined;
  TutorialDetail: { tutorialId: string };
  MakeupGuide: undefined;
  MakeupLook: { lookId: string };
  Skincare: undefined;
  SkincareRoutine: { routineId?: string };
  Hairstyle: undefined;
  HairstyleDetail: { hairstyleId: string };
  Products: { category?: string };
  ProductDetail: { productId: string };
  StyleQuiz: undefined;
  QuizResult: { resultId: string };
  VirtualTryOn: undefined;
  BeautyDiary: undefined;
  DiaryEntry: { entryId?: string };
};

export type AppointmentStackParamList = {
  Appointments: undefined;
  BookAppointment: undefined;
  AppointmentDetail: { appointmentId: string };
  SelectSalon: undefined;
  SelectService: { salonId: string };
  ConfirmBooking: { salonId: string; serviceId: string; date: string; time: string };
};

export type CommunityStackParamList = {
  Community: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  UserProfile: { userId: string };
  Hashtag: { tag: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Favorites: undefined;
  MyAppointments: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};