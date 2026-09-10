import { test, expect } from "@playwright/test";
import { handleCookieConsent } from "./test-helpers.js";

test.describe("Time Tracker Account Deletion Page", () => {
  test("should load deletion page successfully", async ({ page }) => {
    await page.goto("/time-tracker-delete-account.html");

    await expect(page).toHaveTitle(/Time Tracker.*Delete/i);

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Delete Your Time Tracker Account");
  });

  test("should name the app and developer as shown on the store listing", async ({
    page,
  }) => {
    await page.goto("/time-tracker-delete-account.html");

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("Time Tracker");
    expect(content).toContain("Light of Data Ltd");
    expect(content).toContain("support@lightofdata.earth");
  });

  test("should cover both deletion paths required by Play Data safety", async ({
    page,
  }) => {
    await page.goto("/time-tracker-delete-account.html");

    // Full account deletion
    await expect(
      page.getByRole("heading", { name: /^Delete Your Account$/i })
    ).toBeVisible();

    // Deletion of individual data without deleting the account
    await expect(
      page.getByRole("heading", {
        name: /Delete Some of Your Data Without Deleting Your Account/i,
      })
    ).toBeVisible();
  });

  test("should give in-app steps and a route for uninstalled users", async ({
    page,
  }) => {
    await page.goto("/time-tracker-delete-account.html");

    await expect(
      page.getByRole("heading", {
        name: /If you still have the app installed/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /If you have already uninstalled the app/i,
      })
    ).toBeVisible();

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("Settings");
    expect(content).toContain("Delete Account");
    // The confirmation dialog requires typing DELETE - a step someone
    // following this page literally must not be surprised by
    expect(content).toMatch(/Type DELETE to confirm/i);
    // Every deletion path sends an automatic confirmation email, so the page
    // must say so - and must not promise a separate manual reply as well
    expect(content).toMatch(
      /a confirmation email is sent to your account's confirmed email address/i
    );
    expect(content).toMatch(/confirmation email is sent to that address/i);
    expect(content).not.toMatch(/confirm to you once the deletion/i);

    // A contact route must exist for users without the app
    await expect(
      page.locator('a[href="mailto:support@lightofdata.earth"]').first()
    ).toBeVisible();
  });

  test("should state what is deleted, what is kept, and the retention reason", async ({
    page,
  }) => {
    await page.goto("/time-tracker-delete-account.html");

    await expect(
      page.getByRole("heading", { name: /What is deleted/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /What is kept, and for how long/i })
    ).toBeVisible();

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    // Server-side and local data
    expect(content).toContain("clients, projects, tasks, time entries");
    expect(content).toContain("local database");
    // Retention carve-out must match the privacy policy
    expect(content).toContain("RevenueCat");
    expect(content).toMatch(/billing, tax, and dispute-resolution/i);
    // Deleting the account is not the same as cancelling a subscription
    expect(content).toMatch(/does not cancel a subscription/i);
    // Live deletion is immediate; only backups carry the 7-day window.
    // Same wording as time-tracker-privacy.html and time-tracker-terms.html.
    expect(content).toMatch(/live servers immediately/i);
    expect(content).toMatch(/age out within 7 days/i);
    // The confirmation email outlives the account at the email provider.
    // Same wording as time-tracker-privacy.html.
    expect(content).toContain("Resend");
    expect(content).toMatch(/delivery record/i);
  });

  test("should describe export as timesheet reports only", async ({ page }) => {
    await page.goto("/time-tracker-delete-account.html");

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("CSV");
    expect(content).toContain("PDF");
    // Must not overclaim a full account export
    expect(content).toMatch(/not a complete export of your account/i);
  });

  test("should link to the privacy policy and terms", async ({ page }) => {
    await page.goto("/time-tracker-delete-account.html");

    await expect(
      page.locator('a[href="./time-tracker-privacy.html"]').first()
    ).toBeVisible();
    await expect(
      page.locator('a[href="./time-tracker-terms.html"]').first()
    ).toBeVisible();
  });

  test("should have working navigation back to main site", async ({ page }) => {
    await page.goto("/time-tracker-delete-account.html");

    const homeLink = page.locator('a[href="./index.html"]').first();
    await homeLink.scrollIntoViewIfNeeded();
    await homeLink.click();
    await page.waitForURL(/index\.html|\/$/);

    await expect(page.locator("#home")).toBeVisible();
  });

  test("should be reachable from the Time Tracker project card", async ({
    page,
  }) => {
    await page.goto("/");
    await handleCookieConsent(page);

    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    const deleteLink = page
      .locator("#projects")
      .locator('a[href="./time-tracker-delete-account.html"]');
    await expect(deleteLink).toBeVisible();

    await deleteLink.click();
    await page.waitForURL("**/time-tracker-delete-account.html");

    await expect(page.locator("h1")).toContainText("Delete Your Time Tracker");
  });

  test("should be reachable from the privacy policy", async ({ page }) => {
    await page.goto("/time-tracker-privacy.html");

    const deleteLink = page
      .locator('a[href="./time-tracker-delete-account.html"]')
      .first();
    await deleteLink.scrollIntoViewIfNeeded();
    await expect(deleteLink).toBeVisible();

    await deleteLink.click();
    await page.waitForURL("**/time-tracker-delete-account.html");

    await expect(page.locator("h1")).toContainText("Delete Your Time Tracker");
  });

  test("should preserve theme selection across navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await handleCookieConsent(page);

    const html = page.locator("html");
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.goto("/time-tracker-delete-account.html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle back so the page's own toggle is exercised too
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should render the mobile menu toggle on small viewports", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/time-tracker-delete-account.html");

    await expect(page.locator("#menu-toggle")).toBeVisible();

    await page.locator("#menu-toggle").click();
    await expect(page.locator("#nav-links")).toBeVisible();
  });
});

// The retention wording is duplicated across three published pages. Play
// reviewers and users compare them side by side, so a change to one that
// leaves the others behind is a defect in itself - assert the shared claim
// on every page that makes it, in one place.
test.describe("Deletion wording consistency across legal pages", () => {
  const PAGES = [
    "/time-tracker-delete-account.html",
    "/time-tracker-privacy.html",
    "/time-tracker-terms.html",
  ];

  for (const path of PAGES) {
    test(`should state the same deletion and backup windows on ${path}`, async ({
      page,
    }) => {
      await page.goto(path);

      // Source wraps prose across lines, so compare on collapsed whitespace
      const content = (await page.textContent("body")).replace(/\s+/g, " ");

      // Deletion from the live service is immediate ...
      expect(content).toMatch(/live servers immediately/i);
      // ... and only backup copies carry the 7-day window
      expect(content).toMatch(/age out within 7 days/i);
      // No page may reintroduce the superseded "deleted from our servers
      // within 30 days" window. Scoped to our own deletion, because Resend's
      // 30-day email log retention is legitimately stated on two pages.
      expect(content).not.toMatch(/(deleted|servers)[^.]*within 30 days/i);
    });
  }
});
