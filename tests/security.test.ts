import { describe, it, expect } from 'vitest';
import { hashPassword, generateSalt, verifyPassword } from '../utils/security';

describe('Security Utils', () => {
  it('should generate a unique salt', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).toBeDefined();
    expect(salt2).toBeDefined();
    expect(salt1).not.toBe(salt2);
  });

  it('should hash a password correctly', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce different hashes for different salts', async () => {
    const password = 'password123';
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    const hash1 = await hashPassword(password, salt1);
    const hash2 = await hashPassword(password, salt2);

    expect(hash1).not.toBe(hash2);
  });

  it('should verify a correct password', async () => {
    const password = 'correctPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const isValid = await verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'correctPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const isValid = await verifyPassword('wrongPassword', hash, salt);
    expect(isValid).toBe(false);
  });
});
