## 2025-02-17 - Plaintext Password Storage in LocalStorage
**Vulnerability:** User passwords were stored in `localStorage` as plaintext strings.
**Learning:** Client-side only applications often neglect secure storage practices for credentials, relying on the assumption that "it's only local". However, XSS vulnerabilities can easily exfiltrate these plaintext credentials.
**Prevention:** Always hash passwords before storing them, even in client-side storage (using Web Crypto API). Implemented auto-migration for legacy plaintext passwords to SHA-256 hashes.
