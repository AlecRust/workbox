import { getWorktreeStatus } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const statusCommand: CommandDefinition = {
  name: "status",
  summary: "Show sandbox status",
  description: "Show status for workbox worktrees.",
  usage: "workbox status [name]",
  run: async (context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    if (positionals.length > 1) {
      throw new UsageError(`Unexpected arguments: ${positionals.join(" ")}`);
    }

    const result = await getWorktreeStatus({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      name: positionals[0],
    });
    return {
      message:
        result.length === 0
          ? "No workbox worktrees found."
          : [
              "Workbox status:",
              ...result.map((item) => {
                const branch = item.branch ?? "(detached)";
                const managed = item.managed ? "managed" : "unmanaged";
                return `- ${item.name}\t${branch}\t${managed}\t${item.clean ? "clean" : "dirty"}\t${item.path}`;
              }),
            ].join("\n"),
      data: result,
    };
  },
};
