import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Второй проход после основного build: IIFE без import — работает при открытии dist/index.html как file:// */
export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: false,
    minify: "esbuild",
    lib: {
      entry: path.resolve(__dirname, "js", "app.js"),
      name: "SportFit",
      formats: ["iife"],
      fileName: () => "sportfit-app",
    },
    rollupOptions: {
      output: {
        entryFileNames: "js/sportfit-app.js",
      },
    },
  },
});
