import '@testing-library/jest-dom';

// Mock navigator APIs
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn()
});

// Mock IndexedDB
global.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn()
};

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(),
    addEventListener: vi.fn(),
    controller: null
  }
});

// Mock Web Audio API for Howler.js
global.AudioContext = vi.fn(() => ({
  createBuffer: vi.fn(),
  createBufferSource: vi.fn(),
  createGain: vi.fn(),
  destination: {},
  state: 'running',
  resume: vi.fn()
}));

global.webkitAudioContext = global.AudioContext;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to silence console.log during tests
  // log: vi.fn(),
  // error: vi.fn(),
  // warn: vi.fn()
};
