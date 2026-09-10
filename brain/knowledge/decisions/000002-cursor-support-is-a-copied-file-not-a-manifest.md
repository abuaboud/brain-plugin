---
status: accepted
---

# Cursor support is a copied file, not a manifest

## Decision

Ship the Cursor rule as a generated `.cursor/rules/brain.mdc` that users copy or import into their own repo,
and say in the README that there is nothing to install for Cursor.

## Context

The plugin previously carried a `.cursor-plugin/plugin.json` declaring a `rules` array. That format does not
exist. Cursor scans exactly one location — `.cursor/rules/*.mdc` inside the repo being worked on — and has no
manifest that lets a distributed package supply a rule from anywhere else. Nothing was loading the file.

## Why

Emitting to the one path Cursor actually reads makes the same artifact serve three jobs at once: this repo
applies the rule to itself, a user can `curl` it into their repo, and Cursor's GitHub rule-import pulls from
it unchanged. The rejected alternative was keeping a manifest and hoping Cursor grows support for it — a
support claim that does not hold is worse than no claim, because nobody debugs a rule they believe is loaded.

## Consequences

Cursor users get a committed file in their own repo rather than something that updates when the plugin does;
that is the trade, and it is the same trade `brain/` already makes. If Cursor ever ships a real plugin
surface, this is the entry to supersede.
