import { pruneWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const pruneCommand: CommandDefinition = {
  name: "prune",
  summary: "Prune stale git worktree metadata",
  description: "Prune stale git worktree metadata (does not delete branches).",
  usage: "workbox prune",
  run: async (context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 0) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const result = await pruneWorktrees(context.repoRoot);
    return {
      message:
        result.stdout.length > 0
          ? `Pruned worktree metadata:\n${result.stdout}`
          : "Pruned worktree metadata.",
      data: result,
    };
  },
};
