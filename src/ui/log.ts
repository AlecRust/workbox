type OutputMode = "text" | "json";

type CliPayload = {
  ok: boolean;
  command?: string;
  message?: string;
  data?: unknown;
  help?: string;
  errors?: string[];
};

export const formatOutput = (payload: CliPayload, mode: OutputMode): string => {
  if (mode === "json") {
    return JSON.stringify(payload, null, 2);
  }

  const lines: string[] = [];
  if (payload.message) {
    lines.push(payload.message);
  }
  if (payload.help) {
    lines.push(payload.help);
  }
  if (payload.errors && payload.errors.length > 0) {
    lines.push("Errors:");
    for (const error of payload.errors) {
      lines.push(`- ${error}`);
    }
  }

  return lines.join("\n");
};
