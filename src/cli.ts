#!/usr/bin/env bun
import { parseCliArgs } from "./cli/args";
import { renderCommandHelp, renderGlobalHelp } from "./cli/help";
import { getCommand } from "./commands";
import { loadConfig } from "./core/config";
import { getRepoInfo } from "./core/repo";
import { CliError, UsageError } from "./ui/errors";
import { formatOutput } from "./ui/log";

const TOOL_NAME = "workbox";
const TOOL_ALIAS = "wkb";

type OutputTarget = NodeJS.WritableStream;

const writeOutput = (output: string, stream: OutputTarget): void => {
  if (output.trim().length === 0) {
    return;
  }
  stream.write(`${output}\n`);
};

export const runCli = async (argv: string[], cwd = process.cwd()): Promise<number> => {
  const parsed = parseCliArgs(argv);
  const outputMode = parsed.flags.json ? "json" : "text";

  if (parsed.errors.length > 0) {
    throw new UsageError(`${parsed.errors.join(" ")} Run '${TOOL_NAME} --help' for usage.`);
  }

  if (parsed.flags.nonInteractive) {
    process.env.CI ??= "1";
    process.env.GIT_TERMINAL_PROMPT ??= "0";
    process.env.GCM_INTERACTIVE ??= "Never";
  }

  const command = parsed.command ? getCommand(parsed.command) : undefined;

  if (!parsed.command || parsed.flags.help) {
    if (parsed.command && !command) {
      throw new UsageError(`Unknown command "${parsed.command}".`);
    }

    const helpText = command
      ? renderCommandHelp(TOOL_NAME, command)
      : renderGlobalHelp(TOOL_NAME, TOOL_ALIAS);

    writeOutput(
      formatOutput(
        {
          ok: true,
          command: command?.name,
          help: helpText,
        },
        outputMode
      ),
      process.stdout
    );
    return 0;
  }

  if (!command) {
    throw new UsageError(`Unknown command "${parsed.command}".`);
  }

  const { repoRoot, worktreeRoot } = await getRepoInfo(cwd);
  const { config, path } = await loadConfig(repoRoot);
  const result = await command.run(
    {
      cwd,
      repoRoot,
      worktreeRoot,
      config,
      configPath: path,
      flags: parsed.flags,
    },
    parsed.commandArgs
  );

  const exitCode = result.exitCode ?? 0;
  writeOutput(
    formatOutput(
      {
        ok: exitCode === 0,
        command: command.name,
        message: result.message,
        data: result.data,
      },
      outputMode
    ),
    process.stdout
  );

  return exitCode;
};

const main = async () => {
  const outputMode = parseCliArgs(Bun.argv.slice(2)).flags.json ? "json" : "text";
  try {
    const exitCode = await runCli(Bun.argv.slice(2));
    process.exitCode = exitCode;
  } catch (error) {
    const exitCode = error instanceof CliError ? error.exitCode : 1;
    const message = error instanceof Error ? error.message : String(error);

    writeOutput(
      formatOutput(
        {
          ok: false,
          message: `Error: ${message}`,
          ...(outputMode === "json" ? { errors: [message] } : {}),
        },
        outputMode
      ),
      process.stderr
    );
    process.exitCode = exitCode;
  }
};

if (import.meta.main) {
  await main();
}
