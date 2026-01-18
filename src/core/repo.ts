import { CliError } from "../ui/errors";

const readStream = async (stream: ReadableStream<Uint8Array> | null): Promise<string> => {
  if (!stream) {
    return "";
  }
  return new Response(stream).text();
};

const runGit = async (args: string[], cwd: string): Promise<string> => {
  const proc = Bun.spawn({
    cmd: ["git", ...args],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    readStream(proc.stdout),
    readStream(proc.stderr),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    const message = stderr.trim() || stdout.trim() || "Unknown git error.";
    throw new CliError(`Git command failed (git ${args.join(" ")}): ${message}`);
  }

  return stdout.trim();
};

export const getRepoRoot = async (cwd: string): Promise<string> => {
  const root = await runGit(["rev-parse", "--show-toplevel"], cwd);
  if (!root) {
    throw new CliError("Unable to resolve Git repository root.");
  }
  return root;
};
