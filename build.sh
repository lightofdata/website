#!/bin/bash

# Build script for environment-specific deployment
# Usage: ./build.sh [environment]
# Example: ./build.sh prod

set -e

TARGET_ENVIRONMENT=${1:-dev}
BUILD_DIR="build"

echo "🏗️  Building for environment: $TARGET_ENVIRONMENT"

# Create build directory
mkdir -p "$BUILD_DIR"

# Load environment variables
if [ -f ".env.local" ]; then
    echo "📄 Loading .env.local"
    source .env.local
else
    echo "⚠️  Warning: .env.local not found, using defaults from .env.example"
fi

# Set tracking ID based on command line environment (not .env ENVIRONMENT)
case $TARGET_ENVIRONMENT in
    "dev"|"development")
        TRACKING_ID=${GA_TRACKING_ID_DEV:-"GA_DEV_NOT_SET"}
        echo "🧪 Using development tracking ID"
        ;;
    "staging"|"stage")
        TRACKING_ID=${GA_TRACKING_ID_STAGING:-"GA_STAGING_NOT_SET"}
        echo "🎭 Using staging tracking ID"
        ;;
    "prod"|"production")
        TRACKING_ID=${GA_TRACKING_ID_PROD:-"GA_PROD_NOT_SET"}
        echo "🚀 Using production tracking ID"
        ;;
    *)
        echo "❌ Unknown environment: $TARGET_ENVIRONMENT"
        echo "Valid environments: dev, staging, prod"
        exit 1
        ;;
esac

# Validate tracking ID
if [[ ! $TRACKING_ID =~ ^G-[A-Z0-9]+$ ]] && [[ ! $TRACKING_ID =~ GA_.*_NOT_SET ]]; then
    echo "❌ Invalid Google Analytics tracking ID format: $TRACKING_ID"
    echo "Expected format: G-XXXXXXXXXX"
    exit 1
fi

echo "🔧 Using tracking ID: $TRACKING_ID"

# Copy and process HTML file
echo "📝 Processing index.html..."
sed "s/{{GA_TRACKING_ID}}/$TRACKING_ID/g" index.html > "$BUILD_DIR/index.html"

# Copy static assets
echo "📦 Copying static assets..."
cp style.css "$BUILD_DIR/"
cp -r images/ "$BUILD_DIR/images/"
cp CNAME "$BUILD_DIR/" 2>/dev/null || echo "ℹ️  No CNAME file to copy"
cp README.md "$BUILD_DIR/" 2>/dev/null || echo "ℹ️  No README.md file to copy"

# Copy CodeQL queries if they exist
if [ -d "codeql-custom-queries-javascript" ]; then
    cp -r codeql-custom-queries-javascript/ "$BUILD_DIR/"
fi

echo "✅ Build completed successfully!"
echo "📂 Output directory: $BUILD_DIR"
echo ""
echo "🚀 Deployment commands:"
echo "  For GitHub Pages: cp -r $BUILD_DIR/* /path/to/gh-pages/branch/"
echo "  For other hosting: upload contents of $BUILD_DIR/ directory"

# Validate the build
echo ""
echo "🔍 Validating build..."
if grep -q "{{GA_TRACKING_ID}}" "$BUILD_DIR/index.html"; then
    echo "❌ Error: Placeholder not replaced in build output!"
    exit 1
else
    echo "✅ Build validation passed"
fi