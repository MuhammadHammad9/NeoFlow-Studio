import { describe, it, expect } from 'vitest';

describe('Crypto Environment', () => {
  it('should have crypto.subtle', () => {
    expect(window.crypto).toBeDefined();
    expect(window.crypto.subtle).toBeDefined();
  });
});
