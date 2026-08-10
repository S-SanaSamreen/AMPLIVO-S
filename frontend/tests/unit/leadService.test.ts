import { leadService } from '@/services/leadService';
import { api } from '@/services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/api');

describe('leadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch leads with params', async () => {
      const mockResponse = { items: [{ id: 'lead-1' }], total: 1 };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await leadService.getAll({ page_size: 100 });

      expect(api.get).toHaveBeenCalledWith('/leads', { params: { page_size: 100 } });
      expect(result.items).toHaveLength(1);
    });

    it('should fetch all leads without params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { items: [] } });

      await leadService.getAll();

      expect(api.get).toHaveBeenCalledWith('/leads', { params: undefined });
    });
  });

  describe('getById', () => {
    it('should fetch a single lead by ID', async () => {
      const mockLead = { id: 'lead-1', title: 'Test Lead' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockLead });

      const result = await leadService.getById('lead-1');

      expect(api.get).toHaveBeenCalledWith('/leads/lead-1');
      expect(result.id).toBe('lead-1');
    });
  });

  describe('create', () => {
    it('should create lead and strip empty UUID fields', async () => {
      const payload = {
        title: 'New Lead',
        company_name: 'Test Corp',
        source_id: '',
        assigned_to: '',
      };
      const mockResponse = { id: 'lead-1', title: 'New Lead' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await leadService.create(payload);

      expect(api.post).toHaveBeenCalledWith('/leads', {
        title: 'New Lead',
        company_name: 'Test Corp',
      });
      expect(result.id).toBe('lead-1');
    });

    it('should preserve non-empty UUID fields', async () => {
      const payload = {
        title: 'Lead with UUID',
        source_id: 'src-123',
        assigned_to: 'emp-456',
      };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'lead-1' } });

      await leadService.create(payload);

      expect(api.post).toHaveBeenCalledWith('/leads', payload);
    });
  });

  describe('update', () => {
    it('should update lead by ID and strip empty fields', async () => {
      const updates = { title: 'Updated Lead', assigned_to: '' };
      const mockResponse = { id: 'lead-1', title: 'Updated Lead' };
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await leadService.update('lead-1', updates);

      expect(api.put).toHaveBeenCalledWith('/leads/lead-1', { title: 'Updated Lead' });
      expect(result.title).toBe('Updated Lead');
    });
  });

  describe('delete', () => {
    it('should delete lead by ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

      await leadService.delete('lead-1');

      expect(api.delete).toHaveBeenCalledWith('/leads/lead-1');
    });
  });

  describe('convert', () => {
    it('should convert lead to client', async () => {
      const mockResponse = { id: 'lead-1', converted_client_id: 'client-1' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await leadService.convert('lead-1', 'client-1');

      expect(api.post).toHaveBeenCalledWith('/leads/lead-1/convert', { client_id: 'client-1' });
      expect(result.converted_client_id).toBe('client-1');
    });
  });

  describe('markLost', () => {
    it('should mark lead as lost with default terminal_status', async () => {
      const mockResponse = { id: 'lead-1', status: 'LOST' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await leadService.markLost('lead-1');

      expect(api.post).toHaveBeenCalledWith('/leads/lead-1/mark-lost', {
        reason: undefined,
        terminal_status: 'LOST',
      });
      expect(result.status).toBe('LOST');
    });

    it('should mark lead as rejected with custom reason', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'lead-1' } });

      await leadService.markLost('lead-1', 'Client changed mind', 'REJECTED');

      expect(api.post).toHaveBeenCalledWith('/leads/lead-1/mark-lost', {
        reason: 'Client changed mind',
        terminal_status: 'REJECTED',
      });
    });
  });

  describe('getActivities', () => {
    it('should fetch lead activities', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'activity-1' }] });

      const result = await leadService.getActivities('lead-1');

      expect(api.get).toHaveBeenCalledWith('/leads/lead-1/activities');
      expect(result).toHaveLength(1);
    });
  });

  describe('addActivity', () => {
    it('should add activity to lead', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'activity-1' } });

      const result = await leadService.addActivity('lead-1', {
        activity_type: 'call',
        description: 'Called client',
      });

      expect(api.post).toHaveBeenCalledWith('/leads/lead-1/activities', {
        activity_type: 'call',
        description: 'Called client',
      });
      expect(result.id).toBe('activity-1');
    });
  });

  describe('getFollowups', () => {
    it('should fetch lead followups', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'followup-1' }] });

      const result = await leadService.getFollowups('lead-1');

      expect(api.get).toHaveBeenCalledWith('/leads/lead-1/followups');
      expect(result).toHaveLength(1);
    });
  });

  describe('addFollowup', () => {
    it('should add followup to lead', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'followup-1' } });

      const result = await leadService.addFollowup('lead-1', {
        followup_date: '2025-06-01',
        notes: 'Follow up call',
      });

      expect(api.post).toHaveBeenCalledWith('/leads/lead-1/followups', {
        followup_date: '2025-06-01',
        notes: 'Follow up call',
      });
      expect(result.id).toBe('followup-1');
    });
  });

  describe('getSalesPipeline', () => {
    it('should fetch sales pipeline data', async () => {
      const mockPipeline = [{ stage: 'NEW_LEAD', count: 5 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockPipeline });

      const result = await leadService.getSalesPipeline();

      expect(api.get).toHaveBeenCalledWith('/sales-pipeline');
      expect(result).toHaveLength(1);
    });
  });
});
