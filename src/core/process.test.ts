import { describe, expect, it, spyOn } from "bun:test";

import { runCommand, runShellCommand } from "./process";

describe("core/process", () => {
  it.each(["win32", "linux"])("selects the shell on %s", async (platform) => {
    const descriptor = Object.getOwnPropertyDescriptor(process, "platform");
    const spawnSpy = spyOn(Bun, "spawn").mockReturnValue({
      exited: Promise.resolve(0),
    } as Bun.Subprocess);
    Object.defineProperty(process, "platform", { value: platform });
    try {
      expect(
        await runShellCommand({ command: "echo hi", cwd: process.cwd(), mode: "inherit" })
      ).toEqual({ exitCode: 0, stdout: "", stderr: "" });
      expect(spawnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cmd:
            platform === "win32"
              ? ["cmd.exe", "/d", "/s", "/c", "echo hi"]
              : ["sh", "-c", "echo hi"],
        })
      );
    } finally {
      if (descriptor) {
        Object.defineProperty(process, "platform", descriptor);
      }
      spawnSpy.mockRestore();
    }
  });

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
