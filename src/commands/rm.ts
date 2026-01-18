import { removeWorktree } from "../core/git";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

export const rmCommand: CommandDefinition = {
  name: "rm",
  summary: "Remove a sandbox worktree (stub)",
  description: "Remove a workbox sandbox worktree by name.",
  usage: "workbox rm <name>",
  run: async (context, args) => {
    const [name, ...rest] = args;
    if (!name) {
      throw new UsageError(
        context.flags.nonInteractive
          ? "Missing worktree name in non-interactive mode."
          : "Missing worktree name."
      );
    }
    if (rest.length > 0) {
      throw new UsageError(`Unexpected arguments: ${rest.join(" ")}`);
    }

    const result = await removeWorktree(name);
    return {
      message: result.message,
      data: result,
    };
  },
};
