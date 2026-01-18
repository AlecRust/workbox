import { listWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const listCommand: CommandDefinition = {
  name: "list",
  summary: "List sandbox worktrees (stub)",
  description: "List all workbox sandbox worktrees.",
  usage: "workbox list",
  run: async (_context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 0) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const result = await listWorktrees();
    return {
      message: result.message,
      data: result,
    };
  },
};
