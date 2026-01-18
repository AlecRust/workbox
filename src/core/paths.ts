import { join, resolve } from "node:path";

export const CONFIG_PRIMARY = join(".workbox", "config.toml");
export const CONFIG_SECONDARY = "workbox.toml";

export const getConfigCandidatePaths = (repoRoot: string): string[] => [
  join(repoRoot, CONFIG_PRIMARY),
  join(repoRoot, CONFIG_SECONDARY),
];

export const resolveWorktreesDir = (worktreesDir: string, repoRoot: string): string =>
  resolve(repoRoot, worktreesDir);
