import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/dom";

/**
 * Test suite for mobile navigation menu functionality
 * Tests hamburger menu toggle, navigation links, and smooth scrolling
 */

describe("Mobile Navigation Menu", () => {
  beforeEach(() => {
    // Setup DOM structure for navigation
    document.body.innerHTML = `
      <nav>
        <div class="container">
          <div class="logo">
            <a href="#home">
              <img src="/images/small/png/logo-small-light-t.png" alt="Light of Data logo" />
            </a>
          </div>
          <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">
            <span class="menu-icon">&#9776;</span>
          </button>
          <ul class="nav-links" id="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about-title">About</a></li>
            <li><a href="#services-title">Services</a></li>
            <li><a href="#contact-title">Contact</a></li>
          </ul>
        </div>
      </nav>
      
      <section id="home" style="height: 100px;">Home Section</section>
      <section id="about-title" style="height: 100px;">About Section</section>
      <section id="services-title" style="height: 100px;">Services Section</section>
      <section id="contact-title" style="height: 100px;">Contact Section</section>
    `;

    // Mock smooth scrolling
    window.scrollTo = vi.fn();

    // Mock offsetTop and offsetHeight properties
    Object.defineProperty(HTMLElement.prototype, "offsetTop", {
      get() {
        if (this.id === "home") return 0;
        if (this.id === "about-title") return 500;
        if (this.id === "services-title") return 1000;
        if (this.id === "contact-title") return 1500;
        return 0;
      },
      configurable: true,
    });

    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      get() {
        return this.tagName === "NAV" ? 60 : 100;
      },
      configurable: true,
    });

    // Setup navigation functionality
    global.initMobileMenu = () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");
      const navLinkItems = navLinks.querySelectorAll("li a");
      const logoLink = document.querySelector(".logo a");
      const navHeight = document.querySelector("nav").offsetHeight || 60;
      const MENU_CLOSE_DELAY = 250;

      // Toggle menu when hamburger is clicked
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        menuToggle.classList.toggle("active");
      });

      // Close menu when any navigation link is clicked
      navLinkItems.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();

          // Close the menu immediately
          navLinks.classList.remove("open");
          menuToggle.classList.remove("active");

          // Get target and scroll smoothly after menu closes
          const targetId = link.getAttribute("href");
          const targetElement = document.querySelector(targetId);

          if (targetElement) {
            setTimeout(() => {
              const targetTop = targetElement.offsetTop - navHeight - 10;
              window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: "smooth",
              });
            }, MENU_CLOSE_DELAY);
          }
        });
      });

      // Handle logo click separately
      if (logoLink) {
        logoLink.addEventListener("click", (e) => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      }
    };

    // Initialize mobile menu
    global.initMobileMenu();
  });

  describe("Menu Toggle Functionality", () => {
    it("should toggle menu open state when hamburger is clicked", () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");

      expect(navLinks.classList.contains("open")).toBe(false);
      expect(menuToggle.classList.contains("active")).toBe(false);

      fireEvent.click(menuToggle);

      expect(navLinks.classList.contains("open")).toBe(true);
      expect(menuToggle.classList.contains("active")).toBe(true);
    });

    it("should toggle menu closed when clicking hamburger again", () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");

      // Open menu first
      fireEvent.click(menuToggle);
      expect(navLinks.classList.contains("open")).toBe(true);

      // Close menu
      fireEvent.click(menuToggle);
      expect(navLinks.classList.contains("open")).toBe(false);
      expect(menuToggle.classList.contains("active")).toBe(false);
    });

    it("should have proper accessibility attributes", () => {
      const menuToggle = document.getElementById("menu-toggle");
      expect(menuToggle.getAttribute("aria-label")).toBe("Toggle menu");
    });
  });

  describe("Navigation Link Functionality", () => {
    it("should close menu when navigation link is clicked", async () => {
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");
      const aboutLink = navLinks.querySelector('a[href="#about-title"]');

      // Open menu first
      fireEvent.click(menuToggle);
      expect(navLinks.classList.contains("open")).toBe(true);

      // Click navigation link
      fireEvent.click(aboutLink);

      // Menu should close immediately
      expect(navLinks.classList.contains("open")).toBe(false);
      expect(menuToggle.classList.contains("active")).toBe(false);
    });

    it("should prevent default link behavior", () => {
      const aboutLink = document.querySelector('a[href="#about-title"]');
      const clickEvent = new Event("click", { cancelable: true });

      fireEvent(aboutLink, clickEvent);
      expect(clickEvent.defaultPrevented).toBe(true);
    });

    it("should scroll to correct position after delay", async () => {
      const aboutLink = document.querySelector('a[href="#about-title"]');

      fireEvent.click(aboutLink);

      // Wait for timeout
      await waitFor(
        () => {
          expect(window.scrollTo).toHaveBeenCalledWith({
            top: 430, // 500 (offsetTop) - 60 (navHeight) - 10 = 430
            behavior: "smooth",
          });
        },
        { timeout: 300 }
      );
    });

    it("should handle minimum scroll position", async () => {
      const homeLink = document.querySelector('a[href="#home"]');

      fireEvent.click(homeLink);

      await waitFor(
        () => {
          expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0, // Math.max(0, negative_number) = 0
            behavior: "smooth",
          });
        },
        { timeout: 300 }
      );
    });

    it("should handle missing target elements gracefully", () => {
      // Add a link with non-existent target
      const navLinks = document.getElementById("nav-links");
      navLinks.innerHTML += '<li><a href="#nonexistent">Nonexistent</a></li>';

      global.initMobileMenu(); // Re-initialize with new link

      const nonexistentLink = navLinks.querySelector('a[href="#nonexistent"]');

      expect(() => fireEvent.click(nonexistentLink)).not.toThrow();
    });
  });

  describe("Logo Navigation", () => {
    it("should scroll to top when logo is clicked", () => {
      const logoLink = document.querySelector(".logo a");

      fireEvent.click(logoLink);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });

    it("should prevent default logo link behavior", () => {
      const logoLink = document.querySelector(".logo a");
      const clickEvent = new Event("click", { cancelable: true });

      fireEvent(logoLink, clickEvent);
      expect(clickEvent.defaultPrevented).toBe(true);
    });

    it("should handle missing logo gracefully", () => {
      document.querySelector(".logo a").remove();

      // Re-initialize without logo
      expect(() => global.initMobileMenu()).not.toThrow();
    });
  });

  describe("Responsive Design Elements", () => {
    it("should have correct nav structure", () => {
      const nav = document.querySelector("nav");
      const container = nav.querySelector(".container");
      const logo = container.querySelector(".logo");
      const menuToggle = container.querySelector(".menu-toggle");
      const navLinks = container.querySelector(".nav-links");

      expect(nav).toBeTruthy();
      expect(container).toBeTruthy();
      expect(logo).toBeTruthy();
      expect(menuToggle).toBeTruthy();
      expect(navLinks).toBeTruthy();
    });

    it("should have all required navigation items", () => {
      const navItems = document.querySelectorAll(".nav-links a");
      const expectedLinks = [
        "#home",
        "#about-title",
        "#services-title",
        "#contact-title",
      ];

      expect(navItems).toHaveLength(expectedLinks.length);

      navItems.forEach((item, index) => {
        expect(item.getAttribute("href")).toBe(expectedLinks[index]);
      });
    });

    it("should have menu icon with hamburger symbol", () => {
      const menuIcon = document.querySelector(".menu-icon");
      expect(menuIcon.textContent).toBe("☰"); // &#9776; renders as ☰
    });
  });
});
