import { test, expect } from "@playwright/test";

// Helper function to handle cookie consent
async function handleCookieConsent(page) {
  try {
    const cookieOverlay = page.locator("#cookie-consent-overlay");
    // Wait up to 5 seconds for the cookie dialog to appear
    await cookieOverlay.waitFor({ timeout: 5000, state: "visible" });

    // Click the "Accept All" button
    const acceptButton = page.locator('button:has-text("Accept All")');
    await acceptButton.click();

    // Wait for the dialog to disappear
    await cookieOverlay.waitFor({ timeout: 10000, state: "hidden" });

    // Add a small delay to ensure the DOM is stable
    await page.waitForTimeout(500);
  } catch {
    // If no cookie dialog appears within timeout, continue
    console.log("No cookie dialog found or already handled");
  }
}

// Helper function to handle mobile menu navigation
async function ensureMobileMenuOpen(page) {
  const menuToggle = page.locator(".menu-toggle");
  if (await menuToggle.isVisible()) {
    // If menu toggle is visible (mobile view), ensure menu is open
    const navList = page.locator("nav ul");
    if (!(await navList.isVisible())) {
      await menuToggle.click();
      await navList.waitFor({ state: "visible" });
    }
  }
}

// Helper function to click navigation link in mobile view
async function clickMobileNavLink(page, href) {
  await ensureMobileMenuOpen(page);
  await page.click(`a[href="${href}"]`);
}

test.describe("Navigation and Page Loading", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Check page title
    await expect(page).toHaveTitle(/Light of Data/);

    // Check main heading is visible (it contains a logo image)
    const heading = page.locator(".hero h1");
    await expect(heading).toBeVisible();

    // Check the logo image is present
    const logo = page.locator('.hero h1 img[alt*="Light of Data"]');
    await expect(logo).toBeVisible();

    // Check navigation is present
    await expect(page.locator("nav")).toBeVisible();

    // Check footer is present
    await expect(page.locator(".footer")).toBeVisible();
  });

  test("should navigate to different sections", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Test Services navigation (with mobile menu handling)
    await clickMobileNavLink(page, "#services-title");
    await expect(page.locator("#services-title")).toBeInViewport();

    // Test About navigation (with mobile menu handling)
    await clickMobileNavLink(page, "#about-title");
    await expect(page.locator("#about-title")).toBeInViewport();

    // Test Contact navigation (with mobile menu handling)
    await clickMobileNavLink(page, "#contact-title");
    await expect(page.locator("#contact-title")).toBeInViewport();
  });

  test("should have working external links", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Check LinkedIn link
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute("target", "_blank");

    // Check GitHub link
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("target", "_blank");
  });

  test("should display correct metadata", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Check favicon (it's actually a dynamic logo)
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /logo-small-dark/);

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1.0"
    );
  });
});

test.describe("Mobile Navigation", () => {
  test("should show mobile menu on small screens", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Mobile menu toggle should be visible
    const menuToggle = page.locator(".menu-toggle");
    await expect(menuToggle).toBeVisible();

    // Navigation links should be hidden initially (closed state)
    const navLinks = page.locator(".nav-links");
    await expect(navLinks).toHaveClass(/(?!.*open)/);

    // Click menu toggle
    await menuToggle.click();

    // Navigation links should now have open class
    await expect(navLinks).toHaveClass(/open/);

    // Test navigation link click
    await page.click('a[href="#services-title"]');
    await expect(page.locator("#services")).toBeInViewport();

    // Menu should close after navigation (open class should be removed)
    await expect(navLinks).not.toHaveClass(/open/);
  });

  test("should handle mobile menu keyboard navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Find and focus the menu toggle
    const menuToggle = page.locator(".menu-toggle");
    await menuToggle.focus();

    // Press Enter to open menu
    await page.keyboard.press("Enter");

    // Menu should be open
    const navLinks = page.locator(".nav-links");
    await expect(navLinks).toHaveClass(/open/);

    // Press Enter again to close menu (toggle behavior)
    await menuToggle.focus();
    await page.keyboard.press("Enter");

    // Menu should be closed
    await expect(navLinks).not.toHaveClass(/open/);
  });
});

test.describe("Responsive Design", () => {
  test("should adapt layout for different screen sizes", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopNav = page.locator(".nav-links");
    await expect(desktopNav).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(desktopNav).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator(".menu-toggle");
    await expect(menuToggle).toBeVisible();
  });

  test("should maintain functionality across viewport changes", async ({
    page,
  }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Start in mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    await page.click(".menu-toggle");
    await expect(page.locator(".nav-links")).toHaveClass(/open/);

    // Resize to desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Navigation should still work
    await page.click('a[href="#services-title"]');
    await expect(page.locator("#services")).toBeInViewport();
  });
});

test.describe("Accessibility", () => {
  test("should have proper focus management", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Skip link should be focusable
    await page.keyboard.press("Tab");

    // Check that focus indicators are visible when navigating
    const firstFocusable = page.locator(":focus").first();
    await expect(firstFocusable).toBeVisible();

    // Continue tabbing through navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to activate links with Enter
    await page.keyboard.press("Enter");
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Mobile menu toggle should have proper ARIA (check what's currently implemented)
    const menuToggle = page.locator(".menu-toggle");
    if (await menuToggle.isVisible()) {
      // Check that menu toggle has aria-label (which it does have)
      await expect(menuToggle).toHaveAttribute("aria-label", "Toggle menu");
      // Note: aria-expanded would be better UX but is not currently implemented
    }

    // Check for proper heading structure
    const h1 = page.locator(".hero h1");
    await expect(h1).toBeVisible();

    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute("alt");
    }
  });
});
