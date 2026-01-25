## 2024-05-23 - Client-Side Crypto Polyfill in JSDOM
**Vulnerability:** Weakness in test environment configuration where `window.crypto` was not fully supported, potentially leading to untested security paths or false confidence.
**Learning:** `jsdom` (even recent versions) may not fully implement the Web Crypto API (`window.crypto.subtle`). When testing client-side cryptographic functions (hashing, signing) in a Node-based test runner (Vitest/Jest), explicit polyfilling using `node:crypto` is required.
**Prevention:** Always verify `window.crypto.subtle` availability in test setup files (`tests/setup.ts`) and polyfill with:
```typescript
import { webcrypto } from 'node:crypto';
Object.defineProperty(global, 'crypto', { value: webcrypto, writable: true });
Object.defineProperty(window, 'crypto', { value: webcrypto, writable: true });
```
