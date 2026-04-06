/**
 * Flood-fill from image edges: removes outer white background only.
 * White inside closed black outlines (e.g. "SPORT") stays opaque.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(root, "img", "logo-source.png");
const output = path.join(root, "img", "logo.png");

const BG_R = 250;
const BG_G = 250;
const BG_B = 250;

function isBackground(r, g, b) {
  return r >= BG_R && g >= BG_G && b >= BG_B;
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const ch = 4;
const total = w * h;
const mask = new Uint8Array(total);

const qx = [];
const qy = [];

function tryEnqueue(x, y) {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const p = y * w + x;
  if (mask[p]) return;
  const o = p * ch;
  if (!isBackground(data[o], data[o + 1], data[o + 2])) return;
  mask[p] = 1;
  qx.push(x);
  qy.push(y);
}

for (let x = 0; x < w; x++) {
  tryEnqueue(x, 0);
  tryEnqueue(x, h - 1);
}
for (let y = 0; y < h; y++) {
  tryEnqueue(0, y);
  tryEnqueue(w - 1, y);
}

let head = 0;
while (head < qx.length) {
  const x = qx[head];
  const y = qy[head];
  head++;
  tryEnqueue(x + 1, y);
  tryEnqueue(x - 1, y);
  tryEnqueue(x, y + 1);
  tryEnqueue(x, y - 1);
}

const out = Buffer.from(data);
for (let p = 0; p < total; p++) {
  if (mask[p]) {
    out[p * ch + 3] = 0;
  }
}

// Лёгкое снятие белого ореола у пикселей, соседних с «дыркой» (антимостинг)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = y * w + x;
    const o = p * ch;
    if (mask[p]) continue;
    let nearTransparent = false;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (mask[ny * w + nx]) {
        nearTransparent = true;
        break;
      }
    }
    if (!nearTransparent) continue;
    const r = out[o];
    const g = out[o + 1];
    const b = out[o + 2];
    const maxc = Math.max(r, g, b);
    if (maxc >= 248) {
      const t = (maxc - 220) / 35;
      out[o + 3] = Math.round(out[o + 3] * Math.max(0, Math.min(1, 1 - t * 0.85)));
    }
  }
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(output);

const faviconPath = path.join(root, "favicon.png");
await sharp(output)
  .resize(64, 64, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(faviconPath);

console.log("Wrote", output, w + "x" + h);
console.log("Wrote", faviconPath);
