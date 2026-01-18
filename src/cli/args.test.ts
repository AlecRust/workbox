import { describe, expect, it, spyOn } from "bun:test";
import * as util from "node:util";

import { parseCliArgs } from "./args";

describe("parseCliArgs", () => {
  it("parses command and flags", () => {
    const result = parseCliArgs(["--json", "list"]);
    expect(result.command).toBe("list");
    expect(result.flags.json).toBe(true);
    expect(result.commandArgs).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("accepts global flags after the command", () => {
    const result = parseCliArgs(["list", "--json"]);
    expect(result.command).toBe("list");
    expect(result.flags.json).toBe(true);
    expect(result.commandArgs).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("reports unknown flags", () => {
    const result = parseCliArgs(["--nope"]);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain("--nope");
  });

  it("preserves passthrough args", () => {
    const result = parseCliArgs(["exec", "demo", "--", "echo", "--help"]);
    expect(result.command).toBe("exec");
    expect(result.commandArgs).toEqual(["demo", "--", "echo", "--help"]);
    expect(result.errors).toEqual([]);
  });

  it("keeps command-specific flags intact", () => {
    const result = parseCliArgs(["exec", "demo", "--cwd", "sandbox"]);
    expect(result.command).toBe("exec");
    expect(result.commandArgs).toEqual(["demo", "--cwd", "sandbox"]);
    expect(result.errors).toEqual([]);
  });

  it("accepts -h as help", () => {
    const result = parseCliArgs(["-h"]);
    expect(result.flags.help).toBe(true);
    expect(result.command).toBeNull();
  });

  it("parses non-interactive flag", () => {
    const result = parseCliArgs(["--non-interactive", "list"]);
    expect(result.flags.nonInteractive).toBe(true);
    expect(result.command).toBe("list");
  });

  it("treats passthrough options as the command when no command is set", () => {
    const result = parseCliArgs(["--", "--do", "thing"]);
    expect(result.command).toBe("--do");
    expect(result.commandArgs).toEqual(["--", "thing"]);
    expect(result.errors).toEqual([]);
  });

  it("includes option values when tokens carry non-inline values", () => {
    const spy = spyOn(util, "parseArgs").mockReturnValue({
      tokens: [
        { kind: "positional", index: 0, value: "exec" },
        {
          kind: "option",
          index: 1,
          name: "cwd",
          rawName: "--cwd",
          value: "sandbox",
          inlineValue: false,
        },
      ],
      values: {},
      positionals: ["exec"],
    } as ReturnType<typeof util.parseArgs>);
    try {
      const result = parseCliArgs(["exec", "--cwd", "sandbox"]);
      expect(result.command).toBe("exec");
      expect(result.commandArgs).toEqual(["--cwd", "sandbox"]);
    } finally {
      spy.mockRestore();
    }
  });

  it("ignores tokens that are not options when pushing option args", () => {
    const spy = spyOn(util, "parseArgs").mockReturnValue({
      tokens: [{ kind: "mystery", index: 0 }],
      values: {},
      positionals: [],
    } as unknown as ReturnType<typeof util.parseArgs>);
    try {
      const result = parseCliArgs(["noop"]);
      expect(result.command).toBeNull();
      expect(result.commandArgs).toEqual([]);
    } finally {
      spy.mockRestore();
    }
  });

  it("uses passthrough option tokens as the command", () => {
    const spy = spyOn(util, "parseArgs").mockReturnValue({
      tokens: [
        { kind: "option-terminator", index: 0 },
        { kind: "option", index: 1, name: "do", rawName: "--do" },
      ],
      values: {},
      positionals: [],
    } as ReturnType<typeof util.parseArgs>);
    try {
      const result = parseCliArgs(["--", "--do"]);
      expect(result.command).toBe("--do");
      expect(result.commandArgs).toEqual(["--"]);
    } finally {
      spy.mockRestore();
    }
  });
});
