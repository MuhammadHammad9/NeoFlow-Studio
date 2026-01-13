# Sentinel's Journal

## 2025-02-14 - Plaintext Password Storage
**Vulnerability:** User passwords were stored in `localStorage` in plaintext.
**Learning:** Even in client-side only applications or demos, storing sensitive data like passwords in plaintext is a critical risk. It sets a bad precedent and exposes users if the environment is compromised (e.g., via XSS).
**Prevention:** Always hash passwords before storage, even in local storage. Use `crypto.subtle` for client-side hashing.
