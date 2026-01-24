
/**
 * Security utilities for password hashing and verification.
 * Uses Web Crypto API for SHA-256 hashing.
 */

/**
 * Hashes a password using SHA-256 with a salt.
 * @param password The plaintext password
 * @param salt The salt string
 * @returns The hex string of the hash
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random UUID to be used as a salt.
 * @returns A random UUID string
 */
export function generateSalt(): string {
  return crypto.randomUUID();
}

/**
 * Verifies a password against a hash and salt.
 * @param password The plaintext password to verify
 * @param hash The stored hash
 * @param salt The stored salt
 * @returns True if the password matches
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const calculatedHash = await hashPassword(password, salt);
  return calculatedHash === hash;
}
