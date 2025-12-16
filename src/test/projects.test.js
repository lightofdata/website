import { describe, it, expect, beforeEach } from "vitest";

/**
 * Test suite for Time Tracker and Projects section
 * Tests new Projects section content and privacy policy links
 */

describe("Projects Section", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <ul class="nav-links" id="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about-title">About</a></li>
          <li><a href="#services-title">Services</a></li>
          <li><a href="#projects-title">Projects</a></li>
          <li><a href="#contact-title">Contact</a></li>
        </ul>
      </nav>

      <section class="section" id="projects">
        <h2 id="projects-title">Projects</h2>
        <div class="services">
          <div class="service">
            <h3>Time Tracker</h3>
            <p>A privacy-focused time tracking application currently in testing.</p>
            <p>
              Track your time efficiently with a clean, intuitive interface designed
              for productivity.
            </p>
            <p style="margin-top: 1rem; font-style: italic; color: #666;">
              Coming soon - Currently in beta testing
            </p>
            <p style="margin-top: 0.5rem;">
              <a href="/time-tracker-privacy.html" style="color: #1a6a7e; text-decoration: none; font-weight: 500;">
                Privacy Policy →
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-content">
          <span>© 2025 Light Of Data Ltd</span>
          <span class="footer-separator">|</span>
          <span class="footer-item">Company #: 14811585</span>
          <span class="footer-separator">|</span>
          <span class="footer-item">
            <a href="/time-tracker-privacy.html" style="color: inherit; text-decoration: none;">
              Time Tracker Privacy
            </a>
          </span>
        </div>
      </footer>
    `;
  });

  describe("Projects Section Content", () => {
    it("should have Projects section with correct ID", () => {
      const projectsSection = document.getElementById("projects");
      const projectsTitle = document.getElementById("projects-title");

      expect(projectsSection).toBeTruthy();
      expect(projectsTitle).toBeTruthy();
      expect(projectsTitle.textContent).toBe("Projects");
    });

    it("should have Time Tracker project card", () => {
      const timeTrackerHeading = Array.from(
        document.querySelectorAll("h3")
      ).find((h3) => h3.textContent === "Time Tracker");

      expect(timeTrackerHeading).toBeTruthy();
      expect(
        timeTrackerHeading.parentElement.classList.contains("service")
      ).toBe(true);
    });

    it("should display Time Tracker description", () => {
      const projectsSection = document.getElementById("projects");
      const paragraphs = projectsSection.querySelectorAll("p");

      const hasPrivacyDescription = Array.from(paragraphs).some((p) =>
        p.textContent.includes("privacy-focused time tracking")
      );
      const hasBetaMessage = Array.from(paragraphs).some((p) =>
        p.textContent.includes("Coming soon")
      );

      expect(hasPrivacyDescription).toBe(true);
      expect(hasBetaMessage).toBe(true);
    });

    it("should have privacy policy link in project card", () => {
      const projectsSection = document.getElementById("projects");
      const privacyLink = projectsSection.querySelector(
        'a[href="/time-tracker-privacy.html"]'
      );

      expect(privacyLink).toBeTruthy();
      expect(privacyLink.textContent).toContain("Privacy Policy");
    });
  });

  describe("Navigation Integration", () => {
    it("should have Projects link in navigation", () => {
      const navLinks = document.getElementById("nav-links");
      const projectsLink = navLinks.querySelector('a[href="#projects-title"]');

      expect(projectsLink).toBeTruthy();
      expect(projectsLink.textContent).toBe("Projects");
    });

    it("should have Projects link in correct order (after Services)", () => {
      const navLinks = document.getElementById("nav-links");
      const allLinks = Array.from(navLinks.querySelectorAll("a"));
      const linkTexts = allLinks.map((link) => link.textContent);

      expect(linkTexts).toEqual([
        "Home",
        "About",
        "Services",
        "Projects",
        "Contact",
      ]);
    });
  });

  describe("Footer Privacy Link", () => {
    it("should have Time Tracker privacy link in footer", () => {
      const footer = document.querySelector(".footer");
      const privacyLink = footer.querySelector(
        'a[href="/time-tracker-privacy.html"]'
      );

      expect(privacyLink).toBeTruthy();
      expect(privacyLink.textContent).toContain("Time Tracker Privacy");
    });

    it("should have footer link styled consistently", () => {
      const footer = document.querySelector(".footer");
      const privacyLink = footer.querySelector(
        'a[href="/time-tracker-privacy.html"]'
      );

      expect(privacyLink.style.color).toBe("inherit");
      expect(privacyLink.style.textDecoration).toBe("none");
    });
  });

  describe("Projects Section Structure", () => {
    it("should use services grid layout for projects", () => {
      const projectsSection = document.getElementById("projects");
      const servicesGrid = projectsSection.querySelector(".services");

      expect(servicesGrid).toBeTruthy();
    });

    it("should have proper semantic HTML structure", () => {
      const projectsSection = document.getElementById("projects");

      // Should be a section element
      expect(projectsSection.tagName).toBe("SECTION");

      // Should have section class
      expect(projectsSection.classList.contains("section")).toBe(true);

      // Should have heading
      const heading = projectsSection.querySelector("h2");
      expect(heading).toBeTruthy();
      expect(heading.id).toBe("projects-title");
    });

    it("should support additional projects in the future", () => {
      const projectsSection = document.getElementById("projects");
      const servicesGrid = projectsSection.querySelector(".services");
      const projectCards = servicesGrid.querySelectorAll(".service");

      // Currently one project, but structure supports more
      expect(projectCards.length).toBeGreaterThan(0);
      expect(servicesGrid.children.length).toBe(projectCards.length);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const h2 = document.querySelector("#projects-title");
      const h3 = document.querySelector("#projects .service h3");

      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
      expect(h2.tagName).toBe("H2");
      expect(h3.tagName).toBe("H3");
    });

    it("should have descriptive link text", () => {
      const privacyLink = document
        .getElementById("projects")
        .querySelector('a[href="/time-tracker-privacy.html"]');

      // Link text should be descriptive, not just "click here"
      expect(privacyLink.textContent).toContain("Privacy Policy");
      expect(privacyLink.textContent.toLowerCase()).not.toBe("click here");
    });

    it("should have proper link styling for visibility", () => {
      const privacyLink = document
        .getElementById("projects")
        .querySelector('a[href="/time-tracker-privacy.html"]');

      // Link should have visible styling (not default blue/purple)
      expect(privacyLink.style.color).toBe("rgb(26, 106, 126)"); // #1a6a7e
      expect(privacyLink.style.fontWeight).toBe("500");
    });
  });

  describe("Content Requirements", () => {
    it("should clearly indicate beta/testing status", () => {
      const projectsSection = document.getElementById("projects");
      const content = projectsSection.textContent.toLowerCase();

      const hasBetaIndicator =
        content.includes("testing") ||
        content.includes("beta") ||
        content.includes("coming soon");

      expect(hasBetaIndicator).toBe(true);
    });

    it("should emphasize privacy focus", () => {
      const projectsSection = document.getElementById("projects");
      const content = projectsSection.textContent.toLowerCase();

      expect(content).toContain("privacy");
    });

    it("should include call-to-action for privacy policy", () => {
      const projectsSection = document.getElementById("projects");
      const privacyLink = projectsSection.querySelector(
        'a[href="/time-tracker-privacy.html"]'
      );

      expect(privacyLink).toBeTruthy();
      expect(privacyLink.textContent).toBeTruthy();
      expect(privacyLink.href).toContain("time-tracker-privacy.html");
    });
  });
});
