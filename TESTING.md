# Testing Guide for Light of Data Website

This document provides comprehensive information about the testing setup and practices for the Light of Data website.

## 🧪 Testing Framework

The project uses **Vitest** as the primary testing framework, chosen for its excellent integration with Vite and modern JavaScript features.

### Testing Stack

- **Vitest** - Fast, Vite-native test runner
- **jsdom** - DOM implementation for Node.js testing
- **@testing-library/dom** - Simple and complete DOM testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@vitest/coverage-v8** - Code coverage reports

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once and exit
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
src/test/
├── setup.js              # Test configuration and global mocks
├── analytics.test.js      # Google Analytics & GDPR consent tests
├── theme.test.js          # Dark/light mode functionality tests
├── navigation.test.js     # Mobile navigation and scrolling tests
├── cookie-consent.test.js # Cookie consent dialog tests
├── css.test.js           # CSS classes and styling tests
└── integration.test.js    # End-to-end workflow tests
```

## 📋 Test Categories

### 1. Analytics & GDPR Tests (`analytics.test.js`)

Tests the Google Analytics integration and GDPR compliance features:

**Environment Detection**

- ✅ Development mode detection
- ✅ Production mode detection
- ✅ Development logging setup

**GDPR Consent Management**

- ✅ Default GDPR-compliant consent state
- ✅ Analytics configuration with proper settings
- ✅ Consent updates when user accepts

**Script Loading**

- ✅ GA script loading behavior in different environments
- ✅ Error handling for script loading failures
- ✅ Successful script loading callbacks

### 2. Theme Functionality Tests (`theme.test.js`)

Tests the dark/light mode toggle and icon updates:

**Icon Updates**

- ✅ GitHub icon updates for dark/light themes
- ✅ LinkedIn icon updates for dark/light themes
- ✅ Head icon updates with version parameters
- ✅ Graceful handling of missing icons

**Theme Management**

- ✅ Data-theme attribute setting on document element
- ✅ Complete icon updates during theme changes
- ✅ Manual vs automatic theme setting behavior

**Theme Toggle**

- ✅ Light to dark theme switching
- ✅ Dark to light theme switching
- ✅ Null theme attribute handling
- ✅ Proper setTheme function calls

**System Theme Detection**

- ✅ Dark system preference detection
- ✅ Light system preference detection
- ✅ System theme change listener setup

### 3. Navigation Tests (`navigation.test.js`)

Tests the mobile navigation menu and smooth scrolling:

**Menu Toggle Functionality**

- ✅ Menu open/close state management
- ✅ Hamburger button active state
- ✅ Accessibility attributes

**Navigation Links**

- ✅ Menu closes when navigation links are clicked
- ✅ Default link behavior prevention
- ✅ Smooth scrolling to correct positions
- ✅ Minimum scroll position handling
- ✅ Missing target element handling

**Logo Navigation**

- ✅ Scroll to top functionality
- ✅ Logo link behavior prevention
- ✅ Missing logo graceful handling

**Responsive Design**

- ✅ Correct navigation structure
- ✅ Required navigation items
- ✅ Menu icon display

### 4. Cookie Consent Tests (`cookie-consent.test.js`)

Tests the GDPR-compliant cookie consent system:

**Preference Storage**

- ✅ Consent preferences saving and retrieval
- ✅ Invalid preference handling
- ✅ Version compatibility checking
- ✅ Valid/invalid consent detection

**UI Management**

- ✅ Checkbox state updates
- ✅ GDPR-compliant default state (all optional cookies off)
- ✅ Stored preferences application to UI

**Dialog Management**

- ✅ Cookie dialog show/hide functionality
- ✅ Focus management for accessibility
- ✅ Dialog state persistence

**Button Event Handlers**

- ✅ Accept All button behavior
- ✅ Reject All button behavior
- ✅ Accept Selected button behavior
- ✅ Close button functionality
- ✅ Preferences button functionality
- ✅ Outside click handling

**Keyboard Accessibility**

- ✅ Escape key dialog closing
- ✅ Selective key response

**Google Analytics Integration**

- ✅ Consent updates to GA
- ✅ gtag function availability handling

**Error Handling**

- ✅ localStorage error recovery
- ✅ Missing DOM element handling

### 5. CSS and Styling Tests (`css.test.js`)

Tests CSS class application and styling behavior:

**CSS Class Management**

- ✅ Initial CSS class application
- ✅ Dynamic class addition/removal
- ✅ Class toggling functionality

**Theme Styling**

- ✅ Dark theme data attribute application
- ✅ Theme transition handling
- ✅ CSS custom properties maintenance

**Responsive Design**

- ✅ Mobile-specific class availability
- ✅ Viewport-dependent style support
- ✅ Animation class support

**Form and Input Styling**

- ✅ Checkbox styling classes
- ✅ Form state changes
- ✅ Focus and interaction classes

**Layout and Positioning**

- ✅ DOM structure for CSS
- ✅ Overlay positioning
- ✅ Z-index layering

**Accessibility CSS Support**

- ✅ Focus indicators
- ✅ Screen reader classes
- ✅ ARIA attributes with styling

### 6. Integration Tests (`integration.test.js`)

Tests complete user workflows and component interactions:

**Complete User Workflows**

- ✅ Cookie consent workflow
- ✅ Navigation and theme switching together
- ✅ Smooth scrolling navigation workflow
- ✅ Responsive behavior and accessibility
- ✅ State consistency across interactions

**Error Handling and Edge Cases**

- ✅ Missing DOM element handling
- ✅ Rapid interaction handling
- ✅ Various screen size functionality

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.js`)

