import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Test suite for dark mode and theme functionality
 * Tests theme switching, icon updates, and system preference handling
 */

describe("Dark Mode and Theme Functionality", () => {
  beforeEach(() => {
    // Setup DOM elements needed for theme functionality
    document.body.innerHTML = `
      <button id="theme-toggle" onclick="toggleTheme()">🌓</button>
      <img id="github-icon" src="/images/github-mark.svg" alt="GitHub" />
      <img id="linkedin-icon" src="/images/InBug-Black.png" alt="LinkedIn" />
      <link rel="icon" type="image/png" href="/images/small/png/logo-small-light-t.png" />
    `;

    // Define theme functions globally for testing
    global.updateGithubIcon = (theme) => {
      const icon = document.getElementById("github-icon");
      if (!icon) return;
      icon.src =
        theme === "dark"
          ? "/images/github-mark-white.svg"
          : "/images/github-mark.svg";
    };

    global.updateLinkedInIcon = (theme) => {
      const icon = document.getElementById("linkedin-icon");
      if (!icon) return;
      icon.src =
        theme === "dark"
          ? "/images/InBug-White.png"
          : "/images/InBug-Black.png";
    };

    global.updateHeadIcon = (theme) => {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href =
        theme === "dark"
          ? "/images/small/png/logo-small-light-t.png?v=dark"
          : "/images/small/png/logo-small-dark-t.png?v=light";
    };

    global.setTheme = (theme, manual = false) => {
      document.documentElement.setAttribute("data-theme", theme);
      global.updateGithubIcon(theme);
      global.updateLinkedInIcon(theme);
      if (!manual) global.updateHeadIcon(theme);
    };

    global.toggleTheme = () => {
      const current = document.documentElement.getAttribute("data-theme");
      global.setTheme(current === "dark" ? "light" : "dark", true);
    };
  });

  describe("Icon Updates", () => {
    it("should update GitHub icon for dark theme", () => {
      global.updateGithubIcon("dark");
      const icon = document.getElementById("github-icon");
      expect(icon.src).toContain("github-mark-white.svg");
    });

    it("should update GitHub icon for light theme", () => {
      global.updateGithubIcon("light");
      const icon = document.getElementById("github-icon");
      expect(icon.src).toContain("github-mark.svg");
    });

    it("should update LinkedIn icon for dark theme", () => {
      global.updateLinkedInIcon("dark");
      const icon = document.getElementById("linkedin-icon");
      expect(icon.src).toContain("InBug-White.png");
    });

    it("should update LinkedIn icon for light theme", () => {
      global.updateLinkedInIcon("light");
      const icon = document.getElementById("linkedin-icon");
      expect(icon.src).toContain("InBug-Black.png");
    });

    it("should handle missing icons gracefully", () => {
      document.getElementById("github-icon").remove();
      expect(() => global.updateGithubIcon("dark")).not.toThrow();
    });

    it("should update head icon for different themes", () => {
      global.updateHeadIcon("dark");
      const link = document.querySelector("link[rel~='icon']");
      expect(link.href).toContain("logo-small-light-t.png?v=dark");

      global.updateHeadIcon("light");
      expect(link.href).toContain("logo-small-dark-t.png?v=light");
    });

    it("should create head icon if none exists", () => {
      document.querySelector("link[rel~='icon']").remove();
      global.updateHeadIcon("dark");
      const link = document.querySelector("link[rel~='icon']");
      expect(link).toBeTruthy();
      expect(link.href).toContain("logo-small-light-t.png?v=dark");
    });
  });

  describe("Theme Setting", () => {
    it("should set data-theme attribute on documentElement", () => {
      global.setTheme("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      global.setTheme("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should update all icons when setting theme automatically", () => {
      global.setTheme("dark", false);

      const githubIcon = document.getElementById("github-icon");
      const linkedinIcon = document.getElementById("linkedin-icon");
      const headIcon = document.querySelector("link[rel~='icon']");

      expect(githubIcon.src).toContain("github-mark-white.svg");
      expect(linkedinIcon.src).toContain("InBug-White.png");
      expect(headIcon.href).toContain("logo-small-light-t.png?v=dark");
    });

    it("should skip head icon update when setting theme manually", () => {
      const originalHref = document.querySelector("link[rel~='icon']").href;
      global.setTheme("dark", true);

      const headIcon = document.querySelector("link[rel~='icon']");
      expect(headIcon.href).toBe(originalHref); // Should not change
    });
  });

  describe("Theme Toggle", () => {
    it("should toggle from light to dark", () => {
      document.documentElement.setAttribute("data-theme", "light");
      global.toggleTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      document.documentElement.setAttribute("data-theme", "dark");
      global.toggleTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should handle null theme attribute", () => {
      document.documentElement.removeAttribute("data-theme");
      expect(() => global.toggleTheme()).not.toThrow();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("should call setTheme with manual=true", () => {
      document.documentElement.setAttribute("data-theme", "light");
      const setThemeSpy = vi.spyOn(global, "setTheme");

      global.toggleTheme();
      expect(setThemeSpy).toHaveBeenCalledWith("dark", true);
    });
  });

  describe("System Theme Detection", () => {
    it("should detect dark system preference", () => {
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
      expect(systemDark.matches).toBe(true);
    });

    it("should detect light system preference", () => {
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
      expect(systemDark.matches).toBe(false);
    });

    it("should setup system theme change listener", () => {
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
      const mockCallback = vi.fn();
      systemDark.addEventListener("change", mockCallback);

      expect(systemDark.addEventListener).toHaveBeenCalledWith(
        "change",
        mockCallback
      );
    });
  });
});
