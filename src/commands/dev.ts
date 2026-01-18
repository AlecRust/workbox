import { runBootstrap } from "../bootstrap/runner";
import { getWorkboxWorktree } from "../core/git";
import { runShellCommand } from "../core/process";
import { UsageError } from "../ui/errors";
import { parseArgsOrUsage } from "./parse";
import type { CommandDefinition } from "./types";

export const devCommand: CommandDefinition = {
  name: "dev",
  summary: "Start a dev session in a sandbox",
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
      const message = context.flags.nonInteractive
        ? "Missing worktree name in non-interactive mode."
        : "Missing worktree name.";
      throw new UsageError(message);
    }
    if (rest.length > 0) {
      throw new UsageError(`Unexpected arguments: ${rest.join(" ")}`);
    }

    if (!context.config.dev) {
      throw new UsageError('Dev is not configured. Add a [dev] section with a "command".');
    }

    const worktree = await getWorkboxWorktree({
      repoRoot: context.repoRoot,
      worktreesDir: context.config.worktrees.directory,
      branchPrefix: context.config.worktrees.branch_prefix,
      name,
    });

    const mode = context.flags.json ? "capture" : "inherit";

    let bootstrapResult: unknown;
    if (context.config.bootstrap.enabled) {
      const result = await runBootstrap(context.config.bootstrap.steps, {
        repoRoot: worktree.path,
        mode,
      });
      bootstrapResult = result;
      if (result.exitCode !== 0) {
        return {
          message: result.message,
          data: { worktree, bootstrap: result },
          exitCode: result.exitCode,
        };
      }
    }

    let openResult: Awaited<ReturnType<typeof runShellCommand>> | undefined;
    if (context.config.dev.open) {
      openResult = await runShellCommand({
        command: context.config.dev.open,
        cwd: worktree.path,
        mode,
      });
      if (openResult.exitCode !== 0)
        return {
          message: `dev open command failed (exit ${openResult.exitCode}).`,
          data: { worktree, bootstrap: bootstrapResult, open: openResult },
          exitCode: openResult.exitCode,
        };
    }

    const devResult = await runShellCommand({
      command: context.config.dev.command,
      cwd: worktree.path,
      mode,
    });
    return {
      message: devResult.exitCode === 0 ? "" : `dev command exited with ${devResult.exitCode}.`,
      data: {
        worktree,
        bootstrap: bootstrapResult,
        open: openResult,
        dev: devResult,
      },
      exitCode: devResult.exitCode,
    };
  },
};
