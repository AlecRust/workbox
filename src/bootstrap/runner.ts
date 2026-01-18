import type { BootstrapStep } from "./steps";

type BootstrapResult = {
  status: "stub";
  message: string;
  steps: string[];
};

export const runBootstrap = async (steps: BootstrapStep[]): Promise<BootstrapResult> => ({
  status: "stub",
  message:
    steps.length > 0
      ? "bootstrap steps are not implemented yet."
      : "no bootstrap steps configured.",
  steps: steps.map((step) => step.name),
});
