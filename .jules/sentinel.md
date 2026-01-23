## 2024-05-22 - Plaintext Password Storage
**Vulnerability:** Passwords were stored in plaintext in `localStorage`.
**Learning:** Client-side only apps often resort to `localStorage` for persistence, but sensitive data must still be protected. Using Web Crypto API allows for secure hashing even without a backend.
**Prevention:** Always hash passwords before storage, even in prototypes or client-side demos. Use `crypto.subtle` for standards-compliant hashing (SHA-256 or better).
