import { pruneWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const pruneCommand: CommandDefinition = {
  name: "prune",
  summary: "Prune stale worktrees (stub)",
  description: "Remove stale workbox worktrees.",
  usage: "workbox prune",
  run: async (_context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 0) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const result = await pruneWorktrees();
    return {
      message: result.message,
      data: result,
    };
  },
};
