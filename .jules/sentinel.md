## 2025-02-18 - Client-Side Password Hashing
**Vulnerability:** User passwords were stored in plaintext in `localStorage`.
**Learning:** Client-side only applications often skip security best practices like password hashing because there is no backend. However, protecting user credentials, even in local storage, is critical to prevent credential theft if the device is compromised or if XSS occurs (though XSS could steal the session anyway, plaintext passwords are worse as users reuse them).
**Prevention:** Always hash passwords before storage, even if local. Use Web Crypto API (`crypto.subtle`) which is available in modern browsers, ensuring salts are used to prevent rainbow table attacks.
