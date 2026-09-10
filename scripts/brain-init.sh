#!/bin/sh
# Scaffold brain/ at the repo root. Structure only -- the agent fills the content afterwards,
# because a template nobody filled in is worse than no file at all.
set -eu

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
brain="$root/brain"

if [ -e "$brain" ]; then
  echo "brain/ already exists at $brain -- leaving it alone."
  exit 0
fi

mkdir -p "$brain/knowledge/decisions"

cat > "$brain/knowledge/index.md" <<'EOF'
---
icon: 🧠
---

# Brain

Durable context for this repo. Every folder here is a page, and every page here is a file in the repo, so
the team reads the same thing whether they open GitHub or the app.

This page is a **spine**: one line per Area, pointing at the page that holds it. Hard-to-reverse calls live
in `decisions/`, never here.

## Areas

- **context** — the project's own vocabulary, where things live, and the traps
- **decisions** — every hard-to-reverse call, newest number highest
EOF

cat > "$brain/knowledge/context.md" <<'EOF'
# Context

<!-- One or two sentences: what this project is, for whom. -->

## Vocabulary

<!-- Only terms this project uses in its own particular way. **Term** — what it IS, in a sentence. -->

## Key files

<!-- Directories over files. Name the entry-point symbol. Never line numbers, never a guessed path. -->

## Gotchas

<!-- A trap that cost real time and will again. Delete this heading if you have none. -->
EOF

cat > "$brain/knowledge/memory.md" <<'EOF'
# Memory

Dated one-liners that have not earned their own page yet. Newest first.
EOF

cat > "$brain/knowledge/decisions/index.md" <<'EOF'
# Decisions

One file per decision: `NNNNNN-kebab-title.md`, numbered sequentially, numbers never reused.

An entry needs all three — **hard to reverse**, **surprising without the context**, and the result of a
**real trade-off**. Miss one and it does not go in.
EOF

echo "Created brain/ at $brain"
echo
find "$brain" -type f | sed "s|$root/||" | sort | sed 's/^/  /'
echo
echo "Next: ask your agent to fill it from this repo -- \"/brain:init\" or \"fill the brain from this repo\"."
