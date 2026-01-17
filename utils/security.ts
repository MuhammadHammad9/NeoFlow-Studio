/**
 * Security utilities for cryptographic operations
 */

/**
 * Generates a random salt for password hashing
 * @returns A hex string representation of the salt
 */
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Hashes a password using SHA-256 with the provided salt
 * @param password The plaintext password
 * @param salt The salt in hex format
 * @returns A promise that resolves to the hex string of the hash
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifies a password against a stored hash and salt
 * @param password The plaintext password to verify
 * @param salt The stored salt
 * @param hash The stored hash
 * @returns A promise that resolves to true if the password matches
 */
export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
};
