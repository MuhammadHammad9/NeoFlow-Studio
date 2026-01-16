/**
 * Security utility functions for NeoFlow Studio
 * Uses Web Crypto API for client-side hashing
 */

/**
 * Hashes a password using SHA-256 with a salt.
 * @param password The plain text password
 * @param salt The salt string
 * @returns The hexadecimal string of the hash
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random salt.
 * @returns A 32-character hexadecimal string
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
