import { listWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

export const listCommand: CommandDefinition = {
  name: "list",
  summary: "List sandbox worktrees (stub)",
  description: "List all workbox sandbox worktrees.",
  usage: "workbox list",
  run: async (_context, args) => {
    if (args.length > 0) {
      throw new UsageError(`Unexpected arguments: ${args.join(" ")}`);
    }

    const result = await listWorktrees();
    return {
      message: result.message,
      data: result,
    };
  },
};
