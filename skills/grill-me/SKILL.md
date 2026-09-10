---
name: grill-me
description: Interview the user about a plan or a thin area of the project in batched rounds, each question carrying a recommended answer, then record what lands in CONTEXT.md and ADR.md. Use when stress-testing a plan, pinning down vocabulary, or proposing a new feature.
---

# Grill Me

Interview until you and the user share the same understanding of a plan or an area, and write what lands
into `CONTEXT.md` and `ADR.md` as you go.

Two rules carry the whole skill: **look up every fact yourself**, and **ask the remaining decisions in
batched rounds**. A session that spends twenty turns asking one thing at a time, half of them answerable by
grep, has failed even if the plan comes out fine.

## 1. Read first, in one sweep

Before the first question, in parallel:

- **`CONTEXT.md` and `ADR.md`** — what terms and decisions are already recorded? Those are settled. You
  confirm them; you do not ask them.
- **The code the plan touches** — the files, the entry points, the constraint that makes this hard.
- **Overlap, if the plan sounds like a new feature** — does something here already do this job? Check the
  vocabulary, directories and types named for the concept, the routes, and any flag that already gates it.

Overlap is reported, never skipped. A close match becomes round 1's first question — "`job-metrics-service`
already computes this. I would extend it rather than add a service. Agreed?" — with the recommendation to
extend, and you do not design a new feature past an explicit no. Partial overlap gets the same treatment:
name the shared parts, recommend merge or separate, record the rationale.

## 2. Ask in rounds

Map the work as a design tree: each decision branches into the decisions hanging off it. The **frontier** is
every decision whose prerequisites are already settled — everything you can ask *now* without guessing at
an answer you have not heard.

**Ask the whole frontier in one message.** Number the questions, give each your recommended answer, then wait.

```
❓ **Q1** — **<question title>**: <the question, with the constraint you found and the options>

➡️ <your recommended answer, and why>
```

Each round's answers reshape the tree: settled decisions push the frontier outward. Recompute and ask the
next round. A question whose answer depends on another question still open in this round belongs to a
**later** round. Typical shape is two or three rounds of three to six questions, not fifteen single-question
turns.

The session is done when the frontier is empty. Do not act on the plan until the user confirms you have
reached shared understanding.

## 3. What earns a question

A question earns its place only if the user has to decide it, you could not have looked it up, and the
answer changes what gets built or written. Everything else costs you trust:

- **Never ask for a definition.** Draft it from what they said and what the code does, and put it in the
  round as a claim to correct: "I would define a Lease as a time-boxed hold on a job, not a lock on the
  row. Right?"
- **Never ask "how should X work?"** Name the constraint you found, name the design you would pick, ask them
  to confirm or overrule it.
- **Never ask what the files already record.** Restate it as settled. If their answer contradicts
  `CONTEXT.md`, say which line and reconcile to one truth out loud — do not silently overwrite.
- **Never ask a question with no consequence.** If both answers produce the same code and the same file,
  pick one and move on.
- **Never leave a bad question standing.** "I don't understand" means the question was wrong: make it
  smaller, add a worked example, re-ask next round. A fuzzy answer ("maybe", "depends") means you name the
  two branches it splits into and ask which.

Keep descending until each answer names a mechanism. "Branches run in parallel" is a wish, not a design.
Reach for these the moment an answer stays abstract:

- **The constraint** — what in the code as it stands makes this hard? Does it move, or does the design route
  around it?
- **The unit** — what is the smallest thing that can fail, retry, or resume on its own?
- **The blow-up** — at a thousand times the volume, what breaks first: memory, log size, queue depth, a rate
  limit?
- **The half-state** — one part succeeded, one failed, one still running. What does the user see, and what
  can they do about it?
- **The upgrade** — an existing user lands in this without asking. If anything behaves differently for them,
  the default is wrong.
- **The reuse** — what already here does most of this job, and why is it not enough?

## 4. Where results land

Read the formats before you write: `${CLAUDE_PLUGIN_ROOT}/formats/CONTEXT.md` and
`${CLAUDE_PLUGIN_ROOT}/formats/ADR.md`.

| What crystallised | Where it goes |
| --- | --- |
| A hard-to-reverse call with a real trade-off | a new entry at the top of `ADR.md` |
| A term the project uses in its own way | a line under `## Vocabulary` in `CONTEXT.md` |
| Where something lives | a line under `## Key files` in `CONTEXT.md` |
| A trap that cost someone hours | a bullet under `## Gotchas` in `CONTEXT.md` |
| Anything else | nowhere |

**Write each fact the moment it resolves**, not in a batch at the end, and route it to exactly one place.
Grep before each write so you extend the entry that exists rather than adding a second one beside it.

## 5. Before you stop

- Merge duplicates, cut lines that went stale during the session, and check every `## Key files` path still
  exists. A dead path never announces itself; it just sends the next reader nowhere.
- Stop when the area's core terms are pinned and the decisions worth keeping are recorded. A handful of
  terms and one or two ADRs is a good session, not an exhaustive dump.

## Rules

- **Record only what the user actually said.** Never invent or infer a term, a why, or a path into either file.
- **Keep the user's own words** for domain terms. That wording *is* the language the team speaks.
- **No personal or secret data**, ever: no names, emails, handles, customer or account identifiers,
  credentials, or home-directory paths. Write the role — "the on-call engineer", "the reporting customer" —
  and repo-relative paths. If a fact cannot be written without one of those, it does not go in the file.
- **Most of what gets said in a grilling session does not belong in a file.** Write the few things that will
  still matter next month and let the rest go.
