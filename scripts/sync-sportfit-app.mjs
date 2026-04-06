import { copyFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const from = path.join(root, "dist", "js", "sportfit-app.js");
const to = path.join(root, "js", "sportfit-app.js");

if (!existsSync(from)) {
  console.error(
    "[SportFit] Нет файла dist/js/sportfit-app.js — сначала должен отработать vite.config.iife.js"
  );
  process.exit(1);
}
copyFileSync(from, to);
