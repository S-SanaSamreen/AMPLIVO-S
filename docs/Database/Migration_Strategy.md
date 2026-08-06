# Database Migration Strategy

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
Database schemas evolve continuously throughout the application lifecycle. AMPLIVO utilizes **Alembic** as the database migration tool, strictly integrated with SQLAlchemy ORM.

## Workflow
1. **Model Updates:** Developers modify SQLAlchemy declarative models in `app/models/`.
2. **Auto-generation:** A developer generates a new migration script using Alembic's autogenerate feature:
   ```bash
   alembic revision --autogenerate -m "Add new column to users"
   ```
3. **Manual Verification:** Developers MUST inspect the generated script in `alembic/versions/` to ensure no destructive operations (like dropping a table unintentionally) were inferred.
4. **Application:** Migrations are applied sequentially:
   ```bash
   alembic upgrade head
   ```

## Enterprise Constraints
- **Zero-Downtime Deployments:** Migrations must be backwards-compatible with the currently running application version. 
  - *Example:* Renaming a column requires a multi-step release (add new column, double-write, migrate data, drop old column).
- **CI/CD Integration:** The CI pipeline enforces that the `alembic upgrade head` command succeeds against a clean test database before running unit tests.
- **Production Execution:** Migrations in production are executed automatically via an init-container or a pre-flight deployment hook before new application pods accept traffic.
