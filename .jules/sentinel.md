## 2025-05-15 - Plaintext Password Storage in LocalStorage

**Vulnerability:** User passwords were stored in plaintext within the `neoflow_users` localStorage key.
**Learning:** The application mimics a backend using client-side storage for a demo experience, which led to skipping standard backend security practices like hashing.
**Prevention:** Even in mock/demo environments or client-side apps, sensitive data like passwords should always be hashed (salted) to prevent easy extraction if the client machine is compromised or via XSS. Used Web Crypto API for a lightweight, dependency-free solution.
