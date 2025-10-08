/// <reference types="vitest" />
import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";

export default defineConfig({
  // Include the same plugins as main vite config for consistent behavior
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __GA_MEASUREMENT_ID__: "GA-TEST-MODE",
      },
    }),
  ],
  test: {
    // Use jsdom environment for DOM testing
    environment: "jsdom",

    // Setup files to run before each test
    setupFiles: ["./src/test/setup.js"],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "src/test/**", "*.config.js", "*.config.ts"],
    },

    // Include files pattern
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // Exclude files pattern
    exclude: ["node_modules", "dist", ".git", ".cache"],
  },
});
