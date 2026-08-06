# Schema & Index Strategy

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
The AMPLIVO database schema is designed for high-performance read-heavy workloads typical of enterprise identity and access management (IAM) domains.

## Primary Keys
- All tables utilize `UUID` (specifically UUIDv4) as primary keys to ensure global uniqueness and obfuscate sequence enumeration from malicious actors.

## Indexing Strategy
To optimize query performance and enforce data integrity, the following indexing strategies are implemented:

1. **Unique Constraints (B-Tree Indexes)**
   - `users.email`: Ensures no duplicate accounts can be created and accelerates login lookups.
   - `refresh_tokens.token`, `password_reset_tokens.token`, `email_verification_tokens.token`: Accelerates token validation during authorization flows.

2. **Foreign Key Indexes**
   - All foreign keys (e.g., `user_id` on `audit_logs` and `login_history`) are explicitly indexed to prevent full table scans during cascade deletes or relational joins.

3. **Composite & Partial Indexes (Planned)**
   - `audit_logs`: A composite index on `(entity_name, entity_id)` is recommended for fast historical lookups of specific domain objects.
   - Soft Deletes: A partial index on `users.email WHERE deleted_at IS NULL` ensures unique active emails while allowing re-registration if an account was previously soft-deleted.

## Data Types
- JSON payloads (like audit trail changes) are stored in `JSONB` format in PostgreSQL, allowing for GIN indexing if query patterns require deep JSON searches in the future.
