import { formatPrice, formatDate, truncateText, generateId, getDifficultyColor, getMoodEmoji, getTimeSlots } from '../utils/helpers';

describe('formatPrice', () => {
  it('formats price with default currency', () => {
    expect(formatPrice(42.99)).toBe('€42.99');
  });
  it('formats price with custom currency', () => {
    expect(formatPrice(10, '$')).toBe('$10.00');
  });
  it('formats zero price', () => {
    expect(formatPrice(0)).toBe('€0.00');
  });
});

describe('truncateText', () => {
  it('returns full text if shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });
  it('truncates text with ellipsis', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
  });
  it('returns text unchanged when equal to maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('getDifficultyColor', () => {
  it('returns green for beginner', () => {
    expect(getDifficultyColor('beginner')).toBe('#4CAF50');
  });
  it('returns orange for intermediate', () => {
    expect(getDifficultyColor('intermediate')).toBe('#FF9800');
  });
  it('returns red for advanced', () => {
    expect(getDifficultyColor('advanced')).toBe('#F44336');
  });
  it('returns gray for unknown', () => {
    expect(getDifficultyColor('unknown')).toBe('#9E9E9E');
  });
});

describe('getMoodEmoji', () => {
  it('returns correct emoji for great mood', () => {
    expect(getMoodEmoji('great')).toBe('😊');
  });
  it('returns correct emoji for bad mood', () => {
    expect(getMoodEmoji('bad')).toBe('😞');
  });
  it('returns neutral emoji for unknown mood', () => {
    expect(getMoodEmoji('unknown')).toBe('😐');
  });
});

describe('getTimeSlots', () => {
  it('returns an array of time slots', () => {
    const slots = getTimeSlots();
    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);
  });
  it('starts at 09:00', () => {
    const slots = getTimeSlots();
    expect(slots[0]).toBe('09:00');
  });
  it('contains half-hour slots', () => {
    const slots = getTimeSlots();
    expect(slots).toContain('09:30');
    expect(slots).toContain('10:00');
  });
});
