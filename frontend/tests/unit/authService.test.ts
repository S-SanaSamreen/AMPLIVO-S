import { authService, LoginCredentials, RegisterPayload } from '@/services/authService';
import { api } from '@/services/api';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should call login endpoint with correct credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        access_token: 'access-token-abc',
        refresh_token: 'refresh-token-xyz',
        token_type: 'bearer',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        is_active: true,
        is_verified: true,
        role_name: 'admin',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens });
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        identifier: 'test@example.com',
        password: 'password123',
      });
      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        headers: { Authorization: 'Bearer access-token-abc' },
      });
      expect(result.access_token).toBe('access-token-abc');
      expect(result.refresh_token).toBe('refresh-token-xyz');
      expect(result.user.id).toBe('user-1');
      expect(result.user.role).toBe('admin');
    });

    it('should map unknown role to admin by default', async () => {
      const mockTokens = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
      };

      const mockUser = {
        id: 'user-2',
        email: 'unknown@example.com',
        username: 'unknown',
        full_name: 'Unknown User',
        is_active: true,
        is_verified: false,
        role_name: 'superadmin',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens });
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login({ identifier: 'unknown@example.com', password: 'pass' });

      expect(result.user.role).toBe('admin');
    });

    it('should map capitalized role name to lowercase', async () => {
      const mockTokens = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
      };

      const mockUser = {
        id: 'user-3',
        email: 'sales@example.com',
        username: 'salesuser',
        full_name: 'Sales User',
        is_active: true,
        is_verified: true,
        role_name: 'Sales',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens });
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login({ identifier: 'sales@example.com', password: 'pass' });

      expect(result.user.role).toBe('sales');
    });

    it('should handle role_name being null', async () => {
      const mockTokens = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
      };

      const mockUser = {
        id: 'user-4',
        email: 'nullrole@example.com',
        username: 'nullrole',
        full_name: 'Null Role User',
        is_active: true,
        is_verified: false,
        role_name: null,
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens });
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login({ identifier: 'nullrole@example.com', password: 'pass' });

      expect(result.user.role).toBe('admin');
    });

    it('should propagate API errors', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(
        authService.login({ identifier: 'bad@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should call register endpoint with correct payload', async () => {
      const payload: RegisterPayload = {
        email: 'newuser@example.com',
        username: 'newuser',
        full_name: 'New User',
        password: 'SecurePass123',
      };

      const mockResponse = {
        id: 'new-user-1',
        email: 'newuser@example.com',
        username: 'newuser',
        full_name: 'New User',
        is_active: true,
        is_verified: false,
        role_name: 'admin',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register(payload);

      expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
      expect(result.id).toBe('new-user-1');
      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('admin');
    });

    it('should map user fields correctly on register', async () => {
      const payload: RegisterPayload = {
        email: 'client@example.com',
        username: 'client',
        full_name: 'Client User',
        password: 'SecurePass123',
      };

      const mockResponse = {
        id: 'client-1',
        email: 'client@example.com',
        username: 'client',
        full_name: 'Client User',
        is_active: true,
        is_verified: false,
        role_name: 'client',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register(payload);

      expect(result.name).toBe('Client User');
      expect(result.role).toBe('client');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint with refresh token', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.logout('refresh-token-123');

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refresh_token: 'refresh-token-123',
      });
    });
  });

  describe('getMe', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 'me-1',
        email: 'me@example.com',
        username: 'meuser',
        full_name: 'Me User',
        is_active: true,
        is_verified: true,
        role_name: 'hr',
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result.id).toBe('me-1');
      expect(result.role).toBe('hr');
    });
  });

  describe('refreshToken', () => {
    it('should call refresh endpoint and return tokens', async () => {
      const mockResponse = {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'bearer',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.refreshToken('old-refresh');

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'old-refresh',
      });
      expect(result.access_token).toBe('new-access');
      expect(result.refresh_token).toBe('new-refresh');
    });
  });

  describe('forgotPassword', () => {
    it('should call forgot-password endpoint', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.forgotPassword('user@example.com');

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com',
      });
    });
  });

  describe('resetPassword', () => {
    it('should call reset-password endpoint with token and new password', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.resetPassword('reset-token', 'NewPassword123');

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        new_password: 'NewPassword123',
      });
    });
  });

  describe('changePassword', () => {
    it('should call change-password endpoint', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.changePassword('CurrentPass', 'NewPass');

      expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
        current_password: 'CurrentPass',
        new_password: 'NewPass',
      });
    });
  });

  describe('sendVerification', () => {
    it('should call send-verification endpoint', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.sendVerification();

      expect(api.post).toHaveBeenCalledWith('/auth/send-verification');
    });
  });

  describe('verifyEmail', () => {
    it('should call verify-email endpoint with token', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.verifyEmail('verification-token');

      expect(api.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'verification-token',
      });
    });
  });

  describe('checkEmail', () => {
    it('should call check-email endpoint and return exists flag', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { exists: true } });

      const result = await authService.checkEmail('check@example.com');

      expect(api.get).toHaveBeenCalledWith('/auth/check-email?email=check%40example.com');
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { exists: false } });

      const result = await authService.checkEmail('new@example.com');

      expect(result).toBe(false);
    });
  });

  describe('checkUsername', () => {
    it('should call check-username endpoint and return exists flag', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { exists: true } });

      const result = await authService.checkUsername('someuser');

      expect(api.get).toHaveBeenCalledWith('/auth/check-username?username=someuser');
      expect(result).toBe(true);
    });
  });
});