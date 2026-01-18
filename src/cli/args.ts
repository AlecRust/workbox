import { parseArgs } from "node:util";

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

const GLOBAL_OPTIONS = {
  help: { type: "boolean", short: "h" },
  json: { type: "boolean" },
  "non-interactive": { type: "boolean" },
} as const;

type ParsedToken =
  | {
      kind: "option";
      index: number;
      name: string;
      rawName?: string;
      value?: string;
      inlineValue?: boolean;
    }
  | {
      kind: "positional";
      index: number;
      value: string;
    }
  | {
      kind: "option-terminator";
      index: number;
    };

const flagFromOption = (name: string): keyof CliFlags | null => {
  switch (name) {
    case "help":
      return "help";
    case "json":
      return "json";
    case "non-interactive":
      return "nonInteractive";
    default:
      return null;
  }
};

const pushOptionArgs = (token: ParsedToken, argv: string[], commandArgs: string[]): void => {
  if (token.kind !== "option") {
    return;
  }

  const optionArg = argv[token.index];
  if (optionArg !== undefined) {
    commandArgs.push(optionArg);
  }

  if ("value" in token && token.value !== undefined && token.inlineValue === false) {
    const valueArg = argv[token.index + 1];
    if (valueArg !== undefined) {
      commandArgs.push(valueArg);
    }
  }
};

export const parseCliArgs = (argv: string[]): ParsedArgs => {
  const flags: CliFlags = {
    help: false,
    json: false,
    nonInteractive: false,
  };
  const errors: string[] = [];
  const commandArgs: string[] = [];
  let command: string | null = null;
  let passthrough = false;

  const parsed = parseArgs({
    args: argv,
    options: GLOBAL_OPTIONS,
    strict: false,
    allowPositionals: true,
    tokens: true,
  });
  const tokens = parsed.tokens as ParsedToken[] | undefined;

  for (const token of tokens ?? []) {
    if (token.kind === "option-terminator") {
      passthrough = true;
      commandArgs.push("--");
      continue;
    }

    if (token.kind === "option" && !passthrough) {
      const flag = flagFromOption(token.name);
      if (flag) {
        flags[flag] = true;
        continue;
      }
      if (!command) {
        const rawName = "rawName" in token ? token.rawName : argv[token.index];
        errors.push(`Unknown flag "${rawName ?? token.name}".`);
        continue;
      }
      pushOptionArgs(token, argv, commandArgs);
      continue;
    }

    if (!command && token.kind === "positional") {
      command = token.value;
      continue;
    }

    if (!command && passthrough && token.kind === "option") {
      command = argv[token.index] ?? token.name;
      continue;
    }

    if (token.kind === "positional") {
      const value = argv[token.index] ?? token.value;
      commandArgs.push(value);
      continue;
    }

    pushOptionArgs(token, argv, commandArgs);
  }

  return {
    command,
    commandArgs,
    flags,
    errors,
  };
};
