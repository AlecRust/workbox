import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runBootstrap } from "./runner";

const withTempDir = async (fn: (dir: string) => Promise<void>) => {
  const dir = await mkdtemp(join(tmpdir(), "workbox-bootstrap-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

describe("bootstrap runner", () => {
  it("returns ok when there are no steps", async () => {
    await withTempDir(async (repoRoot) => {
      const result = await runBootstrap([], { repoRoot, mode: "capture" });
      expect(result.status).toBe("ok");
      expect(result.exitCode).toBe(0);
      expect(result.steps).toEqual([]);
    });
  });

  it("captures output for steps in capture mode", async () => {
    await withTempDir(async (repoRoot) => {
      const result = await runBootstrap([{ name: "echo", run: "echo hello" }], {
        repoRoot,
        mode: "capture",
      });
      expect(result.status).toBe("ok");
      expect(result.exitCode).toBe(0);
      expect(result.steps[0]?.stdout).toBe("hello");
    });
  });

  it("resolves step cwd within the repo root", async () => {
    await withTempDir(async (repoRoot) => {
      const cwd = "nested";
      await mkdir(join(repoRoot, cwd), { recursive: true });
      const result = await runBootstrap([{ name: "ok", run: "echo ok", cwd }], {
        repoRoot,
        mode: "capture",
      });
      expect(result.status).toBe("ok");
      expect(result.steps[0]?.cwd).toBe(join(repoRoot, cwd));
    });
  });

  it("stops on first failure", async () => {
    await withTempDir(async (repoRoot) => {
      const result = await runBootstrap(
        [
          { name: "ok", run: "echo ok" },
          { name: "fail", run: "exit 3" },
          { name: "never", run: "echo never" },
        ],
        { repoRoot, mode: "capture" }
      );
      expect(result.status).toBe("failed");
      expect(result.exitCode).toBe(3);
      expect(result.steps.map((step) => step.name)).toEqual(["ok", "fail"]);
    });
  });

  it("rejects step cwd that escapes repoRoot via symlink", async () => {
    await withTempDir(async (repoRoot) => {
      const outside = await mkdtemp(join(tmpdir(), "workbox-outside-"));
      try {
        await symlink(outside, join(repoRoot, "link"));
        await expect(
          runBootstrap([{ name: "bad", run: "echo no", cwd: "link" }], {
            repoRoot,
            mode: "capture",
          })
        ).rejects.toThrow(/escapes repo root via symlink/);
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });
});
