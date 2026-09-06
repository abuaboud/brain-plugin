---
name: grill-me
description: Grilling session that reads the brain and the code first, then asks the member the open decisions in batched rounds, each with a recommended answer, and records what lands in the Craftspace brain (pages, Decisions, gotchas, Skills). Use when stress-testing a plan, filling a thin Area, or proposing a new feature.
---

# Grill Me

Interview the member until you both reach shared understanding of a plan or an Area, and write what
lands into the brain as you go.

Two rules carry the whole skill: **look up every fact yourself**, and **ask the remaining decisions in
batched rounds**. A session that spends twenty turns asking one thing at a time, half of them
answerable by grep, has failed even if the plan comes out fine.

## 1. Read first, in one sweep

Before the first question, in parallel (dispatch sub-agents, don't do it serially):

- **The brain** — grep `brain/` if this repo has it, else `search_pages` + `read_page`. What terms and
  decisions are already recorded? Those are settled; you confirm them, you don't ask them.
- **The code the plan touches** — the files, the entry points, the constraint that makes this hard.
- **Connected docs, if the Area has any** — turn what they already say into page lines. Grill fills the
  gaps the docs don't cover.
- **Overlap, if the plan sounds like a new feature** — does something already do this job? Check the
  brain pages, source files and directories named for the concept, the server's routes, the shared
  types package, and any plan or feature flag that already gates it.

Overlap is reported, never skipped: a close match becomes round 1's first question ("`space-health-service`
already computes this. I'd extend it rather than add a service. Agreed?") with the recommendation to
extend, and you do not design a new feature past an explicit no. Partial overlap gets the same
treatment: name the shared parts, recommend merge or separate, record the rationale.

## 2. Ask in rounds

Map the work as a design tree: each decision branches into the decisions hanging off it. The
**frontier** is every decision whose prerequisites are already settled — everything you can ask *now*
without guessing at an answer you haven't heard.

**Ask the whole frontier in one message.** Number the questions, give each your recommended answer,
then wait.

```
❓ **Q1** — **<question title>**: <the question, with the constraint you found and the options>

➡️ <your recommended answer, and why>
```

Each round's answers reshape the tree: settled decisions push the frontier outward. Recompute it and
ask the next round. A question whose answer depends on another question still open in this round
belongs to a **later** round, not this one. Typical shape is two or three rounds of three to six
questions, not fifteen single-question turns.

The session is done when the frontier is empty. Do not act on the plan until the member confirms you
have reached shared understanding.

## 3. What earns a question

A question earns its place only if the member has to decide it, you could not have looked it up, and
the answer changes what gets built or written. Everything else is noise that costs you trust:

- **Never ask for a definition.** Draft it from what they said and what the code does, and put it in
  the round as a claim to correct: "I'd define a Claim as a fact with a shelf life, not any highlighted
  span. Right?"
- **Never ask "how should X work?"** Name the constraint you found, name the design you'd pick, ask
  them to confirm or overrule it.
- **Never ask what the brain already records.** Restate it as settled. If their answer contradicts a
  page, say which page and reconcile to one truth out loud — don't silently overwrite.
- **Never ask a question with no consequence.** If both answers produce the same code and the same
  page, pick one and move on.
- **Never leave a bad question standing.** "I don't understand" means the question was wrong: make it
  smaller, add a worked example, re-ask in the next round. A fuzzy answer ("maybe", "depends") means
  you name the two branches it splits into and ask which.

Keep descending until each answer names a mechanism. "Branches run in parallel" is a wish, not a
design — the questions worth asking are the ones whose answers an implementer could act on without
coming back. Reach for these the moment an answer stays abstract:

- **The constraint** — what in the code as it stands makes this hard? Does it move, or does the design
  route around it?
- **The unit** — what is the smallest thing that can fail, retry, or resume on its own? If the design
  needs a smaller one than exists today, that is the whole change.
- **The blow-up** — at a thousand times the volume, what breaks first: memory, log size, queue depth, a
  rate limit?
- **The half-state** — one part succeeded, one failed, one still running. What does the member see, and
  what can they do about it?
- **The upgrade** — an existing customer lands in this without asking. If anything behaves differently
  for them, the default is wrong.
- **The reuse** — what already here does most of this job, and why is it not enough?

## 4. Where results land

Two write paths; the repo decides which:

- **This repo has a local `brain/` folder (Brain as Code).** The repo is the source of truth, so
  **write markdown files, not MCP tools.** Everywhere below says `upsert_page` / `upsert_decision` /
  `upsert_skill`; in a `brain/` repo each means "write or edit the file." Pages are `brain/<slug>.md`,
  a Decision is `brain/decisions/<slug>.md` with `status: accepted`, a Skill is
  `.agents/skills/<name>/SKILL.md` with `name:` + `description:`. Identity is the filename, not an id —
  to update a page, edit its file; to graduate a term, add a file and link it by relative path. No
  spaceId. Your changes ride a PR.
- **No local `brain/` folder.** Write over MCP with the `upsert_*` tools, ids, and `parentId` as
  written below. If the `craftspace` MCP tools are unavailable, **stop and say so** — don't scatter
  files around the repo instead, and don't skip overlap detection, which is how a duplicate feature
  gets built.

| What crystallised | Where it goes | Tool |
|---|---|---|
| A hard-to-reverse call with a real trade-off | a **Decision**, nested under its Area page | `upsert_decision` |
| A domain term, a feature's behaviour, key files | that **Area page** (its glossary spine) | `upsert_page` |
| A term that outgrew its line | a **child page** under the Area | `upsert_page` |
| A trap that cost someone hours | a bullet under the `Gotchas` heading of that Area's page | `upsert_page` |
| A reusable procedure | a **Skill** | `upsert_skill` |

Page and glossary shape: [PAGE-FORMAT.md](./PAGE-FORMAT.md). Decision shape and the bar for offering
one: [DECISION-FORMAT.md](./DECISION-FORMAT.md). Create nothing eagerly — a page, a leaf, a Decision
each appear only when there is something real to write on them.

**Write each fact the moment it resolves**, not in a batch at the end, and route it to exactly one
surface. A dated one-off that isn't durable yet is a line in **MEMORY**, not a page of its own.

## 5. Before you stop

- Merge duplicates, cut stale lines, fix pointers whose leaf moved. Check every **Key files** path
  still exists — a dead path never announces itself, it just sends the next agent nowhere.
- Stop when the Area's core terms are pinned and the decisions worth keeping are recorded. A handful of
  terms and one or two Decisions is a good session, not an exhaustive dump.

## Rules

- Record only what the member actually said. Never invent or infer a fact, a term, a why, or a path
  into the brain.
- Keep the member's own words for domain terms. That wording *is* the language the team speaks.
- No em dashes in anything you write into the brain (brand voice).
