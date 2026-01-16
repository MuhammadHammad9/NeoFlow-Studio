import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashPassword, generateSalt } from '../utils/security';

describe('Security Utils', () => {
  beforeEach(() => {
    // Mock crypto global
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          digest: async (algo: string, data: Uint8Array) => {
            // Simple Mock hash: just return data (in real life this is complex)
            // But for testing the flow, we just need deterministic output.
            // Let's implement a dummy SHA-256 for testing purposes or rely on node's crypto if available.

            // Actually, in JSDOM or Node environment, crypto might be partially available.
            // Node 16+ has web crypto API global.
            // If it fails, we might need to mock it properly.

            // Let's try to see if we can use node's crypto.
            // const crypto = require('crypto');
            // return crypto.webcrypto.subtle.digest(algo, data);

            // For now, let's mock the return value to be predictable based on input length
            return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]).buffer;
          }
        },
        getRandomValues: (buffer: Uint8Array) => {
          for (let i = 0; i < buffer.length; i++) {
            buffer[i] = i % 255;
          }
          return buffer;
        }
      },
      writable: true
    });
  });

  // NOTE: In a real environment with full crypto support (like modern Node or Browser),
  // we would test the actual hashing. Here we are testing the wrapper logic and flow.
  // The actual crypto implementation is platform dependent.

  it('generateSalt returns a string of correct length', () => {
    // We mocked getRandomValues to be deterministic
    const salt = generateSalt();
    expect(salt).toBeDefined();
    // 16 bytes = 32 hex chars
    expect(salt.length).toBe(32);
    // Check first byte: 0 -> "00"
    expect(salt.substring(0, 2)).toBe("00");
  });

  it('hashPassword returns a string', async () => {
    const password = "password123";
    const salt = "somesalt";
    const hash = await hashPassword(password, salt);

    expect(hash).toBeDefined();
    // We mocked digest to return 16 bytes
    expect(hash.length).toBe(32);
  });
});
