import { devCommand } from "./dev";
import { execCommand } from "./exec";
import { listCommand } from "./list";
import { newCommand } from "./new";
import { pruneCommand } from "./prune";
import { rmCommand } from "./rm";
import { setupCommand } from "./setup";
import { statusCommand } from "./status";
import type { CommandDefinition } from "./types";

export const commands: CommandDefinition[] = [
  newCommand,
  rmCommand,
  listCommand,
  pruneCommand,
  statusCommand,
  setupCommand,
  devCommand,
  execCommand,
];

export const getCommand = (name: string): CommandDefinition | undefined =>
  commands.find((command) => command.name === name);
