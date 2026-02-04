
import { describe, it, expect } from 'vitest';
import { hashPassword } from '../utils/security';

describe('Security Utils', () => {
  describe('hashPassword', () => {
    it('should generate a consistent hash for the same password', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password123');
      const hash2 = await hashPassword('password124');

      expect(hash1).not.toBe(hash2);
    });

    it('should return a hex string', async () => {
      const hash = await hashPassword('test');
      // SHA-256 hex string is 64 characters long
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle empty string', async () => {
        const hash = await hashPassword('');
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
