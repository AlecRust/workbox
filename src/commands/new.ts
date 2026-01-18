import { createWorktree } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const newCommand: CommandDefinition = {
  name: "new",
  summary: "Create a new sandbox worktree",
  description: "Create a new workbox sandbox worktree with the given name.",
  usage: "workbox new <name> [--from <ref>]",
  run: async (context, args) => {
    const parsed = parseArgsOrUsage({
      args,
      options: {
        from: { type: "string" },
      },
      allowPositionals: true,
      strict: true,
    });
    const { positionals } = parsed;
    const [name, ...rest] = positionals;
    if (!name) {
      const message = context.flags.nonInteractive
        ? "Missing worktree name in non-interactive mode."
        : "Missing worktree name.";
      throw new UsageError(message);
    }
    if (rest.length > 0) {
      throw new UsageError(`Unexpected arguments: ${rest.join(" ")}`);
    }

    const fromValue = parsed.values.from;
    const baseRef =
      (typeof fromValue === "string" ? fromValue : undefined) ?? context.config.worktrees.base_ref;
    if (!baseRef) {
      throw new UsageError(
        "Missing base ref. Provide --from <ref> or set worktrees.base_ref in config."
      );
    }

    const worktree = await createWorktree({
      repoRoot: context.repoRoot,
      name,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      baseRef,
    });

    return {
      message: `Created worktree "${worktree.name}" at ${worktree.path} on branch ${worktree.managedBranch}.`,
      data: worktree,
    };
  },
};
