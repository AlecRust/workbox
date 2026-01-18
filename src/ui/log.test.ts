import { describe, expect, it } from "bun:test";

import { formatOutput } from "./log";

describe("formatOutput", () => {
  it("formats text output", () => {
    const output = formatOutput(
      {
        ok: true,
        message: "All good",
      },
      "text"
    );
    expect(output).toBe("All good");
  });

  it("formats json output", () => {
    const output = formatOutput(
      {
        ok: false,
        message: "Nope",
        errors: ["Nope"],
      },
      "json"
    );
    const parsed = JSON.parse(output) as { ok: boolean; errors: string[] };
    expect(parsed.ok).toBe(false);
    expect(parsed.errors).toEqual(["Nope"]);
  });

  it("includes help and errors in text output", () => {
    const output = formatOutput(
      {
        ok: false,
        help: "Usage: workbox list",
        errors: ["bad flag", "missing arg"],
      },
      "text"
    );
    expect(output).toBe("Usage: workbox list\nErrors:\n- bad flag\n- missing arg");
  });
});
