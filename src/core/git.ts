import { join } from "node:path";

type WorktreeInfo = {
  name: string;
  path: string;
  branch: string | null;
};

type WorktreeStatus = WorktreeInfo & {
  clean: boolean;
};

type StubResult<T> = {
  status: "stub";
  message: string;
  data: T;
};

type CreateWorktreeInput = {
  name: string;
  baseDir: string;
  branchPrefix: string;
};

export const createWorktree = async (
  input: CreateWorktreeInput
): Promise<StubResult<WorktreeInfo>> => ({
  status: "stub",
  message: `worktree "${input.name}" would be created under ${input.baseDir}.`,
  data: {
    name: input.name,
    path: join(input.baseDir, input.name),
    branch: `${input.branchPrefix}${input.name}`,
  },
});

export const removeWorktree = async (name: string): Promise<StubResult<{ name: string }>> => ({
  status: "stub",
  message: `worktree "${name}" would be removed.`,
  data: { name },
});

export const listWorktrees = async (): Promise<StubResult<WorktreeInfo[]>> => ({
  status: "stub",
  message: "worktree listing is not implemented yet.",
  data: [],
});

export const pruneWorktrees = async (): Promise<StubResult<{ pruned: string[] }>> => ({
  status: "stub",
  message: "worktree prune is not implemented yet.",
  data: { pruned: [] },
});

export const getWorktreeStatus = async (name?: string): Promise<StubResult<WorktreeStatus[]>> => ({
  status: "stub",
  message: name
    ? `status for worktree "${name}" is not implemented yet.`
    : "status for worktrees is not implemented yet.",
  data: [],
});

export const startDevSession = async (name: string): Promise<StubResult<{ name: string }>> => ({
  status: "stub",
  message: `dev session for "${name}" would start here.`,
  data: { name },
});

export const execInWorktree = async (
  name: string,
  command: string[]
): Promise<StubResult<{ name: string; command: string[] }>> => ({
  status: "stub",
  message: `command would run in "${name}": ${command.join(" ")}.`,
  data: { name, command },
});
