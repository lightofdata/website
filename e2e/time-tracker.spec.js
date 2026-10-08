import { test, expect } from "@playwright/test";
import { handleCookieConsent } from "./test-helpers.js";

const collapsedText = async (page) =>
  (await page.textContent("body")).replace(/\s+/g, " ");

test.describe("Time Tracker Product Page", () => {
  test("should load with the freelancer headline", async ({ page }) => {
    await page.goto("/time-tracker.html");

    // "Multiple clients" is the search phrasing (#62 review)
    await expect(page).toHaveTitle(/Time Tracker.*Multiple Clients/i);
    await expect(page.locator("h1")).toContainText(
      "Time tracking for freelancers who bill multiple clients"
    );
    await expect(page.locator(".tt-subhead")).toHaveText(
      "Show every client where the hours went."
    );
  });

  // The page exists so posts and videos can link to it
  test("should have a canonical URL and link previews", async ({ page }) => {
    await page.goto("/time-tracker.html");

    const url = "https://lightofdata.earth/time-tracker.html";
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      url
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      url
    );
    for (const selector of [
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:card"]',
      'meta[property="og:image:alt"]',
    ]) {
      await expect(page.locator(selector)).toHaveAttribute("content", /\S/);
    }

    // The share card is a large 1200×630 image, and the file is there
    const card = "https://lightofdata.earth/images/time-tracker/og-card.png";
    for (const selector of [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]) {
      await expect(page.locator(selector)).toHaveAttribute("content", card);
    }
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
    const response = await page.request.get(new URL(card).pathname);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("should link to both stores with the official badges", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");

    const hrefs = {
      "app-store": "https://apps.apple.com/app/id6756789817",
      "google-play":
        "https://play.google.com/store/apps/details?id=earth.lightofdata.timetracker",
    };
    // Once in the hero, once after Free and Pro where readers decide
    for (const where of ["#tt-hero", ".tt-cta"]) {
      for (const [store, href] of Object.entries(hrefs)) {
        const badge = page.locator(`${where} [data-store="${store}"]`);
        await expect(badge).toHaveAttribute("href", href);
      }
    }
    await expect(page.locator(".tt-cta")).toContainText(
      "Free for up to 3 clients."
    );
    for (const badge of await page.locator("[data-store]").all()) {
      await badge.scrollIntoViewIfNeeded();
      await expect(badge).toBeVisible();
      await expect(badge).toHaveAttribute("rel", /noopener/);

      const img = badge.locator("img");
      await expect(img).toHaveAttribute("alt", /App Store|Google Play/);
      await expect
        .poll(() => img.evaluate((el) => el.complete && el.naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test("should lead with calendar sync, offline-first and AI summaries", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");

    for (const name of [
      /^A Google Calendar per client$/i,
      /^Offline-first$/i,
      /^AI summaries for your clients$/i,
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
    expect(await collapsedText(page)).toContain("even when the app is closed");
  });

  // Selling Pro features without saying so reads as bait and switch (#62)
  test("should mark the Pro features as Pro", async ({ page }) => {
    await page.goto("/time-tracker.html");

    const tagged = await page
      .locator(".tt-features .service")
      .evaluateAll((cards) =>
        cards.map((card) => ({
          title: card.querySelector("h3").textContent.trim(),
          pro: !!card.querySelector(".tt-pro-tag"),
        }))
      );
    expect(tagged).toEqual([
      { title: "A Google Calendar per client", pro: true },
      { title: "Offline-first", pro: false },
      { title: "AI summaries for your clients", pro: true },
    ]);
    await expect(page.locator(".tt-lead")).toContainText(
      "Pro gives each client their own Google Calendar"
    );
  });

  // Title case for section headings, as on the support, privacy and terms
  // pages. Card titles (h3) stay in sentence case.
  test("should use title case for section headings", async ({ page }) => {
    await page.goto("/time-tracker.html");

    const headings = await page.locator("h2").allTextContents();
    expect(headings.length).toBeGreaterThan(0);
    for (const heading of headings) {
      const words = heading.trim().split(/\s+/);
      for (const word of words.filter((w) => w.length > 3)) {
        expect(word[0], `"${word}" in "${heading}"`).toBe(
          word[0].toUpperCase()
        );
      }
    }
  });

  test("should say who it is for", async ({ page }) => {
    await page.goto("/time-tracker.html");

    await expect(
      page.getByRole("heading", { name: /^Who it's for$/i })
    ).toBeVisible();
    const content = await collapsedText(page);
    expect(content).toContain("Freelancers and consultants");
    // The store listings dropped "small teams" (time_tracker#498)
    expect(content).toContain("not for teams");
    // The 9 languages the store listing names (it has 12 store locales)
    expect(content).toContain(
      "English, German, Spanish, French, Italian, Portuguese, Croatian, Serbian and Japanese"
    );
  });

  // Free vs Pro is copied from the store listing (time_tracker#498). A store
  // reviewer or user comparing the two must not find different limits.
  test("should describe Free and Pro as the store listing does", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");

    const free = page.locator('[data-plan="free"]');
    const pro = page.locator('[data-plan="pro"]');
    await expect(free).toContainText(
      "3 clients, 3 projects per client and 3 tasks per project"
    );
    await expect(pro).toContainText("Unlimited clients, projects and tasks");
    await expect(pro).toContainText("in a calendar for each client");
    await expect(pro).toContainText("AI summaries");
    await expect(pro).toContainText("Monthly or yearly subscription");

    // Pro-only features must not be listed as free
    await expect(free).not.toContainText("Google Calendar");
    await expect(free).not.toContainText("AI");
  });

  test("should answer the FAQ, with calendar sync one way", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");

    for (const name of [
      /offline-first.*mean/i,
      /Where does my data live/i,
      /How does calendar sync work/i,
      /How do AI summaries work/i,
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
    const content = await collapsedText(page);
    expect(content).toContain("one way: from Time Tracker to Google");
    expect(content).toContain(
      "Changes you make in Google Calendar are not copied back into the app"
    );
    expect(content).toContain(
      "It cannot see or change any other calendar in your Google account"
    );
    // The own-key option lives in the FAQ, not the Pro list
    expect(content).toContain("Anthropic, OpenAI, Gemini or OpenRouter key");
    await expect(page.locator('[data-plan="pro"]')).not.toContainText(
      "OpenRouter"
    );
  });

  test("should hold a place for the demo video", async ({ page }) => {
    await page.goto("/time-tracker.html");

    await expect(page.locator("[data-placeholder]")).toHaveCount(1);
    const video = page.locator('[data-placeholder="video"]');
    await expect(video).toHaveAttribute("role", "img");
    await expect(video).toHaveAttribute("aria-label", /coming soon/i);
  });

  test("should show each screenshot in the page's theme, uncropped", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");
    await handleCookieConsent(page);

    const shots = ["entries", "google-cal", "report"];
    const order = await page
      .locator("[data-shot]")
      .evaluateAll((els) => els.map((el) => el.dataset.shot));
    expect(order).toEqual(shots);

    const html = page.locator("html");
    for (const theme of ["light", "dark"]) {
      if ((await html.getAttribute("data-theme")) !== theme) {
        await page.locator("#theme-toggle").click();
      }
      await expect(html).toHaveAttribute("data-theme", theme);
      const other = theme === "light" ? "dark" : "light";

      for (const shot of shots) {
        const img = page.locator(`[data-shot="${shot}"] .tt-shot-${theme}`);
        await expect(img).toHaveAttribute(
          "src",
          `./images/time-tracker/${shot}-${theme}.webp`
        );
        await expect(img).toHaveAttribute("alt", /.+/);
        await expect(
          page.locator(`[data-shot="${shot}"] .tt-shot-${other}`)
        ).toBeHidden();

        await img.scrollIntoViewIfNeeded();
        await expect(img).toBeVisible();
        // Loaded, not a broken image (lazy images load once shown)
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
    }
  });

  test("should link to support, privacy, terms and deletion pages", async ({
    page,
  }) => {
    await page.goto("/time-tracker.html");

    for (const href of [
      "./time-tracker-support.html",
      "./time-tracker-privacy.html",
      "./time-tracker-terms.html",
      "./time-tracker-delete-account.html",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("should be reachable from the Time Tracker project card", async ({
    page,
  }) => {
    await page.goto("/");
    await handleCookieConsent(page);

    await page.locator("#projects-title").scrollIntoViewIfNeeded();

    const productLink = page
      .locator("#projects")
      .locator('a[href="./time-tracker.html"]');
    await expect(productLink).toBeVisible();

    await productLink.click();
    await page.waitForURL("**/time-tracker.html");

    await expect(page.locator("h1")).toContainText(
      "Time tracking for freelancers who bill multiple clients"
    );
  });

  // The page has no analytics of its own: nothing may be tracked here, with
  // or without consent.
  test("should not load analytics or set cookies", async ({ page }) => {
    const gaRequests = [];
    page.on("request", (request) => {
      if (/googletagmanager|google-analytics/.test(request.url())) {
        gaRequests.push(request.url());
      }
    });

    await page.goto("/time-tracker.html");
    await page.waitForLoadState("networkidle");

    expect(gaRequests).toEqual([]);
    expect(await page.context().cookies()).toEqual([]);
    await expect(page.locator("#cookie-consent-overlay")).toHaveCount(0);
  });

  test("should preserve theme selection across navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await handleCookieConsent(page);

    const html = page.locator("html");
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.goto("/time-tracker.html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should stack sections and fit a phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/time-tracker.html");

    await expect(page.locator("#menu-toggle")).toBeVisible();
    await page.locator("#menu-toggle").click();
    await expect(page.locator("#nav-links")).toBeVisible();

    // Feature and plan cards, and the screenshots, stack instead of
    // squeezing side by side
    for (const selector of [".tt-features", ".tt-plans", ".tt-screenshots"]) {
      await expect(page.locator(selector)).toHaveCSS(
        "flex-direction",
        "column"
      );
    }
    // Stacked screenshots are wide enough to read, not thumbnails
    for (const shot of await page.locator(".tt-shot").all()) {
      expect((await shot.boundingBox()).width).toBeGreaterThan(220);
    }

    // The page's own content fits the screen, down to the smallest common
    // phone width. The shared navbar is left out: in Firefox it is already
    // 10px too wide on every page (#65).
    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 800 });
      const overflowing = await page.evaluate(() =>
        [...document.querySelectorAll(".section, .section *")]
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth)
          .map((el) => el.className || el.tagName)
      );
      expect(overflowing, `at ${width}px`).toEqual([]);
    }
  });
});
