// Theme switch with three modes: follow the system, light or dark. The choice
// is kept in localStorage under "theme" as "light" or "dark"; no entry means
// follow the system.
//
// An inline script in index.html's <head> applies the theme and favicon before
// the first paint, so the page does not flash light first. Keep it in step
// with resolveTheme() and updateFavicon() here.

const STORAGE_KEY = "theme";
const MODES = {
  system: { icon: "🌓", name: "System" },
  light: { icon: "☀️", name: "Light" },
  dark: { icon: "🌙", name: "Dark" },
};

const baseUrl = import.meta.env.BASE_URL;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const systemTheme = () => (systemDark.matches ? "dark" : "light");
const resolveTheme = (mode) => (mode === "system" ? systemTheme() : mode);

const readMode = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system"; // Storage is blocked; follow the system.
  }
};

const saveMode = (mode) => {
  try {
    if (mode === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage is blocked; the choice lasts until the page is left.
  }
};

// From System the first click shows the other theme, then the system's own
// theme as a fixed choice, then back to System. That way every click except
// the one back to System changes what is on screen.
const nextMode = (mode) => {
  const system = systemTheme();
  if (mode === "system") return system === "dark" ? "light" : "dark";
  if (mode !== system) return system;
  return "system";
};

// The light logo on a dark page, the dark logo on a light page. The icons are
// opaque so they stay visible whatever colour the browser's own frame is (#25).
const updateFavicon = (theme) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href =
    theme === "dark"
      ? `${baseUrl}images/small/png/logo-small-light-b.png`
      : `${baseUrl}images/small/png/logo-small-dark-w.png`;
};

const updateGithubIcon = (theme) => {
  const icon = document.getElementById("github-icon");
  if (!icon) return;
  icon.src =
    theme === "dark"
      ? `${baseUrl}images/github-mark-white.svg`
      : `${baseUrl}images/github-mark.svg`;
};

const updateLinkedInIcon = (theme) => {
  const icon = document.getElementById("linkedin-icon");
  if (!icon) return;
  icon.src =
    theme === "dark"
      ? `${baseUrl}images/InBug-White.png`
      : `${baseUrl}images/InBug-Black.png`;
};

const updateToggle = (mode) => {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  const label = `Theme: ${MODES[mode].name}. Switch to ${MODES[nextMode(mode)].name}.`;
  toggle.textContent = MODES[mode].icon;
  toggle.setAttribute("aria-label", label);
  toggle.title = label;
  toggle.dataset.mode = mode;
};

let currentMode = readMode();

const apply = () => {
  const theme = resolveTheme(currentMode);
  document.documentElement.setAttribute("data-theme", theme);
  updateFavicon(theme);
  updateGithubIcon(theme);
  updateLinkedInIcon(theme);
  updateToggle(currentMode);
};

// Exposed globally for the onclick handlers in the HTML.
window.toggleTheme = () => {
  currentMode = nextMode(currentMode);
  saveMode(currentMode);
  apply();
};

// Follow system changes while in System mode; the toggle's next step depends
// on the system theme, so refresh it in the other modes too.
systemDark.addEventListener("change", apply);

// Keep other open tabs of the site in step.
window.addEventListener("storage", (event) => {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  currentMode = readMode();
  apply();
});

// Module scripts run after the document is parsed, so the toggle and the
// social icons exist. This is earlier than DOMContentLoaded.
apply();
