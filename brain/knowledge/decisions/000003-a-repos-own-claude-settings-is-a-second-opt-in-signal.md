---
status: accepted
---

# A repo's own `.claude/settings.json` is a second opt-in signal

## Decision

The hooks treat a committed `.claude/settings.json` that enables `brain@brain` as the repo opting in, and
on such a repo with no `brain/` folder yet SessionStart offers once to scaffold it. Folder presence remains
the first signal; those two are the only ones.

## Context

Folder presence alone was the whole switch, so a fresh install was indistinguishable from no install: both
hooks print nothing, and the first thing a new user reports is that the plugin does not work.

## Why

The obvious fix — speak in any repo lacking the folder — was rejected: it would cost every unrelated repo on
the machine tokens and instructions, which is the property that makes user-scope install safe. A repo that
committed the setting has already asked, in a reviewed file, so it is the one place the plugin can speak
without being asked twice. `init` moved from a command to a skill in the same change, so plain English
reaches it and no one has to know a command name.

## Consequences

A team repo now needs no command at all. The solo user still makes one gesture, which is the deliberate
floor. Both hooks must keep failing closed on a malformed or absent settings file — silence, never a crash.
