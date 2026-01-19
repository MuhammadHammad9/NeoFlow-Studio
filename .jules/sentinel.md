## 2024-05-24 - Legacy Password Upgrade
**Vulnerability:** Passwords were stored in plaintext in `localStorage`.
**Learning:** When fixing storage vulnerabilities in existing apps, you can't just change the format and break old users. We implemented a "lazy migration" where legacy plaintext passwords are detected on login, verified against the input, and then immediately upgraded to salted hashes.
**Prevention:** Always design storage with encryption/hashing from day one. If not, plan for a migration strategy that upgrades data upon access.
