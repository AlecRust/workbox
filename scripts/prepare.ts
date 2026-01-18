import { existsSync } from "node:fs";
import { resolve } from "node:path";

const isCi = process.env.CI === "1" || process.env.CI === "true";
if (isCi) {
  process.exit(0);
}

if (!existsSync(resolve(process.cwd(), ".git"))) {
  process.exit(0);
}

const subprocess = Bun.spawn(["lefthook", "install"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

process.exit(await subprocess.exited);
