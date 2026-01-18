import { describe, expect, it } from "bun:test";
import { join } from "node:path";

import {
  CONFIG_PRIMARY,
  CONFIG_SECONDARY,
  getConfigCandidatePaths,
  getDefaultWorktreesDir,
  resolveWorktreesDir,
} from "./paths";

describe("paths", () => {
  it("builds config candidate paths", () => {
    const cwd = "/repo";
    expect(getConfigCandidatePaths(cwd)).toEqual([
      join(cwd, CONFIG_PRIMARY),
      join(cwd, CONFIG_SECONDARY),
    ]);
  });

  it("resolves default worktrees directory", () => {
    const cwd = "/repo";
    expect(getDefaultWorktreesDir(cwd)).toBe(join(cwd, ".workbox", "worktrees"));
  });

  it("resolves worktrees directory against config location", () => {
    const cwd = "/repo";
    const configPath = join(cwd, ".workbox", "config.toml");
    expect(resolveWorktreesDir("worktrees", cwd, configPath)).toBe(
      join(cwd, ".workbox", "worktrees")
    );
  });
});
