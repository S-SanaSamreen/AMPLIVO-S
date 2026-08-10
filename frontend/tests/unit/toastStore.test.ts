import { act, renderHook } from '@testing-library/react';
import { useToastStore } from '@/store/toastStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    const { result } = renderHook(() => useToastStore());
    act(() => {
      result.current.toasts.forEach((t) => {
        result.current.dismissToast(t.id);
      });
    });
    vi.useRealTimers();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToastStore());
    expect(result.current.toasts).toEqual([]);
  });

  it('should show a toast with info type by default', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('info');
    expect(result.current.toasts[0].id).toBeTruthy();
  });

  it('should show a toast with specified type', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Success!', 'success');
    });

    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should show an error toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Something went wrong', 'error');
    });

    expect(result.current.toasts[0].type).toBe('error');
  });

  it('should auto-dismiss toast after 4 seconds', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Auto-dismiss me');
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should dismiss toast before auto-dismiss timeout', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Dismissed early');
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should dismiss only the specified toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('First toast');
      result.current.showToast('Second toast');
    });

    expect(result.current.toasts).toHaveLength(2);

    const firstId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(firstId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Second toast');
  });

  it('should generate unique IDs for each toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
      result.current.showToast('Third');
    });

    const ids = result.current.toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('should not crash when dismissing non-existent toast ID', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.showToast('Only toast');
    });

    act(() => {
      result.current.dismissToast('non-existent-id');
    });

    expect(result.current.toasts).toHaveLength(1);
  });
});