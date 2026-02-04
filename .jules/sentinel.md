## 2026-02-04 - [Plaintext Password Storage in LocalStorage]
**Vulnerability:** User passwords were stored in plaintext in `localStorage` under the `neoflow_users` key.
**Learning:** Client-side only apps often neglect password hashing because they lack a backend, but `localStorage` is accessible to XSS attacks.
**Prevention:** Use Web Crypto API (`crypto.subtle`) to hash passwords client-side before storage. A "lazy migration" strategy in the login flow allows upgrading legacy plaintext passwords to hashes without forcing a reset.
