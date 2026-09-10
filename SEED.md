# Seed prompt

Paste this into any agent — Claude Code, Cursor, Codex, anything — to get a filled `brain/` folder written
from what your repo actually shows. It needs no plugin installed; it is the `init` skill's procedure as a
single self-contained prompt.

---

Set this repo up with a `brain/` folder at its root, filled in from what the code actually shows. An empty
template is worse than nothing: it looks maintained and says nothing.

First read the repo: entry points, module layout, the names that recur in directory and type names, the
README's own vocabulary, and `git log`. Every line you write must trace to something you actually read.

Create this structure:

```
brain/knowledge/
├── index.md          the spine — one line per Area
├── context.md        vocabulary · key files · gotchas
├── memory.md         dated one-liners, newest first
└── decisions/
    └── 000001-kebab-title.md
```

**`brain/knowledge/context.md` — what things ARE, now.**

```markdown
# Context

One or two sentences: what this project is, for whom.

## Vocabulary

**Hopper** — a process that claims one job and runs it to completion. One at a time, always.
_Avoid_: "worker" (retired alias)

## Key files

- `src/dispatch/` — the claim-and-run loop. Entry point: `claimNext()`

## Gotchas

- **A crashed Hopper keeps its claim for the full lease.** It expires on a timer, not on disconnect,
  so a dead job reads as running. See decision 000001 before shortening it.
```

Only terms this project uses in its own particular way — the ones someone fluent in the stack would still
be confused by *here*. Define what a thing IS, not what it does. Ten to twenty terms is a good page; fifty
is a page nobody reads. Key files: directories rather than files, name the entry-point symbol, never line
numbers, and never a guessed path. Leave `## Gotchas` out entirely unless you found a real one.

**`brain/knowledge/index.md` — the spine.** One line per Area, pointing at the page that holds it. Start
with `context` and `decisions`, and add an Area only when this repo actually has one.

**`brain/knowledge/decisions/NNNNNN-kebab-title.md` — WHY the hard-to-reverse calls were made.** One file
per decision, six digits, numbered sequentially, numbers never reused.

```markdown
---
status: accepted
---

# Lease expires on a timer, not on disconnect

## Decision
What was decided, in a sentence or two.

## Context
The situation and the constraint that forced it.

## Why
The reasoning, and the main alternative that was rejected.

## Consequences
What this commits the project to, and what to watch for.
```

Title each file as the claim itself, so the folder reads as a list of positions. A sentence or two per
section. An entry needs all three: **hard to reverse**, **surprising without the context**, and the result
of a **real trade-off** — miss one and skip it. Write one only where the repo gives you evidence: a comment
explaining why, a revert or migration in the history, an existing design doc. **Do not invent decisions or
reasoning.** A `decisions/` folder with one file, or none at all, is a correct outcome — say so and let the
next real decision be the first.

Rules: never write a name, email, handle, customer or account identifier, credential, or home-directory
path anywhere in `brain/` — write the role, and repo-relative paths. Do not overwrite a `brain/` folder
that already exists; read it and offer to extend it. If the repo already has a real `adr/`, `docs/adr/` or
`decisions/` tree elsewhere, stop and say so rather than starting a second one.

Finish by showing me what you wrote and what you deliberately left out.
