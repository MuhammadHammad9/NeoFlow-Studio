## 2025-02-19 - [CRITICAL] Plaintext Password Storage in LocalStorage
**Vulnerability:** User passwords were stored in plaintext in `localStorage` ('neoflow_users' key), making them accessible to any script running on the page (XSS risk) and physical access.
**Learning:** Even in "mock" or client-side-only applications, sensitive data like passwords must never be stored in plaintext. LocalStorage is not a secure vault.
**Prevention:** Implemented client-side hashing using Web Crypto API (SHA-256 + Salt) before storage. Added transparent migration for legacy plaintext passwords upon next login.
