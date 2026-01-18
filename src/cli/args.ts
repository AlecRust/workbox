type CliFlags = {
  help: boolean;
  json: boolean;
  nonInteractive: boolean;
};

type ParsedArgs = {
  command: string | null;
  commandArgs: string[];
  flags: CliFlags;
  errors: string[];
};

const DEFAULT_FLAGS: CliFlags = {
  help: false,
  json: false,
  nonInteractive: false,
};

const FLAG_ALIASES: Record<string, keyof CliFlags> = {
  "--help": "help",
  "-h": "help",
  "--json": "json",
  "--non-interactive": "nonInteractive",
};

export const parseCliArgs = (argv: string[]): ParsedArgs => {
  const flags: CliFlags = { ...DEFAULT_FLAGS };
  const errors: string[] = [];
  const commandArgs: string[] = [];
  let command: string | null = null;
  let passthrough = false;

  for (const token of argv) {
    if (token === "--") {
      passthrough = true;
      commandArgs.push(token);
      continue;
    }

    if (!passthrough && token in FLAG_ALIASES) {
      const flag = FLAG_ALIASES[token];
      flags[flag] = true;
      continue;
    }

    if (!passthrough && token.startsWith("-")) {
      errors.push(`Unknown flag "${token}".`);
      continue;
    }

    if (!command) {
      command = token;
      continue;
    }

    commandArgs.push(token);
  }

  return {
    command,
    commandArgs,
    flags,
    errors,
  };
};
