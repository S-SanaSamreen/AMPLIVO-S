import { renderHook, act } from '@testing-library/react';
import { useSalesStore } from '@/store/salesStore';
import { useToastStore } from '@/store/toastStore';
import { leadService } from '@/services/leadService';
import { meetingService } from '@/services/meetingService';
import { financeService } from '@/services/crmService';
import { proposalService } from '@/services/proposalService';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/leadService');
vi.mock('@/services/meetingService');
vi.mock('@/services/crmService');
vi.mock('@/services/proposalService');

vi.mock('@/store/toastStore', () => ({
  useToastStore: {
    getState: vi.fn().mockReturnValue({
      showToast: vi.fn(),
      dismissToast: vi.fn(),
      toasts: [],
    }),
  },
}));

interface LeadRead {
  id: string;
  title?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  status?: string;
  source_id?: string | null;
  assigned_to?: string;
  priority?: string;
  estimated_value?: number;
  notes?: string | null;
  interested_services?: string[];
  created_at?: string;
  updated_at?: string;
}

const mockLead: LeadRead = {
  id: 'lead-1',
  title: 'Test Lead',
  contact_name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  company_name: 'Test Corp',
  status: 'new',
  source_id: 'referral',
  assigned_to: '',
  priority: 'Medium',
  estimated_value: 50000,
  notes: 'Budget: ₹100,000',
  interested_services: ['Brand Films'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('salesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToastStore.getState).mockReturnValue({
      showToast: vi.fn(),
      toasts: [],
      dismissToast: vi.fn(),
    });
  });

  afterEach(() => {
    const { result } = renderHook(() => useSalesStore());
    act(() => {
      result.current.leads = [];
      result.current.meetings = [];
      result.current.invoices = [];
    });
  });

  describe('initial state', () => {
    it('should have empty arrays and not loading', () => {
      const { result } = renderHook(() => useSalesStore());
      expect(result.current.leads).toEqual([]);
      expect(result.current.meetings).toEqual([]);
      expect(result.current.invoices).toEqual([]);
      expect(result.current.services).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchLeads', () => {
    it('should fetch leads successfully', async () => {
      vi.mocked(leadService.getAll).mockResolvedValueOnce({ items: [mockLead] });
      vi.mocked(meetingService.getAll).mockResolvedValueOnce({ items: [] });
      vi.mocked(financeService.getInvoices).mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.leads).toHaveLength(1);
      expect(result.current.leads[0].title).toBe('Test Lead');
      expect(result.current.leads[0].firstName).toBe('John');
      expect(result.current.leads[0].lastName).toBe('Doe');
      expect(result.current.leads[0].source).toBe('Referral');
    });

    it('should handle fetch with no leads', async () => {
      vi.mocked(leadService.getAll).mockResolvedValueOnce({ items: [] });
      vi.mocked(meetingService.getAll).mockResolvedValueOnce({ items: [] });
      vi.mocked(financeService.getInvoices).mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should map source_id correctly', async () => {
      vi.mocked(leadService.getAll).mockResolvedValueOnce({
        items: [{ ...mockLead, source_id: 'paid_ads' }],
      });
      vi.mocked(meetingService.getAll).mockResolvedValueOnce({ items: [] });
      vi.mocked(financeService.getInvoices).mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads[0].source).toBe('Paid Ads');
    });

    it('should map unknown source to Organic', async () => {
      vi.mocked(leadService.getAll).mockResolvedValueOnce({
        items: [{ ...mockLead, source_id: 'unknown_channel' }],
      });
      vi.mocked(meetingService.getAll).mockResolvedValueOnce({ items: [] });
      vi.mocked(financeService.getInvoices).mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(result.current.leads[0].source).toBe('Organic');
    });

    it('should show error toast on fetch failure', async () => {
      const showToastMock = vi.fn();
      vi.mocked(useToastStore.getState).mockReturnValue({
        showToast: showToastMock,
        toasts: [],
        dismissToast: vi.fn(),
      });

      vi.mocked(leadService.getAll).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.fetchLeads();
      });

      expect(showToastMock).toHaveBeenCalledWith('Failed to load leads.', 'error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createLead', () => {
    it('should create lead and add to list', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({
          title: 'Test Lead',
          email: 'john@example.com',
          company: 'Test Corp',
        });
      });

      expect(leadService.create).toHaveBeenCalledWith({
        title: 'Test Lead',
        email: 'john@example.com',
        company: 'Test Corp',
        status: 'NEW_LEAD',
      });
      expect(result.current.leads).toHaveLength(1);
      expect(result.current.leads[0].title).toBe('Test Lead');
    });

    it('should set isLoading during creation and reset on completion', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);

      const { result } = renderHook(() => useSalesStore());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.createLead({
          title: 'Test',
          email: 't@t.com',
        });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should throw on creation error and reset isLoading', async () => {
      vi.mocked(leadService.create).mockRejectedValueOnce(new Error('DB error'));

      const { result } = renderHook(() => useSalesStore());

      await expect(
        act(async () => {
          await result.current.createLead({ title: 'Fail', email: 'f@f.com' });
        })
      ).rejects.toThrow('DB error');

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('editLead', () => {
    it('should update lead in list', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(leadService.update).mockResolvedValueOnce({ ...mockLead, title: 'Updated Lead' });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'Original', email: 't@t.com' });
      });

      await act(async () => {
        await result.current.editLead('lead-1', { title: 'Updated Lead' });
      });

      expect(result.current.leads[0].title).toBe('Updated Lead');
    });
  });

  describe('deleteLead', () => {
    it('should remove lead from list', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(leadService.delete).mockResolvedValueOnce({});

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'To Delete', email: 't@t.com' });
      });

      expect(result.current.leads).toHaveLength(1);

      await act(async () => {
        await result.current.deleteLead('lead-1');
      });

      expect(result.current.leads).toHaveLength(0);
    });
  });

  describe('updateLeadStatus', () => {
    it('should update status and push timeline event optimistically', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(leadService.update).mockResolvedValueOnce(mockLead);

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'Status Lead', email: 't@t.com' });
      });

      await act(async () => {
        await result.current.updateLeadStatus('lead-1', 'Contacted');
      });

      expect(result.current.leads[0].status).toBe('Contacted');
      expect(result.current.leads[0].timeline).toHaveLength(1);
      expect(result.current.leads[0].timeline[0].type).toBe('status_changed');
    });

    it('should rollback on status update error', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(leadService.update).mockRejectedValueOnce(new Error('API error'));

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'Rollback Lead', email: 't@t.com' });
      });

      const originalStatus = result.current.leads[0].status;

      await expect(
        act(async () => {
          await result.current.updateLeadStatus('lead-1', 'Contacted');
        })
      ).rejects.toThrow('API error');

      expect(result.current.leads[0].status).toBe(originalStatus);
    });

    it('should call markLost when status is Lost', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(leadService.markLost).mockResolvedValueOnce({});

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'Lost Lead', email: 't@t.com' });
      });

      await act(async () => {
        await result.current.updateLeadStatus('lead-1', 'Lost');
      });

      expect(leadService.markLost).toHaveBeenCalledWith('lead-1');
    });
  });

  describe('generateInvoice', () => {
    it('should throw when budget is 0', async () => {
      const { result } = renderHook(() => useSalesStore());

      act(() => {
        result.current.leads = [
          {
            id: 'lead-zero',
            title: 'Zero Budget',
            firstName: 'Zero',
            lastName: 'Budget',
            email: '',
            phone: '',
            designation: '',
            company: '',
            industry: '',
            companySize: '',
            website: '',
            city: '',
            status: 'New',
            source: 'Organic',
            assignedTo: '',
            priority: 'Medium',
            budget: 0,
            expectedCloseDate: '',
            probability: 50,
            interestedServices: [],
            notes: '',
            meetings: [],
            timeline: [],
            invoiceGenerated: false,
            createdAt: '',
            lastUpdated: '',
            followUpDate: '',
            deleted: false,
          },
        ];
      });

      await expect(
        act(async () => {
          await result.current.generateInvoice('lead-zero');
        })
      ).rejects.toThrow('Set a budget greater than ₹0');
    });

    it('should generate invoice successfully', async () => {
      vi.mocked(leadService.create).mockResolvedValueOnce(mockLead);
      vi.mocked(proposalService.createForLead).mockResolvedValueOnce({ id: 'proposal-1' });
      vi.mocked(financeService.createAdvanceInvoice).mockResolvedValueOnce({
        id: 'inv-1',
        invoice_number: 'INV-001',
        lead_id: 'lead-1',
        issue_date: '2025-01-01',
        due_date: '2025-01-08',
        subtotal: 12500,
        tax_total: 2250,
        total_amount: 14750,
        status: 'draft',
        notes: 'Invoice notes',
      });

      const { result } = renderHook(() => useSalesStore());

      await act(async () => {
        await result.current.createLead({ title: 'Invoice Lead', email: 't@t.com' });
      });

      let invoice: any;
      await act(async () => {
        invoice = await result.current.generateInvoice('lead-1');
      });

      expect(invoice).not.toBeNull();
      expect(invoice?.invoiceNumber).toBe('INV-001');
      expect(invoice?.status).toBe('Draft');
      expect(result.current.leads[0].invoiceGenerated).toBe(true);
      expect(result.current.leads[0].status).toBe('Ready for CRM');
    });

    it('should return null when invoice already generated', async () => {
      const { result } = renderHook(() => useSalesStore());

      act(() => {
        result.current.leads = [
          {
            id: 'lead-invoiced',
            title: 'Existing Invoice',
            firstName: 'Existing',
            lastName: 'Invoice',
            email: '',
            phone: '',
            designation: '',
            company: '',
            industry: '',
            companySize: '',
            website: '',
            city: '',
            status: 'Ready for CRM',
            source: 'Organic',
            assignedTo: '',
            priority: 'Medium',
            budget: 50000,
            expectedCloseDate: '',
            probability: 50,
            interestedServices: [],
            notes: '',
            meetings: [],
            timeline: [],
            invoiceGenerated: true,
            invoiceId: 'inv-existing',
            createdAt: '',
            lastUpdated: '',
            followUpDate: '',
            deleted: false,
          },
        ];
      });

      let invoiceResult: any;
      await act(async () => {
        invoiceResult = await result.current.generateInvoice('lead-invoiced');
      });

      expect(invoiceResult).toBeNull();
    });
  });
});