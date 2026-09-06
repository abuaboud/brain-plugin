# Page Format

## One page per Area

The wiki is flat and one Area owns exactly one page: Title Case, emoji icon, and everything known
about that Area on it. The page is a **glossary spine** — one line per term — and any term that
outgrows a line **graduates** to its own small child page.

```
⚙️ Execution Runtime
   two sentences: what this Area is
   **Worker** — definition. _Avoid_: "pool" (transitional bridge, not the deleted pool-server)
   **Sandbox** — definition → see *sandbox*
   ## Key Files       packages/server/worker, packages/server/sandbox
   📁 Decisions: Worker is the Sandbox · Transitional multi-box concurrency · …
```

A graduated leaf holds one idea and links out instead of restating the why or the how:

```
# Onboarding
How a new customer goes from signed to live: the steps, who owns each, the usual snags.
Why we gate on a kickoff call: decision → *kickoff-gate*
How to run the kickoff: skill → *run-a-kickoff*
```

## Rules

- **Search before you write.** `search_pages` (or grep `brain/`) for the Area, then edit the page that
  exists. Creating a second page for an Area that already has one is the failure this structure exists
  to prevent (`Flows` vs `Flows & Execution` vs `Flows (User Guide)` was the old state).
- **Be opinionated.** One canonical word per concept, every retired alias on an `_Avoid_` line. When
  several words exist for one thing, pick the best and retire the rest by name.
- **Keep definitions tight.** One or two sentences per term, defining what it IS, not what it does.
- **Only terms specific to this company.** General programming and business words don't belong, even
  if the team uses them constantly. Before adding a term, ask whether it is unique to this context.
- **Don't mirror the public docs.** User-facing behaviour lives in the docs site. Link to it; never
  restate it. The brain covers what is *not* public: internal architecture, decisions, gotchas,
  domain language.
- **Group terms under subheadings** only when natural clusters emerge. A flat list is fine.

## Key files

A page backed by code ends in a **Key files** list: where that thing lives, so the next agent reads
instead of grepping. Everything else on the page says what a thing IS and why. This says where.

```
# RBAC
Who may do what inside a project. Roles carry permissions; every request asserts against them.
Entry point: `rbacService.assertPrincipalAccessToProject()`

## Key files
- `packages/server/api/src/app/ee/projects/` — role enforcement
- `packages/web/src/features/members/` — members UI
```

Three rules, and they all exist because pointers rot:

- **Directories, not files, wherever a directory covers it.** A file gets renamed; a module directory
  rarely moves. Name a single file only when it genuinely is one file.
- **Never line numbers.** Any edit above a line invalidates it silently. Paths only.
- **Name the entry-point symbol** when there is one. It survives a file move and is one deterministic
  grep away, which no path can promise.

Only add this when the member actually knows the paths. A guessed path is worse than no path: it reads
as authoritative and sends the next agent to the wrong place.
