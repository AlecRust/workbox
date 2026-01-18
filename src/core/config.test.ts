import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "./config";

const withTempDir = async (fn: (cwd: string) => Promise<void>) => {
  const cwd = await mkdtemp(join(tmpdir(), "workbox-"));
  try {
    await fn(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
};

describe("loadConfig", () => {
  it("returns defaults when no config exists", async () => {
    await withTempDir(async (cwd) => {
      const result = await loadConfig(cwd);
      expect(result.path).toBeNull();
      expect(result.config.worktrees.directory).toBe(join(cwd, ".workbox", "worktrees"));
    });
  });

  it("prefers .workbox/config.toml over workbox.toml", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(join(cwd, ".workbox"), { recursive: true });
      await writeFile(join(cwd, ".workbox", "config.toml"), '[worktrees]\ndirectory = "sandbox"\n');
      await writeFile(join(cwd, "workbox.toml"), '[worktrees]\ndirectory = "fallback"\n');

      const result = await loadConfig(cwd);
      expect(result.path).toBe(join(cwd, ".workbox", "config.toml"));
      expect(result.config.worktrees.directory).toBe(join(cwd, ".workbox", "sandbox"));
    });
  });

  it("rejects invalid TOML", async () => {
    await withTempDir(async (cwd) => {
      await writeFile(join(cwd, "workbox.toml"), "=broken");
      await expect(loadConfig(cwd)).rejects.toThrow(/Invalid TOML/);
    });
  });

  it("rejects invalid schema types", async () => {
    await withTempDir(async (cwd) => {
      await writeFile(join(cwd, "workbox.toml"), "[worktrees]\ndirectory = 123\n");
      await expect(loadConfig(cwd)).rejects.toThrow(/worktrees.directory/);
    });
  });

  it("rejects duplicate bootstrap step names", async () => {
    await withTempDir(async (cwd) => {
      await writeFile(
        join(cwd, "workbox.toml"),
        '[bootstrap]\nsteps = [{ name = "install", run = "bun install" }, { name = "install", run = "bun run build" }]\n'
      );
      await expect(loadConfig(cwd)).rejects.toThrow(/Duplicate bootstrap step name/);
    });
  });
});
