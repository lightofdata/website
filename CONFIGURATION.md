# Environment Configuration Guide

This project uses environment-based configuration to manage Google Analytics tracking IDs securely across different deployment environments.

## Quick Setup

1. **Copy the environment template:**

   ```bash
   npm run setup:env
   # OR manually: cp .env.example .env.local
   ```

2. **Edit `.env.local` with your tracking IDs:**

   ```bash
   GA_TRACKING_ID_DEV=G-YOUR-DEV-ID
   GA_TRACKING_ID_STAGING=G-YOUR-STAGING-ID
   GA_TRACKING_ID_PROD=G-YOUR-PRODUCTION-ID
   ```

3. **Build for your target environment:**
   ```bash
   npm run build:dev      # Development
   npm run build:staging  # Staging
   npm run build:prod     # Production
   ```

## Environment Variables

| Variable                 | Description                     | Example        |
| ------------------------ | ------------------------------- | -------------- |
| `GA_TRACKING_ID_DEV`     | Development Google Analytics ID | `G-XXXXXXXXXX` |
| `GA_TRACKING_ID_STAGING` | Staging Google Analytics ID     | `G-YYYYYYYYYY` |
| `GA_TRACKING_ID_PROD`    | Production Google Analytics ID  | `G-ZZZZZZZZZZ` |

## Build Process

The build system automatically:

- ✅ Replaces `{{GA_TRACKING_ID}}` placeholders with environment-specific IDs
- ✅ Validates tracking ID format (G-XXXXXXXXXX)
- ✅ Creates a `build/` directory with processed files
- ✅ Copies all static assets (CSS, images, etc.)

## Security Benefits

- 🔒 **No hardcoded production IDs** in source control
- 🔒 **Environment separation** - different tracking for dev/staging/prod
- 🔒 **CI/CD safety** - test environments don't pollute production analytics
- 🔒 **Team collaboration** - each developer can use their own dev tracking ID

## Available Scripts

```bash
npm run build           # Build with default environment (dev)
npm run build:dev       # Build for development
npm run build:staging   # Build for staging
npm run build:prod      # Build for production
npm run serve           # Serve source files locally
npm run serve:build     # Serve built files locally
npm run validate        # Run HTML and CSS validation
npm run clean           # Clean build directory
```

## Deployment

### Production Deployment

```bash
npm run build:prod
# Upload contents of build/ directory to your hosting provider
```

### GitHub Pages Deployment

```bash
npm run build:prod
cp -r build/* /path/to/gh-pages-branch/
```

## Troubleshooting

### "Tracking ID not set" Error

- Ensure `.env.local` exists and contains the required variables
- Check that variable names match exactly (case-sensitive)
- Verify tracking ID format: `G-XXXXXXXXXX`

### "Placeholder not replaced" Error

- Check that `.env.local` is properly formatted
- Ensure the build script has execute permissions: `chmod +x build.sh`
- Verify the environment parameter is correct: `dev`, `staging`, or `prod`
