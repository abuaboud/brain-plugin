#!/usr/bin/env bash
# SessionStart hook: inject Craftspace's house rules into the session so the agent
# consults the company brain proactively (reads context first, writes learnings back).
#
# ponytail: echoes the bundled HOUSE_RULES.md — the same text the MCP endpoint serves as
# its server `instructions`. A live variant would GET the endpoint for the org's latest
# rules/context, e.g.  curl -fsS https://craftspace.app/mcp/<org-slug>/context  (auth via the
# same OAuth token the MCP connection already holds), but the hook has no way to know which
# org this repo means. Bundled copy keeps it offline-safe and org-agnostic.
set -euo pipefail
cat "${CLAUDE_PLUGIN_ROOT}/HOUSE_RULES.md"
