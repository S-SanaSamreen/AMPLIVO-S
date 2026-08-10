import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('@/store/authStore');

describe('ProtectedRoute', () => {
  const mockRouter = {
    replace: vi.fn(),
  };
  const mockUseAuthStore = useAuthStore as unknown as {
    mockReturnValue: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
  });

  it('should show loader while hasHydrated is false', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      hasHydrated: false,
      token: null,
      refreshToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      hasHydrated: true,
      token: null,
      refreshToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        '/login?redirect=%2Fdashboard'
      );
    });
  });

  it('should redirect to role-specific route when user role not allowed', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', name: 'Sales User', email: 's@s.com', role: 'sales' },
      hasHydrated: true,
      token: 'token',
      refreshToken: 'refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['admin', 'crm']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/sales');
    });
  });

  it('should allow access when user role is in allowedRoles', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', name: 'Admin User', email: 'a@a.com', role: 'admin' },
      hasHydrated: true,
      token: 'token',
      refreshToken: 'refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['admin', 'crm']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should allow access when no allowedRoles are specified (authenticated only)', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', name: 'Client User', email: 'c@c.com', role: 'client' },
      hasHydrated: true,
      token: 'token',
      refreshToken: 'refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Any Authenticated User</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Any Authenticated User')).toBeInTheDocument();
    });
  });

  it('should redirect finance role to /crm/payments when role not allowed', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', name: 'Finance User', email: 'f@f.com', role: 'finance' },
      hasHydrated: true,
      token: 'token',
      refreshToken: 'refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/crm/payments');
    });
  });

  it('should redirect with fallback when role redirect is unknown', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', name: 'Employee User', email: 'e@e.com', role: 'employee' },
      hasHydrated: true,
      token: 'token',
      refreshToken: 'refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setToken: vi.fn(),
      setHasHydrated: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/employee');
    });
  });
});
