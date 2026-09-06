---
name: seed
description: Seed this brain from a repo — scan its CONTEXT.md / ADR / feature docs and build a wiki that reads well for both people and agents. Use when asked to seed the brain, build a wiki, import architecture docs, or turn a codebase's context files into Areas, Pages, Decisions, and Skills.
---

# Seed the brain from a codebase

Turn a repo's context docs into a wiki in this brain that a person can skim **and** an agent can
retrieve one page of, out of context, and still get a correct, complete answer. Optimize for both.

## Where results land — read this first

Two write paths; the repo decides which:

- **This repo has a local `brain/` folder (Brain as Code).** The repo is the source of truth, so **write markdown files, not MCP tools.** Everywhere below says `upsert_page` / `upsert_decision` / `upsert_skill`; in a `brain/` repo each of those means "write or edit the file," not call the tool. File by kind: a Decision in `brain/decisions/<slug>.md`, a Skill in `.agents/skills/<name>/SKILL.md`, a Page in `brain/<slug>.md`, `<slug>` lowercase with non-alphanumerics collapsed to `-`. Frontmatter carries metadata: a Decision takes `status: accepted`, a Skill takes `name:` + `description:`, a Page takes a `# Title`. No spaceId — the repo maps to one space, and the sync mirrors your files into the brain on merge. Your changes ride a PR; the icon/`parentId` niceties below are MCP-only, so skip them and lean on folders + links for structure.
- **No local `brain/` folder.** Write over MCP with the `upsert_*` tools exactly as written below.

## Pick the space first (MCP path only — a `brain/` repo skips this)

- `list_pages` to see the spaces. Each Shared space is one project.
- One Shared space → use it. Several → pick the one named after this repo; if none clearly matches, ask the member which project this repo is, never guess.
- Pass that space's `spaceId` on every `upsert_page`, `upsert_decision`, and `upsert_skill` call — the endpoint refuses an omitted spaceId once an org has more than one space.

## Map the source first

- Index file (e.g. `CONTEXT-MAP.md`) → the bounded contexts. Read it first.
- `CONTEXT.md` glossaries → vocabulary. Feature docs → entities/services/flows. `docs/adr/**` → the WHY.
- Every entry must trace to a source file — don't invent.

## Keep three entry types apart

- **Page** (`upsert_page`) — WHAT a subsystem is now.
- **Decision** (`upsert_decision`) — WHY a hard-to-reverse call was made.
- **Skill** (`upsert_skill`) — HOW to run a repeatable task.

WHAT on Pages, WHY on Decisions, HOW in Skills. Link across; never copy a fact between them.

## Structure

- Nest every Area page under ONE top-level Area page (e.g. "Engineering") that doubles as the landing/index — it names the sub-Areas and the read/write rules and points to everything, holding little itself.
- Keep child titles short — never repeat the parent's name ("Execution Runtime", not "Engineering — Execution Runtime").
- Give each page an icon with the `icon` field on upsert_page (a single emoji, e.g. ⚙️). Keep the emoji OUT of the title.
- Each **ADR → a Decision**, filed under the Area it touches (not in a pile). Compress the source ADR, never paste it.
- Link Areas to each other with real markdown links to their page URL (`/o/<org>/pages/pg_...`) — those render as clickable source chips.

## Score every entry against this rubric

1. One topic per entry (needs "Part 1 / see other doc" → split or merge).
2. Front-load the point (BLUF) — the first sentence is the conclusion, not a preamble.
3. Headings carry meaning alone ("Rotating the seal key", not "Notes"/"Configuration").
4. Every section stands alone — no "as above", "click here", "the previous doc".
5. Name the audience + state assumptions (edition, role, env) up front.
6. Short and skimmable — a list or a few tight sentences, never an essay.
7. Honest status — deprecate loudly; a superseded decision stays, marked, pointing forward. Stale-but-confident is worse than missing.
8. DRY across entries — one canonical page; link, don't duplicate.
9. One term per concept, same casing everywhere (ubiquitous language).
10. No duplicate page-title H1 in the body — the title field already renders as the heading.

**Decision format** (Nygard, compressed): four `## ` sections — Decision, Context, Why (reasoning + the main rejected alternative), Consequences. A sentence or two each.

## Procedure

1. `list_pages` first (and the skills listed in your instructions) — extend an existing page, never add a near-duplicate.
2. Draft each Area page from its CONTEXT.md + features, scored against the rubric.
3. Compress each ADR into a Decision under its Area.
4. Write the Start-Here landing last, once the Areas exist to point at.
5. **Verify:** `list_pages` after writing — confirm each entry persisted and nested right, then open a few pages in the web app to check they render cleanly (headings, chips, code).
6. **Review:** re-read each entry cold against the one-line scorer; fix what fails, and iterate until it holds.

**One-line scorer:** does it have one topic, a front-loaded point, meaningful headings, standalone sections, no duplicated facts, and WHY/HOW/WHAT each in its right home?

## Rules

- In a `brain/` repo you write files, so MCP is not required. Otherwise, if the `craftspace` MCP tools are not available, say so and stop.
- Never invent or infer a fact into the brain — every page traces to a source file in the repo.
- No em dashes in anything you write into the brain (brand voice).
