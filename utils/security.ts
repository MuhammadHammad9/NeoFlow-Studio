
/**
 * Security utilities for NeoFlow Studio
 */

/**
 * Hashes a password using SHA-256 with a static salt.
 *
 * Note: In a real backend environment, we would use a unique random salt per user
 * and a slower algorithm like bcrypt or Argon2. Since this is a client-side only
 * application using localStorage, we use Web Crypto API with a static salt to
 * prevent plaintext storage.
 *
 * @param password The plaintext password to hash
 * @returns The hex string representation of the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = 'neoflow-secure-salt-v1';
  const msgBuffer = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
