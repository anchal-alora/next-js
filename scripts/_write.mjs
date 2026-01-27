import fs from "node:fs/promises";
import path from "node:path";

export async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function writeTextIfChanged(filePath, nextText, { ensureDir = true } = {}) {
  const next = String(nextText ?? "");
  const prev = await readTextIfExists(filePath);
  if (prev !== null && prev === next) return false;

  if (ensureDir) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
  await fs.writeFile(filePath, next, "utf8");
  return true;
}

