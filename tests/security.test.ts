import { describe, it, expect } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from '../utils/security';

describe('Security Utilities', () => {
  it('should generate a random salt', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBe(32); // 16 bytes * 2 chars/byte
  });

  it('should hash a password consistently with the same salt', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash1 = await hashPassword(password, salt);
    const hash2 = await hashPassword(password, salt);
    expect(hash1).toBe(hash2);
  });

  it('should verify a correct password', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const isValid = await verifyPassword(password, salt, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const isValid = await verifyPassword('wrongPassword', salt, hash);
    expect(isValid).toBe(false);
  });
});
