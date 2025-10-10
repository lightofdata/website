/**
 * Test setup file - runs before each test
 * Configures the DOM environment and global test utilities
 */

import { beforeEach, vi } from "vitest";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock localStorage for theme persistence tests
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Google Analytics gtag function
global.gtag = vi.fn();
global.dataLayer = [];

// Setup DOM before each test
beforeEach(() => {
  // Reset DOM
  document.head.innerHTML = "";
  document.body.innerHTML = "";

  // Reset mocks
  vi.clearAllMocks();

  // Reset global variables that might be set by the application
  delete window.GA_MEASUREMENT_ID;
  delete window.isProduction;
  delete window.isDevelopment;
  delete window.gtag_dev_mode;
});
