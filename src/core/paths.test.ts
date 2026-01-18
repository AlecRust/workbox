import { describe, expect, it } from "bun:test";
import { join } from "node:path";

import {
  CONFIG_PRIMARY,
  CONFIG_SECONDARY,
  getConfigCandidatePaths,
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

  it("resolves worktrees directory relative to repo root", () => {
    const cwd = "/repo";
    expect(resolveWorktreesDir(".workbox/worktrees", cwd)).toBe(join(cwd, ".workbox", "worktrees"));
  });
});
