# Craftspace agent plugin

Install Craftspace, your team's **company brain**, into the coding agent you already use.

Setup is two steps, and both are quick:

1. **Install the plugin.** It ships the house rules and the shared skills, so your agent knows to read context before acting and write learnings back.
2. **Add a project `.mcp.json` naming your org.** That is what actually connects the brain. See [Pick your org](#pick-your-org-mcporg-slug) below for the URL.

The plugin deliberately ships **no MCP server of its own**. It installs globally, so it cannot know which org a given repo means, and a bundled org-less server would just resolve to whichever org your stored credential got pinned to. The org belongs in the project config, next to the code that means it.

What each manifest carries:

- **[Claude Code](#claude-code)**: `.claude-plugin/` manifest + a **SessionStart hook** that injects the house rules and a **Stop hook** that blocks the first stop of a substantive session that recorded nothing, so write-back actually happens.
- **[Cursor](#cursor)**: `.cursor-plugin/` manifest + an **always-apply rule** carrying the house rules.
- **[Codex](#codex)**: `.codex-plugin/` manifest + the shared skills. Codex honors the MCP server's `instructions`, so the rules arrive from the endpoint once you connect it.

The endpoint is hosted and OAuth-protected (streamable HTTP). There is no token in any config file: the first connection runs the standard MCP OAuth flow (DCR + PKCE) in your browser, and the endpoint resolves your Member from that credential.

### Pick your org: `/mcp/<org-slug>`

Bare `/mcp` reads the org off your credential, which is whichever org was active when you consented. That is fine with one org and wrong the moment you have two: every project shares one stored credential, so every project writes into that same org.

If you're in more than one org, address it in the URL instead. The slug is the one in the app, `/o/<org-slug>`:

```json
{ "mcpServers": { "craftspace-acme": { "type": "http", "url": "https://craftspace.app/mcp/acme" } } }
```

Drop that in a project's `.mcp.json` and each repo talks to its own org, off one login. A different URL gets its own OAuth credential, so you consent once per org. You must be a member of the org you name, or the endpoint 401s.

Name the server after the org too (`craftspace-<org-slug>`, not a bare `craftspace`): a global entry for one org and a project entry for another then never share a name, so adding the second can't silently overwrite the first. Bare `/mcp` is refused outright for accounts in more than one org — it names the org URLs to use instead — so a multi-org login can't quietly write into the wrong brain.

## Brain as Code: where reads and writes go

The plugin behaves differently depending on whether the repo it's in is **Brain as Code** —
connected to a Craftspace space so its context lives as versioned markdown under `brain/`, with
the repo as the source of truth and the hosted brain a read copy synced on push/merge.

The rule the house rules hand the agent is a single check: **does this repo have a local `brain/`
folder?**

- **Yes (Brain as Code).** Read by grepping `brain/` on disk (zero setup, current to the working
  tree). Write by **editing a markdown file** — a Decision in `brain/decisions/<slug>.md`, a Skill in
  `.agents/skills/<name>/SKILL.md`, a Page or MEMORY in `brain/<slug>.md`. The agent never calls the MCP
  `upsert_*` tools here: a file change rides the normal PR and review, which is the quality filter,
  whereas an MCP write would push straight to `main` and skip it. On merge, the Craftspace bot syncs
  the changed files into the hosted brain. No MCP write access is needed in the repo at all.
- **No.** Read and write over MCP against the hosted brain — `search_pages` / `read_page` and the
  `upsert_decision` / `upsert_skill` / `upsert_page` tools, passing the target `spaceId`.

The **MCP write tools still exist on the server** — they're how the web editor and out-of-repo
clients (claude.ai, a teammate not in the repo) write back. The plugin just steers an in-repo agent
to the file path instead, because for a coding agent already in the repo that's the reviewable one.

The on-disk contract the sync reads (so a hand-written file round-trips): fixed subfolders map to
kinds (`decisions` / `skills` / `wiki`), the filename is the entry's identity, and a leading
`--- … ---` frontmatter block carries metadata (`status:` on a Decision, `name:` + `description:` on
a Skill). The **Stop hook counts a `brain/` file write as write-back**, so it doesn't nag a session
that recorded its learning the Brain-as-Code way.

## Layout

```
agent-plugin/
├── HOUSE_RULES.md                 # single source of truth for the proactivity text
│                                  # (mirrors the MCP endpoint's server `instructions`)
├── skills/                        # shared skills, shipped to every client
│   ├── grill-me/SKILL.md
│   └── seed/SKILL.md
├── .claude-plugin/plugin.json     # Claude Code manifest
├── hooks/
│   ├── hooks.json                 # SessionStart + Stop hook wiring
│   ├── session-start.sh           # echoes HOUSE_RULES.md into the session
│   ├── stop.mjs                   # blocks a stop that wrote nothing back (MCP upsert OR a brain/ file); nudges once, fails open
│   └── stop.test.mjs              # self-check for stop.mjs's write-back detection (node hooks/stop.test.mjs)
├── .cursor-plugin/
│   ├── plugin.json                # Cursor manifest
│   └── rules/craftspace.mdc       # always-apply rule (house rules)
├── .codex-plugin/
│   └── plugin.json                # Codex manifest
└── README.md
```

No MCP config file lives in here on purpose. Every client auto-discovers an `.mcp.json`
at the plugin root, so shipping one would hand every repo on the machine the same org.
The MCP server is yours to declare per project.

`grill-me` and `seed` are copies of the endpoint's built-in skills, so the plugin ships them for
discovery — and, in Claude Code, as slash commands (`/seed`) — even before the agent lists skills
over MCP. Keep them in sync with the endpoint's copies in
`packages/server/src/agents/mcp/builtin-skills.ts`, and only ship skills the endpoint still has.
`write-decision-record` used to live here and is gone: the `upsert_decision` tool carries
the record shape now, and the stale copy kept telling agents to call `create_page` and
`edit_page`, which no longer exist.

## Claude Code

Marketplace install (this public repo is the marketplace):

```sh
/plugin marketplace add craftspacehq/craftspace-agent-plugin
/plugin install craftspace
```

On session start the plugin's **SessionStart hook** prints the house rules so the agent
consults the brain proactively, and its **Stop hook** blocks the first stop of a session that
did real work but recorded nothing, telling the agent to `upsert_decision` / `upsert_page` /
`upsert_skill` now or say why not. It nudges once and fails open.

Then connect the brain in the project you want it in. Drop a `.mcp.json` at the repo root
with your org slug (see [Pick your org](#pick-your-org-mcporg-slug)), or run:

```sh
claude mcp add --transport http --scope project craftspace-<org-slug> https://craftspace.app/mcp/<org-slug>
```

`--scope project` writes the server to the repo's `.mcp.json`, so each project stays pinned to the
org its URL names, and the `craftspace-<org-slug>` name keeps a second org's entry from clobbering the
first (drop the flag for a user-config connection instead). Either way the first connection prompts for
OAuth in your browser.

## Cursor

Add the plugin (the always-apply rule + skills) via the plugin marketplace once the repo is
listed. Cursor is not documented to honor an MCP server's `instructions`, so the house rules
ship as an `alwaysApply` rule in `.cursor-plugin/rules/craftspace.mdc`.

Then connect the brain per project: paste into `.cursor/mcp.json` in the repo, swapping in
your slug (see [Pick your org](#pick-your-org-mcporg-slug)):

```json
{ "mcpServers": { "craftspace-acme": { "url": "https://craftspace.app/mcp/acme" } } }
```

**One-click deeplink**, if you'd rather not hand-edit. This one is built for the `acme` org,
so rebuild the payload with your own slug before using it:

```
cursor://anysphere.cursor-deeplink/mcp/install?name=craftspace&config=eyJ1cmwiOiJodHRwczovL2NyYWZ0c3BhY2UuYXBwL21jcC9hY21lIn0=
```

The `config` payload is base64 of `{"url":"https://craftspace.app/mcp/acme"}`. Generate yours:

```sh
printf '%s' '{"url":"https://craftspace.app/mcp/<org-slug>"}' | base64
```

Heads up: the deeplink adds the server **globally** (`~/.cursor/mcp.json`), which puts you
back on one org for every project. Prefer the per-project `.cursor/mcp.json` above if you're
in more than one org.

## Codex

Marketplace install:

```sh
codex plugin marketplace add craftspacehq/craftspace-agent-plugin
codex plugin install craftspace
```

Codex explicitly honors the MCP server's `instructions` field, and our endpoint front-loads
the core rule (read context first) into the **first 512 characters** of those instructions,
so no separate rules file is needed on the Codex side. That only kicks in once the server is
connected.

Connect it in `~/.codex/config.toml`, naming your org (see [Pick your org](#pick-your-org-mcporg-slug)):

```toml
[mcp_servers.craftspace-<org-slug>]
url = "https://craftspace.app/mcp/<org-slug>"
```

Codex resolves MCP servers from your user config rather than per repo, so this is a
**single-org** setup. If you work across two orgs in Codex, give each its own entry
(`craftspace-acme`, `craftspace-globex`) pointing at its own slug, and let the server name
tell them apart.

## This is a public repo

Cursor's plugin marketplace requires the plugin repo be **open source**, so this bundle is
meant to live in its own public repo (`craftspacehq/craftspace-agent-plugin`), split from the
product. It contains no secrets, just config, markdown, and one shell hook. The MCP endpoint
holds the auth and the org's real context.

## Follow-up: agent-setup screen wiring (deferred)

The in-product **agent-setup screen** (issue #380) should surface all three install paths:
the Claude Code / Codex marketplace commands, the Cursor deeplink button (the URL above), and
the plain `claude mcp add` / `config.toml` / `mcp.json` fallbacks. That wiring lives in the
product repo (`packages/web`) and is **not** done here. This bundle only produces the install
targets. Link them from `AgentSetupRoute.tsx` when #380 is picked up.
