import { createWorktree } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const newCommand: CommandDefinition = {
  name: "new",
  summary: "Create a new sandbox worktree (stub)",
  description: "Create a new workbox sandbox worktree with the given name.",
  usage: "workbox new <name>",
  run: async (context, args) => {
    const { positionals } = parseArgsOrUsage({
      args,
      allowPositionals: true,
      strict: true,
    });
    const [name, ...rest] = positionals;
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

    const result = await createWorktree({
      name,
      baseDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
    });

    return {
      message: result.message,
      data: result,
    };
  },
};
