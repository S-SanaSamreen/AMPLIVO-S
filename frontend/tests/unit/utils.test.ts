import {
  cn,
  formatINR,
  truncate,
  getInitials,
  getEffectiveMeetingStatus,
  isMeetingUpcoming,
  statusColors,
} from '@/lib/utils';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('utils - cn (className combiner)', () => {
  it('should join truthy class names with spaces', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter out falsy values (undefined, false, null)', () => {
    expect(cn('foo', undefined, false, 'bar', null)).toBe('foo bar');
  });

  it('should return empty string for empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle all falsy inputs', () => {
    expect(cn(undefined, false, null, '')).toBe('');
  });

  it('should preserve string values', () => {
    expect(cn('class-a', 'class-b', 'class-c')).toBe('class-a class-b class-c');
  });
});

describe('utils - formatINR', () => {
  it('should format small amounts with ₹ and comma grouping', () => {
    expect(formatINR(500)).toBe('₹500');
  });

  it('should format thousands with K suffix', () => {
    expect(formatINR(1500)).toBe('₹1.5K');
  });

  it('should format 1000 with K suffix', () => {
    expect(formatINR(1000)).toBe('₹1.0K');
  });

  it('should format lakhs with L suffix', () => {
    expect(formatINR(150000)).toBe('₹1.5L');
  });

  it('should format 100000 with L suffix', () => {
    expect(formatINR(100000)).toBe('₹1.0L');
  });

  it('should format crores with Cr suffix', () => {
    expect(formatINR(15000000)).toBe('₹1.5Cr');
  });

  it('should format 10000000 with Cr suffix', () => {
    expect(formatINR(10000000)).toBe('₹1.0Cr');
  });

  it('should format amounts just under 1000 with commas', () => {
    expect(formatINR(999)).toBe('₹999');
  });

  it('should format amounts just under 100000 with K boundary check', () => {
    expect(formatINR(99999)).toBe('₹100.0K');
  });

  it('should handle zero', () => {
    expect(formatINR(0)).toBe('₹0');
  });
});

describe('utils - truncate', () => {
  it('should return text as-is if under maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should return text as-is if equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should truncate text with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(truncate('hello', 0)).toBe('…');
  });
});

describe('utils - getInitials', () => {
  it('should return first and last initial for full name', () => {
    expect(getInitials('Rajesh Kumar')).toBe('RK');
  });

  it('should return first two chars for single word name', () => {
    expect(getInitials('Rajesh')).toBe('RA');
  });

  it('should handle names with multiple spaces', () => {
    expect(getInitials('John  David  Smith')).toBe('JS');
  });

  it('should return "EP" for null name', () => {
    expect(getInitials(null)).toBe('EP');
  });

  it('should return "EP" for undefined name', () => {
    expect(getInitials(undefined)).toBe('EP');
  });

  it('should return "EP" for empty string', () => {
    expect(getInitials('')).toBe('EP');
  });

  it('should return "EP" for whitespace-only string', () => {
    expect(getInitials('   ')).toBe('EP');
  });

  it('should handle three name parts', () => {
    expect(getInitials('John David Smith')).toBe('JS');
  });
});

describe('utils - getEffectiveMeetingStatus', () => {
  const realNow = Date.now;

  afterEach(() => {
    Date.now = realNow;
  });

  it('should return original status when not Scheduled', () => {
    const meeting = { date: '2025-01-01', time: '10:00', status: 'Completed' };
    expect(getEffectiveMeetingStatus(meeting)).toBe('Completed');
  });

  it('should return "No-Show" when Scheduled meeting time is in the past', () => {
    Date.now = vi.fn(() => new Date('2025-06-01T12:00:00Z').getTime());

    const meeting = {
      date: '2025-05-01',
      time: '10:00',
      status: 'Scheduled',
    };

    expect(getEffectiveMeetingStatus(meeting)).toBe('No-Show');
  });

  it('should return "Scheduled" when meeting time is in the future', () => {
    Date.now = vi.fn(() => new Date('2025-01-01T00:00:00Z').getTime());

    const meeting = {
      date: '2025-06-01',
      time: '10:00',
      status: 'Scheduled',
    };

    expect(getEffectiveMeetingStatus(meeting)).toBe('Scheduled');
  });

  it('should return original status when meeting has invalid date', () => {
    const meeting = {
      date: 'invalid-date',
      time: '10:00',
      status: 'Scheduled',
    };

    expect(getEffectiveMeetingStatus(meeting)).toBe('Scheduled');
  });
});

describe('utils - isMeetingUpcoming', () => {
  const realNow = Date.now;

  afterEach(() => {
    Date.now = realNow;
  });

  it('should return true for upcoming Scheduled meeting', () => {
    Date.now = vi.fn(() => new Date('2025-01-01T00:00:00Z').getTime());

    const meeting = {
      date: '2025-06-01',
      time: '10:00',
      status: 'Scheduled',
    };

    expect(isMeetingUpcoming(meeting)).toBe(true);
  });

  it('should return false for past Scheduled meeting', () => {
    Date.now = vi.fn(() => new Date('2025-06-01T12:00:00Z').getTime());

    const meeting = {
      date: '2025-05-01',
      time: '10:00',
      status: 'Scheduled',
    };

    expect(isMeetingUpcoming(meeting)).toBe(false);
  });

  it('should return false for non-Scheduled status', () => {
    const meeting = {
      date: '2025-06-01',
      time: '10:00',
      status: 'Completed',
    };

    expect(isMeetingUpcoming(meeting)).toBe(false);
  });
});

describe('utils - statusColors', () => {
  it('should have color mappings for all common statuses', () => {
    expect(statusColors.Active).toBeTruthy();
    expect(statusColors.Completed).toBeTruthy();
    expect(statusColors.Pending).toBeTruthy();
    expect(statusColors.Paid).toBeTruthy();
    expect(statusColors.Won).toBeTruthy();
    expect(statusColors.Draft).toBeTruthy();
  });

  it('should have case-sensitive status keys', () => {
    expect(statusColors['In Campaign']).toBeTruthy();
    expect(statusColors['In Progress']).toBeTruthy();
    expect(statusColors['On Leave']).toBeTruthy();
    expect(statusColors['Ready for CRM']).toBeTruthy();
  });

  it('should have both lowercase and uppercase variants for some statuses', () => {
    expect(statusColors.open).toBeTruthy();
    expect(statusColors.OPEN).toBeTruthy();
    expect(statusColors.resolved).toBeTruthy();
    expect(statusColors.RESOLVED).toBeTruthy();
  });
});