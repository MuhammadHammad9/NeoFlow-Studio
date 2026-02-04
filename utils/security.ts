
/**
 * Hashes a password using SHA-256 with a static salt.
 * This is used to avoid storing plaintext passwords in localStorage.
 *
 * @param password The plaintext password to hash
 * @returns The hex string representation of the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // using a static salt since we are in a client-side only environment without a backend DB to manage per-user salts easily
  const salt = 'neoflow-secure-salt-v1';
  const data = encoder.encode(password + salt);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
