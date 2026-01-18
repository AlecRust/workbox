import { commands } from "../commands";
import type { CommandDefinition } from "../commands/types";

const TOOL_DESCRIPTION =
  "workbox manages fast Git worktree sandboxes with optional bootstraps (skeleton).";

export const renderGlobalHelp = (toolName: string, alias: string): string => {
  const commandLines = commands.map((command) => `  ${command.name.padEnd(8)} ${command.summary}`);

  return [
    `${toolName} - ${TOOL_DESCRIPTION}`,
    `Alias: ${alias}`,
    "",
    "Usage:",
    `  ${toolName} <command> [options]`,
    "",
    "Commands:",
    ...commandLines,
    "",
    "Global options:",
    "  --help            Show help for a command",
    "  --json            Output machine-readable JSON",
    "  --non-interactive Disable prompts and fail fast",
  ].join("\n");
};

export const renderCommandHelp = (toolName: string, command: CommandDefinition): string =>
  [
    `${toolName} ${command.name} - ${command.summary}`,
    "",
    "Usage:",
    `  ${command.usage}`,
    "",
    "Description:",
    `  ${command.description}`,
    "",
    "Options:",
    "  --help            Show help for this command",
    "  --json            Output machine-readable JSON",
    "  --non-interactive Disable prompts and fail fast",
  ].join("\n");
