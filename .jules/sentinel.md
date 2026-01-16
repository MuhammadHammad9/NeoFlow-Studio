## 2024-05-23 - Client-Side Password Hashing
**Vulnerability:** Passwords were stored in plain text in `localStorage`, exposing them to XSS attacks or physical device access.
**Learning:** In a client-side only architecture (no backend), storing credentials securely is challenging. While client-side hashing doesn't prevent all attacks (like rainbow tables if the local storage is dumped), it significantly raises the bar compared to plaintext. We utilized the Web Crypto API for standard compliant SHA-256 hashing.
**Prevention:** Always hash passwords before storage, even in local-only environments. We implemented an automatic upgrade path for legacy plaintext passwords during the login process to ensure backward compatibility.
