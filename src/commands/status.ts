import { getWorktreeStatus } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const statusCommand: CommandDefinition = {
  name: "status",
  summary: "Show sandbox status (stub)",
  description: "Show status for workbox worktrees.",
  usage: "workbox status [name]",
  run: async (_context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 1) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const result = await getWorktreeStatus(positionals[0]);
    return {
      message: result.message,
      data: result,
    };
  },
};
