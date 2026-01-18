import type { ResolvedWorkboxConfig } from "../core/config";

type GlobalFlags = {
  help: boolean;
  json: boolean;
  nonInteractive: boolean;
};

export type CommandContext = {
  cwd: string;
  repoRoot: string;
  worktreeRoot: string;
  config: ResolvedWorkboxConfig;
  configPath: string;
  flags: GlobalFlags;
};

export type CommandResult = {
  message: string;
  data?: unknown;
  exitCode?: number;
};

export type CommandDefinition = {
  name: string;
  summary: string;
  description: string;
  usage: string;
  run: (context: CommandContext, args: string[]) => Promise<CommandResult>;
};
