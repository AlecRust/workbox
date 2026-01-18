import { describe, expect, it } from "bun:test";

import { parseCliArgs } from "./args";

describe("parseCliArgs", () => {
  it("parses command and flags", () => {
    const result = parseCliArgs(["--json", "list"]);
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

  it("accepts -h as help", () => {
    const result = parseCliArgs(["-h"]);
    expect(result.flags.help).toBe(true);
    expect(result.command).toBeNull();
  });
});
