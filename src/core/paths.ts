import { dirname, join, resolve } from "node:path";

export const CONFIG_PRIMARY = join(".workbox", "config.toml");
export const CONFIG_SECONDARY = "workbox.toml";

export const getConfigCandidatePaths = (cwd: string): string[] => [
  join(cwd, CONFIG_PRIMARY),
  join(cwd, CONFIG_SECONDARY),
];

const getWorkboxDir = (cwd: string): string => join(cwd, ".workbox");

export const getDefaultWorktreesDir = (cwd: string): string =>
  join(getWorkboxDir(cwd), "worktrees");

export const resolveWorktreesDir = (
  worktreesDir: string,
  cwd: string,
  configPath: string | null
): string => {
  const baseDir = configPath ? dirname(configPath) : cwd;
  return resolve(baseDir, worktreesDir);
};
