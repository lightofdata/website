import { test, expect } from "@playwright/test";

// Helper function to handle cookie consent (for tests that load pages mid-test)
async function handleCookieConsent(page) {
  const cookieDialog = page.locator("#cookie-consent-overlay");
  const dialogVisible = await cookieDialog.isVisible().catch(() => false);

  if (dialogVisible) {
    const acceptButton = page.locator("#cookie-accept-all");
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await cookieDialog.waitFor({ state: "hidden", timeout: 2000 });
    }
  }
}

// Helper function to pre-set cookie consent in localStorage (prevents dialog from appearing)
async function presetCookieConsent(page, url = "/") {
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.setItem(
      "cookie-consent-preferences",
      JSON.stringify({
        version: "1.0",
        necessary: true,
        analytics: false,
        timestamp: new Date().toISOString(),
      })
    );
  });
  await page.goto(url);
}

test.describe("Time Tracker Privacy Policy Page", () => {
  test("should load privacy policy page successfully", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check page title
    await expect(page).toHaveTitle(/Time Tracker.*Privacy Policy/);

    // Check main heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Privacy Policy");
    await expect(heading).toContainText("Time Tracker");
  });

  test("should have proper privacy policy structure", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check for key sections
    await expect(
      page.getByRole("heading", { name: /Introduction/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Developer Information/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Information We Collect/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Data Storage and Security/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Your Rights/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Contact/i })).toBeVisible();
  });

  test("should display effective date", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check for date information
    const content = await page.textContent("body");
    expect(content).toContain("Last Updated");
    expect(content).toContain("December 16, 2024");
  });

  test("should have working navigation back to main site", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check navigation links exist (use first to avoid strict mode violation)
    const homeLink = page.locator('a[href="/#home"]').first();
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
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    const themeToggle = page.locator("#theme-toggle");
    const html = page.locator("html");

    // Theme toggle should be visible
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await html.getAttribute("data-theme");

    // Toggle theme
    await themeToggle.click();
    const newTheme = await html.getAttribute("data-theme");

    // Theme should have changed
    expect(newTheme).not.toBe(initialTheme);
    expect(["light", "dark"]).toContain(newTheme);
  });

  test("should persist theme across navigation", async ({ page }) => {
    // Pre-set cookie consent to prevent dialog from appearing
    await presetCookieConsent(page, "/");

    const html = page.locator("html");
    const themeToggle = page.locator("#theme-toggle");

    // Set theme to dark
    await themeToggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate to privacy policy
    const privacyLink = page
      .locator('a[href="/time-tracker-privacy.html"]')
      .first();

    // Ensure link is in viewport and stable before clicking
    await privacyLink.scrollIntoViewIfNeeded();
    await privacyLink.click();
    await page.waitForURL("**/time-tracker-privacy.html");

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate back to main page (consent is already in localStorage)
    await page.goto("/");

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("should have accessible contact information", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check for contact email (use first to avoid strict mode violation)
    const emailLink = page.locator('a[href*="mailto"]').first();
    await expect(emailLink).toBeVisible();

    // Verify email is clickable
    const href = await emailLink.getAttribute("href");
    expect(href).toContain("@lightofdata.earth");
  });

  test("should have links to third-party privacy policies", async ({
    page,
  }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check for external policy links
    const content = await page.textContent("body");
    expect(content).toContain("Google");
    expect(content).toContain("Supabase");
    expect(content).toContain("Firebase");

    // Verify external links are marked properly
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    // Check rel="noopener" for security
    const firstExternal = externalLinks.first();
    if (await firstExternal.isVisible()) {
      const rel = await firstExternal.getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });

  test("should be mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

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
  test("should navigate from main page to privacy policy", async ({ page }) => {
    // Pre-set cookie consent to prevent dialog from appearing
    await presetCookieConsent(page, "/");

    // Scroll to Projects section
    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    // Find and click privacy policy link in Projects section
    const privacyLink = page
      .locator("#projects")
      .locator('a[href="/time-tracker-privacy.html"]');
    await expect(privacyLink).toBeVisible();

    await privacyLink.click();
    await page.waitForURL("**/time-tracker-privacy.html");

    // Verify we're on the privacy page
    await expect(page.locator("h1")).toContainText("Privacy Policy");
  });

  test("should navigate from footer to privacy policy", async ({ page }) => {
    // Pre-set cookie consent to prevent dialog from appearing
    await presetCookieConsent(page, "/");
    await handleCookieConsent(page);

    // Find footer link
    const footerPrivacyLink = page
      .locator(".footer")
      .locator('a[href="/time-tracker-privacy.html"]');
    await footerPrivacyLink.scrollIntoViewIfNeeded();
    await expect(footerPrivacyLink).toBeVisible();

    await footerPrivacyLink.click();
    await page.waitForURL("**/time-tracker-privacy.html");

    // Verify we're on the privacy page
    await expect(page.locator("h1")).toContainText("Privacy Policy");
  });

  test("should show Projects in navigation menu", async ({ page }) => {
    // Pre-set cookie consent to prevent dialog from appearing
    await presetCookieConsent(page, "/");
    await handleCookieConsent(page);

    const projectsLink = page.locator('a[href="#projects-title"]');

    // On mobile, need to open the hamburger menu first
    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 600) {
      const menuToggle = page.locator(".menu-toggle");
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
      }
    }

    await expect(projectsLink).toBeVisible();

    // Click and verify scroll
    await projectsLink.click();
    await expect(page.locator("#projects-title")).toBeInViewport();
  });

  test("should display Time Tracker project card", async ({ page }) => {
    // Pre-set cookie consent to prevent dialog from appearing
    await presetCookieConsent(page, "/");
    await handleCookieConsent(page);

    // Scroll to projects
    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    // Check Time Tracker content
    const projectsSection = page.locator("#projects");
    await expect(
      projectsSection.getByRole("heading", { name: "Time Tracker" })
    ).toBeVisible();
    await expect(projectsSection).toContainText("privacy-focused");
    await expect(projectsSection).toContainText("beta testing");
  });
});

