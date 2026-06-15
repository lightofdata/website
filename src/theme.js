// Dark mode toggle logic
const updateGithubIcon = (theme) => {
  const icon = document.getElementById("github-icon");
  if (!icon) return;
  const baseUrl = import.meta.env.BASE_URL;
  icon.src =
    theme === "dark"
      ? `${baseUrl}images/github-mark-white.svg`
      : `${baseUrl}images/github-mark.svg`;
};

const updateLinkedInIcon = (theme) => {
  const icon = document.getElementById("linkedin-icon");
  if (!icon) return;
  const baseUrl = import.meta.env.BASE_URL;
  icon.src =
    theme === "dark"
      ? `${baseUrl}images/InBug-White.png`
      : `${baseUrl}images/InBug-Black.png`;
};

const updateHeadIcon = (theme) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  const baseUrl = import.meta.env.BASE_URL;
  link.href =
    theme === "dark"
      ? `${baseUrl}images/small/png/logo-small-light-t.png?v=dark`
      : `${baseUrl}images/small/png/logo-small-dark-t.png?v=light`;
};

const setTheme = (theme, manual = false) => {
  document.documentElement.setAttribute("data-theme", theme);
  updateGithubIcon(theme);
  updateLinkedInIcon(theme);
  if (!manual) updateHeadIcon(theme);
  if (manual) {
    localStorage.setItem("theme", theme);
  }
};

// Expose toggleTheme globally for onclick handlers in HTML
window.toggleTheme = () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark", true);
};

// Initialize theme on load from localStorage or system preference
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const initialTheme = savedTheme || (systemDark.matches ? "dark" : "light");
  setTheme(initialTheme);
  // Listen for system theme changes only if user hasn't manually set a theme
  if (!savedTheme) {
    systemDark.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
  }
});
