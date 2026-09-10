# Brain plugin

Two files at the root of your repo, read before your agent answers and updated when something lands.

- **`CONTEXT.md`** — what things ARE. The project's own vocabulary, where things live, the traps.
- **`ADR.md`** — WHY the hard-to-reverse calls were made. Newest first.

Plain markdown, committed to your repo, reviewed in your normal pull request. **No server, no account, no
network, no MCP.** Uninstall the plugin and both files are still sitting there, still useful.

```sh
/plugin marketplace add abuaboud/brain-plugin
/plugin install brain@brain
/brain:init
```

`/brain:init` reads the repo and writes both files from what it actually finds — the recurring
vocabulary, the entry points, the decisions the history gives evidence for. It refuses to invent, and it
leaves `ADR.md` nearly empty rather than filling it with guesses.

## Install it in any repo

The plugin installs **once per machine**, at user scope, and is then present in every repo you open. Turning
it on in a particular repo is one more command, run from inside that repo:

```sh
# once per machine
/plugin marketplace add abuaboud/brain-plugin
/plugin install brain@brain

# once per repo, from that repo's root
/brain:init
```

That is the whole install. There is no account, no API key, no server, and nothing to configure — the plugin
never makes a network call. `init` writes `CONTEXT.md` and `ADR.md` at the repo root and adds nothing else:
no config file, no dot-directory, no `.gitignore` entry. **The two files are the install.** Both hooks look
for them at the root and stay completely silent in a repo that has neither, so having the plugin on your
machine costs your other repos zero tokens and zero instructions.

It works in any repo regardless of language or stack, because it reads and writes markdown and nothing else.
On an existing repo `init` will not overwrite a `CONTEXT.md` or `ADR.md` you already have, and if it finds a
real `adr/` or `docs/adr/` tree it stops and tells you rather than starting a second one at the root.

To turn it off for one repo, delete the two files. To remove it everywhere, `/plugin uninstall brain@brain`
— the files stay behind as plain markdown and keep working for whoever reads them.

### Installing it *for* a repo, so every clone gets it

The commands above install for you, on this machine. To make the plugin part of the repo itself — so a
teammate who clones it is offered the plugin on their first session instead of being told to go install
something — commit a `.claude/settings.json` naming the marketplace and the plugin:

```json
{
  "extraKnownMarketplaces": {
    "brain": {
      "source": { "source": "github", "repo": "abuaboud/brain-plugin" }
    }
  },
  "enabledPlugins": {
    "brain@brain": true
  }
}
```

`enabledPlugins` is keyed `<plugin>@<marketplace>`, both of which are `brain` here. Claude Code fetches the
marketplace on session start and prompts to trust it once per user — a repo cannot silently install code on
someone's machine, which is the correct trade and worth knowing before you commit the file.

This is the shape to use for a team repo: `.claude/settings.json` is reviewed in a pull request like any
other file, so adopting the plugin is a visible decision rather than an instruction in an onboarding doc that
half the team never reads. Keep personal, machine-specific overrides in `.claude/settings.local.json`, which
is git-ignored.

### Cursor and Codex

**Codex** installs the plugin the same way, from `.codex-plugin/plugin.json` — you get the `grill-me` skill
and the format specs. The hooks are not part of it: hook config is Claude Code's, so on Codex the read-first
and update-on-resolve rules are advisory rather than enforced.

**Cursor has no plugin manifest that can ship a rule**, so there is nothing to install. It reads exactly one
location — `.cursor/rules/*.mdc` inside the repo you are working on — which means the rule has to land in
your repo. Two ways:

```sh
# copy it in
curl -o .cursor/rules/brain.mdc \
  https://raw.githubusercontent.com/abuaboud/brain-plugin/main/.cursor/rules/brain.mdc
```

or use Cursor's **import rules from a GitHub repository** in Settings, point it at `abuaboud/brain-plugin`,
and it pulls the same file into `.cursor/rules/imported/`. Either way it is a committed file in your repo,
which is the right place for it — your teammates get it on clone.

Any other agent finds `CONTEXT.md` and `ADR.md` by grepping the repo root, which is the whole reason they
live at a fixed path instead of somewhere a tool has to be told about.

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
| **`/brain:init`** | Creates both files, filled in from the repo. |
| **`/brain:grill-me` skill** | Interviews you in batched rounds about a plan or a thin area, and records what lands. |
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
brain-plugin/
├── RULES.md                        the rules, injected by SessionStart. The only copy.
├── formats/
│   ├── CONTEXT.md                  format spec for the vocabulary file
│   └── ADR.md                      format spec for the decision record
├── commands/init.md                /brain:init
├── skills/grill-me/SKILL.md        /brain:grill-me
├── hooks/
│   ├── hooks.json                  SessionStart + Stop
│   ├── project.mjs                 the opted-in check both hooks route through
│   ├── session-start.mjs           injects RULES.md, or exits silently
│   ├── stop.mjs                    nudges once, or exits silently
│   └── stop.test.mjs               the block-or-allow table
├── scripts/sync-cursor-rule.mjs    generates the Cursor rule from RULES.md
├── .claude-plugin/                 Claude Code manifest + marketplace
├── .cursor/rules/brain.mdc         generated. Copy it into your own repo; Cursor loads no other path
└── .codex-plugin/                  Codex manifest (skill + formats; hooks are Claude Code only)
```

`RULES.md` is the single source. The Cursor rule is **generated** from it and `npm test` fails if it is
stale — an earlier version of this plugin kept four hand-maintained copies of the same paragraphs, and they
drifted into naming a tool that did not exist and three different paths for the same file.

## Develop

```sh
npm test     # the Stop hook's decision table, and the Cursor rule freshness check
npm run build   # regenerate the Cursor rule after editing RULES.md
```

No dependencies, no build step beyond that one generator.

## License

MIT, see [LICENSE](LICENSE).