test.describe("Cross-Page Theme Consistency", () => {
  test("should maintain consistent styling across pages", async ({ page }) => {
    // Check main page
    await page.goto("/");
    await handleCookieConsent(page);

    const mainNavBg = await page
      .locator("nav")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Check privacy page
    await page.goto("/time-tracker-privacy.html");

    const privacyNavBg = await page
      .locator("nav")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Should have same navigation styling
    expect(privacyNavBg).toBe(mainNavBg);
  });

  test("should load shared theme.js on both pages", async ({ page }) => {
    // Test on main page
    await page.goto("/");
    await handleCookieConsent(page);

    let toggleThemeExists = await page.evaluate(
      () => typeof toggleTheme === "function"
    );
    expect(toggleThemeExists).toBe(true);

    // Test on privacy page
    await page.goto("/time-tracker-privacy.html");

    toggleThemeExists = await page.evaluate(
      () => typeof toggleTheme === "function"
    );
    expect(toggleThemeExists).toBe(true);
  });
});

test.describe("Privacy Policy Content Quality", () => {
  test("should have GDPR compliance sections", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    const content = await page.textContent("body");

    // Check for GDPR-related content
    expect(content).toContain("GDPR");
    expect(content).toContain("rights");
    expect(content).toContain("consent");
  });

  test("should have data retention information", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Check for data retention section
    await expect(
      page.getByRole("heading", { name: /data retention/i })
    ).toBeVisible();

    // Check for specific content about account deletion and time period
    const content = await page.textContent("body");
    expect(content).toContain("30");
    expect(content).toContain("days");
  });

  test("should explain data collection clearly", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");
    await handleCookieConsent(page);

    // Should have numbered or structured information collection
    await expect(
      page.getByRole("heading", { name: /Account Information/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Time Tracking Data/i })
    ).toBeVisible();
  });
});
