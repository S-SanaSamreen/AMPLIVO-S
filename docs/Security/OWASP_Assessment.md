# OWASP Top 10 Security Assessment

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
This document outlines how the AMPLIVO application mitigates the OWASP Top 10 web application security risks.

### 1. Broken Access Control
- **Mitigation:** Implemented robust role-based access control (RBAC). All protected endpoints require a valid JWT bearer token. `AuthenticationMiddleware` validates the token on every request.

### 2. Cryptographic Failures
- **Mitigation:**
  - Passwords are hashed using `bcrypt` (work factor 12) via `passlib`.
  - Application strictly requires HTTPS (`DB_SSL_MODE=require` enforced in production).
  - Secure configurations prevent leaking `JWT_SECRET_KEY` in production.

### 3. Injection
- **Mitigation:**
  - **SQL Injection:** The application uses SQLAlchemy Core/ORM with parameterized queries. Raw string concatenation is never used for SQL statements.
  - **Cross-Site Scripting (XSS):** The frontend relies on React/Next.js which automatically escapes output. The backend enforces a strict `Content-Security-Policy` (CSP) blocking inline scripts (`unsafe-inline` is only allowed on the Swagger docs path) and sets `X-XSS-Protection: 0` as per modern OWASP guidelines.

### 4. Insecure Design
- **Mitigation:** The application enforces a strong architectural pattern separating business logic, routing, and database access. Rate limiting and CSRF protection are baked into the middleware stack by default.

### 5. Security Misconfiguration
- **Mitigation:**
  - `SecurityHeadersMiddleware` ensures `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` are always present.
  - Unused features (like legacy PHP/Express headers) are defensively stripped (`x-powered-by`).
  - The application provides a distinct `ENVIRONMENT` variable separating `development` and `production`.

### 6. Vulnerable and Outdated Components
- **Mitigation:** We regularly run `pip-audit` and `npm audit` to detect known vulnerabilities in our dependencies. Continuous Integration fails builds if high-severity vulnerabilities are found.

### 7. Identification and Authentication Failures
- **Mitigation:** 
  - The `RateLimiterMiddleware` specifically enforces strict limits on `/api/v1/auth/login` to mitigate brute-force and credential stuffing attacks.
  - A maximum failed login attempt lockout is supported in the configuration (`ACCOUNT_LOCK_MINUTES`).

### 8. Software and Data Integrity Failures
- **Mitigation:** Dependencies are locked using `requirements.txt` and `package-lock.json`. CI/CD pipelines use these locks to ensure integrity across environments.

### 9. Security Logging and Monitoring Failures
- **Mitigation:** 
  - `AuditMiddleware` logs critical actions to the `audit_logs` table.
  - `RequestIDMiddleware` injects correlation IDs for robust traceability.
  - Unhandled errors trigger alerts in the centralized structured logging system.

### 10. Server-Side Request Forgery (SSRF)
- **Mitigation:** The application does not fetch external resources based on user-supplied URLs. Any external integrations (like Brevo for emails) use strictly configured API clients.

## Conclusion
The AMPLIVO backend architecture fundamentally mitigates the OWASP Top 10 risks through built-in security middlewares, strict type checking, and modern cryptographic standards.
