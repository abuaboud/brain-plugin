# Decision format

One file per decision, in `brain/knowledge/decisions/`. The filename is the entry's identity: a second file
on the same subject is a duplicate, not an update.

```
brain/knowledge/decisions/000007-worker-is-the-sandbox.md
```

- **Six digits, sequential**, one above the highest already in the folder. Numbers are never reused.
- **Kebab-case the title** into the rest of the filename.

## Before you add one

All three must hold:

1. **Hard to reverse.** Changing your mind later costs something real.
2. **Surprising without the context.** A future reader will ask "why on earth did they do it this way?"
3. **A real trade-off.** There were genuine alternatives and one was picked for reasons.

Miss any one and skip it. Easy to reverse? You will just reverse it. Not surprising? Nobody will wonder.
No real alternative? There is nothing to record beyond "we did the obvious thing."

**Grep `brain/knowledge/decisions/` first.** If a decision on this subject already exists, you are either
revising it (edit that file) or superseding it (see below).

## Shape

```markdown
---
status: accepted
---

# Worker is the Sandbox: one job per worker, scale by replicas

## Decision

What was decided, in a sentence or two.

## Context

The situation and the constraint that forced the choice. What was true at the time.

## Why

The reasoning, and the main alternative that was rejected and why.

## Consequences

What this commits the project to, and what to watch for.
```

- **Title it as the claim itself**, so the folder reads as a list of positions: "Worker is the Sandbox",
  "Migrations run forward only", "Postgres over SQLite". Not "Decision about the worker".
- **`status`** is `accepted`, `proposed` while the call is still open, or `superseded by 000011`.
- **A sentence or two per section.** Four short paragraphs, not four essays. Link out to code or docs rather
  than inlining background.

## Superseding

When a new decision replaces an old one, do two edits: add the new file, then change the old file's
`status` to `superseded by <number>`. **Never rewrite an old decision to say something it did not say.**
The record of what was believed at the time is the point; a decision that quietly changed its mind is
worth less than none.

## What does not go here

- **What something currently is** — that is `brain/knowledge/context.md`.
- **A gotcha** — a bullet under `## Gotchas` in `brain/knowledge/context.md`.
- **A dated status with nothing procedural to teach** — one line in `brain/knowledge/memory.md`.
- **Anything with a person, a customer, a credential, or a home-directory path in it.** Write the role and
  the shape of the case instead, or leave the entry out.
