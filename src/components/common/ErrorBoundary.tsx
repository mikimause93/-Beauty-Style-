import { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches any unhandled JavaScript error in the tree and renders a branded
 * recovery screen instead of a black/white blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    if (info?.componentStack) {
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>💄</Text>
          <Text style={styles.title}>Beauty &amp; Style</Text>
          <Text style={styles.subtitle}>Something went wrong</Text>
          <Text style={styles.detail} numberOfLines={3}>
            {this.state.message}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, message: '' })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  detail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  buttonText: { color: '#E91E8C', fontWeight: '700', fontSize: 16 },
});
