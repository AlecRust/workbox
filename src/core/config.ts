import { z } from "zod";

import { ConfigError } from "../ui/errors";
import { getConfigCandidatePaths, resolveWorktreesDir } from "./paths";

const BootstrapStepSchema = z
  .object({
    name: z.string().min(1, "Step name is required."),
    run: z.string().min(1, "Step command is required."),
    cwd: z.string().min(1).optional(),
    env: z.record(z.string(), z.string()).optional(),
  })
  .strict();

const BootstrapSchemaBase = z
  .object({
    enabled: z.boolean().default(true),
    steps: z.array(BootstrapStepSchema).default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.steps.forEach((step, index) => {
      if (seen.has(step.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps", index, "name"],
          message: `Duplicate bootstrap step name "${step.name}".`,
        });
      }
      seen.add(step.name);
    });
  });

const BootstrapSchema = BootstrapSchemaBase.default(() => ({
  enabled: true,
  steps: [],
}));

const WorktreesSchema = z
  .object({
    directory: z.string().min(1).default(".workbox/worktrees"),
    branch_prefix: z.string().min(1).default("wkb/"),
  })
  .strict()
  .default({
    directory: ".workbox/worktrees",
    branch_prefix: "wkb/",
  });

const WorkboxConfigSchema = z
  .object({
    worktrees: WorktreesSchema,
    bootstrap: BootstrapSchema,
  })
  .strict();

export type WorkboxConfig = z.infer<typeof WorkboxConfigSchema>;

export type ResolvedWorkboxConfig = WorkboxConfig & {
  worktrees: WorkboxConfig["worktrees"] & { directory: string };
};

type LoadedConfig = {
  config: ResolvedWorkboxConfig;
  path: string | null;
};

const formatZodError = (error: z.ZodError, filePath: string): string => {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });

  return `Invalid workbox config in ${filePath}:\n${issues.map((item) => `- ${item}`).join("\n")}`;
};

const parseConfig = (source: string, filePath: string): WorkboxConfig => {
  let parsed: unknown;
  try {
    parsed = Bun.TOML.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ConfigError(`Invalid TOML in ${filePath}: ${message}`, { cause: error });
  }

  const result = WorkboxConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new ConfigError(formatZodError(result.error, filePath));
  }

  return result.data;
};

const resolveConfig = (
  config: WorkboxConfig,
  cwd: string,
  configPath: string | null
): ResolvedWorkboxConfig => ({
  ...config,
  worktrees: {
    ...config.worktrees,
    directory: resolveWorktreesDir(config.worktrees.directory, cwd, configPath),
  },
});

export const loadConfig = async (cwd: string): Promise<LoadedConfig> => {
  const candidates = getConfigCandidatePaths(cwd);

  for (const configPath of candidates) {
    const file = Bun.file(configPath);
    if (await file.exists()) {
      const contents = await file.text();
      const config = parseConfig(contents, configPath);
      return {
        config: resolveConfig(config, cwd, configPath),
        path: configPath,
      };
    }
  }

  const config = WorkboxConfigSchema.parse({});
  return {
    config: resolveConfig(config, cwd, null),
    path: null,
  };
};
