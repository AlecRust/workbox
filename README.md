# workbox (wkb)

Minimal Bun-first CLI for Git worktrees. Creates a worktree per sandbox and removes it cleanly.

## Install

```sh
bun add -g github:AlecRust/workbox
```

Planned npm package:

```sh
npm i -g @AlecRust/workbox
```

## Use

```sh
wkb new <name>               # create sandbox worktree (stub)
wkb rm <name>                # remove worktree (keep branch)
wkb list                     # list worktrees
wkb prune                    # prune stale metadata
wkb status                   # show current repo/worktree info
wkb setup                    # run configured bootstrap steps
wkb dev                      # run configured dev command
wkb exec <name> -- <cmd...>  # run a command in worktree context
```

`workbox` and `wkb` are equivalent.

## Config

Looks for config in:

1. `.workbox/config.toml`
2. `workbox.toml`

Config is required. Paths are resolved relative to the repo root.

Example:

```toml
[worktrees]
directory = ".workbox/worktrees"
branch_prefix = "wkb/"

[bootstrap]
enabled = true
steps = [
  { name = "install", run = "bun install" },
  { name = "build", run = "bun run build" }
]
```

## Development

```sh
bun install
bun test
bun run check
```

## Commit conventions

Conventional Commits are enforced. See `cog.toml`.
