## 2026-01-21 - [CRITICAL] Fixed Plaintext Password Storage
**Vulnerability:** Passwords were stored in plaintext in localStorage, allowing any script (XSS) to steal credentials.
**Learning:** Even in "mock" or client-side apps, sensitive data handling should mimic production security standards to prevent bad habits and easy exploitation.
**Prevention:** Always use one-way hashing (SHA-256 + Salt) for passwords, even on the client side if local auth is used.
