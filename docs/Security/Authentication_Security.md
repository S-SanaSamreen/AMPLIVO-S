# Authentication Security Report

**Date:** 2026-08-04
**Project:** AMPLIVO

## Authentication Architecture
The AMPLIVO application utilizes stateless JSON Web Tokens (JWT) for authentication. The security lifecycle of user credentials and tokens is detailed below.

## Credential Management
- **Hashing Algorithm:** `bcrypt` (rounds: 12) via `passlib`.
- **Validation:** Pydantic models enforce strict password complexity requirements upon registration and password reset.

## Token Lifecycle
- **Access Tokens:** Short-lived JWTs (default 30 minutes) signed with `HS256`. Sent by the client in the `Authorization: Bearer <token>` header.
- **Refresh Tokens:** Long-lived tokens (default 7 days) stored securely to acquire new access tokens without requiring re-authentication.

## Protection Mechanisms
### 1. Brute-Force & Credential Stuffing
The `RateLimiterMiddleware` enforces a strict fixed-window rate limit:
- **Login:** 5 requests per minute per IP.
- **Registration:** 3 requests per minute per IP.
- **Account Lockout:** Configured to lock accounts for 15 minutes after 5 failed login attempts (`MAX_FAILED_LOGIN_ATTEMPTS`).

### 2. Session Hijacking & CSRF
- **CSRF Mitigation:** Since the application utilizes bearer tokens in headers rather than cookies, it is inherently immune to standard Cross-Site Request Forgery (CSRF).
- For edge cases utilizing cookies, `CSRFMiddleware` enforces a Double-Submit Cookie pattern. Unsafe methods (`POST`, `PUT`, `DELETE`) are rejected if the `X-CSRF-Token` header does not match the `csrf_token` cookie.
- **Token Leakage:** Access tokens are stored in memory or secure context on the frontend, never in `localStorage` if avoidable, to mitigate XSS exfiltration.

### 3. Session Timeout
- **Inactivity:** The system forces re-authentication after an inactivity period defined by `SESSION_INACTIVITY_TIMEOUT_MINUTES` (default 60 minutes).

## Audit & Traceability
- **Audit Logging:** Every authentication attempt (success, failure, password reset) is recorded via `AuditMiddleware`, capturing the IP address, timestamp, and user ID.
- **Device Tracking:** Capable of tracking unique devices and invalidating all active sessions if suspicious activity is detected.

## Conclusion
The authentication flow in AMPLIVO adheres to enterprise standards, balancing user experience with stringent security controls against brute-force, hijacking, and forgery attacks.
