import { pruneWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

export const pruneCommand: CommandDefinition = {
  name: "prune",
  summary: "Prune stale worktrees (stub)",
  description: "Remove stale workbox worktrees.",
  usage: "workbox prune",
  run: async (_context, args) => {
    if (args.length > 0) {
      throw new UsageError(`Unexpected arguments: ${args.join(" ")}`);
    }

    const result = await pruneWorktrees();
    return {
      message: result.message,
      data: result,
    };
  },
};
