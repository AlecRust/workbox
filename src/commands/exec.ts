import { getWorkboxWorktree } from "../core/git";
import { runCommand } from "../core/process";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

const splitExecArgs = (args: string[]): { name: string; command: string[] } => {
  const { tokens } = parseArgsOrUsage({
    args,
    allowPositionals: true,
    strict: false,
    tokens: true,
  });

  const separator = tokens?.find((token) => token.kind === "option-terminator");
  if (!separator) {
    throw new UsageError(
      "Missing command separator '--'. Usage: workbox exec <name> -- <command>."
    );
  }

  const before = args.slice(0, separator.index);
  if (before.length !== 1) {
    throw new UsageError("Usage: workbox exec <name> -- <command>.");
  }

  const [name] = before;
  const command = args.slice(separator.index + 1);
  if (!name) {
    throw new UsageError("Missing worktree name.");
  }
  if (command.length === 0) {
    throw new UsageError("Missing command to execute after '--'.");
  }

  return { name, command };
};

export const execCommand: CommandDefinition = {
  name: "exec",
  summary: "Run a command inside a sandbox",
  description: "Execute a command inside a workbox sandbox worktree.",
  usage: "workbox exec <name> -- <command>",
  run: async (context, args) => {
    const { name, command } = splitExecArgs(args);

    const worktree = await getWorkboxWorktree({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      name,
    });

    const mode = context.flags.json ? "capture" : "inherit";
    const result = await runCommand({ cmd: command, cwd: worktree.path, mode });

    return {
      message: "",
      data: {
        worktree,
        command,
        result,
      },
      exitCode: result.exitCode,
    };
  },
};
