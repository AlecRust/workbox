import { parseArgs } from "node:util";

import { UsageError } from "../ui/errors";

type ParseArgsOptions = Parameters<typeof parseArgs>[0];

export const parseArgsOrUsage = (options: ParseArgsOptions) => {
  try {
    return parseArgs(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new UsageError(message);
  }
};
