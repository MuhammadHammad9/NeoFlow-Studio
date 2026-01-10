import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock AudioContext
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createBufferSource: vi.fn().mockReturnValue({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      playbackRate: { value: 1 },
      detune: { value: 0 },
    }),
    createBuffer: vi.fn().mockReturnValue({
      getChannelData: vi.fn().mockReturnValue(new Float32Array(1024)),
      duration: 1,
    }),
    destination: {},
    currentTime: 0,
  })),
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn(),
      }],
    }),
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock FileReader - using a simple object approach
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onabort: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadstart: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onprogress: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  
  readAsDataURL(_blob: Blob) {
    this.result = 'data:text/plain;base64,dGVzdA==';
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  readAsText(_blob: Blob) {
    this.result = 'test content';
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  readAsArrayBuffer(_blob: Blob) {
    this.result = new ArrayBuffer(10);
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  readAsBinaryString(_blob: Blob) {
    this.result = 'binary string';
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return false; }
  
  EMPTY = 0;
  LOADING = 1;
  DONE = 2;
}

// Use Object.defineProperty for cleaner FileReader mock
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: MockFileReader,
});
