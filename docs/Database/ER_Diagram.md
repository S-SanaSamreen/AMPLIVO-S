# Entity Relationship (ER) Diagram

**Date:** 2026-08-04
**Project:** AMPLIVO

## Database Architecture
The AMPLIVO backend leverages a relational data model (PostgreSQL) mapped via SQLAlchemy ORM. The following diagram illustrates the relationships between the core authentication and auditing entities.

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "has"
    USERS ||--o{ USER_SESSIONS : "has"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "has"
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : "has"
    USERS ||--o{ LOGIN_HISTORY : "logs"
    USERS ||--o{ AUDIT_LOGS : "performs"

    USERS {
        uuid id PK
        string email UK
        string hashed_password
        boolean is_active
        boolean is_verified
        boolean is_superuser
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    REFRESH_TOKENS {
        uuid id PK
        string token UK
        uuid user_id FK
        timestamp expires_at
        boolean is_revoked
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        string user_agent
        string ip_address
        timestamp last_active
    }

    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        boolean is_used
    }

    EMAIL_VERIFICATION_TOKENS {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
    }

    LOGIN_HISTORY {
        uuid id PK
        uuid user_id FK
        string ip_address
        string user_agent
        boolean success
        timestamp attempt_time
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_name
        uuid entity_id
        jsonb changes
        string ip_address
        timestamp timestamp
    }
```
