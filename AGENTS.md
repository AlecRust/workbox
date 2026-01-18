# Repository Guidelines

## Project Structure & Module Organization

- `src/cli.ts`: CLI entrypoint (published as `workbox` and `wkb`).
- `src/cli/`: argument parsing and help output.
- `src/commands/`: subcommands (`new`, `rm`, `list`, `status`, `exec`, `dev`, `setup`, `prune`).
- `src/core/`: Git/worktree, config, path, and process utilities.
- `src/bootstrap/`: “setup” bootstrapping steps runner.
- `src/ui/`: user-facing formatting and error helpers.
- Tests live next to code as `src/**/*.test.ts`.
- Config is read from `.workbox/config.toml` or `workbox.toml` (paths resolve from repo root).

## Build, Test, and Development Commands

This is a Bun-first TypeScript CLI (Bun `1.3.6`).

- `bun install`: install dependencies (hooks are installed via `lefthook` on `prepare`).
- `bun test`: run the Bun test suite (coverage is enabled and enforced).
- `bun run lint`: lint via Biome.
- `bun run check`: run `lint` + `tsc --noEmit` + `knip` (unused/invalid exports).
- `bun run format`: auto-format via Biome.
- Local CLI run: `bun ./src/cli.ts --help` (or `bun ./src/cli.ts list`).

## Coding Style & Naming Conventions

- Formatting/linting: Biome (`biome.json`) with 2-space indentation, 100-char lines, and double quotes.
- TypeScript is ESM (`"type": "module"`). Prefer `camelCase` for functions/vars and `PascalCase` for types.
- Keep modules small and area-based under `src/core`, `src/commands`, and `src/cli`.

## Testing Guidelines

- Framework: `bun:test`.
- Naming: `*.test.ts`, colocated with the module under test.
- Coverage: `bunfig.toml` enforces 100% line/function/statement coverage; add/adjust tests with any behavior change.

## Commit & Pull Request Guidelines

- Commit messages must follow Conventional Commits (validated in CI via `cog.toml`): e.g. `feat(core): add ...`, `fix: ...`, `chore(deps): ...`.
- Before opening a PR, run `bun run check` and `bun test`.
- PRs should describe user-facing behavior changes and include example commands/output when relevant.

## Security & Configuration Tips

- Don’t commit local state: `.workbox/worktrees/`, `coverage/`, `.env`, and logs are ignored.
- Treat config-defined commands (`bootstrap.steps`, `dev.command`) as code: review before running in shared repos.
