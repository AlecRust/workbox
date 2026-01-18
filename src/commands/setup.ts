import { runBootstrap } from "../bootstrap/runner";
import { UsageError } from "../ui/errors";
import type { CommandDefinition } from "./types";

export const setupCommand: CommandDefinition = {
  name: "setup",
  summary: "Run bootstrap steps (stub)",
  description: "Run configured bootstrap steps for a workbox sandbox.",
  usage: "workbox setup",
  run: async (context, args) => {
    if (args.length > 0) {
      throw new UsageError(`Unexpected arguments: ${args.join(" ")}`);
    }

    if (!context.config.bootstrap.enabled) {
      return {
        message: "bootstrap is disabled in config.",
        data: {
          status: "disabled",
          steps: context.config.bootstrap.steps.map((step) => step.name),
        },
      };
    }

    const result = await runBootstrap(context.config.bootstrap.steps);
    return {
      message: result.message,
      data: result,
    };
  },
};
