## 2025-05-15 - Plaintext Password Storage
**Vulnerability:** User passwords were stored in plaintext in localStorage.
**Learning:** Even in client-side-only "mock" authentication systems, sensitive data like passwords should be treated securely to prevent bad habits and protect users who might reuse passwords.
**Prevention:** Use Web Crypto API (`window.crypto.subtle`) for client-side hashing. Implement salt generation and SHA-256 hashing.
