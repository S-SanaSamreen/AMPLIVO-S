import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api/v1');

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}));

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

class FormDataMock {
  private data: Record<string, any> = {};
  append(key: string, value: any) {
    this.data[key] = value;
  }
  get(key: string) {
    return this.data[key];
  }
  getAll(key: string) {
    return Object.keys(this.data).filter(k => k === key).map(k => this.data[k]);
  }
  has(key: string) {
    return key in this.data;
  }
  delete(key: string) {
    delete this.data[key];
  }
}

globalThis.FormData = FormDataMock as any;