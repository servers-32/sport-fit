import { copyFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const copyJsStaticPlugin = {
  name: "sportfit-copy-js-static",
  closeBundle() {
    const outDir = path.resolve(__dirname, "dist", "js");
    mkdirSync(outDir, { recursive: true });
    for (const f of ["i18n.js", "checkout-page.js"]) {
      copyFileSync(
        path.resolve(__dirname, "js", f),
        path.join(outDir, f)
      );
    }
  },
};

/** Если ES module не выполнился (часто при file://), подгружаем один IIFE-файл. */
const injectIifeFallbackPlugin = {
  name: "sportfit-iife-fallback",
  apply: "build",
  transformIndexHtml(html) {
    if (html.includes("sportfit-file-fallback")) return html;
    return html.replace(
      "</body>",
      `    <script>
      window.addEventListener("DOMContentLoaded", function () {
        if (window.__SPORTFIT_BOOTED || window.__SPORTFIT_IIFE_QUEUED) return;
        window.__SPORTFIT_IIFE_QUEUED = true;
        var s = document.createElement("script");
        s.src = "./js/sportfit-app.js";
        s.setAttribute("data-sportfit-file-fallback", "");
        s.onerror = function () {
          window.__SPORTFIT_IIFE_QUEUED = false;
          console.warn("[SportFit] Не загрузился ./js/sportfit-app.js. Запустите: npm run build");
        };
        document.body.appendChild(s);
      });
    </script>
</body>`
    );
  },
};

/** Сборка: `npm run build` → каталог `dist/` (см. package.json: затем vite.config.iife.js). */
export default defineConfig(({ command }) => ({
  root: ".",
  base: "./",
  server:
    command === "serve"
      ? {
          proxy: {
            "/create-payment-intent": {
              target: "http://127.0.0.1:4242",
              changeOrigin: true,
            },
          },
        }
      : undefined,
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        checkout: path.resolve(__dirname, "checkout.html"),
        training: path.resolve(__dirname, "training.html"),
        tariffs: path.resolve(__dirname, "tariffs.html"),
        zaly: path.resolve(__dirname, "zaly.html"),
        uslugi: path.resolve(__dirname, "uslugi.html"),
        galerie: path.resolve(__dirname, "galerie.html"),
        team: path.resolve(__dirname, "team.html"),
        reviews: path.resolve(__dirname, "reviews.html"),
        faq: path.resolve(__dirname, "faq.html"),
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
  plugins: [copyJsStaticPlugin, injectIifeFallbackPlugin],
}));
