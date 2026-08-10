import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn().mockReturnValue({
      user: { role: 'crm' },
      token: 'mock-token',
    }),
  },
}));

vi.mock('@/services/crmService', () => ({
  notificationService: {
    markRead: vi.fn().mockResolvedValue({}),
    markAllRead: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/leadService');
vi.mock('@/services/moduleServices');

import { useCrmStore } from '@/store/crmStore';
import { notificationService } from '@/services/crmService';

describe('crmStore', () => {
  const { setTheme, addNotification, markNotificationRead, markAllNotificationsRead, getUnreadCount, getClientById, getProjectById, getEmployeeById } = useCrmStore.getState();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationService.markRead).mockResolvedValue({});
    vi.mocked(notificationService.markAllRead).mockResolvedValue({});
  });

  describe('initial state', () => {
    it('should initialize with loaded tasks and not loading', () => {
      const state = useCrmStore.getState();
      expect(state.tasks.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
    });

    it('should initialize theme (light or system based on persist)', () => {
      const state = useCrmStore.getState();
      const validThemes = ['light', 'dark', 'system'];
      expect(validThemes).toContain(state.theme);
    });

    it('should set theme to dark', () => {
      setTheme('dark');
      expect(useCrmStore.getState().theme).toBe('dark');
    });

    it('should set theme to system', () => {
      setTheme('system');
      expect(useCrmStore.getState().theme).toBe('system');
    });
  });

  describe('notification actions', () => {
    it('should add notification', () => {
      addNotification({
        type: 'lead',
        title: 'New Lead',
        message: 'A new lead was assigned to you',
        read: false,
        timestamp: '2025-01-01T00:00:00Z',
      });
      expect(useCrmStore.getState().notifications).toHaveLength(1);
      expect(useCrmStore.getState().notifications[0].title).toBe('New Lead');
      expect(useCrmStore.getState().notifications[0].read).toBe(false);
    });

    it('should mark notification as read', () => {
      addNotification({
        type: 'lead', title: 'Test', message: 'Test message',
        read: false, timestamp: '2025-01-01',
      });
      const notifId = useCrmStore.getState().notifications[0].id;
      markNotificationRead(notifId);
      expect(useCrmStore.getState().notifications[0].read).toBe(true);
    });

    it('should mark all notifications as read', () => {
      addNotification({ type: 'lead', title: 'N1', message: 'M1', read: false, timestamp: '' });
      addNotification({ type: 'lead', title: 'N2', message: 'M2', read: false, timestamp: '' });
      markAllNotificationsRead();
      const state = useCrmStore.getState();
      expect(state.notifications.every(n => n.read === true)).toBe(true);
    });

    it('should count unread notifications', () => {
      addNotification({ type: 'lead', title: 'N1', message: 'M1', read: false, timestamp: '' });
      addNotification({ type: 'lead', title: 'N2', message: 'M2', read: true, timestamp: '' });
      addNotification({ type: 'lead', title: 'N3', message: 'M3', read: false, timestamp: '' });
      expect(getUnreadCount()).toBe(2);
    });
  });

  describe('selectors', () => {
    it('should getClientById returning undefined for empty list', () => {
      expect(getClientById('non-existent')).toBeUndefined();
    });

    it('should getProjectById returning undefined for empty list', () => {
      expect(getProjectById('non-existent')).toBeUndefined();
    });

    it('should getEmployeeById returning undefined for empty list', () => {
      expect(getEmployeeById('non-existent')).toBeUndefined();
    });
  });
});
