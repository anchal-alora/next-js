import fs from "node:fs";
import path from "node:path";

export function listFilesRecursive(rootDir, { exts, ignoreDirs } = {}) {
  const root = path.resolve(process.cwd(), rootDir);
  const out = [];
  const ignore = new Set(ignoreDirs ?? ["node_modules", ".git", ".next", "dist", "build", ".turbo"]);
  const allowedExts = exts ? new Set(exts.map((e) => e.toLowerCase())) : null;

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (ignore.has(ent.name)) continue;
        walk(path.join(current, ent.name));
        continue;
      }

      if (!ent.isFile()) continue;
      const abs = path.join(current, ent.name);
      if (allowedExts) {
        const ext = path.extname(ent.name).toLowerCase();
        if (!allowedExts.has(ext)) continue;
      }
      out.push(abs);
    }
  }

  walk(root);
  return out;
}

export function toPosixRelativeFromCwd(absPath) {
  const rel = path.relative(process.cwd(), absPath);
  return rel.split(path.sep).join("/");
}

