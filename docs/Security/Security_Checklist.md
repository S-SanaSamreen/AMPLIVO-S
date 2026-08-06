# Enterprise Security Checklist

**Date:** 2026-08-04
**Project:** AMPLIVO

## 1. Network & Transport Security
- [x] HTTPS enforced via `Strict-Transport-Security` (HSTS).
- [x] Database connections enforce SSL (`DB_SSL_MODE=require`).
- [x] CORS tightly scoped to trusted frontend origins via `CORSMiddleware`.

## 2. Authentication & Authorization
- [x] Passwords hashed with `bcrypt` (work factor 12).
- [x] Stateless JWTs used for authentication (`HS256`).
- [x] Refresh token rotation/revocation supported.
- [x] Rate limiting active for login (5/min) and registration (3/min).
- [x] Account lockout implemented (15 mins after 5 failed attempts).

## 3. Data Protection & Validation
- [x] Input validation strictly enforced via Pydantic on all API endpoints.
- [x] SQL Injection prevented via SQLAlchemy parameterized queries.
- [x] Cross-Site Scripting (XSS) mitigated by React output escaping and backend CSP headers.

## 4. Middleware Defenses
- [x] `SecurityHeadersMiddleware`: Sets `X-Frame-Options`, `X-Content-Type-Options`, and `Permissions-Policy`.
- [x] `CSRFMiddleware`: Enforces Double-Submit Cookie pattern for cookie-based interactions.
- [x] `RateLimiterMiddleware`: Protects against volumetric DDoS and brute force.

## 5. Observability & Auditing
- [x] All authentication events (login, logout, refresh, reset) logged to `audit_logs` table.
- [x] `RequestIDMiddleware` injects UUIDs for request correlation.
- [x] Centralized structured JSON logging in production.
- [x] Application secrets separated from code and loaded via environment variables.

## 6. Supply Chain
- [x] Dependencies locked in `requirements.txt` and `package-lock.json`.
- [x] Routine `pip-audit` and `npm audit` scans integrated.
