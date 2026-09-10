---
name: init
description: Scaffold brain/ in this repo and fill it from what the code actually shows. Use when someone wants to initialise, set up, bootstrap or turn on the brain / project context for a repo, or asks where brain/knowledge/context.md and brain/knowledge/ADR.md come from.
---

# Init

Two steps, in order: a script makes the structure, then you fill it from the repo. An empty template is
worse than nothing — it looks maintained and says nothing — so the second step is the one that matters.

## 1. Scaffold

```sh
sh "${CLAUDE_PLUGIN_ROOT}/scripts/brain-init.sh"
```

It creates `brain/knowledge/` with `context.md` and `ADR.md`, prints the tree, and exits 0 without touching
anything if `brain/` already exists. Run it from the repo root; it resolves the
root itself with `git rev-parse` when it can.

If it reports that `brain/` already exists, **do not overwrite what is there.** Read it, tell the user what
it already covers, and offer to extend it instead. Check too for context that lives elsewhere and should be
folded in rather than duplicated: `README.md`, `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/`, and any
`adr/`, `adrs/`, `rfcs/` or `decisions/` folder. If a real ADR tree already exists somewhere else, say so
and stop — that repo already has this covered, and a second one would just split it.

## 2. Learn the project before you write a word

Read the formats first: `${CLAUDE_PLUGIN_ROOT}/formats/CONTEXT.md` and `${CLAUDE_PLUGIN_ROOT}/formats/ADR.md`.

Then, in parallel: the entry points, the package or module layout, the names that recur in directory and
type names, the README's own vocabulary, and `git log` for the shape of recent work. Every line you write
must trace to something you actually read.

## 3. Fill `brain/knowledge/context.md`

Vocabulary first — only the terms this project uses in its own particular way, the ones a competent engineer
would still be confused by here. Then `## Key files` (directories, entry-point symbols, no line numbers).
Keep `## Gotchas` only if you found a real one; delete the heading otherwise.

Aim for something a new teammate reads in two minutes. Ten to twenty terms is a good page. Fifty is a page
nobody reads.

## 4. Fill `brain/knowledge/ADR.md`

Newest first, numbered sequentially. Only for calls the repo gives you real evidence for — a migration in
the history, a comment explaining why something is the way it is, an existing design doc. Each must be hard
to reverse, surprising without the context, and the result of a real trade-off.

**Do not invent decisions or reasoning.** If the repo does not tell you why, the entry does not go in. It is
completely fine for `ADR.md` to end up with one entry, or none at all — say so, and let the next real
decision be the first.

## Rules

- Never write a name, email, handle, customer or account identifier, credential, or home-directory path
  anywhere in `brain/`. Roles and repo-relative paths only.
- Never guess a path. A guessed path reads as authoritative and sends the next reader nowhere.
- Show the user what you wrote and what you deliberately left out.
