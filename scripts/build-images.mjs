import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const gallery = path.join(root, "img", "gallery");

if (!fs.existsSync(gallery)) {
  console.error("Missing img/gallery");
  process.exit(1);
}

const files = fs.readdirSync(gallery).filter((f) => f.endsWith(".png"));

for (const f of files) {
  const base = f.replace(/\.png$/i, "");
  const src = path.join(gallery, f);
  const out = path.join(gallery, `${base}.webp`);
  await sharp(src).webp({ quality: 82, effort: 4 }).toFile(out);
  console.log("wrote", path.relative(root, out));
}
