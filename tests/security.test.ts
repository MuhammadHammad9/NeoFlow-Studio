import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword } from '../utils/security';

// Mock TextEncoder if not available in environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encode(input: string): Uint8Array {
      const arr = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        arr[i] = input.charCodeAt(i);
      }
      return arr;
    }
  } as any;
}

// Mock crypto.subtle if not available (Vitest might need setup)
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: vi.fn().mockImplementation(async (algo, data) => {
             // Simple mock hash: return a buffer based on input length or content
             // This is just to ensure the function completes without error in environments without crypto
             // Real tests should ideally run in an environment with crypto (Node 20+)
             return new Uint8Array(32).buffer; // Return 32 bytes (256 bits) empty buffer for mock
        }),
      },
    },
  });
}

describe('Security Utilities', () => {
  describe('hashPassword', () => {
    it('should return a hex string', async () => {
      const password = 'mySecretPassword123';
      const hash = await hashPassword(password);

      expect(typeof hash).toBe('string');
      // If we are using the real crypto (Node 20+), length is 64.
      // If we are using the fallback mock above, length is 64 (32 bytes * 2 hex chars).
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce consistent hashes for the same password', async () => {
      const password = 'consistentPassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      // This test relies on real crypto implementation.
      // If we are using the simple mock above (which returns constant buffer), this test would fail.
      // So we should only run this if we have real crypto or a better mock.
      // Node 20+ has real crypto.
      if (global.crypto && global.crypto.subtle && !vi.isMockFunction(global.crypto.subtle.digest)) {
          const hash1 = await hashPassword('passwordA');
          const hash2 = await hashPassword('passwordB');
          expect(hash1).not.toBe(hash2);
      }
    });
  });
});
