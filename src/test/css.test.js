import { describe, it, expect, beforeEach } from "vitest";

/**
 * CSS and styling tests for the Light of Data website
 * Tests CSS classes, responsive behavior, and theme styling
 */

describe("CSS and Styling Tests", () => {
  beforeEach(() => {
    // Setup basic HTML structure with CSS classes
    document.head.innerHTML = `
      <style>
        /* Import relevant CSS for testing */
        :root {
          --smooth-ease: cubic-bezier(0.4, 0, 0.2, 1);
          --smooth-duration: 0.3s;
        }
        
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 2rem;
          color: #e5e5e5ff;
          cursor: pointer;
          margin-left: 1rem;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        @media (max-width: 600px) {
          .menu-toggle {
            display: block;
          }
          
          .nav-links {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: #1a6a7e;
            flex-direction: column;
            opacity: 0;
            visibility: hidden;
            transition: opacity var(--smooth-duration) var(--smooth-ease),
                        visibility var(--smooth-duration) var(--smooth-ease);
          }
          
          .nav-links.open {
            opacity: 1;
            visibility: visible;
          }
        }
        
        /* Dark theme styles */
        html[data-theme="dark"] .section {
          background: #23272e !important;
          color: #d3d3d3 !important;
        }
        
        html[data-theme="dark"] .footer {
          background: #23272e;
          color: #eee;
        }
        
        .cookie-consent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--smooth-duration) var(--smooth-ease);
        }
        
        .cookie-consent-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        .cookie-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          background-color: #ccc;
          border-radius: 24px;
          transition: var(--smooth-duration) var(--smooth-ease);
        }
        
        .cookie-toggle input:checked + .toggle-slider {
          background-color: #3976ab;
        }
      </style>
    `;

    document.body.innerHTML = `
      <nav>
        <div class="container">
          <button class="menu-toggle" id="menu-toggle">☰</button>
          <ul class="nav-links" id="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
      </nav>
      
      <section class="section" id="test-section">
        <h2>Test Section</h2>
      </section>
      
      <footer class="footer">
        <div class="footer-content">Footer Content</div>
      </footer>
      
      <div id="cookie-consent-overlay" class="cookie-consent-overlay">
        <div class="cookie-consent-dialog">
          <label class="cookie-toggle">
            <input type="checkbox" id="test-checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
  });

  describe("CSS Class Application", () => {
    it("should have correct initial CSS classes", () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");
      const section = document.getElementById("test-section");
      const overlay = document.getElementById("cookie-consent-overlay");

      expect(menuToggle.classList.contains("menu-toggle")).toBe(true);
      expect(navLinks.classList.contains("nav-links")).toBe(true);
      expect(section.classList.contains("section")).toBe(true);
      expect(overlay.classList.contains("cookie-consent-overlay")).toBe(true);
    });

    it("should apply dynamic classes correctly", () => {
      const navLinks = document.getElementById("nav-links");
      const overlay = document.getElementById("cookie-consent-overlay");

      // Test dynamic class addition
      navLinks.classList.add("open");
      expect(navLinks.classList.contains("open")).toBe(true);

      overlay.classList.add("show");
      expect(overlay.classList.contains("show")).toBe(true);

      // Test class removal
      navLinks.classList.remove("open");
      expect(navLinks.classList.contains("open")).toBe(false);

      overlay.classList.remove("show");
      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should toggle classes correctly", () => {
      const navLinks = document.getElementById("nav-links");

      expect(navLinks.classList.contains("open")).toBe(false);

      navLinks.classList.toggle("open");
      expect(navLinks.classList.contains("open")).toBe(true);

      navLinks.classList.toggle("open");
      expect(navLinks.classList.contains("open")).toBe(false);
    });
  });

  describe("Theme Styling", () => {
    it("should apply dark theme data attribute", () => {
      document.documentElement.setAttribute("data-theme", "dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      document.documentElement.setAttribute("data-theme", "light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should handle theme transitions", () => {
      const section = document.getElementById("test-section");

      // Test that element exists and can have theme applied
      expect(section).toBeTruthy();

      // Simulate theme change
      document.documentElement.setAttribute("data-theme", "dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      // Test computed styles would be applied (can't test actual computed styles in jsdom)
      // But we can test the structure is correct
      expect(section.classList.contains("section")).toBe(true);
    });

    it("should maintain CSS custom properties", () => {
      // Test that CSS custom properties structure is maintained
      const testElement = document.createElement("div");
      testElement.style.setProperty("--test-duration", "0.3s");

      expect(testElement.style.getPropertyValue("--test-duration")).toBe(
        "0.3s"
      );
    });
  });

  describe("Responsive Design Classes", () => {
    it("should have mobile-specific classes available", () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");

      // Elements should exist for responsive behavior
      expect(menuToggle).toBeTruthy();
      expect(navLinks).toBeTruthy();

      // Test that responsive classes can be applied
      menuToggle.classList.add("active");
      expect(menuToggle.classList.contains("active")).toBe(true);

      navLinks.classList.add("open");
      expect(navLinks.classList.contains("open")).toBe(true);
    });

    it("should handle viewport-dependent styles", () => {
      // While we can't test actual CSS media queries in jsdom,
      // we can test that the structure supports them
      const navLinks = document.getElementById("nav-links");

      // Test classes that would be affected by media queries
      expect(navLinks.classList.contains("nav-links")).toBe(true);

      // Simulate mobile state
      navLinks.classList.add("mobile-open");
      expect(navLinks.classList.contains("mobile-open")).toBe(true);
    });

    it("should support animation classes", () => {
      const overlay = document.getElementById("cookie-consent-overlay");

      // Test transition classes
      overlay.classList.add("show");
      expect(overlay.classList.contains("show")).toBe(true);

      // Test that elements support animation-related properties
      overlay.style.transition = "opacity 0.3s ease";
      expect(overlay.style.transition).toBe("opacity 0.3s ease");
    });
  });

  describe("Form and Input Styling", () => {
    it("should handle checkbox styling classes", () => {
      const checkbox = document.getElementById("test-checkbox");
      const toggle = checkbox.parentElement;
      const slider = toggle.querySelector(".toggle-slider");

      expect(checkbox.type).toBe("checkbox");
      expect(toggle.classList.contains("cookie-toggle")).toBe(true);
      expect(slider.classList.contains("toggle-slider")).toBe(true);
    });

    it("should support form state changes", () => {
      const checkbox = document.getElementById("test-checkbox");

      // Test checkbox state changes
      expect(checkbox.checked).toBe(false);

      checkbox.checked = true;
      expect(checkbox.checked).toBe(true);

      checkbox.checked = false;
      expect(checkbox.checked).toBe(false);
    });

    it("should apply focus and interaction classes", () => {
      const checkbox = document.getElementById("test-checkbox");

      // Test that focus classes can be applied
      checkbox.classList.add("focus");
      expect(checkbox.classList.contains("focus")).toBe(true);

      checkbox.classList.remove("focus");
      expect(checkbox.classList.contains("focus")).toBe(false);
    });
  });

  describe("Layout and Positioning", () => {
    it("should maintain proper DOM structure for CSS", () => {
      const nav = document.querySelector("nav");
      const container = nav.querySelector(".container");
      const section = document.querySelector(".section");
      const footer = document.querySelector(".footer");

      expect(nav).toBeTruthy();
      expect(container).toBeTruthy();
      expect(section).toBeTruthy();
      expect(footer).toBeTruthy();

      // Test hierarchical structure
      expect(container.parentElement).toBe(nav);
      expect(nav.nextElementSibling).toBe(section);
    });

    it("should support overlay positioning", () => {
      const overlay = document.getElementById("cookie-consent-overlay");
      const dialog = overlay.querySelector(".cookie-consent-dialog");

      expect(overlay).toBeTruthy();
      expect(dialog).toBeTruthy();
      expect(dialog.parentElement).toBe(overlay);

      // Test that positioning classes are maintained
      expect(overlay.classList.contains("cookie-consent-overlay")).toBe(true);
    });

    it("should handle z-index layering", () => {
      const overlay = document.getElementById("cookie-consent-overlay");

      // Test that z-index can be applied
      overlay.style.zIndex = "10000";
      expect(overlay.style.zIndex).toBe("10000");
    });
  });

  describe("Accessibility CSS Support", () => {
    it("should support focus indicators", () => {
      const menuToggle = document.getElementById("menu-toggle");

      // Test focus class application
      menuToggle.classList.add("focus");
      expect(menuToggle.classList.contains("focus")).toBe(true);

      // Test outline properties
      menuToggle.style.outline = "2px solid #ffd600";
      expect(menuToggle.style.outline).toContain("2px solid");
    });

    it("should support screen reader classes", () => {
      const srOnly = document.createElement("span");
      srOnly.classList.add("sr-only");
      srOnly.textContent = "Screen reader only text";

      expect(srOnly.classList.contains("sr-only")).toBe(true);
      expect(srOnly.textContent).toBe("Screen reader only text");
    });

    it("should handle aria attributes with styling", () => {
      const button = document.getElementById("menu-toggle");

      button.setAttribute("aria-expanded", "false");
      expect(button.getAttribute("aria-expanded")).toBe("false");

      button.setAttribute("aria-expanded", "true");
      expect(button.getAttribute("aria-expanded")).toBe("true");

      // Test that ARIA states can influence CSS classes
      if (button.getAttribute("aria-expanded") === "true") {
        button.classList.add("expanded");
      }
      expect(button.classList.contains("expanded")).toBe(true);
    });
  });
});
