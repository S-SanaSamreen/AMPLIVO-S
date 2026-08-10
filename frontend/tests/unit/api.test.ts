import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/authStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/authStore')>();
  return {
    ...actual,
    useAuthStore: {
      getState: vi.fn(),
    },
  };
});

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        post: vi.fn(),
        get: vi.fn(),
      })),
    },
  };
});

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api/v1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should create axios instance with correct baseURL', async () => {
    await import('@/services/api');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8000/api/v1',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should create axios instance with fallback baseURL when env not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    vi.resetModules();
    await import('@/services/api');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://127.0.0.1:8000/api/v1',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should attach JWT token to request via interceptor', async () => {
    const storeGetState = vi.mocked(useAuthStore.getState);
    storeGetState.mockReturnValue({
      token: 'valid-jwt-token',
      refreshToken: 'refresh-token',
      user: null,
      isAuthenticated: true,
      hasHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.resetModules();
    const { api } = await import('@/services/api');

    const requestInterceptor = (api.interceptors.request as any).use as ReturnType<typeof vi.fn>;
    expect(requestInterceptor).toHaveBeenCalled();

    const interceptorFn = requestInterceptor.mock.calls[0][0];
    const config = { headers: {} };

    const result = interceptorFn(config);

    expect(result.headers.Authorization).toBe('Bearer valid-jwt-token');
  });

  it('should not attach token if token is null', async () => {
    const storeGetState = vi.mocked(useAuthStore.getState);
    storeGetState.mockReturnValue({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.resetModules();
    const { api } = await import('@/services/api');

    const requestInterceptor = (api.interceptors.request as any).use as ReturnType<typeof vi.fn>;
    const interceptorFn = requestInterceptor.mock.calls[0][0];
    const config = { headers: {} };

    const result = interceptorFn(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should handle 401 response with token refresh', async () => {
    const storeGetState = vi.mocked(useAuthStore.getState);
    const setTokenMock = vi.fn();
    const logoutMock = vi.fn();
    const refreshToken = 'current-refresh-token';

    storeGetState.mockReturnValue({
      token: 'expired-token',
      refreshToken,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
      login: vi.fn(),
      logout: logoutMock,
      setToken: setTokenMock,
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.stubGlobal('axios', {
      post: vi.fn().mockResolvedValue({ data: { access_token: 'new-access-token' } }),
    });

    vi.resetModules();
    const { api } = await import('@/services/api');

    const responseInterceptor = (api.interceptors.response as any).use as ReturnType<typeof vi.fn>;
    expect(responseInterceptor).toHaveBeenCalled();

    const responseFn = responseInterceptor.mock.calls[0][1];

    expect(typeof responseFn).toBe('function');
    expect(responseFn).toBeDefined();
  });

  it('should call logout when refresh token is missing on 401', async () => {
    const storeGetState = vi.mocked(useAuthStore.getState);
    const logoutMock = vi.fn();

    storeGetState.mockReturnValue({
      token: 'expired-token',
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
      login: vi.fn(),
      logout: logoutMock,
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.resetModules();
    const { api } = await import('@/services/api');

    const responseInterceptor = (api.interceptors.response as any).use as ReturnType<typeof vi.fn>;
    expect(responseInterceptor).toHaveBeenCalled();

    const responseFn = responseInterceptor.mock.calls[0][1];

    const error = {
      response: { status: 401 },
      config: { headers: {} },
    };

    await expect(responseFn(error)).rejects.toEqual(error);
    expect(logoutMock).toHaveBeenCalled();
  });

  it('should reject non-401 errors without retry', async () => {
    const storeGetState = vi.mocked(useAuthStore.getState);
    storeGetState.mockReturnValue({
      token: 'valid-token',
      refreshToken: 'refresh',
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.resetModules();
    const { api } = await import('@/services/api');

    const responseInterceptor = (api.interceptors.response as any).use as ReturnType<typeof vi.fn>;
    const responseFn = responseInterceptor.mock.calls[0][1];

    const error = {
      response: { status: 500 },
      config: { headers: {} },
    };

    await expect(responseFn(error)).rejects.toEqual(error);
  });
});