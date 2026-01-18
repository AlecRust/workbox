import { describe, expect, it, spyOn } from "bun:test";

import { runCommand } from "./process";

describe("core/process", () => {
  it("handles null streams in capture mode", async () => {
    const spawnSpy = spyOn(Bun, "spawn").mockImplementation(() => {
      return {
        stdout: null,
        stderr: null,
        exited: Promise.resolve(0),
      } as unknown as Bun.Subprocess;
    });

    try {
      const result = await runCommand({
        cmd: ["echo", "hi"],
        cwd: process.cwd(),
        mode: "capture",
      });
      expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    } finally {
      spawnSpy.mockRestore();
    }
  });
});
