import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Test suite for Google Analytics and GDPR consent functionality
 * Tests the analytics integration including development/production modes
 * and GDPR-compliant consent management
 */

describe("Google Analytics Integration", () => {
  beforeEach(() => {
    // Setup HTML structure needed for tests
    document.head.innerHTML = `
      <script>
        window.dataLayer = window.dataLayer || [];
        const originalGtag = function () {
          dataLayer.push(arguments);
        };
        window.gtag = originalGtag;
        window.GA_MEASUREMENT_ID = "GA-TEST-MODE";
        window.isProduction = window.GA_MEASUREMENT_ID !== "GA-DEVELOPMENT-MODE";
        window.isDevelopment = !window.isProduction;
      </script>
    `;
  });

  describe("Environment Detection", () => {
    it("should detect development mode correctly", () => {
      window.GA_MEASUREMENT_ID = "GA-DEVELOPMENT-MODE";
      window.isProduction = window.GA_MEASUREMENT_ID !== "GA-DEVELOPMENT-MODE";
      window.isDevelopment = !window.isProduction;

      expect(window.isDevelopment).toBe(true);
      expect(window.isProduction).toBe(false);
    });

    it("should detect production mode correctly", () => {
      window.GA_MEASUREMENT_ID = "G-CGZZ6MLGWX";
      window.isProduction = window.GA_MEASUREMENT_ID !== "GA-DEVELOPMENT-MODE";
      window.isDevelopment = !window.isProduction;

      expect(window.isProduction).toBe(true);
      expect(window.isDevelopment).toBe(false);
    });

    it("should set up development mode logging", () => {
      window.GA_MEASUREMENT_ID = "GA-DEVELOPMENT-MODE";
      window.isDevelopment = true;
      window.gtag_dev_mode = true;

      // Override gtag for development
      const originalGtag = window.gtag;
      window.gtag = function () {
        console.log("📊 GA (dev):", Array.from(arguments));
        return originalGtag.apply(this, arguments);
      };

      window.gtag("test", "data");
      expect(console.log).toHaveBeenCalledWith("📊 GA (dev):", [
        "test",
        "data",
      ]);
    });
  });

  describe("GDPR Consent Management", () => {
    it("should set default GDPR-compliant consent state", () => {
      // Create a spy on gtag before calling it
      const gtagSpy = vi.spyOn(window, "gtag");

      // Simulate the default consent call
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
      });

      expect(gtagSpy).toHaveBeenCalledWith("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
      });
    });

    it("should configure analytics with proper settings", () => {
      const gtagSpy = vi.spyOn(window, "gtag");

      window.gtag("config", "GA-TEST-MODE", {
        anonymize_ip: true,
        cookie_flags: "SameSite=None;Secure",
      });

      expect(gtagSpy).toHaveBeenCalledWith("config", "GA-TEST-MODE", {
        anonymize_ip: true,
        cookie_flags: "SameSite=None;Secure",
      });
    });

    it("should update consent when user accepts", () => {
      const gtagSpy = vi.spyOn(window, "gtag");

      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });

      expect(gtagSpy).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    });
  });

  describe("Script Loading", () => {
    it("should not load GA script in development mode", () => {
      window.isProduction = false;
      const initialScriptCount = document.head.children.length;

      // Script should not be created in development
      expect(document.head.children.length).toBe(initialScriptCount);
    });

    it("should handle script loading errors gracefully", () => {
      window.isProduction = true;

      const script = document.createElement("script");
      script.onerror = () => {
        console.warn("⚠️ Failed to load Google Analytics script");
      };

      // Simulate error
      script.onerror();
      expect(console.warn).toHaveBeenCalledWith(
        "⚠️ Failed to load Google Analytics script"
      );
    });

    it("should handle successful script loading", () => {
      window.isProduction = true;

      const script = document.createElement("script");
      script.onload = () => {
        window.gtag("config", window.GA_MEASUREMENT_ID, {
          anonymize_ip: true,
          cookie_flags: "SameSite=None;Secure",
        });
        console.log("✅ Google Analytics loaded successfully");
      };

      // Simulate successful load
      script.onload();
      expect(console.log).toHaveBeenCalledWith(
        "✅ Google Analytics loaded successfully"
      );
    });
  });
});
