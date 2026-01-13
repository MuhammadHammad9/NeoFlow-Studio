/**
 * Security utilities for the application.
 */

/**
 * Generates a random salt string.
 * @returns A hex string representation of the random salt.
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a password combined with a salt using SHA-256.
 * @param password The password to hash.
 * @param salt The salt to combine with the password.
 * @returns The hex string representation of the hash.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
