# Craftspace plugin

Two files at the root of your repo, read before your agent answers and updated when something lands.

- **`CONTEXT.md`** — what things ARE. The project's own vocabulary, where things live, the traps.
- **`ADR.md`** — WHY the hard-to-reverse calls were made. Newest first.

Plain markdown, committed to your repo, reviewed in your normal pull request. **No server, no account, no
network, no MCP.** Uninstall the plugin and both files are still sitting there, still useful.

```sh
/plugin marketplace add abuaboud/craftspace-plugin
/plugin install craftspace@craftspace
/craftspace:init
```

`/craftspace:init` reads the repo and writes both files from what it actually finds — the recurring
vocabulary, the entry points, the decisions the history gives evidence for. It refuses to invent, and it
leaves `ADR.md` nearly empty rather than filling it with guesses.

## Why files, and why only two

The problem is not that teams have no documentation. It is that the documentation nobody reads and nobody
updates is worse than none, because it is confidently wrong. Two files at a fixed path fix both halves: an
agent finds them without being told where to look, and a file that rides a pull request gets reviewed like
code.

The split is the useful part. `CONTEXT.md` is the present tense and gets edited freely. `ADR.md` is the past
tense and is append-only — you supersede an entry, you never rewrite it, because the record of what was
believed at the time is the whole point.

## What the plugin adds

| | |
| --- | --- |
| **SessionStart hook** | Injects the read-first / update-on-resolve rules and the bar for what earns an entry. |
| **Stop hook** | Nudges once when a session changed the codebase and left both files untouched. |
| **`/craftspace:init`** | Creates both files, filled in from the repo. |
| **`/grill-me` skill** | Interviews you in batched rounds about a plan or a thin area, and records what lands. |
| **`formats/`** | The two format specs, read on demand by everything above. |

### Both hooks stay silent unless the repo opted in

The plugin installs globally, so it is in every repo on your machine. In a repo with neither `CONTEXT.md`
nor `ADR.md` it prints nothing, injects nothing, and blocks nothing — it exits 0 and gets out of the way.
Creating either file is what turns it on.

The Stop hook nudges only when the session **mutated a file** and touched neither context file. A read-only
session — however many greps it ran — is never a reason to write something down. It nudges once per session
(`stop_hook_active` is the escape hatch) and fails open on any error, so it can never trap you.

## Not everything is worth writing down

Most sessions should record nothing, and the instructions say so out loud. An entry costs every future
reader, so the bar is that it will still be true and still useful next month.

An ADR needs all three: **hard to reverse**, **surprising without the context**, and the result of a **real
trade-off**. Miss one and it does not go in — you will just reverse an easy call, nobody wonders about an
unsurprising one, and there is nothing to record when there was no alternative.

## No personal or secret data

Both files are committed and permanent in the history, so the instructions forbid writing:

- **people** — names, emails, usernames, handles, phone numbers. Write the role: "the on-call engineer".
- **customer or account identifiers** — org names, account ids, subdomains, ticket URLs carrying them.
- **credentials** — tokens, keys, passwords, connection strings, internal hostnames.
- **machine-local paths** — anything under a home directory. Repo-relative only.

If a fact cannot be written without one of these, it does not go in the file.

The hooks themselves collect nothing. The Stop hook reads the transcript only to collect tool *names* and
test one filename pattern; no transcript content is stored, logged, or emitted, and the nudge is fixed text
that is identical whatever the session did. There is no network call anywhere in this plugin.

## Layout

```
craftspace-plugin/
├── RULES.md                        the rules, injected by SessionStart. The only copy.
├── formats/
│   ├── CONTEXT.md                  format spec for the vocabulary file
│   └── ADR.md                      format spec for the decision record
├── commands/init.md                /craftspace:init
├── skills/grill-me/SKILL.md        /grill-me
├── hooks/
│   ├── hooks.json                  SessionStart (startup|clear) + Stop
│   ├── project.mjs                 the opted-in check both hooks route through
│   ├── session-start.mjs           injects RULES.md, or exits silently
│   ├── stop.mjs                    nudges once, or exits silently
│   └── stop.test.mjs               the block-or-allow table
├── scripts/sync-cursor-rule.mjs    generates the Cursor rule from RULES.md
├── .claude-plugin/                 Claude Code manifest + marketplace
├── .cursor-plugin/                 Cursor manifest + generated always-apply rule
└── .codex-plugin/                  Codex manifest (skill + formats; hooks are Claude Code only)
```

`RULES.md` is the single source. The Cursor rule is **generated** from it and `npm test` fails if it is
stale — an earlier version of this plugin kept four hand-maintained copies of the same paragraphs, and they
drifted into naming a tool that did not exist and three different paths for the same file.

## Other agents

`CONTEXT.md` and `ADR.md` are just files at a fixed, obvious path, so any agent that greps the repo finds
them with no setup. Cursor gets the rules as an always-apply rule. The hooks — the part that makes
read-first and update-on-resolve *reliable* rather than advisory — are Claude Code only.

## Develop

```sh
npm test     # the Stop hook's decision table, and the Cursor rule freshness check
npm run build   # regenerate the Cursor rule after editing RULES.md
```

No dependencies, no build step beyond that one generator.

## License

MIT, see [LICENSE](LICENSE).
