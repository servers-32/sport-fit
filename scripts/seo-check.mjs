import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_BASE = "https://sportfit-badhersfeld.de";
const PAGES = [
  "/",
  "/tariffs.html",
  "/training.html",
  "/zaly.html",
  "/uslugi.html",
  "/galerie.html",
  "/team.html",
  "/reviews.html",
  "/faq.html",
];

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  return process.argv[i + 1] || fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function normalizeBase(url) {
  return (url || DEFAULT_BASE).replace(/\/+$/, "");
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    shell: true,
    ...opts,
  });
  if (res.error) {
    throw new Error(res.error.message || `Failed to run: ${cmd}`);
  }
  if (res.status !== 0) {
    const out = [res.stdout, res.stderr].filter(Boolean).join("\n").trim();
    throw new Error(out || `Command failed: ${cmd} ${args.join(" ")}`);
  }
  return res;
}

async function waitForBase(baseUrl, timeoutMs = 30000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(baseUrl, { redirect: "follow" });
      if (res.ok) return;
      lastError = new Error(`status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  throw new Error(`Base URL is not ready: ${baseUrl} (${lastError?.message || "timeout"})`);
}

async function checkStaticSeoEndpoints(baseUrl) {
  const urls = [`${baseUrl}/robots.txt`, `${baseUrl}/sitemap.xml`];
  for (const u of urls) {
    const res = await fetch(u, { redirect: "follow" });
    if (!res.ok) {
      throw new Error(`SEO endpoint unavailable: ${u} (status ${res.status})`);
    }
    const text = await res.text();
    if (!text || text.length < 8) {
      throw new Error(`SEO endpoint seems empty: ${u}`);
    }
  }
}

async function assertIndexableHeaders(baseUrl) {
  const probePages = ["/", "/tariffs.html", "/training.html"];
  for (const page of probePages) {
    const res = await fetch(`${baseUrl}${page}`, {
      method: "GET",
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Page is not reachable for indexing: ${page} (status ${res.status})`);
    }
    const xRobots = (res.headers.get("x-robots-tag") || "").toLowerCase();
    if (xRobots.includes("noindex")) {
      throw new Error(`x-robots-tag contains noindex on ${page}: "${xRobots}"`);
    }
  }
}

function runLighthouseSeo(baseUrl, threshold) {
  const tmp = mkdtempSync(path.join(tmpdir(), "sportfit-seo-"));
  const scores = [];
  try {
    for (const page of PAGES) {
      const slug = page === "/" ? "index" : page.slice(1).replace(".html", "");
      const out = path.join(tmp, `seo-${slug}.json`);
      const url = `${baseUrl}${page}`;
      run("npx", [
        "--yes",
        "lighthouse",
        url,
        "--only-categories=seo",
        "--output=json",
        `--output-path=${out}`,
        '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
        "--quiet",
      ]);
      const json = JSON.parse(readFileSync(out, "utf8"));
      const score = Math.round((json?.categories?.seo?.score || 0) * 100);
      scores.push({ page, score });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const failed = scores.filter((x) => x.score < threshold);
  return { scores, failed };
}

async function main() {
  const base = normalizeBase(getArg("--base", DEFAULT_BASE));
  const threshold = Number(getArg("--min-score", "90"));
  const skipRemote = hasFlag("--skip-endpoint-check");

  console.log(`SEO check base: ${base}`);
  console.log(`Minimum score: ${threshold}`);

  if (!skipRemote) {
    await checkStaticSeoEndpoints(base);
    console.log("robots.txt and sitemap.xml: OK");
    await assertIndexableHeaders(base);
    console.log("x-robots-tag headers: indexable");
  }

  await waitForBase(base);

  const { scores, failed } = runLighthouseSeo(base, threshold);
  for (const row of scores) {
    console.log(`${row.score}\t${row.page}`);
  }

  if (failed.length) {
    const pages = failed.map((x) => `${x.page} (${x.score})`).join(", ");
    throw new Error(`SEO score below ${threshold}: ${pages}`);
  }

  console.log("SEO gate PASSED");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
