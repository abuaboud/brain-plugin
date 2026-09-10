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

mkdir -p "$brain/knowledge"

cat > "$brain/knowledge/context.md" <<'EOF'
# Context

<!-- One or two sentences: what this project is, for whom. -->

## Vocabulary

<!-- Only terms this project uses in its own particular way. **Term** -- what it IS, in a sentence. -->

## Key files

<!-- Directories over files. Name the entry-point symbol. Never line numbers, never a guessed path. -->

## Gotchas

<!-- A trap that cost real time and will again. Delete this heading if you have none. -->
EOF

cat > "$brain/knowledge/ADR.md" <<'EOF'
# Decisions

Newest first. Number sequentially; numbers are never reused.

An entry needs all three -- **hard to reverse**, **surprising without the context**, and the result of a
**real trade-off**. Miss one and it does not go in.
EOF

echo "Created brain/ at $brain"
echo
find "$brain" -type f | sed "s|$root/||" | sort | sed 's/^/  /'
echo
echo "Next: ask your agent to fill it from this repo -- \"/brain:init\" or \"fill the brain from this repo\"."
