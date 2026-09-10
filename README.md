# Brain plugin

A `brain/` folder at the root of your repo, read before your agent answers and updated when something lands.

```
brain/knowledge/
├── context.md        what things ARE: vocabulary, where they live, the traps
└── ADR.md            WHY the hard-to-reverse calls were made, newest first
```

Plain markdown, committed to your repo, reviewed in your normal pull request. **No server, no account, no
network, no MCP.** Uninstall the plugin and the folder is still sitting there, still useful.

```sh
/plugin marketplace add abuaboud/brain-plugin
/plugin install brain@brain
/brain:init
```

**The folder is the switch.** Both hooks look for `brain/` at the repo root; until it exists the plugin
prints nothing, injects nothing and blocks nothing. That is deliberate — the plugin installs once per
machine and has to stay out of the way in every repo that never asked for it — but it does mean a fresh
install looks like nothing happened, because nothing has.

`/brain:init` is what gets you past that. It runs in two steps:

1. **`scripts/brain-init.sh` scaffolds the structure** — deterministic, idempotent, and it exits without
   touching anything if `brain/` already exists.
2. **The agent fills it from the repo** — the recurring vocabulary, the entry points, the decisions the
   history gives evidence for. It refuses to invent, and leaves `ADR.md` nearly empty rather than filling
   it with guesses.

Step 2 is the one that matters. An empty template is worse than nothing: it looks maintained and says
nothing, which is why the script stops at structure and hands over.

`init` is a skill rather than a fixed command, so "set up the brain in this repo" reaches it just as well as
typing the slash. And if you would rather not install anything at all, [`SEED.md`](SEED.md) is the same
procedure as one self-contained prompt you can paste into any agent.

## Install it in any repo

The plugin installs **once per machine**, at user scope, and is then present in every repo you open. Turning
it on in a particular repo means giving it something to read, which `init` does for you:

```sh
# once per machine
/plugin marketplace add abuaboud/brain-plugin
/plugin install brain@brain

# once per repo, from that repo's root
/brain:init
```

That is the whole install. There is no account, no API key, no server, and nothing to configure — the plugin
never makes a network call. `init` writes `brain/` at the repo root and adds nothing else: no config file,
no dot-directory, no `.gitignore` entry. **The folder is the entire footprint.** Both hooks look for it
there and stay completely silent in a repo that has none, so having the plugin on your machine costs your
other repos zero tokens and zero instructions.

It works in any repo regardless of language or stack, because it reads and writes markdown and nothing else.
On an existing repo `init` will not overwrite a `brain/` you already have, and if it finds a real `adr/` or
`docs/adr/` tree it stops and tells you rather than starting a second one.

To turn it off for one repo, delete the folder. To remove it everywhere, `/plugin uninstall brain@brain` —
the markdown stays behind and keeps working for whoever reads it.

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

A repo that enables the plugin this way needs **no command at all**. The SessionStart hook reads the same
`.claude/settings.json`, treats it as the repo opting in, and — on a repo with no `brain/` yet — offers once
to scaffold and fill it. A teammate who clones runs nothing and is asked nothing twice.

This is the shape to use for a team repo: `.claude/settings.json` is reviewed in a pull request like any
other file, so adopting the plugin is a visible decision rather than an instruction in an onboarding doc that
half the team never reads. Keep personal, machine-specific overrides in `.claude/settings.local.json`, which
is git-ignored.

### Cursor and Codex

**Codex** installs the plugin the same way, from `.codex-plugin/plugin.json` — you get the `init` and
`grill-me` skills and the format specs. The hooks are not part of it: hook config is Claude Code's, so on
Codex the read-first and update-on-resolve rules are advisory rather than enforced.

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

Any other agent finds `brain/` by grepping the repo root, which is the whole reason it lives at a fixed path
instead of somewhere a tool has to be told about.

## Why a folder, and why this shape

The problem is not that teams have no documentation. It is that the documentation nobody reads and nobody
updates is worse than none, because it is confidently wrong. A folder at a fixed path fixes both halves: an
agent finds it without being told where to look, and files that ride a pull request get reviewed like code.

The split inside it is the useful part. `context.md` is the present tense and gets edited freely. `ADR.md`
is the past tense and is append-only — you supersede an entry, you never rewrite it, because the record of
what was believed at the time is the whole point.

## What the plugin adds

