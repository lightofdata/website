/**
 * Mobile Navigation Menu Management
 * Handles mobile menu toggle and link click behavior
 *
 * This script supports two modes:
 * 1. Simple mode (time-tracker-privacy.html): Basic toggle with "active" class
 * 2. Complex mode (index.html): Smooth scrolling with offset calculations and both "open" and "active" classes
 *
 * The mode is determined by checking if navigation links are hash-based (complex mode)
 * or regular links (simple mode).
 */

// Initialize mobile menu
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (!menuToggle || !navLinks) {
  console.warn("Mobile menu elements not found");
} else {
  const navLinkItems = navLinks.querySelectorAll("li a");

  // Detect if we're on a single-page app with hash navigation (index.html)
  const isHashNavigation =
    navLinkItems.length > 0 &&
    Array.from(navLinkItems).some((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#");
    });

  if (isHashNavigation) {
    // Complex mode: Single-page smooth scrolling with offset
    const MENU_CLOSE_DELAY = 250; // ms
    const navHeight = document.querySelector("nav")?.offsetHeight || 60;

    // Toggle menu when hamburger is clicked (use both "open" and "active")
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      menuToggle.classList.toggle("active");
    });

    // Handle navigation links with smooth scrolling
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
          }, MENU_CLOSE_DELAY); // Wait for menu close animation
        }
      });
    });

    // Handle logo click separately (no menu closing needed)
    const logoLink = document.querySelector(".logo a");
    if (logoLink) {
      logoLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  } else {
    // Simple mode: Basic toggle for multi-page navigation
    // Toggle menu when hamburger is clicked (use "active" class only)
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Close mobile menu when any link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }
}
