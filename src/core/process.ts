type RunMode = "inherit" | "capture";

type RunResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

const readStream = async (
  stream: ReadableStream<Uint8Array> | null | undefined
): Promise<string> => {
  if (!stream) {
    return "";
  }
  return new Response(stream).text();
};

export const runCommand = async (input: {
  cmd: string[];
  cwd: string;
  mode: RunMode;
  env?: Record<string, string>;
}): Promise<RunResult> => {
  const proc = Bun.spawn({
    cmd: input.cmd,
    cwd: input.cwd,
    env: input.env ? { ...process.env, ...input.env } : process.env,
    stdout: input.mode === "inherit" ? "inherit" : "pipe",
    stderr: input.mode === "inherit" ? "inherit" : "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    input.mode === "capture" ? readStream(proc.stdout) : Promise.resolve(""),
    input.mode === "capture" ? readStream(proc.stderr) : Promise.resolve(""),
    proc.exited,
  ]);

  return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
};

export const runShellCommand = async (input: {
  command: string;
  cwd: string;
  mode: RunMode;
  env?: Record<string, string>;
}): Promise<RunResult> => {
  const isWindows = process.platform === "win32";
  const cmd = isWindows
    ? ["cmd.exe", "/d", "/s", "/c", input.command]
    : ["sh", "-c", input.command];
  return runCommand({ cmd, cwd: input.cwd, mode: input.mode, env: input.env });
};
