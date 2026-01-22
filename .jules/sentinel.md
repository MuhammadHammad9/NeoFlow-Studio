## 2026-01-22 - Plaintext Passwords in LocalStorage
**Vulnerability:** User passwords were stored in `localStorage` in plaintext within the `neoflow_users` key.
**Learning:** The application uses `localStorage` as a mock database. Mock implementations often skip security controls, but this leaves credentials exposed even in prototypes.
**Prevention:** Even for client-side demos, use the Web Crypto API to hash passwords (SHA-256 + Salt) before storage.
