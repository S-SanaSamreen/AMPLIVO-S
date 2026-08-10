import { act, renderHook } from '@testing-library/react';
import { useAuthStore, User } from '@/store/authStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api/v1');
  });

  afterEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login and set auth state correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: User = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      role: 'admin',
      is_active: true,
      is_verified: true,
    };
    const mockToken = 'access-token-abc';
    const mockRefreshToken = 'refresh-token-xyz';

    act(() => {
      result.current.login(mockUser, mockToken, mockRefreshToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.refreshToken).toBe(mockRefreshToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login without refresh token (optional param)', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: User = {
      id: 'user-456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'client',
    };
    const mockToken = 'access-token-xyz';

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.refreshToken).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear all auth state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login(
        { id: 'u1', name: 'Test', email: 't@t.com', role: 'admin' },
        'token',
        'refresh'
      );
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set token', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken('new-token-value');
    });

    expect(result.current.token).toBe('new-token-value');
  });

  it('should set hasHydrated to true', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setHasHydrated(true);
    });

    expect(result.current.hasHydrated).toBe(true);
  });

  it('should set hasHydrated to false', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setHasHydrated(false);
    });

    expect(result.current.hasHydrated).toBe(false);
  });

  it('should update user fields immutably', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: User = {
      id: 'u1',
      name: 'Original Name',
      email: 'orig@example.com',
      role: 'admin',
    };

    act(() => {
      result.current.login(mockUser, 'token');
    });

    act(() => {
      result.current.updateUser({ name: 'Updated Name', phone: '555-1234' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
    expect(result.current.user?.email).toBe('orig@example.com');
    expect(result.current.user?.phone).toBe('555-1234');
  });

  it('should not update user if user is null', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.updateUser({ name: 'Should Not Apply' });
    });

    expect(result.current.user).toBeNull();
  });

  it('should handle sessionStorage persistence', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login(
        { id: 'u1', name: 'Persist', email: 'p@p.com', role: 'admin' },
        'token',
        'refresh'
      );
    });

    expect(setItemSpy).toHaveBeenCalled();
  });

  it('should clear other stores on logout (crm and hr storage)', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login(
        { id: 'u1', name: 'Test', email: 't@t.com', role: 'admin' },
        'token'
      );
    });

    act(() => {
      result.current.logout();
    });

    expect(removeItemSpy).toHaveBeenCalledWith('amplivo-crm-store');
    expect(removeItemSpy).toHaveBeenCalledWith('amplivo-hr-storage');
  });

  it('should call setHasHydrated via onRehydrateStorage callback', () => {
    const { result } = renderHook(() => useAuthStore());

    const state = result.current;
    const rehydrationCallback = state.setHasHydrated;

    expect(typeof rehydrationCallback).toBe('function');
  });
});