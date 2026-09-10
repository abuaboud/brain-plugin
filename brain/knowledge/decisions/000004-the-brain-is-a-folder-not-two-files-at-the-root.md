---
status: accepted
---

# The brain is a folder, not two files at the root

## Decision

Durable context lives in `brain/knowledge/` — `index.md`, `context.md`, `memory.md` and one file per
decision under `decisions/` — replacing `CONTEXT.md` and `ADR.md` at the repo root. A shell script
scaffolds the structure; the agent fills it.

## Context

The flat layout put two loose files at the root of every adopting repo and capped decisions at one
append-only file. Meanwhile the repos this plugin is meant for already kept `brain/knowledge/` with numbered
decision files — a layout the plugin did not produce, so adopting it meant reconciling two shapes by hand.

## Why

Matching the layout those repos already run means the plugin scaffolds what teams actually keep, rather than
a third format to migrate off later. One file per decision also removes the merge conflict that an
append-at-the-top single file guarantees when two branches both record a call. The rejected alternative,
`brain/CONTEXT.md` plus `brain/ADR.md`, moved the files without fixing either problem.

## Consequences

Every path in the hooks, the injected rules, the format specs and both skills names `brain/`, so the layout
is now a public contract — changing it again is a breaking change for every adopting repo. The scaffold
script can only produce empty structure, so the value depends entirely on the fill step that follows it;
shipping the script alone would leave exactly the empty template the format spec forbids.
