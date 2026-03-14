import { render } from '@testing-library/react-native';
import { Badge } from '../components/common/Badge';
import { StarRating } from '../components/common/StarRating';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

describe('Badge', () => {
  it('renders label text', () => {
    const { getByText } = render(<Badge label="Beginner" />);
    expect(getByText('Beginner')).toBeTruthy();
  });
});

describe('StarRating', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<StarRating rating={4.5} />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card><Badge label="test" /></Card>);
    expect(getByText('test')).toBeTruthy();
  });
});

describe('Button', () => {
  it('renders title', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });
  it('shows loading indicator when loading', () => {
    const { queryByText } = render(<Button title="Click Me" onPress={() => {}} loading={true} />);
    expect(queryByText('Click Me')).toBeNull();
  });
});
