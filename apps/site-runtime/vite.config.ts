import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL(".", import.meta.url));

/**
 * Builds the runtime that published customer sites load: one stylesheet and one
 * script, written straight into the Laravel public directory so a deploy is
 * "pull, composer install, build" with nothing to copy by hand.
 *
 * Filenames are fixed rather than hashed because the published HTML that
 * references them is rendered by the browser at publish time and cannot know a
 * build hash. Serve /site/* with a short max-age.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: { jsx: "automatic" },
  build: {
    outDir: path.resolve(dir, "../api/public/site"),
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      input: path.resolve(dir, "src/main.tsx"),
      output: {
        entryFileNames: "site.js",
        chunkFileNames: "site-[name].js",
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith(".css") ? "site.css" : "site-[name][extname]",
      },
    },
  },
});
