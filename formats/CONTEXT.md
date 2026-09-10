# Context page format

`brain/knowledge/context.md`. The project's vocabulary and where things live — what a reader needs to
understand a conversation about this codebase before they can be useful in it.

This page says what things **are, now**. It carries no history and no reasoning; the why behind a
hard-to-reverse call lives in `brain/knowledge/decisions/`.

## Shape

```markdown
# Context

One or two sentences: what this project is, for whom.

## Vocabulary

**Worker** — a process that claims one job and runs it to completion. One job at a time, always.
_Avoid_: "runner" (retired alias)
**Sandbox** — the isolated filesystem a Worker executes in. Created per job, destroyed after.
**Lease** — a Worker's time-boxed hold on a job. Expires on a timer, not when the process dies.

## Key files

- `packages/server/worker/` — the claim-and-run loop. Entry point: `workerService.claimNext()`
- `packages/server/sandbox/` — sandbox lifecycle
- `packages/shared/` — schemas both sides share

## Gotchas

- **A Worker holds its claim for 30s after the process dies.** The lease expires on a timer, not on
  disconnect, so a crashed job looks running until then. Do not shorten it without reading decision 000004.
```

## Rules

- **Only terms this project uses in its own particular way.** General programming and business words do not
  belong, however often the team says them. Before adding a term, ask whether someone fluent in the stack
  would still be confused by it here. If not, leave it out.
- **Define what a thing IS, not what it does.** One or two sentences.
- **Be opinionated.** One canonical word per concept. When several words are in use, pick one and retire the
  rest by name on an `_Avoid_` line, so the next reader stops reintroducing them.
- **A term that outgrows its line** gets its own section further down, or its own file linked from the line.
- **Never mirror the public docs.** Link to them. This file covers what is not written down elsewhere.

## Key files

Where things live, so the next reader opens a file instead of grepping. Three rules, all because pointers rot:

- **Directories, not files**, wherever a directory covers it. A file gets renamed; a module directory rarely
  moves.
- **Never line numbers.** Any edit above one silently invalidates it.
- **Name the entry-point symbol** when there is one. It survives a file move, which no path does.

Only add a path someone actually knows. A guessed path reads as authoritative and sends the next reader to
the wrong place.

## Gotchas

A gotcha is a trap that cost real time and will cost it again. It is **never its own file** — it goes as a
bullet here, so whoever reads about the thing meets the trap in place instead of having to know it exists.

Name the trap in bold, then say what actually happens and what to do instead. If a decision explains why it
is that way, point at its number.

## What does not go here

- **Why a call was made** — that is `brain/knowledge/decisions/`.
- **A dated status with nothing procedural to teach** — one line in `brain/knowledge/memory.md`.
- **Anything with a person, a customer, a credential, or a home-directory path in it.** Write the role
  instead, or leave it out.
