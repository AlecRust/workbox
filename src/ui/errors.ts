export class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, options?: { exitCode?: number; cause?: unknown }) {
    super(message, options);
    this.name = "CliError";
    this.exitCode = options?.exitCode ?? 1;
  }
}

export class UsageError extends CliError {
  constructor(message: string) {
    super(message, { exitCode: 2 });
    this.name = "UsageError";
  }
}

export class ConfigError extends CliError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, { exitCode: 1, cause: options?.cause });
    this.name = "ConfigError";
  }
}
