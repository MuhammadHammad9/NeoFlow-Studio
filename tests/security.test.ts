import { describe, it, expect } from 'vitest';
import { hashPassword } from '../utils/security';

describe('Security Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password consistently', async () => {
      const password = 'mySecretPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(password);
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for different passwords', async () => {
      const pass1 = 'passwordA';
      const pass2 = 'passwordB';

      const hash1 = await hashPassword(pass1);
      const hash2 = await hashPassword(pass2);

      expect(hash1).not.toBe(hash2);
    });

    it('should match the expected hex format (SHA-256)', async () => {
      const password = 'test';
      const hash = await hashPassword(password);
      // SHA-256 produces 32 bytes, so 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
