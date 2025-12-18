import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";

// Only `mode` is used here because the configuration only depends on the build mode.
// If you need to customize the config based on the Vite command (e.g., 'serve' for dev server or 'build' for production build),
// add the `command` parameter to the function signature: ({ command, mode }) => ({ ... }).
// For example, use `command` if you want to enable plugins only during development, change server options for 'serve',
// or adjust build settings for 'build'. See https://vitejs.dev/config/#conditional-config for details.
export default defineConfig(({ mode }) => ({
  // Base path for deployment (adjust if deploying to a subdirectory)
  base: "./",

  // Plugins configuration
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __GA_MEASUREMENT_ID__:
          mode === "production" ? "G-CGZZ6MLGWX" : "GA-DEVELOPMENT-MODE",
      },
    }),
  ],

  // Build configuration
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure CSS and JS are inlined for better performance on simple sites
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: "./index.html",
        "time-tracker-privacy": "./time-tracker-privacy.html",
      },
      output: {
        // Customize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const extType = info.at(-1) ?? "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },

  // Asset handling
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
}));
