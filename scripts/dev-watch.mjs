/**
 * Dev mode with content watch.
 *
 * - Runs `npm run content:prepare` once at startup
 * - Starts `next dev`
 * - Watches content + insight image folders and re-runs only the relevant content steps
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const WATCH_GLOBS = [
  { kind: "newsroom", dir: "content/newsroom" },
  { kind: "insightsMd", dir: "content/insights-md" },
  { kind: "csv", dir: "content/csv" },
  { kind: "images", dir: "public/insights/image" },
];

const DEBOUNCE_MS = Number(process.env.CONTENT_WATCH_DEBOUNCE_MS ?? 500);
const ENABLE_WATCH = String(process.env.CONTENT_WATCH ?? "1").trim() !== "0";

function npmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function runNpm(args, { label } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCmd(), args, { stdio: "inherit", cwd: process.cwd(), env: process.env });
    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${label ?? `npm ${args.join(" ")}`} exited with code ${code}`));
    });
  });
}

function runInitialPrepare() {
  const res = spawnSync(npmCmd(), ["run", "content:prepare"], { stdio: "inherit", cwd: process.cwd(), env: process.env });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function startNextDev() {
  const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  return child;
}

function canRecursiveWatch() {
  // Node supports recursive fs.watch on macOS + Windows.
  return process.platform === "darwin" || process.platform === "win32";
}

function safeRelative(p) {
  try {
    return path.relative(process.cwd(), p).split(path.sep).join("/");
  } catch {
    return String(p);
  }
}

function shouldIgnore(kind, fileName) {
  const name = String(fileName ?? "");
  if (!name) return false;
  if (name.endsWith(".tmp")) return true;
  if (name === ".DS_Store") return true;

  // Avoid reacting to generated MDX output (content/web-articles).
  if (name.includes("content/web-articles")) return true;

  // Newsroom/insights README files are ignored by generators; changes don’t matter.
  const base = path.basename(name).toLowerCase();
  if (base === "readme.md") return true;

  // If the image optimizer creates a .webp, we still allow a single follow-up run to update JSON.
  // But ignore rapid duplicate events for the same file; debounce handles most of this.
  if (kind === "images" && base === ".ds_store") return true;

  return false;
}

async function runStepsForKinds(kinds) {
  const hasImages = kinds.has("images");
  const hasCsv = kinds.has("csv");
  const hasInsightsMd = kinds.has("insightsMd");
  const hasNewsroom = kinds.has("newsroom");

  console.log(`[content:watch] Running steps for: ${[...kinds].sort().join(", ")}`);

  // Images change: optimize images, then refresh both insight pipelines so JSON can switch to .webp
  if (hasImages) {
    await runNpm(["run", "optimize:images"], { label: "optimize:images" });
    await runNpm(["run", "generate:insights"], { label: "generate:insights" });
    await runNpm(["run", "index:insights-md"], { label: "index:insights-md" });
  } else {
    if (hasCsv) await runNpm(["run", "generate:insights"], { label: "generate:insights" });
    if (hasInsightsMd) await runNpm(["run", "index:insights-md"], { label: "index:insights-md" });
  }

  if (hasNewsroom) await runNpm(["run", "generate:newsroom"], { label: "generate:newsroom" });

  await runNpm(["run", "validate:content"], { label: "validate:content" });
  console.log("[content:watch] Done.");
}

function startWatchers(onKind) {
  const watchers = [];
  const recursive = canRecursiveWatch();

  for (const w of WATCH_GLOBS) {
    const abs = path.join(process.cwd(), w.dir);
    if (!fs.existsSync(abs)) continue;

    const watcher = fs.watch(abs, { recursive }, (_eventType, fileName) => {
      const rel = fileName ? path.join(w.dir, String(fileName)) : w.dir;
      if (shouldIgnore(w.kind, rel)) return;
      onKind(w.kind, rel);
    });

    watchers.push({ kind: w.kind, dir: w.dir, watcher });
    console.log(`[content:watch] Watching ${w.dir}${recursive ? " (recursive)" : ""}`);
  }

  if (!recursive) {
    console.warn("[content:watch] Non-recursive fs.watch fallback; nested folders may not trigger on all platforms.");
  }

  return () => {
    for (const w of watchers) {
      try {
        w.watcher.close();
      } catch {
        // ignore
      }
    }
  };
}

async function main() {
  runInitialPrepare();

  const next = startNextDev();

  if (!ENABLE_WATCH) {
    console.log("[content:watch] CONTENT_WATCH=0; watch mode disabled.");
    next.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  let timer = null;
  let running = false;
  const pending = new Set();

  const drain = async () => {
    if (running) return;
    if (pending.size === 0) return;

    const snapshot = new Set(pending);
    pending.clear();
    running = true;
    try {
      await runStepsForKinds(snapshot);
    } catch (e) {
      console.error("[content:watch] ERROR:", e?.message ?? e);
      // keep dev server running; user can fix content and save again
    } finally {
      running = false;
      if (pending.size > 0) schedule();
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void drain();
    }, DEBOUNCE_MS);
  };

  const stopWatchers = startWatchers((kind, rel) => {
    pending.add(kind);
    console.log(`[content:watch] Change detected (${kind}): ${safeRelative(path.join(process.cwd(), rel))}`);
    schedule();
  });

  const shutdown = (signal) => {
    console.log(`[content:watch] Shutting down (${signal})...`);
    stopWatchers();
    try {
      next.kill("SIGINT");
    } catch {
      // ignore
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  next.on("exit", (code) => {
    stopWatchers();
    process.exit(code ?? 0);
  });
}

main().catch((e) => {
  console.error("[content:watch] Fatal:", e);
  process.exit(1);
});

