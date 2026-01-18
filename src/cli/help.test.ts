import { describe, expect, it } from "bun:test";

import { commands } from "../commands";
import { renderCommandHelp, renderGlobalHelp } from "./help";

describe("help rendering", () => {
  it("lists commands in global help", () => {
    const output = renderGlobalHelp("workbox", "wkb");
    expect(output).toContain("new      Create a new sandbox worktree");
    expect(output).toContain("list     List sandbox worktrees");
    expect(output).toContain("Alias: wkb");
  });

  it("renders command help details", () => {
    const command = commands.find((item) => item.name === "exec");
    if (!command) {
      throw new Error("Missing exec command");
    }

    const output = renderCommandHelp("workbox", command);
    expect(output).toContain(command.usage);
    expect(output).toContain(command.description);
  });
});
