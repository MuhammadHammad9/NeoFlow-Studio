import { describe, it, expect, vi, beforeAll } from 'vitest';
import { generateSalt, hashPassword } from '../utils/security';

describe('Security Utils', () => {
  beforeAll(() => {
    // Mock crypto if not available (though jsdom should have it)
    if (!window.crypto) {
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
          },
          subtle: {
            digest: async (algorithm: string, data: Uint8Array) => {
              // Simple mock hash for testing flow
              return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
            }
          }
        }
      });
    }
  });

  it('should generate a salt of correct length', () => {
    const salt = generateSalt();
    // 16 bytes -> 32 hex chars
    expect(salt).toHaveLength(32);
    expect(salt).toMatch(/^[0-9a-f]+$/);
  });

  it('should generate different salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });

  it('should hash password correctly', async () => {
    // If we are using real crypto (jsdom), this will produce real hash
    // If we are using mock, it will produce mock hash
    const salt = generateSalt();
    const hash = await hashPassword('password123', salt);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce same hash for same input', async () => {
    const salt = 'fixedsalt';
    const hash1 = await hashPassword('password123', salt);
    const hash2 = await hashPassword('password123', salt);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hash for different salt', async () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    // Ensure salts are different
    if (salt1 === salt2) return;

    const hash1 = await hashPassword('password123', salt1);
    const hash2 = await hashPassword('password123', salt2);

    expect(hash1).not.toBe(hash2);
  });
});
