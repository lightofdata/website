# Google Analytics & Cookie Consent Implementation

This project implements a GDPR-compliant Google Analytics setup with Google Consent Mode v2.

## 🛡️ GDPR Compliance Features

- **Google Consent Mode v2**: Full integration with consent management
- **Default Denial**: All optional cookies denied by default
- **Explicit Opt-in**: Users must actively consent to analytics tracking
- **Granular Control**: Separate controls for analytics and marketing cookies
- **Build-time injection**: Tracking ID injected securely during build

## 🔧 How It Works

### Development Mode

1. Vite replaces `__GA_MEASUREMENT_ID__` with `"GA-DEVELOPMENT-MODE"`
2. Google Analytics script is not loaded
3. All gtag calls are logged to console for debugging
4. Cookie consent dialog works for testing

### Production Mode

1. Vite replaces `__GA_MEASUREMENT_ID__` with real tracking ID `"G-CGZZ6MLGWX"`
2. Google Analytics script loads conditionally
3. Tracking respects user consent choices
4. Full analytics functionality enabled

## 🚀 Cookie Consent Flow

### Default State (GDPR Compliant)

```javascript
gtag("consent", "default", {
  analytics_storage: "denied", // ✅ Off by default
  ad_storage: "denied", // ✅ Off by default
  functionality_storage: "granted", // Essential
  security_storage: "granted", // Essential
});
```

### User Consent Update

```javascript
gtag("consent", "update", {
  analytics_storage: "granted", // Only after user opts in
  ad_storage: "granted", // Only after user opts in
});
```

## 📊 Build Process

```bash
npm run build  # Production build with real GA tracking ID
npm run dev    # Development with console logging only
npm run preview # Test production build locally
```

## 🔐 Security & Privacy Benefits

- **No tracking without consent**: Analytics disabled until user opts in
- **Secure credential handling**: No tracking ID in source code
- **Privacy-first approach**: GDPR compliant by design
- **Development safety**: No accidental tracking in dev mode
- **Error handling**: Graceful fallbacks for script loading failures

## 🎯 User Experience

1. **First Visit**: Cookie dialog appears, analytics OFF by default
2. **User Choice**: Can opt-in to analytics if desired
3. **Immediate Feedback**: Checkbox states update instantly when "Accept All" or "Reject All" is clicked
4. **Preference Storage**: Choices saved in localStorage
5. **Easy Management**: Footer button allows preference changes anytime
6. **Consistent UI**: Checkboxes always reflect current saved preferences when dialog reopens

## 🔍 Testing

### Development Testing

- Open browser console to see: `🔧 Development mode: Google Analytics calls will be logged to console`
- All gtag calls logged as: `📊 GA (dev): [arguments]`
- Cookie dialog fully functional for testing

### Production Testing

- Analytics only tracks after explicit user consent
- Check Network tab for GA requests only after consent
- Verify consent state updates properly
