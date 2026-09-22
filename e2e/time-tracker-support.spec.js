import { test, expect } from "@playwright/test";
import { handleCookieConsent } from "./test-helpers.js";

test.describe("Time Tracker Support Page", () => {
  test("should load support page successfully", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

    await expect(page).toHaveTitle(/Time Tracker.*Support/i);

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Time Tracker Support");
  });

  test("should name the app and developer as shown on the store listing", async ({
    page,
  }) => {
    await page.goto("/time-tracker-support.html");

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("Time Tracker");
    expect(content).toContain("Light of Data Ltd");
    expect(content).toContain("support@lightofdata.earth");
  });

  test("should say how to get help and what to include", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

    await expect(
      page.getByRole("heading", { name: /^How to Get Help$/i })
    ).toBeVisible();
    await expect(
      page.locator('a[href="mailto:support@lightofdata.earth"]').first()
    ).toBeVisible();

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("App version");
    expect(content).toContain("Platform");
    expect(content).toContain("Device");
    expect(content).toContain("What happened");
  });

  test("should answer the common questions", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

    for (const name of [
      /^Frequently Asked Questions$/i,
      /^Subscriptions$/i,
      /^Restoring Purchases$/i,
      /^Google Calendar$/i,
      /^Exporting Reports$/i,
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });

  // Calendar sync moved to the server in 1.6.0 (#55). The old client-side
  // controls no longer exist, so the FAQ must not send users looking for them.
  test("should describe server-side Google Calendar sync", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain(
      "Settings > Integrations > Calendar Sync and select Connect Google"
    );
    expect(content).toContain("Sync to Google Calendar");
    expect(content).toContain("even when the app is closed");
    expect(content).toContain(
      "Calendars and events already written stay in Google"
    );
    for (const removed of [
      "Enable Calendar Sync",
      "Authenticate Google Calendar",
      "Sign Out",
    ]) {
      expect(content).not.toContain(removed);
    }
  });

  // Subscription wording is duplicated from the terms. Store reviewers compare
  // the two, so the support page must not drift from what the terms promise.
  test("should describe cancellation and refunds as the terms do", async ({
    page,
  }) => {
    const collapsed = async (path) => {
      await page.goto(path);
      return (await page.textContent("body")).replace(/\s+/g, " ");
    };
    const terms = await collapsed("/time-tracker-terms.html");
    const support = await collapsed("/time-tracker-support.html");

    for (const claim of [
      "Go to Settings > [Your Name] > Subscriptions in the Apple App Store",
      "Go to the Google Play Store > Account > Payments & subscriptions",
      "We do not issue refunds directly.",
      "please contact Apple Support or Google Play Support",
    ]) {
      expect(terms).toContain(claim);
      expect(support).toContain(claim);
    }
    expect(support).toMatch(/does not cancel a subscription/i);
  });

  test("should describe export as timesheet reports only", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

    const content = (await page.textContent("body")).replace(/\s+/g, " ");
    expect(content).toContain("CSV");
    expect(content).toContain("PDF");
    // Must not overclaim a full account export (#45)
    expect(content).toMatch(/not a complete export of your account/i);
  });

  test("should show each screenshot in its section, in order", async ({
    page,
  }) => {
    await page.goto("/time-tracker-support.html");

    await expect(page.locator("[data-screenshot]")).toHaveCount(5);
    const order = await page
      .locator("[data-screenshot]")
      .evaluateAll((els) => els.map((el) => el.dataset.screenshot));
    expect(order).toEqual([
      "app-support-entry.png",
      "subscription-manage.png",
      "google-calendar-connect.png",
      "google-calendar-disconnect.png",
      "reports-export.png",
    ]);
  });

  test("should load real screenshots with alt text at their own aspect ratio", async ({
    page,
  }) => {
    await page.goto("/time-tracker-support.html");

    for (const file of [
      "app-support-entry.png",
      "subscription-manage.png",
      "google-calendar-connect.png",
      "google-calendar-disconnect.png",
      "reports-export.png",
    ]) {
      const img = page.locator(`img[data-screenshot="${file}"]`);
      await expect(img).toHaveAttribute(
        "src",
        `./images/time-tracker/support/${file}`
      );
      await expect(img).toHaveAttribute("alt", /^Time Tracker .+/);

      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible();
      // Loaded, not a broken image (lazy images load once scrolled to)
      await expect
        .poll(() => img.evaluate((el) => el.complete && el.naturalWidth))
        .toBeGreaterThan(0);

      // Not cropped or stretched: rendered shape matches the file's shape
      const { naturalWidth, naturalHeight } = await img.evaluate((el) => ({
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      }));
      const box = await img.boundingBox();
      expect(box.height / box.width).toBeCloseTo(
        naturalHeight / naturalWidth,
        1
      );
    }
  });

  test("should link to the privacy policy, terms and deletion page", async ({
    page,
  }) => {
    await page.goto("/time-tracker-support.html");

    for (const href of [
      "./time-tracker-privacy.html",
      "./time-tracker-terms.html",
      "./time-tracker-delete-account.html",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("should have working navigation back to main site", async ({ page }) => {
    await page.goto("/time-tracker-support.html");

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

    const supportLink = page
      .locator("#projects")
      .locator('a[href="./time-tracker-support.html"]');
    await expect(supportLink).toBeVisible();

    await supportLink.click();
    await page.waitForURL("**/time-tracker-support.html");

    await expect(page.locator("h1")).toContainText("Time Tracker Support");
  });

  for (const path of [
    "/time-tracker-privacy.html",
    "/time-tracker-terms.html",
    "/time-tracker-delete-account.html",
  ]) {
    test(`should be reachable from ${path}`, async ({ page }) => {
      await page.goto(path);

      const supportLink = page
        .locator('a[href="./time-tracker-support.html"]')
        .first();
      await supportLink.scrollIntoViewIfNeeded();
      await expect(supportLink).toBeVisible();

      await supportLink.click();
      await page.waitForURL("**/time-tracker-support.html");

      await expect(page.locator("h1")).toContainText("Time Tracker Support");
    });
  }

  test("should preserve theme selection across navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await handleCookieConsent(page);

    const html = page.locator("html");
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.goto("/time-tracker-support.html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle back so the page's own toggle is exercised too
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should render the mobile menu toggle on small viewports", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/time-tracker-support.html");

    await expect(page.locator("#menu-toggle")).toBeVisible();

    await page.locator("#menu-toggle").click();
    await expect(page.locator("#nav-links")).toBeVisible();
  });
});
