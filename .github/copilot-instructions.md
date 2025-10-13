# Copilot Instructions

This is a modern, responsive website built with Vite and vanilla HTML/CSS/JS. It features GDPR-compliant Google Analytics, dark mode theming, and comprehensive testing with Vitest and Playwright.

## Architecture & Key Patterns

### Single-Page Architecture with Vanilla JS

- **Main Files**: `index.html` (700 lines) contains all content and JavaScript inline
- **Styling**: `src/style.css` uses CSS custom properties (`--smooth-ease`, `--smooth-duration`) for consistent animations
- **Build Tool**: Vite with `@rollup/plugin-replace` for environment-specific GA tracking IDs

### Google Analytics Integration Pattern

- **Development Mode**: GA calls logged to console when `GA_MEASUREMENT_ID === "GA-DEVELOPMENT-MODE"`
- **Production**: Real GA script loaded only in production builds
- **Consent Mode v2**: GDPR-compliant with granular consent controls in `index.html` lines 1-80
- **Testing**: GA_MEASUREMENT_ID replaced with "GA-TEST-MODE" in tests via `vitest.config.js`

### Theme System Architecture

- **State Management**: Manual theme persistence via localStorage with system preference detection
- **Multi-Asset Updates**: Theme changes update GitHub icons, LinkedIn icons, and favicon simultaneously
- **Mobile Responsive**: Theme toggle button adapts styling for mobile viewports (<600px)

## Development Workflows

### Testing Strategy

```bash
npm test              # Unit tests with Vitest (watch mode)
npm run test:coverage # Generate coverage reports
npm run test:e2e      # Playwright E2E tests
npm run test:e2e:mobile # Mobile-specific E2E tests
```

### Key Testing Patterns

- **Unit Tests** (`src/test/*.test.js`): Use jsdom environment with global mocks in `setup.js`
- **E2E Tests** (`e2e/*.spec.js`): Include `handleCookieConsent()` helper for GDPR compliance testing
- **Mobile Testing**: Helper functions `ensureMobileMenuOpen()` and `clickMobileNavLink()` for responsive navigation

### Environment Configuration

- **Development**: `npm run dev` (port 3000, auto-open browser)
- **Production**: `npm run build` → `npm run preview` (port 4173)
- **Linting**: Combined CSS (`stylelint`) and JS (`eslint`) with `npm run lint`

## Project-Specific Conventions

### CSS Architecture

- **Mobile-First**: Single consolidated media query at `@media (max-width: 600px)`
- **Flexbox Navigation**: Desktop horizontal flex, mobile absolute positioning with hamburger menu
- **CSS Variables**: Use `var(--smooth-ease)` and `var(--smooth-duration)` for consistent animations

### File Organization

- **Static Assets**: All images in `/public/images/` with organized subdirectories (`large/`, `small/`, format-specific folders)
- **Tests**: Unit tests mirror main structure in `src/test/`, E2E tests in `e2e/`
- **Configuration**: Separate configs for Vite, Vitest, Playwright, and ESLint with environment-specific settings

### Development Conventions

- **GA Implementation**: Always test both development (logged) and production (tracked) modes
- **Responsive Testing**: Test both desktop and mobile navigation patterns
- **Theme Testing**: Verify all icon updates (GitHub, LinkedIn, favicon) change simultaneously
- **Cookie Consent**: Include GDPR testing in all E2E scenarios using provided helper functions

### Build & Deployment

- **GitHub Pages**: Automatic deployment via GitHub Actions on `main` branch pushes
- **Asset Optimization**: Images hashed and moved to `images/` directory during build
- **Base Path**: Set to `"./"` for subdirectory deployment compatibility
