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

## 📁 Project Structure

```
├── public/           # Static assets (images, icons)
│   └── images/      # All image assets
├── src/             # Source files
│   └── style.css    # Main stylesheet
├── index.html       # Main HTML file
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies and scripts
```

## 🛠️ Technologies

- **Vite** - Fast build tool and dev server
- **Vanilla HTML/CSS/JS** - Simple, lightweight approach
- **GitHub Actions** - Automated deployment to GitHub Pages

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
- 🎨 Modern CSS with custom properties
- 🚀 Optimized production builds
- 📦 Automatic asset optimization

## 🎯 Build Configuration

The Vite configuration includes:

- Optimized asset handling for images
- CSS bundling
- Production build optimization
- GitHub Pages deployment support
