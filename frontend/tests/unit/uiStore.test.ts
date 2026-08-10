import { renderHook, act } from '@testing-library/react';
import { useUiStore } from '@/store/uiStore';
import { describe, it, expect } from 'vitest';

describe('uiStore', () => {
  it('should initialize with sidebar closed', () => {
    const { result } = renderHook(() => useUiStore());
    expect(result.current.isSidebarOpen).toBe(false);
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useUiStore());

    expect(result.current.isSidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isSidebarOpen).toBe(false);
  });

  it('should set sidebar open', () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.isSidebarOpen).toBe(true);
  });

  it('should set sidebar closed', () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
      result.current.setSidebarOpen(false);
    });

    expect(result.current.isSidebarOpen).toBe(false);
  });

  it('should toggle from any state', () => {
    const { result } = renderHook(() => useUiStore());

    act(() => result.current.setSidebarOpen(true));
    expect(result.current.isSidebarOpen).toBe(true);

    act(() => result.current.toggleSidebar());
    expect(result.current.isSidebarOpen).toBe(false);

    act(() => result.current.toggleSidebar());
    expect(result.current.isSidebarOpen).toBe(true);
  });
});