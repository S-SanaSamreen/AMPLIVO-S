# Frontend Unit Tests

This directory contains unit tests for the AMPLIVO frontend application.

## Setup

Tests are configured using **Vitest** with the following dependencies:

- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers for DOM assertions
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment for testing

## Configuration

- **`vitest.config.ts`** (in project root) - Vitest configuration with jsdom environment, path aliases, and coverage settings
- **`tests/unit/setup.ts`** - Global test setup (mocks for IntersectionObserver, matchMedia, FormData, etc.)

## Running Tests

```bash
# Run all unit tests once
npm run test:unit

# Run tests in watch mode (development)
npm run test:unit:watch

# Run tests with coverage report
npm run test:unit:coverage
```

## Test File Inventory

| File | Module | Tests |
|---|---|---|
| `authStore.test.ts` | `src/store/authStore.ts` | 11 |
| `salesStore.test.ts` | `src/store/salesStore.ts` | 17 |
| `toastStore.test.ts` | `src/store/toastStore.ts` | 7 |
| `crmStore.test.ts` | `src/store/crmStore.ts` | 11 |
| `hrStore.test.ts` | `src/store/hrStore.ts` | 11 |
| `uiStore.test.ts` | `src/store/uiStore.ts` | 6 |
| `api.test.ts` | `src/services/api.ts` | 7 |
| `authService.test.ts` | `src/services/authService.ts` | 14 |
| `leadService.test.ts` | `src/services/leadService.ts` | 14 |
| `campaignService.test.ts` | `src/services/campaignService.ts` | 14 |
| `utils.test.ts` | `src/lib/utils.ts` | 38 |
| `useCountUp.test.ts` | `src/hooks/useCountUp.ts` | 6 |
| `ProtectedRoute.test.tsx` | `src/components/auth/ProtectedRoute.tsx` | 7 |

**Total: 170 tests**

## Mocking Strategy

- Services are mocked using `vi.mock('@/services/*')` to isolate store tests from API calls
- Zustand stores are tested directly using `renderHook` from React Testing Library
- axios is mocked at the module level for API service tests
- Browser APIs (IntersectionObserver, matchMedia) are mocked globally in `setup.ts`

## Coverage

Run `npm run test:unit:coverage` to generate a coverage report:
- HTML report: `coverage/index.html`
- Terminal summary with uncovered lines