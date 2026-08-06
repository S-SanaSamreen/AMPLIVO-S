# Test Coverage Report

**Date:** 2026-08-04
**Project:** AMPLIVO

## Target Metric
- **Enterprise Minimum Coverage Target:** 80%

## Current Status

### Backend Coverage
- **Current Coverage:** >80% (Verified)
- **Tool:** `pytest-cov`
- **Resolution:** The database connection issue was resolved via the direct IPv6 Supabase URI. All 187 backend tests successfully pass, achieving the enterprise minimum coverage target.

### Frontend Coverage
- **Current Coverage:** Partial
- **Tool:** `@vitest/coverage-v8`
- **Reason:** Initial component tests (e.g., `Button`) passed successfully. However, global coverage metrics could not be aggregated because the native Vite configuration failed to parse several complex Next.js files (`login/page.tsx`, `register/page.tsx`).

## Action Items
1. **Fix Frontend Parsing:** Migrate Vitest to use `@vitejs/plugin-react-swc` to fully support Next.js TypeScript syntax during coverage parsing.
2. **Expand Tests:** Expand E2E coverage using Playwright now that the backend environment is fully unblocked.
