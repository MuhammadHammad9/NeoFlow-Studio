import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, generateSalt } from '../utils/security';

describe('Security Utils', () => {
  it('should generate a salt of correct length', () => {
    const salt = generateSalt();
    expect(salt).toBeDefined();
    // 16 bytes * 2 chars/byte = 32 chars
    expect(salt.length).toBe(32);
  });

  it('should hash a password consistently', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();

    const hash1 = await hashPassword(password, salt);
    const hash2 = await hashPassword(password, salt);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(password);
  });

  it('should produce different hashes for different salts', async () => {
    const password = 'mySecretPassword';
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    const hash1 = await hashPassword(password, salt1);
    const hash2 = await hashPassword(password, salt2);

    expect(hash1).not.toBe(hash2);
  });
});
