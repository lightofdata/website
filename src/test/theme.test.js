import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for src/theme.js: the three-way theme switch (System, Light, Dark),
 * persistence, following the system, and the assets that follow the theme
 * (favicon, GitHub and LinkedIn icons, the toggle itself).
 *
 * The module runs on import, so each test sets up storage, the system
 * preference and the DOM first, then imports a fresh copy.
 */

let store;
let systemIsDark;
let mediaListeners;

const html = () => document.documentElement;
const theme = () => html().getAttribute("data-theme");
const toggle = () => document.getElementById("theme-toggle");
const favicon = () => document.querySelector("link[rel~='icon']");

const setSystemDark = (dark) => {
  systemIsDark = dark;
  mediaListeners.forEach((listener) => listener({ matches: dark }));
};

const loadTheme = async () => {
  vi.resetModules();
  await import("../theme.js");
};

describe("Theme switch", () => {
  beforeEach(() => {
    store = {};
    systemIsDark = false;
    mediaListeners = [];

    window.localStorage.getItem.mockImplementation((key) =>
      key in store ? store[key] : null
    );
    window.localStorage.setItem.mockImplementation((key, value) => {
      store[key] = String(value);
    });
    window.localStorage.removeItem.mockImplementation((key) => {
      delete store[key];
    });

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      get matches() {
        return query === "(prefers-color-scheme: dark)" && systemIsDark;
      },
      media: query,
      addEventListener: (type, listener) => mediaListeners.push(listener),
      removeEventListener: vi.fn(),
    }));

    html().removeAttribute("data-theme");
    document.head.innerHTML = `
      <link rel="icon" type="image/png" href="./images/small/png/logo-small-dark-w.png" />
    `;
    document.body.innerHTML = `
      <button id="theme-toggle" onclick="toggleTheme()">🌓</button>
      <img id="github-icon" src="./images/github-mark.svg" alt="GitHub" />
      <img id="linkedin-icon" src="./images/LI-In-Bug.png" alt="LinkedIn" />
    `;
  });

  describe("Initial theme", () => {
    it("follows a light system when nothing is saved", async () => {
      await loadTheme();
      expect(theme()).toBe("light");
      expect(toggle().dataset.mode).toBe("system");
      expect(toggle().textContent).toBe("🌓");
    });

    it("follows a dark system when nothing is saved", async () => {
      systemIsDark = true;
      await loadTheme();
      expect(theme()).toBe("dark");
      expect(toggle().dataset.mode).toBe("system");
    });

    it("applies a saved theme over the system", async () => {
      systemIsDark = true;
      store.theme = "light";
      await loadTheme();
      expect(theme()).toBe("light");
      expect(toggle().dataset.mode).toBe("light");
      expect(toggle().textContent).toBe("☀️");
    });

    it("ignores an unknown saved value", async () => {
      store.theme = "sepia";
      await loadTheme();
      expect(theme()).toBe("light");
      expect(toggle().dataset.mode).toBe("system");
    });

    it("follows the system when storage is blocked", async () => {
      systemIsDark = true;
      window.localStorage.getItem.mockImplementation(() => {
        throw new Error("SecurityError");
      });
      await loadTheme();
      expect(theme()).toBe("dark");
    });
  });

  describe("Three-way toggle", () => {
    it("cycles System → Dark → Light → System on a light system", async () => {
      await loadTheme();

      window.toggleTheme();
      expect(theme()).toBe("dark");
      expect(toggle().dataset.mode).toBe("dark");
      expect(store.theme).toBe("dark");

      window.toggleTheme();
      expect(theme()).toBe("light");
      expect(toggle().dataset.mode).toBe("light");
      expect(store.theme).toBe("light");

      window.toggleTheme();
      expect(theme()).toBe("light");
      expect(toggle().dataset.mode).toBe("system");
      expect("theme" in store).toBe(false);
    });

    it("cycles System → Light → Dark → System on a dark system", async () => {
      systemIsDark = true;
      await loadTheme();

      window.toggleTheme();
      expect(theme()).toBe("light");
      window.toggleTheme();
      expect(theme()).toBe("dark");
      expect(store.theme).toBe("dark");
      window.toggleTheme();
      expect(toggle().dataset.mode).toBe("system");
      expect("theme" in store).toBe(false);
    });

    it("labels the toggle with the current mode and the next one", async () => {
      await loadTheme();
      expect(toggle().getAttribute("aria-label")).toBe(
        "Theme: System. Switch to Dark."
      );
      window.toggleTheme();
      expect(toggle().getAttribute("aria-label")).toBe(
        "Theme: Dark. Switch to Light."
      );
      expect(toggle().title).toBe("Theme: Dark. Switch to Light.");
    });

    it("keeps working when storage is blocked", async () => {
      window.localStorage.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      await loadTheme();
      expect(() => window.toggleTheme()).not.toThrow();
      expect(theme()).toBe("dark");
    });
  });

  describe("System changes", () => {
    it("follows live system changes in System mode", async () => {
      await loadTheme();
      setSystemDark(true);
      expect(theme()).toBe("dark");
      setSystemDark(false);
      expect(theme()).toBe("light");
    });

    it("ignores system changes once a theme is chosen", async () => {
      await loadTheme();
      window.toggleTheme(); // Dark
      setSystemDark(true);
      expect(theme()).toBe("dark");
      setSystemDark(false);
      expect(theme()).toBe("dark");
    });

    it("follows the system again after switching back to System", async () => {
      await loadTheme();
      window.toggleTheme(); // Dark
      window.toggleTheme(); // Light
      window.toggleTheme(); // System
      setSystemDark(true);
      expect(theme()).toBe("dark");
    });

    it("picks up a change made in another tab", async () => {
      await loadTheme();
      store.theme = "dark";
      window.dispatchEvent(
        new window.StorageEvent("storage", { key: "theme" })
      );
      expect(theme()).toBe("dark");
      expect(toggle().dataset.mode).toBe("dark");
    });
  });

  describe("Assets that follow the theme", () => {
    it("uses the light favicon on a dark page and the dark one on a light page", async () => {
      await loadTheme();
      expect(favicon().href).toContain("logo-small-dark-w.png");

      window.toggleTheme(); // Dark, a manual switch
      expect(favicon().href).toContain("logo-small-light-b.png");

      window.toggleTheme(); // Light
      expect(favicon().href).toContain("logo-small-dark-w.png");
    });

    it("creates the favicon link if the page has none", async () => {
      document.head.innerHTML = "";
      systemIsDark = true;
      await loadTheme();
      expect(favicon()).toBeTruthy();
      expect(favicon().href).toContain("logo-small-light-b.png");
    });

    it("swaps the GitHub and LinkedIn icons on every change", async () => {
      await loadTheme();
      const github = document.getElementById("github-icon");
      const linkedin = document.getElementById("linkedin-icon");
      expect(github.src).toContain("github-mark.svg");
      expect(linkedin.src).toContain("InBug-Black.png");

      window.toggleTheme(); // Dark
      expect(github.src).toContain("github-mark-white.svg");
      expect(linkedin.src).toContain("InBug-White.png");

      window.toggleTheme(); // Light
      expect(github.src).toContain("github-mark.svg");
      expect(linkedin.src).toContain("InBug-Black.png");
    });

    it("works on pages without the social icons or the toggle", async () => {
      document.body.innerHTML = "";
      await loadTheme();
      expect(() => window.toggleTheme()).not.toThrow();
      expect(theme()).toBe("dark");
    });
  });
});
