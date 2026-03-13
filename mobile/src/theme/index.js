// Beauty & Style App — Color Theme
// Primary: Violet #667eea

const Colors = {
  // Primary palette
  primary: '#667eea',
  primaryDark: '#5a6fd6',
  primaryLight: '#8fa4ef',
  primaryGradientStart: '#667eea',
  primaryGradientEnd: '#764ba2',

  // Secondary palette
  secondary: '#f093fb',
  secondaryDark: '#e070e8',
  secondaryLight: '#f5b8fc',

  // Neutrals
  background: '#f8f9ff',
  surface: '#ffffff',
  surfaceElevated: '#f0f2ff',
  border: '#e2e8f0',
  divider: '#edf2f7',

  // Text
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textDisabled: '#a0aec0',
  textOnPrimary: '#ffffff',

  // Status
  success: '#48bb78',
  successLight: '#c6f6d5',
  error: '#fc8181',
  errorLight: '#fff5f5',
  warning: '#f6ad55',
  warningLight: '#fffaf0',
  info: '#63b3ed',
  infoLight: '#ebf8ff',

  // Interaction
  like: '#fc8181',
  applause: '#f6ad55',
  bookmark: '#667eea',

  // Gradients (use as array for LinearGradient)
  gradientPrimary: ['#667eea', '#764ba2'],
  gradientSunset: ['#f093fb', '#f5576c'],
  gradientOcean: ['#4facfe', '#00f2fe'],

  // Dark theme overrides
  dark: {
    background: '#0d0d1a',
    surface: '#1a1a2e',
    surfaceElevated: '#16213e',
    textPrimary: '#f7fafc',
    textSecondary: '#e2e8f0',
    border: '#2d3748',
  },
};

const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const FontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

const Shadows = {
  sm: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows };
