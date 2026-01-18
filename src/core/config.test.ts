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

const minimalConfig = `[worktrees]
directory = ".workbox/worktrees"
branch_prefix = "wkb/"

[bootstrap]
enabled = false
steps = []
`;

describe("loadConfig", () => {
  it("rejects when no config exists", async () => {
    await withTempDir(async (cwd) => {
      await expect(loadConfig(cwd)).rejects.toThrow(/No workbox config found/);
    });
  });

  it("prefers .workbox/config.toml over workbox.toml", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(join(cwd, ".workbox"), { recursive: true });
      await writeFile(
        join(cwd, ".workbox", "config.toml"),
        minimalConfig.replace('.workbox/worktrees"', 'sandbox"')
      );
      await writeFile(
        join(cwd, "workbox.toml"),
        minimalConfig.replace('.workbox/worktrees"', 'fallback"')
      );

      const result = await loadConfig(cwd);
      expect(result.path).toBe(join(cwd, ".workbox", "config.toml"));
      expect(result.config.worktrees.directory).toBe(join(cwd, "sandbox"));
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
      await writeFile(
        join(cwd, "workbox.toml"),
        minimalConfig.replace('directory = ".workbox/worktrees"', "directory = 123")
      );
      await expect(loadConfig(cwd)).rejects.toThrow(/worktrees.directory/);
    });
  });

  it("rejects duplicate bootstrap step names", async () => {
    await withTempDir(async (cwd) => {
      const duplicateConfig = minimalConfig
        .replace(
          "steps = []",
          `steps = [
  { name = "install", run = "bun install" },
  { name = "install", run = "bun run build" }
]`
        )
        .replace("enabled = false", "enabled = true");
      await writeFile(join(cwd, "workbox.toml"), duplicateConfig);
      await expect(loadConfig(cwd)).rejects.toThrow(/Duplicate bootstrap step name/);
    });
  });
});
