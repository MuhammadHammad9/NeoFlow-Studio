
/**
 * Security utilities for NeoFlow Studio
 * Provides cryptographic functions for password hashing
 */

/**
 * Generates a random salt string
 * @param length Length of the salt in bytes (default 16)
 * @returns Hex string representation of the salt
 */
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes a password with a salt using SHA-256
 * @param password The plaintext password
 * @param salt The salt string
 * @returns Promise resolving to the hex string of the hash
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a password against a stored hash and salt
 * @param password The plaintext password to verify
 * @param storedHash The stored hash to compare against
 * @param salt The stored salt
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}
