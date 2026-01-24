## 2025-02-17 - Secure Password Storage & Test Polyfills
**Vulnerability:** Passwords were stored in plaintext in `localStorage`.
**Learning:** JSDOM environment used by Vitest requires manual polyfilling of `window.crypto` using `node:crypto` to support `subtle` crypto API for hashing. Also, existing users with plaintext passwords can be migrated seamlessly using an opportunistic upgrade strategy during login.
**Prevention:** Use the `utils/security.ts` helpers for all password handling. Always ensure `tests/setup.ts` polyfills `crypto`.
