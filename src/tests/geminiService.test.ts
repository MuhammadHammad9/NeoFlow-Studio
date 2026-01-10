import { describe, it, expect } from 'vitest';
import { getFriendlyErrorMessage } from '../services/geminiService';

describe('Gemini Service Utilities', () => {
  it('returns appropriate error message for 400', () => {
    const error = new Error('400 Bad Request');
    expect(getFriendlyErrorMessage(error)).toContain('invalid or unsupported');
  });

  it('returns appropriate error message for 401/403', () => {
    const error = new Error('401 Unauthorized');
    expect(getFriendlyErrorMessage(error)).toContain('Authentication failed');
  });

  it('returns appropriate error message for network issues', () => {
    const error = new Error('failed to fetch');
    expect(getFriendlyErrorMessage(error)).toContain('Network connection issue');
  });

  it('returns default message for unknown errors', () => {
    const error = new Error('Something random');
    expect(getFriendlyErrorMessage(error)).toContain('unexpected error');
  });
});
