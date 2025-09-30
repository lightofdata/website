# Google Analytics Implementation

This project implements Google Analytics using a secure, build-time injection approach.

## Security Features

- **Build-time injection**: The Google Analytics tracking ID is injected during the build process, not exposed in source code
- **Environment variable protection**: The tracking ID is stored in `.env` files that are gitignored

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_GA_MEASUREMENT_ID=G-CGZZ6MLGWX
```

## How It Works

1. The Vite build process uses `@rollup/plugin-replace` to replace `__GA_MEASUREMENT_ID__` placeholders
2. Environment variables are loaded securely using Vite's `loadEnv` function
3. The tracking ID is injected only during build, never exposed in source code
4. CSP headers ensure only trusted Google Analytics domains can execute scripts

## Build Process

```bash
npm run build  # Injects GA tracking ID and builds for production
npm run dev    # Development server with GA tracking enabled
```

## Security Benefits

- No tracking ID exposed in source code or version control
- Build-time injection prevents credential leakage
- CSP headers provide additional security layer
- Environment variables are properly secured and gitignored