| | |
| --- | --- |
| **SessionStart hook** | Injects the read-first / update-on-resolve rules and the bar for what earns an entry. |
| **Stop hook** | Nudges once when a session changed the codebase and wrote nothing to `brain/`. |
| **`/brain:init` skill** | Scaffolds the folder, then fills it from the repo. Triggers on plain English too. |
| **`/brain:grill-me` skill** | Interviews you in batched rounds about a plan or a thin area, and records what lands. |
| **`scripts/brain-init.sh`** | The scaffold on its own, if you want it without an agent. |
| **`formats/`** | The two format specs, read on demand by everything above. |
| **`SEED.md`** | The same `init` procedure as one paste-anywhere prompt, for agents with no plugin support. |

### Both hooks stay silent unless the repo opted in

The plugin installs globally, so it is in every repo on your machine. In a repo with no `brain/` folder it
prints nothing, injects nothing, and blocks nothing — it exits 0 and gets out of the way.

Two things turn it on, and nothing else does:

1. **`brain/` exists at the repo root.** The hooks read it and inject the rules.
2. **The repo's own `.claude/settings.json` enables `brain@brain`.** Nothing scaffolded yet, so there is
   nothing to read — the hook offers once to create it and then drops it.

A repo that did neither is a repo that never asked, and it hears nothing.

The Stop hook nudges only when the session **mutated a file** and wrote nothing under `brain/`. A read-only
session — however many greps it ran — is never a reason to write something down. It nudges once per session
(`stop_hook_active` is the escape hatch) and fails open on any error, so it can never trap you.

## Not everything is worth writing down

Most sessions should record nothing, and the instructions say so out loud. An entry costs every future
reader, so the bar is that it will still be true and still useful next month.

A decision needs all three: **hard to reverse**, **surprising without the context**, and the result of a
**real trade-off**. Miss one and it does not go in — you will just reverse an easy call, nobody wonders about
an unsurprising one, and there is nothing to record when there was no alternative.

## No personal or secret data

Everything in `brain/` is committed and permanent in the history, so the instructions forbid writing:

- **people** — names, emails, usernames, handles, phone numbers. Write the role: "the on-call engineer".
- **customer or account identifiers** — org names, account ids, subdomains, ticket URLs carrying them.
- **credentials** — tokens, keys, passwords, connection strings, internal hostnames.
- **machine-local paths** — anything under a home directory. Repo-relative only.

If a fact cannot be written without one of these, it does not go in the file.

The hooks themselves collect nothing. The Stop hook reads the transcript only to collect tool *names* and
test one path pattern; no transcript content is stored, logged, or emitted, and the nudge is fixed text that
is identical whatever the session did. There is no network call anywhere in this plugin.

## Layout

```
brain-plugin/
├── RULES.md                        the rules, injected by SessionStart. The only copy.
├── SEED.md                         init as a paste-anywhere prompt, for agents with no plugins
├── brain/                          this plugin's own brain, in the format it ships
├── formats/
│   ├── CONTEXT.md                  format spec for the context page
│   └── ADR.md                      format spec for the decision record
├── skills/init/SKILL.md            /brain:init, and plain English
├── skills/grill-me/SKILL.md        /brain:grill-me
├── hooks/
│   ├── hooks.json                  SessionStart + Stop
│   ├── project.mjs                 the two opt-in signals both hooks route through
│   ├── session-start.mjs           injects RULES.md, or exits silently
│   ├── stop.mjs                    nudges once, or exits silently
│   ├── project.test.mjs            the two opt-in signals
│   └── stop.test.mjs               the block-or-allow table
├── scripts/
│   ├── brain-init.sh               the scaffold
│   └── sync-cursor-rule.mjs        generates the Cursor rule from RULES.md
├── .claude-plugin/                 Claude Code manifest + marketplace
├── .cursor/rules/brain.mdc         generated. Copy it into your own repo; Cursor loads no other path
└── .codex-plugin/                  Codex manifest (skills + formats; hooks are Claude Code only)
```

`RULES.md` is the single source. The Cursor rule is **generated** from it and `npm test` fails if it is
stale — an earlier version of this plugin kept four hand-maintained copies of the same paragraphs, and they
drifted into naming a tool that did not exist and three different paths for the same file.

## Develop

```sh
npm test        # the opt-in signals, the Stop hook's decision table, and the Cursor rule freshness check
npm run build   # regenerate the Cursor rule after editing RULES.md
```

No dependencies, no build step beyond that one generator.

## License

MIT, see [LICENSE](LICENSE).
