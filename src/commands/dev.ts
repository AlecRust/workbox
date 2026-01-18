import { startDevSession } from "../core/git";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const devCommand: CommandDefinition = {
  name: "dev",
  summary: "Start a dev session (stub)",
  description: "Start a development session inside a workbox sandbox.",
  usage: "workbox dev <name>",
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

    const result = await startDevSession(name);
    return {
      message: result.message,
      data: result,
    };
  },
};
