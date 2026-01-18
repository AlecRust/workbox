import { describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createWorktree,
  getManagedWorktrees,
  getWorkboxWorktrees,
  getWorktreeStatus,
  removeWorktree,
} from "./git";

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

const gitSucceeds = async (args: string[], cwd: string): Promise<boolean> => {
  const proc = Bun.spawn({
    cmd: ["git", ...args],
    cwd,
    stdout: "ignore",
    stderr: "ignore",
  });
  const exitCode = await proc.exited;
  return exitCode === 0;
};

const withRepo = async (fn: (repoRoot: string) => Promise<void>) => {
  const repoRoot = await mkdtemp(join(tmpdir(), "workbox-git-"));
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

describe("core/git worktrees", () => {
  it("creates, lists, statuses, and removes a managed worktree without deleting the branch", async () => {
    await withRepo(async (repoRoot) => {
      const worktreesDir = join(repoRoot, ".workbox", "worktrees");
      const branchPrefix = "wkb/";

      const created = await createWorktree({
        repoRoot,
        worktreesDir,
        branchPrefix,
        baseRef: "HEAD",
        name: "box1",
      });

      expect(created.branch).toBe("wkb/box1");
      expect(created.path).toBe(await realpath(join(worktreesDir, "box1")));
      expect(await gitSucceeds(["show-ref", "--verify", "refs/heads/wkb/box1"], repoRoot)).toBe(
        true
      );

      const listed = await getManagedWorktrees({ repoRoot, worktreesDir, branchPrefix });
      expect(listed.map((item) => item.name)).toEqual(["box1"]);

      const status = await getWorktreeStatus({ repoRoot, worktreesDir, branchPrefix });
      expect(status).toHaveLength(1);
      expect(status[0]?.clean).toBe(true);

      await removeWorktree({
        repoRoot,
        worktreesDir,
        branchPrefix,
        name: "box1",
        force: false,
      });

      expect(await gitSucceeds(["show-ref", "--verify", "refs/heads/wkb/box1"], repoRoot)).toBe(
        true
      );
      expect(await getManagedWorktrees({ repoRoot, worktreesDir, branchPrefix })).toEqual([]);
    });
  });

  it("can remove a detached worktree in the workbox directory", async () => {
    await withRepo(async (repoRoot) => {
      const worktreesDir = join(repoRoot, ".workbox", "worktrees");
      const branchPrefix = "wkb/";

      const created = await createWorktree({
        repoRoot,
        worktreesDir,
        branchPrefix,
        baseRef: "HEAD",
        name: "box1",
      });

      await runGit(["checkout", "--detach"], created.path);

      expect(await getManagedWorktrees({ repoRoot, worktreesDir, branchPrefix })).toEqual([]);

      const all = await getWorkboxWorktrees({ repoRoot, worktreesDir, branchPrefix });
      expect(all).toHaveLength(1);
      expect(all[0]?.branch).toBeNull();
      expect(all[0]?.managed).toBe(false);

      await removeWorktree({
        repoRoot,
        worktreesDir,
        branchPrefix,
        name: "box1",
        force: false,
      });

      expect(await gitSucceeds(["show-ref", "--verify", "refs/heads/wkb/box1"], repoRoot)).toBe(
        true
      );
      expect(await getWorkboxWorktrees({ repoRoot, worktreesDir, branchPrefix })).toEqual([]);
    });
  });

  it("rejects a worktreesDir that escapes the repo via symlink", async () => {
    await withRepo(async (repoRoot) => {
      const outside = await mkdtemp(join(tmpdir(), "workbox-outside-"));
      try {
        await symlink(outside, join(repoRoot, ".workbox"));
        await expect(
          createWorktree({
            repoRoot,
            worktreesDir: join(repoRoot, ".workbox", "worktrees"),
            branchPrefix: "wkb/",
            baseRef: "HEAD",
            name: "box1",
          })
        ).rejects.toThrow(/escapes repo root via symlink/);
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });
});
