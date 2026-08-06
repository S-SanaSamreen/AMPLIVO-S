# API Documentation

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
The AMPLIVO backend provides a robust, strictly typed REST API utilizing FastAPI. The API relies on JSON Web Tokens (JWT) for stateless authentication and employs standardized JSON responses for both successes and errors.

## OpenAPI Specification
The complete OpenAPI 3.1.0 specification has been successfully exported directly from the application's runtime.

- **Location:** `docs/API/openapi.json`
- **Interactive UI (Local):** `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc` (ReDoc)

## Key Endpoints

### 1. Authentication (`/api/v1/auth`)
- `POST /register`: Registers a new user. Rate-limited to 3/min.
- `POST /login`: Authenticates a user and returns an access/refresh token pair. Rate-limited to 5/min.
- `POST /refresh`: Generates a new access token using a valid refresh token.
- `GET /me`: Retrieves the profile of the currently authenticated user.

### 2. Monitoring (`/`)
- `GET /health`: Returns basic Liveness probe.
- `GET /health/ready`: Returns Readiness probe including Database connectivity status.
- `GET /metrics`: Internal metrics including CPU and memory usage (Requires `ADMIN` role).

## Swagger UI Accessibility
- The Swagger UI interface is served securely via FastAPI.
- **CSP Compliance:** The application's `SecurityHeadersMiddleware` allows `unsafe-inline` strictly for the `/docs` and `/redoc` paths so the interactive UI can render properly while protecting all other application routes from XSS.
- **Security:** Access to sensitive endpoints within Swagger requires authorizing via the "Authorize" button using a valid Bearer token.

## Implementation Standard
All API endpoints rely on Pydantic `BaseModel` for validation, ensuring that poorly formatted requests are automatically rejected with a standard `422 Unprocessable Entity` response, minimizing manual validation logic in the controllers.
