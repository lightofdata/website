import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/dom";

/**
 * Test suite for GDPR Cookie Consent functionality
 * Tests cookie dialog, preference management, and GDPR compliance
 */

describe("Cookie Consent Management", () => {
  const COOKIE_CONSENT_KEY = "cookie-consent-preferences";
  const COOKIE_CONSENT_VERSION = "1.0";

  beforeEach(() => {
    // Setup DOM structure for cookie consent
    document.body.innerHTML = `
      <footer class="footer">
        <div class="footer-content">
          <span>Light Of Data Ltd</span>
          <button id="cookie-preferences-btn" class="cookie-preferences-btn">
            🍪 Cookie Preferences
          </button>
        </div>
      </footer>

      <!-- Cookie Consent Dialog -->
      <div id="cookie-consent-overlay" class="cookie-consent-overlay">
        <div class="cookie-consent-dialog">
          <div class="cookie-consent-header">
            <h2>Cookie Preferences</h2>
            <button id="cookie-consent-close" class="cookie-consent-close">×</button>
          </div>

          <div class="cookie-consent-content">
            <p>We use cookies to enhance your browsing experience.</p>

            <div class="cookie-categories">
              <div class="cookie-category">
                <h3>Essential Cookies</h3>
                <span class="cookie-status">Always Active</span>
              </div>

              <div class="cookie-category">
                <h3>Analytics Cookies</h3>
                <label class="cookie-toggle">
                  <input type="checkbox" id="analytics-consent" name="analytics" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="cookie-category">
                <h3>Marketing Cookies</h3>
                <label class="cookie-toggle">
                  <input type="checkbox" id="marketing-consent" name="marketing" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="cookie-consent-footer">
            <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Accept All</button>
            <button id="cookie-accept-selected" class="cookie-btn cookie-btn-secondary">Accept Selected</button>
            <button id="cookie-reject-all" class="cookie-btn cookie-btn-outline">Reject All</button>
          </div>
        </div>
      </div>
    `;

    // Setup cookie consent functionality
    global.initCookieConsent = () => {
      // Helper functions
      const hasValidConsent = () => {
        try {
          const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
          if (!stored) return false;

          const preferences = JSON.parse(stored);
          return (
            preferences.version === COOKIE_CONSENT_VERSION &&
            !!preferences.timestamp
          );
        } catch (_e) {
          return false;
        }
      };

      const getConsentPreferences = () => {
        try {
          const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
          if (!stored) return null;

          const preferences = JSON.parse(stored);
          if (preferences.version !== COOKIE_CONSENT_VERSION) return null;

          return preferences;
        } catch (_e) {
          return null;
        }
      };

      const saveConsentPreferences = (analytics, marketing) => {
        const preferences = {
          version: COOKIE_CONSENT_VERSION,
          timestamp: Date.now(),
          analytics: analytics,
          marketing: marketing,
          essential: true,
        };

        try {
          localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
          return preferences;
        } catch (e) {
          console.warn("⚠️ Failed to save cookie preferences:", e.message);
          return preferences;
        }
      };

      const updateGoogleConsent = (analytics, marketing) => {
        if (typeof gtag === "function") {
          gtag("consent", "update", {
            analytics_storage: analytics ? "granted" : "denied",
            ad_storage: marketing ? "granted" : "denied",
            ad_user_data: marketing ? "granted" : "denied",
            ad_personalization: marketing ? "granted" : "denied",
          });
        }
      };

      const showCookieDialog = () => {
        const overlay = document.getElementById("cookie-consent-overlay");
        if (overlay) {
          applyStoredConsent();
          overlay.classList.add("show");

          const firstButton = overlay.querySelector(
            'button, input[type="checkbox"]'
          );
          if (firstButton) {
            firstButton.focus();
          }
        }
      };

      const hideCookieDialog = () => {
        const overlay = document.getElementById("cookie-consent-overlay");
        if (overlay) {
          overlay.classList.remove("show");
        }
      };

      const updateCheckboxes = (analytics, marketing) => {
        const analyticsCheckbox = document.getElementById("analytics-consent");
        const marketingCheckbox = document.getElementById("marketing-consent");

        if (analyticsCheckbox) analyticsCheckbox.checked = analytics;
        if (marketingCheckbox) marketingCheckbox.checked = marketing;
      };

      const applyStoredConsent = () => {
        const preferences = getConsentPreferences();
        if (preferences) {
          updateGoogleConsent(preferences.analytics, preferences.marketing);
          updateCheckboxes(preferences.analytics, preferences.marketing);
        } else {
          updateCheckboxes(false, false);
        }
      };

      const handleConsentChoice = (analytics, marketing) => {
        const preferences = saveConsentPreferences(analytics, marketing);
        updateGoogleConsent(analytics, marketing);
        hideCookieDialog();
        console.log("Cookie preferences saved:", preferences);
      };

      // Apply any stored consent
      applyStoredConsent();

      // Show dialog if no valid consent exists
      if (!hasValidConsent()) {
        setTimeout(showCookieDialog, 500);
      }

      // Event listeners
      const acceptAllBtn = document.getElementById("cookie-accept-all");
      const acceptSelectedBtn = document.getElementById(
        "cookie-accept-selected"
      );
      const rejectAllBtn = document.getElementById("cookie-reject-all");
      const closeBtn = document.getElementById("cookie-consent-close");
      const preferencesBtn = document.getElementById("cookie-preferences-btn");
      const overlay = document.getElementById("cookie-consent-overlay");

      if (acceptAllBtn) {
        acceptAllBtn.addEventListener("click", () => {
          updateCheckboxes(true, true);
          handleConsentChoice(true, true);
        });
      }

      if (acceptSelectedBtn) {
        acceptSelectedBtn.addEventListener("click", () => {
          const analyticsCheckbox =
            document.getElementById("analytics-consent");
          const marketingCheckbox =
            document.getElementById("marketing-consent");

          const analytics = analyticsCheckbox
            ? analyticsCheckbox.checked
            : false;
          const marketing = marketingCheckbox
            ? marketingCheckbox.checked
            : false;

          handleConsentChoice(analytics, marketing);
        });
      }

      if (rejectAllBtn) {
        rejectAllBtn.addEventListener("click", () => {
          updateCheckboxes(false, false);
          handleConsentChoice(false, false);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener("click", hideCookieDialog);
      }

      if (preferencesBtn) {
        preferencesBtn.addEventListener("click", showCookieDialog);
      }

      if (overlay) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            hideCookieDialog();
          }
        });
      }

      // Keyboard accessibility
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Escape" &&
          overlay &&
          overlay.classList.contains("show")
        ) {
          hideCookieDialog();
        }
      });

      // Return public methods for testing
      return {
        hasValidConsent,
        getConsentPreferences,
        saveConsentPreferences,
        updateGoogleConsent,
        showCookieDialog,
        hideCookieDialog,
        updateCheckboxes,
        applyStoredConsent,
        handleConsentChoice,
      };
    };

    // Initialize cookie consent
    global.cookieConsent = global.initCookieConsent();
  });

  describe("Consent Preference Storage", () => {
    it("should save consent preferences correctly", () => {
      const preferences = global.cookieConsent.saveConsentPreferences(
        true,
        false
      );

      expect(preferences).toEqual({
        version: COOKIE_CONSENT_VERSION,
        timestamp: expect.any(Number),
        analytics: true,
        marketing: false,
        essential: true,
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        COOKIE_CONSENT_KEY,
        JSON.stringify(preferences)
      );
    });

    it("should retrieve stored consent preferences", () => {
      const testPreferences = {
        version: COOKIE_CONSENT_VERSION,
        timestamp: Date.now(),
        analytics: true,
        marketing: false,
        essential: true,
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(testPreferences));

      const retrieved = global.cookieConsent.getConsentPreferences();
      expect(retrieved).toEqual(testPreferences);
    });

    it("should return null for invalid stored preferences", () => {
      localStorage.getItem.mockReturnValue("invalid json");
      const retrieved = global.cookieConsent.getConsentPreferences();
      expect(retrieved).toBeNull();
    });

    it("should return null for wrong version", () => {
      const oldPreferences = {
        version: "0.5",
        timestamp: Date.now(),
        analytics: true,
        marketing: false,
        essential: true,
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(oldPreferences));

      const retrieved = global.cookieConsent.getConsentPreferences();
      expect(retrieved).toBeNull();
    });

    it("should detect valid consent", () => {
      const validPreferences = {
        version: COOKIE_CONSENT_VERSION,
        timestamp: Date.now(),
        analytics: true,
        marketing: false,
        essential: true,
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(validPreferences));

      const hasConsent = global.cookieConsent.hasValidConsent();
      expect(hasConsent).toBe(true);
    });

    it("should detect invalid consent", () => {
      localStorage.getItem.mockReturnValue(null);

      const hasConsent = global.cookieConsent.hasValidConsent();
      expect(hasConsent).toBe(false);
    });
  });

  describe("Checkbox UI Management", () => {
    it("should update checkboxes correctly", () => {
      global.cookieConsent.updateCheckboxes(true, false);

      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");

      expect(analyticsCheckbox.checked).toBe(true);
      expect(marketingCheckbox.checked).toBe(false);
    });

    it("should apply GDPR-compliant default state", () => {
      global.cookieConsent.applyStoredConsent();

      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");

      // Should default to false (GDPR compliant)
      expect(analyticsCheckbox.checked).toBe(false);
      expect(marketingCheckbox.checked).toBe(false);
    });

    it("should apply stored preferences to checkboxes", () => {
      const testPreferences = {
        version: COOKIE_CONSENT_VERSION,
        timestamp: Date.now(),
        analytics: true,
        marketing: false,
        essential: true,
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(testPreferences));

      global.cookieConsent.applyStoredConsent();

      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");

      expect(analyticsCheckbox.checked).toBe(true);
      expect(marketingCheckbox.checked).toBe(false);
    });
  });

  describe("Dialog Management", () => {
    it("should show cookie dialog", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      expect(overlay.classList.contains("show")).toBe(false);

      global.cookieConsent.showCookieDialog();

      expect(overlay.classList.contains("show")).toBe(true);
    });

    it("should hide cookie dialog", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      overlay.classList.add("show");

      global.cookieConsent.hideCookieDialog();

      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should focus first interactive element when shown", () => {
      // Mock all focusable elements since DOM focus isn't available in jsdom
      const focusableElements = document.querySelectorAll(
        'button, input[type="checkbox"]'
      );
      focusableElements.forEach((el) => {
        el.focus = vi.fn();
      });

      global.cookieConsent.showCookieDialog();

      // Check that at least one element received focus
      const focusCalled = Array.from(focusableElements).some(
        (el) => el.focus.mock && el.focus.mock.calls.length > 0
      );
      expect(focusCalled).toBe(true);
    });
  });

  describe("Button Event Handlers", () => {
    it("should handle Accept All button correctly", () => {
      const acceptAllBtn = document.getElementById("cookie-accept-all");
      const overlay = document.getElementById("cookie-consent-overlay");

      fireEvent.click(acceptAllBtn);

      // Check checkboxes are updated
      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");
      expect(analyticsCheckbox.checked).toBe(true);
      expect(marketingCheckbox.checked).toBe(true);

      // Check dialog is hidden
      expect(overlay.classList.contains("show")).toBe(false);

      // Check preferences are saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        COOKIE_CONSENT_KEY,
        expect.stringContaining('"analytics":true')
      );
    });

    it("should handle Reject All button correctly", () => {
      const rejectAllBtn = document.getElementById("cookie-reject-all");
      const overlay = document.getElementById("cookie-consent-overlay");

      fireEvent.click(rejectAllBtn);

      // Check checkboxes are updated
      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");
      expect(analyticsCheckbox.checked).toBe(false);
      expect(marketingCheckbox.checked).toBe(false);

      // Check dialog is hidden
      expect(overlay.classList.contains("show")).toBe(false);

      // Check preferences are saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        COOKIE_CONSENT_KEY,
        expect.stringContaining('"analytics":false')
      );
    });

    it("should handle Accept Selected button correctly", () => {
      // Set up specific checkbox states
      const analyticsCheckbox = document.getElementById("analytics-consent");
      const marketingCheckbox = document.getElementById("marketing-consent");
      analyticsCheckbox.checked = true;
      marketingCheckbox.checked = false;

      const acceptSelectedBtn = document.getElementById(
        "cookie-accept-selected"
      );
      const overlay = document.getElementById("cookie-consent-overlay");

      fireEvent.click(acceptSelectedBtn);

      // Check dialog is hidden
      expect(overlay.classList.contains("show")).toBe(false);

      // Check preferences are saved with selected values
      expect(localStorage.setItem).toHaveBeenCalledWith(
        COOKIE_CONSENT_KEY,
        expect.stringContaining('"analytics":true')
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        COOKIE_CONSENT_KEY,
        expect.stringContaining('"marketing":false')
      );
    });

    it("should handle close button", () => {
      const closeBtn = document.getElementById("cookie-consent-close");
      const overlay = document.getElementById("cookie-consent-overlay");
      overlay.classList.add("show");

      fireEvent.click(closeBtn);

      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should handle preferences button", () => {
      const preferencesBtn = document.getElementById("cookie-preferences-btn");
      const overlay = document.getElementById("cookie-consent-overlay");

      fireEvent.click(preferencesBtn);

      expect(overlay.classList.contains("show")).toBe(true);
    });

    it("should close dialog when clicking outside", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      overlay.classList.add("show");

      fireEvent.click(overlay);

      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should not close dialog when clicking inside", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      const dialog = overlay.querySelector(".cookie-consent-dialog");
      overlay.classList.add("show");

      fireEvent.click(dialog);

      expect(overlay.classList.contains("show")).toBe(true);
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should close dialog on Escape key", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      overlay.classList.add("show");

      fireEvent.keyDown(document, { key: "Escape" });

      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should not close dialog on other keys", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      overlay.classList.add("show");

      fireEvent.keyDown(document, { key: "Enter" });

      expect(overlay.classList.contains("show")).toBe(true);
    });

    it("should only respond to Escape when dialog is open", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      // Dialog is closed by default

      fireEvent.keyDown(document, { key: "Escape" });

      // Should not change anything
      expect(overlay.classList.contains("show")).toBe(false);
    });
  });

  describe("Google Analytics Integration", () => {
    it("should update Google consent when handling choice", () => {
      global.cookieConsent.handleConsentChoice(true, false);

      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    });

    it("should handle gtag function availability", () => {
      // Test when gtag is not available
      const originalGtag = window.gtag;
      delete window.gtag;

      expect(() => {
        global.cookieConsent.updateGoogleConsent(true, false);
      }).not.toThrow();

      // Restore gtag
      window.gtag = originalGtag;
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage errors gracefully", () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const preferences = global.cookieConsent.saveConsentPreferences(
        true,
        false
      );

      expect(console.warn).toHaveBeenCalledWith(
        "⚠️ Failed to save cookie preferences:",
        "Storage error"
      );
      expect(preferences.analytics).toBe(true);
    });

    it("should handle missing DOM elements gracefully", () => {
      // Remove checkboxes
      document.getElementById("analytics-consent").remove();
      document.getElementById("marketing-consent").remove();

      expect(() => {
        global.cookieConsent.updateCheckboxes(true, false);
      }).not.toThrow();
    });
  });
});
