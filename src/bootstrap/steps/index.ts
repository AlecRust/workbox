export type BootstrapStep = {
  name: string;
  run: string;
  cwd?: string;
  env?: Record<string, string>;
};