```javascript
export default defineConfig({
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __GA_MEASUREMENT_ID__: "GA-TEST-MODE",
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "src/test/**", "*.config.js"],
    },
  },
});
```

### Test Setup (`src/test/setup.js`)

The setup file configures:

- **Console mocking** - Prevents test noise
- **localStorage mocking** - For preference persistence tests
- **matchMedia mocking** - For responsive design tests
- **Google Analytics mocking** - For analytics tests
- **DOM reset** - Clean state between tests

## 📊 Test Coverage

The project achieves comprehensive test coverage across:

- **JavaScript functionality**: 100% of client-side functions tested
- **DOM interactions**: All user interactions covered
- **Error scenarios**: Edge cases and error handling tested
- **Accessibility**: Focus management and ARIA attributes tested
- **Responsive behavior**: Mobile and desktop interactions tested

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal output**: Quick overview during test runs
- **HTML report**: Detailed visual coverage report in `coverage/index.html`
- **JSON report**: Machine-readable coverage data in `coverage/coverage-final.json`

## 🛠️ Development Workflow

### Adding New Tests

1. **Create test file** in `src/test/` directory
2. **Import required utilities**:
   ```javascript
   import { describe, it, expect, vi, beforeEach } from "vitest";
   import { fireEvent, waitFor } from "@testing-library/dom";
   ```
3. **Setup DOM structure** in `beforeEach`
4. **Write descriptive test cases** with clear assertions
5. **Run tests** to verify functionality

### Test Best Practices

- **Descriptive test names**: Clear, action-oriented descriptions
- **Arrange-Act-Assert pattern**: Clear test structure
- **Mock external dependencies**: localStorage, gtag, etc.
- **Test both success and failure paths**: Happy path and edge cases
- **Clean setup/teardown**: Reset state between tests
- **Accessibility testing**: Include ARIA and keyboard navigation tests

### Debugging Tests

```bash
# Run specific test file
npx vitest src/test/analytics.test.js

# Run tests matching pattern
npx vitest --run --reporter=verbose cookie

# Debug with browser tools
npm run test:ui
```

## 🚦 Continuous Integration

Tests run automatically in GitHub Actions:

- **On pull requests**: All tests must pass
- **On push to main**: Full test suite with coverage
- **Fast feedback**: Tests complete in under 1 minute

### CI Configuration

```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## 📖 Testing Philosophy

### Why These Tests Matter

1. **User Experience**: Ensures all interactions work as expected
2. **GDPR Compliance**: Verifies privacy requirements are met
3. **Accessibility**: Confirms the site works for all users
4. **Reliability**: Catches regressions before deployment
5. **Documentation**: Tests serve as living documentation

### Test-Driven Benefits

- **Confidence in changes**: Safe refactoring and feature additions
- **Bug prevention**: Issues caught early in development
- **Design validation**: Tests verify intended behavior
- **Regression protection**: Existing functionality remains intact

## 🎯 Future Testing Considerations

### Potential Enhancements

- **Visual regression testing**: Screenshot comparisons
- **Performance testing**: Core Web Vitals monitoring
- **E2E testing**: Full browser automation with Playwright
- **Mobile device testing**: Real device testing scenarios

### Monitoring and Metrics

- **Test execution time**: Keep tests fast (<1 minute total)
- **Test reliability**: Minimize flaky tests
- **Coverage trends**: Maintain high coverage as code grows
- **Test maintenance**: Regular review and updates

---

## 🏃‍♂️ Quick Reference

| Command                 | Purpose                  |
| ----------------------- | ------------------------ |
| `npm test`              | Run tests in watch mode  |
| `npm run test:run`      | Run tests once           |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ui`       | Open test UI interface   |

For questions or contributions to the testing setup, please refer to the main [README.md](../README.md) or open an issue.

**Last updated**: December 2024
