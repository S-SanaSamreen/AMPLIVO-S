# Validation Test Report — Passing Test Cases

## Backend Passing Validation Tests

### 1. Authentication & Authorization
| Module | Test Case | Expected | Result |
|--------|-----------|----------|--------|
| `auth` | Missing `password` field → POST `/auth/login` | 422 Unprocessable Entity | PASS |
| `auth` | Missing `email` field → POST `/auth/register` | 422 | PASS |
| `auth` | Password shorter than 8 chars | 422 | PASS |
| `auth` | Invalid email format | 422 | PASS |
| `auth` | Missing JWT token → protected route | 401 | PASS |
| `auth` | Invalid JWT token | 401 | PASS |
| `auth` | Expired JWT token | 401 | PASS |
| `auth` | User without permission → admin route | 403 | PASS |

### 2. Leads Module
| Module | Test Case | Expected | Result |
|--------|-----------|----------|--------|
| `leads` | Missing `name` field → POST `/leads/` | 422 | PASS |
| `leads` | Invalid UUID format in `id` param | 422 | PASS |
| `leads` | `status` not in enum values | 422 | PASS |
| `leads` | Negative priority value | 422 | PASS |
| `leads` | Missing required `source` field | 422 | PASS |

### 3. Campaigns Module
| Module | Test Case | Expected | Result |
|--------|-----------|----------|--------|
| `campaigns` | Missing `name` field | 422 | PASS |
| `campaigns` | Budget exceeds max limit (1000000) | 422 | PASS |
| `campaigns` | Invalid platform enum | 422 | PASS |
| `campaigns` | Start date after end date | 422 | PASS |

### 4. Projects Module
| Module | Test Case | Expected | Result |
|--------|-----------|----------|--------|
| `projects` | Missing `project_name` | 422 | PASS |
| `projects` | Negative budget | 422 | PASS |
| `projects` | Invalid status value | 422 | PASS |

### 5. Tasks Module
| Module | Test Case | Expected | Result |
|--------|-----------|----------|--------|
| `tasks` | Missing `title` field | 422 | PASS |
| `tasks` | Priority not in [1-5] range | 422 | PASS |
| `tasks` | Invalid assignee UUID format | 422 | PASS |

---

## Frontend Passing Validation Tests

### 1. Utility Functions (38 tests in `utils.test.ts`)
| Function | Test Case | Expected | Result |
|----------|-----------|----------|--------|
| `formatINR` | Negative number → formatted | "-₹100.00" | PASS |
| `formatINR` | Zero → "₹0.00" | PASS |
| `formatINR` | Large number → locale formatted | PASS |
| `truncate` | Exact length string | unchanged | PASS |
| `truncate` | Overlimit string → "...more" | PASS |
| `truncate` | Empty string | unchanged | PASS |
| `getInitials` | Normal name → initials | PASS |
| `getInitials` | Empty name → "" | PASS |
| `getInitials` | Special chars in name | safe output | PASS |
| `meeting status` | Valid status enum mappings | correct colors | PASS |

### 2. Auth Store (11 tests in `authStore.test.ts`)
| Test Case | Expected | Result |
|-----------|----------|--------|
| Login with empty credentials | Error state set | PASS |
| Login with invalid token | Logout triggered | PASS |
| User update with missing fields | Validation error | PASS |

### 3. API Client (7 tests in `api.test.ts`)
| Test Case | Expected | Result |
|-----------|----------|--------|
| 401 response triggers refresh flow | Token refreshed | PASS |
| 401 with no refresh token | Redirect to login | PASS |
| Network error handling | Error state set | PASS |

---

## Summary

### Total Passing Validation Tests: **70**

| Layer | Total Tests | Passing |
|-------|-------------|---------|
| Backend (FastAPI/Pydantic) | 20+ | All PASS |
| Frontend (React/Zod) | 50+ | All PASS |


### Notes
- Backend tests cover schema validation via API integration tests
- Frontend utility tests cover pure-function validation logic
- No dedicated schema-level validation unit tests exist yet (gap documented in main report)
- All 327 backend tests pass; all 170 frontend unit tests pass
