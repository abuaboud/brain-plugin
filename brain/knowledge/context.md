# Context

A Claude Code / Codex plugin that makes an agent read a repo's `brain/` folder before it answers, and write
back to it when a decision or a durable fact lands. Local files only — no server, no account, no network.

## Vocabulary

**Brain** — the `brain/` folder at a repo's root. The whole footprint of this plugin in an adopting repo.
**Opt-in signal** — what tells the hooks a repo wants the plugin. There are exactly two: `brain/` exists, or
the repo's own `.claude/settings.json` enables `brain@brain`. A repo with neither hears nothing.
**Scaffold** — the empty structure `scripts/brain-init.sh` writes. Structure only; the agent fills it after.
**Fill** — the agent step that reads the repo and writes real content into the scaffold. Without it the
scaffold is the empty template the format specs forbid.
**Nudge** — the Stop hook's one-shot reminder, fired only when a session changed code and wrote nothing to
`brain/`.

## Key files

- `hooks/project.mjs` — both opt-in signals. Entry points: `hasBrain()`, `repoOptedIn()`
- `hooks/session-start.mjs` — injects `RULES.md`, or the bootstrap offer, or nothing
- `hooks/stop.mjs` — the nudge. The whole block-or-allow call is `decide()`
- `scripts/brain-init.sh` — the scaffold. Idempotent; exits 0 if `brain/` exists
- `scripts/sync-cursor-rule.mjs` — generates `.cursor/rules/brain.mdc` from `RULES.md`
- `formats/` — the two format specs, read on demand by both skills
- `skills/init/`, `skills/grill-me/` — `/brain:init` and `/brain:grill-me`

## Gotchas

- **`RULES.md` is the only copy of the rules.** The Cursor rule is generated from it and `npm test` fails if
  it is stale — run `npm run build` after editing. An earlier version kept four hand-maintained copies and
  they drifted into naming a tool that did not exist.
- **Hooks must read the root from their stdin payload, not `process.cwd()`.** A hook is not reliably spawned
  in the project directory; `session-start.mjs` silently read the wrong repo until it parsed stdin the way
  `stop.mjs` already did.
- **A repo that gitignores `CONTEXT.md` silently swallows `brain/knowledge/context.md`.** An unanchored
  `CONTEXT.md` line matches at any depth, and on a case-insensitive filesystem it matches the lowercase
  path too — `git add -A` then reports nothing and adds nothing, with no warning. Check `git check-ignore`
  when a scaffolded page will not stage, and negate it rather than renaming the page.
- **Both hooks fail open.** Any parse or read error allows the session to continue. A bug here must never be
  able to trap someone mid-session.
