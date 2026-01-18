import { getWorkboxWorktree, removeWorktree } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const rmCommand: CommandDefinition = {
  name: "rm",
  summary: "Remove a sandbox worktree",
  description: "Remove a workbox sandbox worktree by name.",
  usage: "workbox rm <name> [--force] [--unmanaged]",
  run: async (context, args) => {
    const parsed = parseArgsOrUsage({
      args,
      options: {
        force: { type: "boolean" },
        unmanaged: { type: "boolean" },
      },
      allowPositionals: true,
      strict: true,
    });
    const { positionals } = parsed;
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

    const worktree = await getWorkboxWorktree({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      name,
    });

    if (!worktree.managed && parsed.values.unmanaged !== true) {
      throw new UsageError(
        `Refusing to remove unmanaged worktree "${name}". Re-run with --unmanaged to confirm.`
      );
    }

    await removeWorktree({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      name,
      force: parsed.values.force === true,
    });

    return {
      message: `Removed worktree "${worktree.name}" at ${worktree.path}. No branches were deleted.`,
      data: worktree,
    };
  },
};
