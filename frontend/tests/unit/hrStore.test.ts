import { renderHook, act } from '@testing-library/react';
import { useHrStore } from '@/store/hrStore';
import { careersService } from '@/services/moduleServices';
import { userManagementService } from '@/services/crmService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/moduleServices');
vi.mock('@/services/crmService');

describe('hrStore', () => {
  const initialJobsLength = useHrStore.getState().jobs.length;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty arrays and not loading', () => {
      const { result } = renderHook(() => useHrStore());
      const state = result.current;
      expect(state.isLoading).toBe(false);
      expect(state.dataLoaded).toBe(false);
      expect(typeof state.addJob).toBe('function');
      expect(typeof state.fetchAllData).toBe('function');
    });
  });

  describe('fetchDepartments', () => {
    it('should fetch departments successfully', async () => {
      vi.mocked(userManagementService.getDepartments).mockResolvedValueOnce({
        items: [
          { id: 'dept-1', name: 'Engineering' },
          { id: 'dept-2', name: 'Marketing' },
        ],
      });

      const { result } = renderHook(() => useHrStore());

      await act(async () => {
        await result.current.fetchDepartments();
      });

      expect(result.current.departments).toHaveLength(2);
      expect(result.current.departments[0].id).toBe('dept-1');
      expect(result.current.departments[0].name).toBe('Engineering');
    });

    it('should not throw on fetch error', async () => {
      vi.mocked(userManagementService.getDepartments).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useHrStore());

      await expect(result.current.fetchDepartments()).resolves.not.toThrow();
    });
  });

  describe('fetchJobs', () => {
    it('should fetch jobs successfully', async () => {
      vi.mocked(userManagementService.getDepartments).mockResolvedValueOnce({
        items: [{ id: 'dept-1', name: 'Engineering' }],
      });

      vi.mocked(careersService.getJobs).mockResolvedValueOnce({
        items: [
          {
            id: 'job-1',
            title: 'Senior Developer',
            department_id: 'dept-1',
            employment_type: 'full_time',
            status: 'published',
            experience_level: 'Senior',
            location: 'Remote',
            work_mode: 'remote',
            salary_range: '$100k-$150k',
            vacancies: 2,
            skills_required: ['React', 'TypeScript'],
            responsibilities: ['Build apps'],
            benefits: ['Health insurance'],
            description: 'Senior role',
            application_deadline: '2025-12-31',
            posted_at: '2025-01-01',
            created_at: '2025-01-01',
            updated_at: '2025-01-01',
          },
        ],
      });

      const { result } = renderHook(() => useHrStore());

      await act(async () => {
        await result.current.fetchDepartments();
        await result.current.fetchJobs();
      });

      expect(result.current.jobs.some(j => j.title === 'Senior Developer')).toBe(true);
      expect(result.current.jobs.some(j => j.department === 'Engineering')).toBe(true);
    });
  });

  describe('addJob', () => {
    it('should add job to the list', () => {
      const { result } = renderHook(() => useHrStore());
      const jobsBefore = result.current.jobs.length;

      act(() => {
        result.current.addJob({
          id: 'job-new-unique',
          title: 'New Position',
          department: 'Unassigned',
          serviceCategory: '',
          employmentType: 'Full-time',
          experienceLevel: 'Mid',
          location: 'Remote',
          workMode: 'On-site',
          salaryRange: '$80k-$100k',
          vacancies: 1,
          skillsRequired: [],
          responsibilities: [],
          requirements: [],
          benefits: [],
          description: '',
          applicationDeadline: '',
          status: 'Draft',
          postedDate: '',
        });
      });

      expect(result.current.jobs.length).toBe(jobsBefore + 1);
      expect(result.current.jobs.some(j => j.id === 'job-new-unique' && j.title === 'New Position')).toBe(true);
    });
  });

  describe('updateJob', () => {
    it('should update job in the list', () => {
      const { result } = renderHook(() => useHrStore());

      act(() => {
        result.current.addJob({
          id: 'job-update-test', title: 'Old Title', department: 'Engineering', serviceCategory: '',
          employmentType: 'Full-time', experienceLevel: 'Mid', location: 'Remote',
          workMode: 'On-site', salaryRange: '$80k', vacancies: 1,
          skillsRequired: [], responsibilities: [], requirements: [],
          benefits: [], description: '', applicationDeadline: '',
          status: 'Draft', postedDate: '',
        });
      });

      act(() => {
        result.current.updateJob('job-update-test', { title: 'Updated Title', status: 'Published' });
      });

      const updatedJob = result.current.jobs.find(j => j.id === 'job-update-test');
      expect(updatedJob?.title).toBe('Updated Title');
      expect(updatedJob?.status).toBe('Published');
    });
  });

  describe('deleteJob', () => {
    it('should remove job from the list', () => {
      const { result } = renderHook(() => useHrStore());

      act(() => {
        result.current.addJob({
          id: 'job-delete-test', title: 'To Delete', department: '', serviceCategory: '',
          employmentType: 'Full-time', experienceLevel: '', location: '',
          workMode: 'On-site', salaryRange: '', vacancies: 1,
          skillsRequired: [], responsibilities: [], requirements: [],
          benefits: [], description: '', applicationDeadline: '',
          status: 'Draft', postedDate: '',
        });
      });

      const jobsBefore = result.current.jobs.length;

      act(() => {
        result.current.deleteJob('job-delete-test');
      });

      expect(result.current.jobs.length).toBe(jobsBefore - 1);
      expect(result.current.jobs.some(j => j.id === 'job-delete-test')).toBe(false);
    });
  });

  describe('addApplication', () => {
    it('should add application to the list', () => {
      const { result } = renderHook(() => useHrStore());

      act(() => {
        result.current.addApplication({
          id: 'app-add-test',
          jobId: 'job-1',
          jobTitle: 'Developer',
          department: 'Engineering',
          location: 'Remote',
          candidateName: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          experience: '',
          skills: ['React'],
          appliedDate: '2025-01-01',
          status: 'New' as const,
          notes: '',
          education: [],
          workHistory: [],
        });
      });

      expect(result.current.applications.some(a => a.id === 'app-add-test')).toBe(true);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status', () => {
      const { result } = renderHook(() => useHrStore());

      act(() => {
        result.current.addApplication({
          id: 'app-status-test',
          jobId: 'job-1',
          jobTitle: 'Developer',
          department: 'Engineering',
          location: 'Remote',
          candidateName: 'John Doe',
          email: 'john@example.com',
          phone: '',
          experience: '',
          skills: [],
          appliedDate: '2025-01-01',
          status: 'New' as const,
          notes: '',
          education: [],
          workHistory: [],
        });
      });

      act(() => {
        result.current.updateApplicationStatus('app-status-test', 'Shortlisted');
      });

      const updatedApp = result.current.applications.find(a => a.id === 'app-status-test');
      expect(updatedApp?.status).toBe('Shortlisted');
    });
  });

  describe('fetchAllData', () => {
    it('should set dataLoaded to true on success', async () => {
      vi.mocked(userManagementService.getDepartments).mockResolvedValueOnce({ items: [] });
      vi.mocked(careersService.getJobs).mockResolvedValueOnce({ items: [] });
      vi.mocked(careersService.getAllApplications).mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() => useHrStore());

      await act(async () => {
        await result.current.fetchAllData();
      });

      expect(result.current.dataLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading to false on error', async () => {
      vi.mocked(userManagementService.getDepartments).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useHrStore());

      await act(async () => {
        await result.current.fetchAllData();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
