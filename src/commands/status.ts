import { getWorktreeStatus } from "../core/git";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

export const statusCommand: CommandDefinition = {
  name: "status",
  summary: "Show sandbox status (stub)",
  description: "Show status for workbox worktrees.",
  usage: "workbox status [name]",
  run: async (_context, args) => {
    if (args.length > 1) {
      throw new UsageError(`Unexpected arguments: ${args.join(" ")}`);
    }

    const result = await getWorktreeStatus(args[0]);
    return {
      message: result.message,
      data: result,
    };
  },
};
