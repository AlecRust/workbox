import { execInWorktree } from "../core/git";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

const splitExecArgs = (args: string[]): { name: string; command: string[] } => {
  const separatorIndex = args.indexOf("--");
  if (separatorIndex === -1) {
    throw new UsageError(
      "Missing command separator '--'. Usage: workbox exec <name> -- <command>."
    );
  }

  const before = args.slice(0, separatorIndex);
  if (before.length !== 1) {
    throw new UsageError("Usage: workbox exec <name> -- <command>.");
  }

  const [name] = before;
  const command = args.slice(separatorIndex + 1);
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
  summary: "Run a command inside a sandbox (stub)",
  description: "Execute a command inside a workbox sandbox worktree.",
  usage: "workbox exec <name> -- <command>",
  run: async (_context, args) => {
    const { name, command } = splitExecArgs(args);
    const result = await execInWorktree(name, command);
    return {
      message: result.message,
      data: result,
    };
  },
};
