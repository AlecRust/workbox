import { describe, expect, it } from "bun:test";

const readStream = async (stream: ReadableStream<Uint8Array> | null): Promise<string> => {
  if (!stream) {
    return "";
  }
  return await new Response(stream).text();
};

const packageVersion = async (): Promise<string> => {
  const packageJson = (await Bun.file(`${import.meta.dir}/../package.json`).json()) as {
    version: string;
  };
  return packageJson.version;
};

const runWorkbox = async (args: string[]) => {
  const proc = Bun.spawn(["bun", "./src/cli.ts", ...args], {
    cwd: `${import.meta.dir}/..`,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    readStream(proc.stdout),
    readStream(proc.stderr),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
};

describe("cli", () => {
  it("prints the package version", async () => {
    const version = await packageVersion();
    const result = await runWorkbox(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe(`workbox ${version}\n`);
  });

  it("prints the package version as JSON", async () => {
    const version = await packageVersion();
    const result = await runWorkbox(["--json", "--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      message: `workbox ${version}`,
      data: { version },
    });
  });
});
