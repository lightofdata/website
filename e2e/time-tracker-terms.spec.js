import { test, expect } from "@playwright/test";
import { handleCookieConsent } from "./test-helpers.js";

test.describe("Time Tracker Terms of Use Page", () => {
  test("should load terms page successfully", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    // Check page title
    await expect(page).toHaveTitle(/Time Tracker.*Terms/);

    // Check main heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Terms of Use");
    await expect(heading).toContainText("Time Tracker");
  });

  test("should have proper terms structure", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    // Check for key sections
    await expect(
      page.getByRole("heading", { name: /Acceptance of Terms/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Description of the Service/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Subscription and Payment/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /User Responsibilities/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Intellectual Property/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Disclaimer of Warranties/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Limitation of Liability/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Termination/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Governing Law/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Contact/i })).toBeVisible();
  });

  test("should display effective date", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");
    expect(content).toContain("Last Updated");
    expect(content).toContain("June 15, 2026");
  });

  test("should have working navigation back to main site", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    // Check navigation links exist (use first to avoid strict mode violation)
    const homeLink = page.locator('a[href="./#home"]').first();
    await expect(homeLink).toBeVisible();

    // Click home link
    await homeLink.click();
    await page.waitForURL("**/#home");

    // Verify we're on the main page
    await expect(page.locator(".hero")).toBeVisible();
  });

  test("should have consistent theme toggle functionality", async ({
    page,
  }) => {
    // Force light color scheme and clear storage for deterministic test
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/time-tracker-terms.html");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const themeToggle = page.locator("#theme-toggle");
    const html = page.locator("html");

    // Theme toggle should be visible
    await expect(themeToggle).toBeVisible();

    // Initial theme should be light (deterministic)
    await expect(html).toHaveAttribute("data-theme", "light");

    // Toggle to dark theme
    await themeToggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle back to light theme
    await themeToggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should persist theme across navigation", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    const html = page.locator("html");
    const themeToggle = page.locator("#theme-toggle");

    // Set theme to dark
    await themeToggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate to terms page
    const termsLink = page
      .locator('a[href="./time-tracker-terms.html"]')
      .first();

    await termsLink.scrollIntoViewIfNeeded();
    await termsLink.click();
    await page.waitForURL("**/time-tracker-terms.html");

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate back to main page
    await page.goto("/");

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("should have accessible contact information", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    // Check for contact email (use first to avoid strict mode violation)
    const emailLink = page.locator('a[href*="mailto"]').first();
    await expect(emailLink).toBeVisible();

    // Verify email is clickable
    const href = await emailLink.getAttribute("href");
    expect(href).toContain("@lightofdata.earth");
  });

  test("should have link to privacy policy", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    // Terms should reference the privacy policy
    const privacyLink = page
      .locator('a[href="./time-tracker-privacy.html"]')
      .first();
    await expect(privacyLink).toBeVisible();
  });

  test("should be mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/time-tracker-terms.html");

    // Content should be visible
    const section = page.locator("section").first();
    await expect(section).toBeVisible();

    // Navigation should work on mobile
    const menuToggle = page.locator(".menu-toggle");
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      const navLinks = page.locator(".nav-links");
      await expect(navLinks).toHaveClass(/active/);
    }
  });
});

test.describe("Projects Section Integration", () => {
  test("should navigate from main page to terms of use", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Scroll to Projects section
    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    // Find and click terms link in Projects section
    const termsLink = page
      .locator("#projects")
      .locator('a[href="./time-tracker-terms.html"]');
    await expect(termsLink).toBeVisible();

    await termsLink.click();
    await page.waitForURL("**/time-tracker-terms.html");

    // Verify we're on the terms page
    await expect(page.locator("h1")).toContainText("Terms of Use");
  });

  test("should navigate from privacy policy to terms of use", async ({
    page,
  }) => {
    await page.goto("/time-tracker-privacy.html");

    // Privacy policy links to terms in the consent section
    const termsLink = page
      .locator('a[href="./time-tracker-terms.html"]')
      .first();
    await termsLink.scrollIntoViewIfNeeded();
    await expect(termsLink).toBeVisible();

    await termsLink.click();
    await page.waitForURL("**/time-tracker-terms.html");

    await expect(page.locator("h1")).toContainText("Terms of Use");
  });

  test("should display Time Tracker project card with both legal links", async ({
    page,
  }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    const projectsSection = page.locator("#projects");
    await expect(
      projectsSection.getByRole("heading", { name: "Time Tracker" })
    ).toBeVisible();
    await expect(
      projectsSection.locator('a[href="./time-tracker-privacy.html"]')
    ).toBeVisible();
    await expect(
      projectsSection.locator('a[href="./time-tracker-terms.html"]')
    ).toBeVisible();
  });
});

test.describe("Cross-Page Theme Consistency", () => {
  test("should maintain consistent styling across pages", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    const mainNavBg = await page
      .locator("nav")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Check terms page
    await page.goto("/time-tracker-terms.html");

    const termsNavBg = await page
      .locator("nav")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Should have same navigation styling
    expect(termsNavBg).toBe(mainNavBg);
  });

  test("should load shared theme.js on both pages", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    let toggleThemeExists = await page.evaluate(
      () => typeof toggleTheme === "function"
    );
    expect(toggleThemeExists).toBe(true);

    // Test on terms page
    await page.goto("/time-tracker-terms.html");

    toggleThemeExists = await page.evaluate(
      () => typeof toggleTheme === "function"
    );
    expect(toggleThemeExists).toBe(true);
  });
});

test.describe("Terms of Use Content Quality", () => {
  test("should have subscription information", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");

    // Check for subscription-related content
    expect(content).toContain("Monthly");
    expect(content).toContain("Annual");
    expect(content).toContain("cancel");
    expect(content).toContain("auto-renew");
  });

  test("should have cancellation instructions for both platforms", async ({
    page,
  }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");

    // Check for platform-specific cancellation steps
    expect(content).toContain("App Store");
    expect(content).toContain("Google Play");
  });

  test("should specify governing law", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");
    expect(content).toContain("England and Wales");
  });

  test("should have company registration information", async ({ page }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");
    expect(content).toContain("Light of Data Ltd");
    expect(content).toContain("14811585");
  });

  test("should explain data deletion on account termination", async ({
    page,
  }) => {
    await page.goto("/time-tracker-terms.html");

    const content = await page.textContent("body");
    expect(content).toContain("30 days");
  });
});
