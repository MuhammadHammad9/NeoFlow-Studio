import { describe, it, expect, beforeAll } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from '../utils/security';

describe('Security Utils', () => {
  beforeAll(async () => {
    // Polyfill Web Crypto API for JSDOM environment
    // JSDOM supports getRandomValues but not subtle crypto
    if (!globalThis.crypto.subtle) {
      const { webcrypto } = await import('node:crypto');
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto as unknown as Crypto
      });
    }
  });

  it('generateSalt creates a random string', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBeGreaterThan(0);
  });

  it('hashPassword creates consistent hashes', async () => {
    const password = 'password123';
    const salt = generateSalt();
    const hash1 = await hashPassword(password, salt);
    const hash2 = await hashPassword(password, salt);
    expect(hash1).toBe(hash2);
  });

  it('hashPassword creates different hashes for different salts', async () => {
    const password = 'password123';
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const hash1 = await hashPassword(password, salt1);
    const hash2 = await hashPassword(password, salt2);
    expect(hash1).not.toBe(hash2);
  });

  it('verifyPassword validates correct password', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const isValid = await verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);
  });

  it('verifyPassword rejects incorrect password', async () => {
    const password = 'mySecretPassword';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const isValid = await verifyPassword('wrongPassword', hash, salt);
    expect(isValid).toBe(false);
  });
});
