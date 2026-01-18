import { getWorkboxWorktrees } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const listCommand: CommandDefinition = {
  name: "list",
  summary: "List sandbox worktrees",
  description: "List all workbox sandbox worktrees.",
  usage: "workbox list",
  run: async (context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 0) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const worktrees = await getWorkboxWorktrees({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
    });

    return {
      message:
        worktrees.length === 0
          ? "No workbox worktrees found."
          : [
              "Workbox worktrees:",
              ...worktrees.map((w) => {
                const branch = w.branch ?? "(detached)";
                const status = w.managed ? "managed" : "unmanaged";
                return `- ${w.name}\t${branch}\t${status}\t${w.path}`;
              }),
            ].join("\n"),
      data: worktrees,
    };
  },
};
