# Performance Baseline & Optimization Report

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
This document outlines the performance characteristics, baseline expectations, and optimization strategies for the AMPLIVO application.

## Load Testing Strategy (`k6`)
A load testing suite has been implemented using `k6` (`Backend/k6_tests/load_test.js`). 
- **Workload Profile:** Ramp up to 20 concurrent virtual users (VUs), sustain for 1 minute, and ramp down.
- **SLAs (Service Level Agreements):**
  - **P95 Latency:** < 500ms
  - **Error Rate:** < 1%

### Current Execution Status
- **Status:** READY FOR PIPELINE INTEGRATION
- **Resolution:** The backend application's active database connection blocker was resolved by switching to the direct IPv6 Supabase URI. The `k6` load test scripts are committed and ready to be executed against the staging environment without startup failures.

## Optimization Strategies

### 1. Database Tier
- **Connection Pooling:** SQLAlchemy is configured with an `Asyncpg` connection pool. `pool_size` and `max_overflow` should be tuned based on the production replica capacity.
- **Query Optimization:** Missing indexes on high-read columns (like `email`) have been documented in the Database Schema strategy and must be enforced.

### 2. Application Tier (FastAPI)
- **Asynchronous Execution:** All I/O bound endpoints (`/api/v1/auth/*`) leverage Python `async/await` to free the event loop.
- **Rate Limiting:** The `RateLimiterMiddleware` protects against DDoS by shedding excess load early in the request lifecycle.
- **Caching:** For static metadata or repeated reads (e.g., configurations), integrating Redis via `FastAPI-Cache` is highly recommended.

### 3. Frontend Tier (Next.js)
- **Static Generation (SSG):** Marketing pages and non-authenticated routes should use SSG.
- **Bundle Optimization:** `npm audit` findings have highlighted the need to upgrade specific UI libraries, which may reduce overall bundle size. 

## Conclusion
The architectural foundation (FastAPI + Asyncpg) is highly performant. Final baseline metrics will be captured automatically by the CI pipeline once the network egress or local `docker-compose` topology is resolved.
