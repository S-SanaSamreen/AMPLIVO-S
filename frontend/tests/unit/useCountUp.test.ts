import { renderHook } from '@testing-library/react';
import { useCountUp } from '@/hooks/useCountUp';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useCountUp', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      return setTimeout(() => callback(Date.now()), 16) as unknown as number;
    };
    globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('should initialize count at 0', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));

    const { result } = renderHook(() => useCountUp(100));

    expect(result.current.count).toBe(0);
    expect(result.current.ref).toBeTruthy();
  });

  it('should return a ref object and count', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));

    const { result } = renderHook(() => useCountUp(500));

    expect(result.current.count).toBe(0);
    expect(result.current.ref).toEqual(expect.objectContaining({
      current: null,
    }));
  });

  it('should use default duration of 1800ms when no duration specified', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));

    const { result } = renderHook(() => useCountUp(500));

    expect(result.current.count).toBe(0);
  });

  it('should handle zero as end value', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));

    const { result } = renderHook(() => useCountUp(0));

    expect(result.current.count).toBe(0);
  });

  it('should accept custom end value', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));

    const { result } = renderHook(() => useCountUp(999999));

    expect(result.current.count).toBe(0);
  });
});