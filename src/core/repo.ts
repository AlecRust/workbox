import { dirname, resolve } from "node:path";

import { CliError } from "../ui/errors";
import { runCommand } from "./process";

const runGit = async (args: string[], cwd: string): Promise<string> => {
  const { stdout, stderr, exitCode } = await runCommand({
    cmd: ["git", ...args],
    cwd,
    mode: "capture",
  });

  if (exitCode !== 0) {
    const message = stderr.trim() || stdout.trim() || "Unknown git error.";
    throw new CliError(`Git command failed (git ${args.join(" ")}): ${message}`);
  }

  return stdout.trim();
};

export const getRepoInfo = async (
  cwd: string
): Promise<{ repoRoot: string; worktreeRoot: string; gitCommonDir: string }> => {
  const worktreeRoot = await runGit(["rev-parse", "--show-toplevel"], cwd);
  if (!worktreeRoot) {
    throw new CliError("Unable to resolve Git worktree root.");
  }

  const commonDirRaw = await runGit(["rev-parse", "--git-common-dir"], cwd);
  if (!commonDirRaw) {
    throw new CliError("Unable to resolve Git common directory.");
  }

  // `--git-common-dir` is typically relative to the current working directory,
  // not the worktree root. Resolving it relative to `cwd` ensures this works
  // from nested subdirectories.
  const gitCommonDir = resolve(cwd, commonDirRaw);
  const repoRoot = dirname(gitCommonDir);
  if (!repoRoot) {
    throw new CliError("Unable to resolve Git repository root.");
  }

  return { repoRoot, worktreeRoot, gitCommonDir };
};
