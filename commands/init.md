---
description: Create CONTEXT.md and ADR.md for this repo, filled in from what the code actually shows.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git log:*), Bash(ls:*), Bash(find:*)
---

Set this repo up with the two context files, and fill them from the repo itself rather than leaving a
scaffold behind. An empty template is worse than nothing: it looks maintained and says nothing.

## 1. Read the formats

Read `${CLAUDE_PLUGIN_ROOT}/formats/CONTEXT.md` and `${CLAUDE_PLUGIN_ROOT}/formats/ADR.md` before writing
anything. Follow them exactly.

## 2. Check what is already here

- If `CONTEXT.md` or `ADR.md` already exists, **do not overwrite it.** Read it, tell the user what it
  already covers, and offer to extend it instead.
- Look for context that already exists elsewhere and should be folded in rather than duplicated:
  `README.md`, `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/`, and any `adr/`, `adrs/`, `rfcs/` or
  `decisions/` folder. If a real ADR tree already exists, say so and stop — that repo already has this
  covered, and a second one at the root would just split it.

## 3. Learn the project before you write a word

In parallel: the entry points, the package or module layout, the names that recur in directory and type
names, the README's own vocabulary, and `git log` for the shape of recent work. Every line you write must
trace to something you actually read.

## 4. Write CONTEXT.md

Vocabulary first — only the terms this project uses in its own particular way, the ones a competent
engineer would still be confused by here. Then `## Key files` (directories, entry-point symbols, no line
numbers). Add `## Gotchas` only if you found a real one; leave the heading out otherwise.

Aim for something a new teammate reads in two minutes. Ten to twenty terms is a good file. Fifty is a file
nobody reads.

## 5. Write ADR.md

Only for calls the repo gives you real evidence for — a migration in the history, a comment explaining why
something is the way it is, an existing design doc. Each must be hard to reverse, surprising without the
context, and the result of a real trade-off.

**Do not invent decisions or reasoning.** If the repo does not tell you why, the entry does not go in. It is
completely fine for `ADR.md` to start with a heading and one entry, or with none at all — say so, and let
the next real decision be the first.

## 6. Rules

- Never write a name, email, handle, customer or account identifier, credential, or home-directory path
  into either file. Roles and repo-relative paths only.
- Never guess a path. A guessed path reads as authoritative and sends the next reader nowhere.
- Show the user what you wrote and what you deliberately left out.
