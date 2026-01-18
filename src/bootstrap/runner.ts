import { resolve } from "node:path";

import { checkPathWithinRoot } from "../core/path";
import { runShellCommand } from "../core/process";
import { CliError } from "../ui/errors";
import type { BootstrapStep } from "./steps";

type BootstrapStepResult = {
  name: string;
  command: string;
  cwd: string;
  exitCode: number;
  stdout?: string;
  stderr?: string;
};

type BootstrapResult = {
  status: "ok" | "failed";
  message: string;
  steps: BootstrapStepResult[];
  exitCode: number;
};

type OutputMode = "inherit" | "capture";

const resolveStepCwd = async (repoRoot: string, stepCwd?: string): Promise<string> => {
  if (!stepCwd) {
    return repoRoot;
  }
  const resolved = resolve(repoRoot, stepCwd);
  const within = await checkPathWithinRoot({
    rootDir: repoRoot,
    candidatePath: resolved,
    label: "bootstrap step cwd",
  });
  if (!within.ok) {
    throw new CliError(within.reason, { exitCode: 2 });
  }
  return resolved;
};

export const runBootstrap = async (
  steps: BootstrapStep[],
  options: { repoRoot: string; mode: OutputMode }
): Promise<BootstrapResult> => {
  if (steps.length === 0) {
    return {
      status: "ok",
      message: "no bootstrap steps configured.",
      steps: [],
      exitCode: 0,
    };
  }

  const results: BootstrapStepResult[] = [];
  for (const step of steps) {
    const cwd = await resolveStepCwd(options.repoRoot, step.cwd);
    const { stdout, stderr, exitCode } = await runShellCommand({
      command: step.run,
      cwd,
      mode: options.mode,
      env: step.env,
    });

    results.push({
      name: step.name,
      command: step.run,
      cwd,
      exitCode,
      ...(options.mode === "capture" ? { stdout: stdout.trim(), stderr: stderr.trim() } : {}),
    });

    if (exitCode !== 0) {
      return {
        status: "failed",
        message: `bootstrap step "${step.name}" failed (exit ${exitCode}).`,
        steps: results,
        exitCode,
      };
    }
  }

  return {
    status: "ok",
    message: "bootstrap completed.",
    steps: results,
    exitCode: 0,
  };
};
