# AGENTS.md

This repository contains **workbox (wkb)** — a small, high-quality CLI for managing Git worktrees as disposable development sandboxes.

This file exists to keep the **end goal and design constraints** clear for AI agents (Codex) and humans working on the project.

---

## What we are building

workbox is a **generic, Bun-first CLI** that wraps `git worktree` with a clean, explicit workflow:

- One worktree per task
- One branch per worktree
- Worktrees are temporary
- Branches are normal Git branches

Removing a worktree must **never** delete the branch.

The tool is intentionally small and boring. It should feel like a Unix CLI: predictable, explicit, and safe.

---

## Core mental model

- A worktree is a **sandbox**
- A branch is **permanent**
- Creating and removing worktrees should be cheap
- No hidden state, no magic

If a user understands Git branches and directories, they should understand workbox.

---

## Scope of the tool

workbox is responsible for:

- Creating and removing Git worktrees safely
- Keeping a clear mapping between:
  - branch ↔ worktree path
- Providing optional bootstrap hooks:
  - copy env files
  - install dependencies
  - run checks
  - run a dev command
- Supporting parallel work (humans + automation)

workbox is **not** responsible for:

- Replacing Git
- Managing PRs
- Managing CI
- Managing containers or databases
- Owning developer environments

---

## Design constraints (do not violate)

- Bun-first (runtime, package manager, tests)
- ESM-only
- TypeScript everywhere
- Minimal dependencies
- Repo-local configuration only
- No global state outside the repo
- No interactive prompts by default
- Deterministic, scriptable behavior

---

## CLI principles

- Every command must be usable non-interactively
- Every command must have:
  - clear exit codes
  - stable output
  - optional `--json` mode
- Commands must fail loudly and clearly when unsafe
- Never guess when deleting files or directories

---

## Configuration principles

- Config is TOML
- Config is loaded from:
  1. `.workbox/config.toml`
  2. `workbox.toml`
- Config is validated strictly with good error messages
- No global config, no hidden defaults

---

## Safety guarantees

workbox must never:

- Delete a branch automatically
- Delete a directory that is not a registered worktree
- Assume a base branch unless explicitly configured
- Overwrite env files without explicit intent
- Hide state in global locations

---

## Code quality bar

- Small, focused modules
- Strong typing
- Clear naming
- Explicit control flow
- No clever abstractions
- Everything testable
- Tests colocated with source files
- All tooling checks must pass

If a feature increases complexity without clear value, do not add it.

---

## Guiding question for every change

> Does this make worktrees easier to use **without** making Git harder to reason about?

If the answer is no, the change is probably wrong.

---

## End goal (v1.0)

At v1.0, workbox should be:

- Boring in the best way
- Trusted to manage worktrees safely
- Fast enough to feel instant
- Simple enough to explain in a single screen
- Useful for both humans and AI agents

Keep this goal in mind for every change.
