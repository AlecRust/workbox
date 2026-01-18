import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getRepoInfo } from "./repo";

const readStream = async (stream: ReadableStream<Uint8Array> | null): Promise<string> => {
  if (!stream) {
    return "";
  }
  return new Response(stream).text();
};

const runGit = async (args: string[], cwd: string): Promise<string> => {
  const proc = Bun.spawn({
    cmd: ["git", ...args],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    readStream(proc.stdout),
    readStream(proc.stderr),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${stderr.trim() || stdout.trim()}`);
  }

  return stdout.trim();
};

const withRepo = async (fn: (repoRoot: string) => Promise<void>) => {
  const repoRoot = await mkdtemp(join(tmpdir(), "workbox-repo-"));
  try {
    await runGit(["init"], repoRoot);
    await runGit(["config", "user.email", "test@example.com"], repoRoot);
    await runGit(["config", "user.name", "Test"], repoRoot);
    await writeFile(join(repoRoot, "README.md"), "hello\n");
    await runGit(["add", "README.md"], repoRoot);
    await runGit(["commit", "-m", "init"], repoRoot);
    await fn(repoRoot);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
};

describe("core/repo getRepoInfo", () => {
  it("resolves repoRoot from nested subdirectories", async () => {
    await withRepo(async (repoRoot) => {
      const nested = join(repoRoot, "a", "b");
      await mkdir(nested, { recursive: true });

      const info = await getRepoInfo(nested);
      expect(await realpath(info.repoRoot)).toBe(await realpath(repoRoot));
      expect(await realpath(info.worktreeRoot)).toBe(await realpath(repoRoot));
    });
  });

  it("resolves repoRoot correctly from inside a linked worktree", async () => {
    await withRepo(async (repoRoot) => {
      const worktreesDir = join(repoRoot, ".workbox", "worktrees");
      const worktreeRoot = join(worktreesDir, "box1");
      await mkdir(worktreesDir, { recursive: true });

      await runGit(["worktree", "add", worktreeRoot, "-b", "wkb/box1", "HEAD"], repoRoot);

      const infoAtRoot = await getRepoInfo(worktreeRoot);
      expect(await realpath(infoAtRoot.repoRoot)).toBe(await realpath(repoRoot));
      expect(await realpath(infoAtRoot.worktreeRoot)).toBe(await realpath(worktreeRoot));

      const nested = join(worktreeRoot, "x", "y");
      await mkdir(nested, { recursive: true });
      const infoNested = await getRepoInfo(nested);
      expect(await realpath(infoNested.repoRoot)).toBe(await realpath(repoRoot));
      expect(await realpath(infoNested.worktreeRoot)).toBe(await realpath(worktreeRoot));
    });
  });
});
