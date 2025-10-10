import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    // Configuration for Node.js config files
    files: [
      "*.config.js",
      "vite.config.js",
      "vitest.config.js",
      "playwright.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    // Configuration for regular JS files (non-test)
    files: ["**/*.js"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "src/test/**/*.js",
      "e2e/**/*.js",
      "*.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        gtag: "readonly",
      },
    },
    rules: {
      // Customize rules as needed
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off", // Allow console.log for development
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    // Configuration for Playwright E2E test files
    files: ["e2e/**/*.js", "e2e/**/*.spec.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Playwright globals
        test: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      // Lenient rules for E2E tests
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      // Allow undefined globals in evaluate functions (browser context)
      "no-undef": "off",
    },
  },
  {
    // Configuration for test files
    files: ["src/test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        gtag: "readonly",
        global: "readonly",
        setTimeout: "readonly",

        // DOM globals for tests
        HTMLElement: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",

        // Vitest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      // More lenient rules for test files
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
    },
  },
];
