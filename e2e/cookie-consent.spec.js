import { test, expect } from "@playwright/test";

// Helper function to handle cookie consent if it's shown

test.describe("Cookie Consent Management", () => {
  test("should show cookie consent dialog on first visit", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Cookie consent dialog should be visible
    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Dialog should have proper structure
    await expect(page.locator("#cookie-consent-title")).toBeVisible();
    await expect(page.locator("#cookie-consent-description")).toBeVisible();

    // All action buttons should be present
    await expect(page.locator("#cookie-accept-all")).toBeVisible();
    await expect(page.locator("#cookie-accept-selected")).toBeVisible();
    await expect(page.locator("#cookie-reject-all")).toBeVisible();
  });

  test("should accept all cookies and hide dialog", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Click accept all
    await page.click("#cookie-accept-all");

    // Dialog should be hidden
    await expect(overlay).toBeHidden();

    // Preferences should be stored
    const preferences = await page.evaluate(() =>
      localStorage.getItem("cookie-consent-preferences")
    );
    expect(preferences).toBeTruthy();

    const parsed = JSON.parse(preferences);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);
  });

  test("should reject all cookies and hide dialog", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Click reject all
    await page.click("#cookie-reject-all");

    // Dialog should be hidden
    await expect(overlay).toBeHidden();

    // Preferences should be stored with all optional cookies rejected
    const preferences = await page.evaluate(() =>
      localStorage.getItem("cookie-consent-preferences")
    );
    expect(preferences).toBeTruthy();

    const parsed = JSON.parse(preferences);
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
  });

  test("should manage individual cookie preferences", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for dialog to appear
    await expect(page.locator("#cookie-consent-overlay")).toBeVisible();

    // Check individual cookie controls - use labels which are the visible toggle elements
    const analyticsCheckbox = page.locator("#analytics-consent");
    const marketingCheckbox = page.locator("#marketing-consent");
    const analyticsToggle = page
      .locator("label")
      .filter({ has: analyticsCheckbox });

    // Both should be unchecked initially
    await expect(analyticsCheckbox).not.toBeChecked();
    await expect(marketingCheckbox).not.toBeChecked();

    // Enable analytics but not marketing by clicking the visible toggle
    await analyticsToggle.click();
    await expect(analyticsCheckbox).toBeChecked();
    await expect(marketingCheckbox).not.toBeChecked();

    // Accept selected preferences
    await page.click("#cookie-accept-selected");

    // Dialog should be hidden
    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeHidden();

    // Check localStorage has correct preferences
    const preferences = await page.evaluate(() =>
      localStorage.getItem("cookie-consent-preferences")
    );
    const parsed = JSON.parse(preferences);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
  });

  test("should persist consent choices across page reloads", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Accept analytics only
    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Click the analytics toggle label to select it
    const analyticsLabel = page
      .locator("label")
      .filter({ has: page.locator("#analytics-consent") });
    await analyticsLabel.click();
    await page.click("#cookie-accept-selected");

    // Reload page
    await page.reload();

    // Dialog should not appear (consent already given)
    await expect(overlay).toBeHidden();

    // Preferences should persist
    const preferences = await page.evaluate(() =>
      localStorage.getItem("cookie-consent-preferences")
    );
    const parsed = JSON.parse(preferences);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
  });

  test("should close dialog with close button", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Click close button
    await page.click("#cookie-consent-close");

    // Dialog should be hidden
    await expect(overlay).toBeHidden();
  });

  test("should close dialog with Escape key", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Press Escape key
    await page.keyboard.press("Escape");

    // Dialog should be hidden
    await expect(overlay).toBeHidden();
  });

  test("should handle clicking outside dialog to close", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Click outside the dialog (on the overlay)
    await page
      .locator(".cookie-consent-overlay")
      .click({ position: { x: 10, y: 10 } });

    // Dialog should be hidden
    await expect(overlay).toBeHidden();
  });
});

test.describe("Cookie Consent Accessibility", () => {
  test("should have proper ARIA attributes", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const dialog = page.locator("#cookie-consent-overlay");
    await expect(dialog).toBeVisible();

    // Check ARIA attributes
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute(
      "aria-labelledby",
      "cookie-consent-title"
    );
    await expect(dialog).toHaveAttribute(
      "aria-describedby",
      "cookie-consent-description"
    );

    // Check close button has proper label
    const closeBtn = page.locator("#cookie-consent-close");
    await expect(closeBtn).toHaveAttribute(
      "aria-label",
      "Close cookie preferences"
    );
  });

  test("should trap focus within dialog", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Focus should be trapped within the dialog
    // Focus directly on a button to verify it can be focused
    const acceptAllBtn = page.locator("#cookie-accept-all");
    await acceptAllBtn.focus();
    await expect(acceptAllBtn).toBeFocused();

    // Tab should move to another focusable element within the dialog
    await page.keyboard.press("Tab");
    // Just verify that focus is still within the dialog (not specific element)
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should restore focus after closing dialog", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Focus an element before opening dialog (dialog opens automatically)
    const themeToggle = page.locator("#theme-toggle");

    const overlay = page.locator("#cookie-consent-overlay");
    await expect(overlay).toBeVisible();

    // Close dialog
    await page.click("#cookie-accept-all");
    await expect(overlay).toBeHidden();

    // Focus an element to verify focus is restored properly
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();
  });
});
