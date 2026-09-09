# ADR.md format

One file at the repo root. Every hard-to-reverse call the project has made, **newest first**, so the top of
the file is the current thinking and scrolling down is going back in time.

## Before you add one

All three must hold:

1. **Hard to reverse.** Changing your mind later costs something real.
2. **Surprising without the context.** A future reader will ask "why on earth did they do it this way?"
3. **A real trade-off.** There were genuine alternatives and one was picked for reasons.

Miss any one and skip it. Easy to reverse? You will just reverse it. Not surprising? Nobody will wonder.
No real alternative? There is nothing to record beyond "we did the obvious thing."

**Grep `ADR.md` first.** If a decision on this subject already exists, you are either revising it (edit it)
or superseding it (see below). A second entry on the same subject is a duplicate.

## Shape

```markdown
## 0007 · Worker is the Sandbox
`accepted` · 2026-09-08

### Decision
What was decided, in a sentence or two.

### Context
The situation and the constraint that forced the choice. What was true at the time.

### Why
The reasoning, and the main alternative that was rejected and why.

### Consequences
What this commits the project to, and what to watch for.
```

- **Number sequentially**, one above the highest already in the file. Numbers are never reused.
- **Title it as the claim itself**, so the file reads as a list of positions: "Worker is the Sandbox",
  "Pieces resolve lazily", "Postgres over SQLite". Not "Decision about the worker" and not a full sentence.
- **Status** is `accepted`, `proposed` while the call is still open, or `superseded by 0011`.
- **A sentence or two per section.** Four short paragraphs, not four essays. Link out to code or docs rather
  than inlining background.

## Superseding

When a new decision replaces an old one, do two edits: add the new entry at the top, then change the old
entry's status line to `superseded by <number>`. **Never rewrite an old entry to say something it did not
say.** The record of what was believed at the time is the point; an ADR that quietly changed its mind is
worth less than no ADR.

## What does not go here

- **What something currently is** — that is `CONTEXT.md`. ADRs are history and reasoning.
- **A gotcha** — a bullet under `## Gotchas` in `CONTEXT.md`.
- **Anything with a person, a customer, a credential, or a home-directory path in it.** Write the role and
  the shape of the case instead, or leave the entry out.
