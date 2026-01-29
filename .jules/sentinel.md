# Sentinel's Security Journal

## 2025-02-15 - Plaintext Password Storage in LocalStorage
**Vulnerability:** User passwords were stored in plaintext in `localStorage`.
**Learning:** Client-side only apps often neglect secure storage because "it's just local", but XSS can easily steal these credentials.
**Prevention:** Always hash passwords before storage, even in local-only apps. Implemented migration pattern to upgrade legacy plaintext passwords on next login.
