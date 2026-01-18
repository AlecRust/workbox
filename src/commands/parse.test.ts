import { describe, expect, it } from "bun:test";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";

describe("parseArgsOrUsage", () => {
  it("wraps parse errors as UsageError", () => {
    expect(() =>
      parseArgsOrUsage({
        args: ["--unknown"],
        options: { known: { type: "boolean" } },
        allowPositionals: true,
        strict: true,
      })
    ).toThrow(UsageError);
  });
});
