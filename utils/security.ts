/**
 * Security utilities for the application.
 */

// A static salt for the application.
// In a production environment with a backend, each user should have a unique random salt stored in the DB.
// Since this is a client-side demo using localStorage, we use a static application salt
// to provide a basic layer of protection against simple rainbow table attacks on the stored JSON.
const APP_SALT = 'neoflow-secure-salt-v1-92834';

/**
 * Hashes a password using SHA-256 with a static salt.
 * @param password The plaintext password
 * @returns The hex string representation of the hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + APP_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
