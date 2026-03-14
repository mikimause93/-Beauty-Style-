export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  hairType?: 'straight' | 'wavy' | 'curly' | 'coily';
  beautyProfile?: BeautyProfile;
  createdAt: string;
}

export interface BeautyProfile {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  stylePreferences: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'makeup' | 'skincare' | 'hairstyle' | 'nails';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  thumbnail: string;
  steps: TutorialStep[];
  tags: string[];
  likes: number;
  author: string;
}

export interface TutorialStep {
  id: string;
  order: number;
  title: string;
  description: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  tags: string[];
  ingredients?: string[];
  suitableFor?: string[];
}

export interface Appointment {
  id: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  notes?: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
  services: Service[];
  openHours: string;
  phone: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  isLiked?: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  mood: 'great' | 'good' | 'neutral' | 'bad';
  skinCondition: string;
  routineCompleted: boolean;
  notes: string;
  products: string[];
  photos: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
  image?: string;
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  recommendations: string[];
  products: Product[];
}