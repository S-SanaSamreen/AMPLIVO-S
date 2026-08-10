import { campaignService } from '@/services/campaignService';
import { api } from '@/services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/api');

describe('campaignService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch campaigns with params', async () => {
      const mockResponse = { items: [{ id: 'camp-1' }], total: 1 };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await campaignService.getAll({ page_size: 50, status: 'Active' });

      expect(api.get).toHaveBeenCalledWith('/campaigns', { params: { page_size: 50, status: 'Active' } });
      expect(result.items).toHaveLength(1);
    });

    it('should fetch all campaigns without params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { items: [] } });

      await campaignService.getAll();

      expect(api.get).toHaveBeenCalledWith('/campaigns', { params: undefined });
    });
  });

  describe('getById', () => {
    it('should fetch a single campaign by ID', async () => {
      const mockCampaign = { id: 'camp-1', name: 'Summer Campaign' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCampaign });

      const result = await campaignService.getById('camp-1');

      expect(api.get).toHaveBeenCalledWith('/campaigns/camp-1');
      expect(result.name).toBe('Summer Campaign');
    });
  });

  describe('create', () => {
    it('should create campaign and strip empty UUID fields', async () => {
      const payload = {
        name: 'New Campaign',
        client_id: '',
        type: 'social',
        manager_id: '',
      };
      const mockResponse = { id: 'camp-1', name: 'New Campaign' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await campaignService.create(payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns', {
        name: 'New Campaign',
        type: 'social',
      });
      expect(result.id).toBe('camp-1');
    });

    it('should preserve non-empty UUID fields', async () => {
      const payload = {
        name: 'Campaign with IDs',
        client_id: 'client-123',
        type: 'video',
        manager_id: 'emp-456',
      };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'camp-1' } });

      await campaignService.create(payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns', payload);
    });

    it('should strip empty date fields', async () => {
      const payload = {
        name: 'Campaign with Dates',
        client_id: 'client-1',
        type: 'social',
        start_date: '',
        end_date: '',
      };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'camp-1' } });

      await campaignService.create(payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns', {
        name: 'Campaign with Dates',
        client_id: 'client-1',
        type: 'social',
      });
    });
  });

  describe('update', () => {
    it('should update campaign by ID', async () => {
      const updates = { name: 'Updated Campaign', manager_id: '' };
      const mockResponse = { id: 'camp-1', name: 'Updated Campaign' };
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await campaignService.update('camp-1', updates);

      expect(api.put).toHaveBeenCalledWith('/campaigns/camp-1', { name: 'Updated Campaign' });
      expect(result.name).toBe('Updated Campaign');
    });
  });

  describe('delete', () => {
    it('should delete campaign by ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

      await campaignService.delete('camp-1');

      expect(api.delete).toHaveBeenCalledWith('/campaigns/camp-1');
    });
  });

  describe('getPlatforms', () => {
    it('should fetch campaign platforms', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'plat-1' }] });

      const result = await campaignService.getPlatforms('camp-1');

      expect(api.get).toHaveBeenCalledWith('/campaigns/camp-1/platforms');
      expect(result).toHaveLength(1);
    });
  });

  describe('addPlatform', () => {
    it('should add platform to campaign', async () => {
      const payload = { platform_name: 'Facebook', budget_allocation: 5000 };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'plat-1' } });

      const result = await campaignService.addPlatform('camp-1', payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns/camp-1/platforms', payload);
      expect(result.id).toBe('plat-1');
    });
  });

  describe('getAssets', () => {
    it('should fetch campaign assets', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'asset-1' }] });

      const result = await campaignService.getAssets('camp-1');

      expect(api.get).toHaveBeenCalledWith('/campaigns/camp-1/assets');
      expect(result).toHaveLength(1);
    });
  });

  describe('addAsset', () => {
    it('should add asset to campaign', async () => {
      const payload = { name: 'Video Ad', asset_type: 'video' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'asset-1' } });

      const result = await campaignService.addAsset('camp-1', payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns/camp-1/assets', payload);
      expect(result.id).toBe('asset-1');
    });
  });

  describe('getMetrics', () => {
    it('should fetch campaign metrics', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ date: '2025-01-01', impressions: 1000 }] });

      const result = await campaignService.getMetrics('camp-1');

      expect(api.get).toHaveBeenCalledWith('/campaigns/camp-1/metrics');
      expect(result[0].impressions).toBe(1000);
    });
  });

  describe('addMetric', () => {
    it('should add metric to campaign', async () => {
      const payload = { date: '2025-01-01', impressions: 1000, clicks: 50 };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'metric-1' } });

      const result = await campaignService.addMetric('camp-1', payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns/camp-1/metrics', payload);
      expect(result.id).toBe('metric-1');
    });

    it('should handle optional metric fields', async () => {
      const payload = { date: '2025-01-01' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'metric-1' } });

      await campaignService.addMetric('camp-1', payload);

      expect(api.post).toHaveBeenCalledWith('/campaigns/camp-1/metrics', payload);
    });
  });
});
