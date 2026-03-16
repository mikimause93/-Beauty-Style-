import { validateEmail } from '../utils/helpers';

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  it('accepts a standard email address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with a subdomain', () => {
    expect(validateEmail('hello@mail.example.org')).toBe(true);
  });

  it('accepts an email with leading/trailing whitespace (trimmed internally)', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects a string with no @ symbol', () => {
    expect(validateEmail('notanemail')).toBe(false);
  });

  it('rejects a string with @ but no domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects a string with @ but no TLD', () => {
    expect(validateEmail('user@domain')).toBe(false);
  });

  it('rejects a string with spaces inside', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });
});
