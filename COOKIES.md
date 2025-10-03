# Cookie Policy & Implementation Guide

This document provides detailed information about how cookies are handled on the Light of Data website.

## 🍪 Cookie Categories

### Essential Cookies

- **Purpose**: Website functionality and security
- **Default State**: Always enabled
- **User Control**: Cannot be disabled
- **Examples**: Session management, security tokens

### Analytics Cookies

- **Purpose**: Understanding website usage and performance
- **Default State**: Disabled (GDPR compliant)
- **User Control**: Can be enabled/disabled by user
- **Provider**: Google Analytics
- **Data**: Anonymized visitor behavior, page views, traffic sources

### Marketing Cookies

- **Purpose**: Advertising and campaign tracking
- **Default State**: Disabled (GDPR compliant)
- **User Control**: Can be enabled/disabled by user
- **Provider**: Various advertising platforms
- **Data**: Ad preferences, campaign effectiveness

## 🛡️ GDPR Compliance

Our implementation follows strict GDPR requirements:

### Consent Requirements Met

- ✅ **Explicit Consent**: Users must actively opt-in
- ✅ **Informed Consent**: Clear descriptions of cookie purposes
- ✅ **Granular Control**: Separate choices for each category
- ✅ **Withdrawal Rights**: Easy to change preferences anytime
- ✅ **Default Denial**: Optional cookies off by default

### Technical Implementation

- ✅ **Google Consent Mode v2**: Industry standard implementation
- ✅ **localStorage**: Secure preference storage
- ✅ **Version Control**: Future-proof preference management
- ✅ **Error Handling**: Graceful fallbacks for storage issues

## 🔧 Technical Details

### Cookie Consent Dialog

- **Trigger**: Appears automatically for new visitors
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive**: Works on all device sizes
- **Themes**: Supports dark/light mode
- **Location**: Accessible via footer button anytime

### Data Storage

```javascript
// Example of stored preferences
{
  "version": "1.0",
  "timestamp": 1696291200000,
  "analytics": false,    // User choice
  "marketing": false,    // User choice
  "essential": true      // Always true
}
```

### Google Consent Mode Integration

```javascript
// Default state (no tracking)
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
});

// After user consent
gtag("consent", "update", {
  analytics_storage: "granted",
});
```

## 🎯 User Management

### Changing Preferences

1. Click "🍪 Cookie Preferences" in footer
2. Adjust toggles for Analytics/Marketing cookies
3. Click "Accept Selected" to save choices
4. Preferences are immediately applied

**Note**: The checkbox states automatically sync with your saved preferences. When you click "Accept All" or "Reject All", the checkboxes immediately reflect your choice and remain synchronized when you reopen the dialog.

### Reset Preferences

Users can reset their choices by:

- Clicking "Reject All" in the cookie dialog
- Clearing browser localStorage
- Using browser's cookie management tools

## 🚀 Developer Information

### Environment Handling

- **Development**: Console logging only, no real tracking
- **Production**: Full analytics with consent respect
- **Build Process**: Secure credential injection

### Testing

- Open browser DevTools console for development logs
- Check Network tab for analytics requests (only after consent)
- Verify localStorage for preference storage
- Test checkbox synchronization: "Accept All" → checkboxes turn ON, "Reject All" → checkboxes turn OFF
- Verify persistent state: Close and reopen dialog to confirm checkboxes match saved preferences

### Debugging

```javascript
// Check current consent state
console.log(localStorage.getItem("cookie-consent-preferences"));

// Force show dialog (development)
document.getElementById("cookie-consent-overlay").classList.add("show");

// Check checkbox states
const analytics = document.getElementById("analytics-consent").checked;
const marketing = document.getElementById("marketing-consent").checked;
console.log("Checkbox states:", { analytics, marketing });
```

## 📞 Contact

For questions about our cookie policy or privacy practices:

- Email: info@lightofdata.earth
- Website: https://lightofdata.earth

---

_Last updated: October 2025_
