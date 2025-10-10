# Light of Data Website

A modern, responsive website for Light of Data built with Vite for fast development and optimized builds.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm

### Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

   This will start the Vite development server at `http://localhost:3000` with hot module replacement.

3. **Build for production**

   ```bash
   npm run build
   ```

   Builds the app for production to the `dist` folder.

4. **Preview production build**

   ```bash
   npm run preview
   ```

   Locally preview the production build.

5. **Run tests**

   ```bash
   npm test
   ```

   Run the comprehensive test suite in watch mode.

6. **Generate test coverage**
   ```bash
   npm run test:coverage
   ```
   Generate detailed test coverage reports.

## 📁 Project Structure

```
├── public/           # Static assets (images, icons)
│   └── images/      # All image assets
├── src/             # Source files
│   ├── style.css    # Main stylesheet
│   └── test/        # Test files
│       ├── setup.js               # Test configuration
│       ├── analytics.test.js      # Google Analytics tests
│       ├── theme.test.js          # Dark mode tests
│       ├── navigation.test.js     # Navigation tests
│       ├── cookie-consent.test.js # Cookie consent tests
│       ├── css.test.js           # CSS/styling tests
│       └── integration.test.js    # End-to-end tests
├── index.html       # Main HTML file
├── vite.config.js   # Vite configuration
├── vitest.config.js # Testing configuration
├── TESTING.md       # Comprehensive testing guide
└── package.json     # Dependencies and scripts
```

## 🛠️ Technologies

- **Vite** - Fast build tool and dev server
- **Vanilla HTML/CSS/JS** - Simple, lightweight approach
- **Google Consent Mode v2** - GDPR-compliant analytics tracking
- **GitHub Actions** - Automated deployment to GitHub Pages
- **Vitest** - Fast, modern testing framework
- **jsdom** - DOM testing environment
- **@testing-library** - Testing utilities for DOM interactions

## 🚢 Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

### Manual Deployment

```bash
npm run deploy
```

## ✨ Features

- ⚡ Fast development with Vite HMR
- 📱 Responsive design
- 🌙 Dark/light mode toggle
- 🍪 **GDPR-compliant cookie consent dialog**
- 🛡️ **Google Consent Mode v2 integration**
- 🎨 Modern CSS with custom properties
- 🚀 Optimized production builds
- 📦 Automatic asset optimization
- ♿ Full accessibility support (ARIA labels, keyboard navigation)
- 🧪 **Comprehensive test suite with 92 tests**
- 📊 **Test coverage reporting**
- 🔄 **Continuous integration with GitHub Actions**

## 🍪 Cookie Consent & Privacy

This website implements a comprehensive GDPR-compliant cookie consent system:

### Features

- **GDPR Compliant**: All optional cookies are disabled by default
- **Google Consent Mode v2**: Integrated with Google Analytics
- **Granular Control**: Users can choose which cookie categories to enable
- **Persistent Preferences**: Choices are saved in localStorage
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works seamlessly on all devices

### Cookie Categories

- **Essential**: Always active (functionality, security)
- **Analytics**: Google Analytics tracking (opt-in required)
- **Marketing**: Advertisement cookies (opt-in required)

### Development vs Production

- **Development**: Console logging instead of actual tracking
- **Production**: Full Google Analytics integration with consent respect

### User Control

Users can manage their cookie preferences at any time via the "🍪 Cookie Preferences" button in the footer.

## 🧪 Testing

This project includes a comprehensive test suite with **92 tests** covering:

- **Google Analytics integration** - GDPR compliance and environment detection
- **Theme functionality** - Dark/light mode switching and icon updates
- **Navigation system** - Mobile menu and smooth scrolling
- **Cookie consent** - GDPR-compliant preference management
- **CSS and styling** - Responsive design and accessibility
- **Integration workflows** - Complete user interaction scenarios

### Quick Test Commands

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Generate coverage report
npm run test:ui       # Open test UI interface
```

For detailed testing information, see [TESTING.md](TESTING.md).

## 🎯 Build Configuration

The Vite configuration includes:

- Optimized asset handling for images
- CSS bundling
- Production build optimization
- GitHub Pages deployment support
- Environment-based Google Analytics configuration
- Testing framework integration
