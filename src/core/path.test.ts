import { describe, expect, it, spyOn } from "bun:test";
import * as fs from "node:fs/promises";
import { mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { checkPathWithinRoot, isSubpath } from "./path";

const withTempDir = async (fn: (dir: string) => Promise<void>) => {
  const dir = await mkdtemp(join(tmpdir(), "workbox-path-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

describe("core/path", () => {
  it("detects subpaths correctly", () => {
    const base = resolve(join(tmpdir(), "workbox-base"));
    expect(isSubpath(base, base)).toBe(true);
    expect(isSubpath(join(base, "child"), base)).toBe(true);
    expect(isSubpath(resolve(join(tmpdir(), "workbox-other")), base)).toBe(false);
  });

  it("accepts root path itself", async () => {
    await withTempDir(async (rootDir) => {
      const result = await checkPathWithinRoot({
        rootDir,
        candidatePath: rootDir,
        label: "root",
      });
      expect(result.ok).toBe(true);
    });
  });

  it("rejects candidates outside the root", async () => {
    await withTempDir(async (rootDir) => {
      const outside = await mkdtemp(join(tmpdir(), "workbox-outside-"));
      try {
        const result = await checkPathWithinRoot({
          rootDir,
          candidatePath: outside,
          label: "candidate",
        });
        expect(result.ok).toBe(false);
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });

  it("rejects symlink escapes within the root", async () => {
    await withTempDir(async (rootDir) => {
      const outside = await mkdtemp(join(tmpdir(), "workbox-outside-"));
      try {
        await symlink(outside, join(rootDir, "link"));
        const result = await checkPathWithinRoot({
          rootDir,
          candidatePath: join(rootDir, "link", "child"),
          label: "candidate",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain("escapes repo root via symlink");
        }
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });

  it("allows symlinks that remain within the root", async () => {
    await withTempDir(async (rootDir) => {
      const target = join(rootDir, "target");
      await mkdir(target, { recursive: true });
      await symlink(target, join(rootDir, "link"));
      const result = await checkPathWithinRoot({
        rootDir,
        candidatePath: join(rootDir, "link", "child"),
        label: "candidate",
      });
      expect(result.ok).toBe(true);
    });
  });

  it("allows missing path segments", async () => {
    await withTempDir(async (rootDir) => {
      const originalLstat = fs.lstat;
      let sawEnoent = false;
      const lstatSpy = spyOn(fs, "lstat").mockImplementation((async (
        ...args: Parameters<typeof fs.lstat>
      ) => {
        try {
          return await originalLstat(...args);
        } catch (error) {
          if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            sawEnoent = true;
          }
          throw error;
        }
      }) as typeof fs.lstat);
      const candidatePath = join(rootDir, "missing", "child");
      try {
        const result = await checkPathWithinRoot({
          rootDir,
          candidatePath,
          label: "candidate",
        });
        expect(result.ok).toBe(true);
        expect(sawEnoent).toBe(true);
      } finally {
        lstatSpy.mockRestore();
      }
    });
  });

  it("treats ENOENT during lstat as safe", async () => {
    await withTempDir(async (rootDir) => {
      const candidatePath = join(rootDir, "exists");
      await mkdir(candidatePath, { recursive: true });
      const lstatSpy = spyOn(fs, "lstat").mockImplementation((async () => {
        const error = new Error("missing");
        (error as NodeJS.ErrnoException).code = "ENOENT";
        throw error;
      }) as typeof fs.lstat);
      try {
        const result = await checkPathWithinRoot({
          rootDir,
          candidatePath,
          label: "candidate",
        });
        expect(result.ok).toBe(true);
        expect(lstatSpy.mock.calls.length).toBeGreaterThan(0);
      } finally {
        lstatSpy.mockRestore();
      }
    });
  });

  it("falls back to resolve when the root is missing", async () => {
    await withTempDir(async (baseDir) => {
      const rootDir = join(baseDir, "missing-root");
      const result = await checkPathWithinRoot({
        rootDir,
        candidatePath: join(rootDir, "child"),
        label: "root",
      });
      expect(result.ok).toBe(true);
    });
  });

  it("detects resolution escapes after the initial checks", async () => {
    await withTempDir(async (rootDir) => {
      const candidateDir = join(rootDir, "child");
      await mkdir(candidateDir, { recursive: true });
      const outside = await mkdtemp(join(tmpdir(), "workbox-outside-"));
      const rootResolved = resolve(rootDir);
      const candidateResolved = resolve(candidateDir);
      const realpathSpy = spyOn(fs, "realpath").mockImplementation((async (
        ...args: Parameters<typeof fs.realpath>
      ) => {
        const [path] = args;
        if (path === rootResolved) {
          return rootResolved;
        }
        if (path === candidateResolved) {
          return outside;
        }
        return typeof path === "string" ? path : String(path);
      }) as typeof fs.realpath);

      try {
        const result = await checkPathWithinRoot({
          rootDir,
          candidatePath: candidateDir,
          label: "candidate",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain("must resolve within repo root");
        }
      } finally {
        realpathSpy.mockRestore();
        await rm(outside, { recursive: true, force: true });
      }
    });
  });
});
