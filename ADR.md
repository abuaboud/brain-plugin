# Decisions

Newest first. See `formats/ADR.md` for the shape and the bar.

## 0002 · Cursor support is a copied file, not a manifest
`accepted` · 2026-09-10

### Decision
Ship the Cursor rule as a generated `.cursor/rules/brain.mdc` that users copy or import into their own repo,
and say in the README that there is nothing to install for Cursor.

### Context
The plugin previously carried a `.cursor-plugin/plugin.json` declaring a `rules` array. That format does not
exist. Cursor scans exactly one location — `.cursor/rules/*.mdc` inside the repo being worked on — and has no
manifest that lets a distributed package supply a rule from anywhere else. Nothing was loading the file.

### Why
Emitting to the one path Cursor actually reads makes the same artifact serve three jobs at once: this repo
applies the rule to itself, a user can `curl` it into their repo, and Cursor's GitHub rule-import pulls from
it unchanged. The rejected alternative was keeping a manifest and hoping Cursor grows support for it — a
support claim that does not hold is worse than no claim, because nobody debugs a rule they believe is loaded.

### Consequences
Cursor users get a committed file in their own repo rather than something that updates when the plugin does;
that is the trade, and it is the same trade `CONTEXT.md` and `ADR.md` already make. If Cursor ever ships a
real plugin surface, this is the entry to supersede.

## 0001 · The plugin is named for what it does, not for a product
`accepted` · 2026-09-10

### Decision
Name the plugin `brain`, with no reference to any product or vendor in the manifests, the commands, the
repo slug, or the example vocabulary in the format specs.

### Context
It was built inside a product and carried that product's name through five manifests, both command
namespaces, the homepage and author fields, and — less visibly — the worked examples in `formats/` and the
`grill-me` skill, which teach the format by demonstrating it in another product's vocabulary.

### Why
The plugin never depended on a control plane: no network call, no MCP tool, no auth anywhere in the runtime.
The only thing suggesting otherwise was the naming, which made a self-contained tool look like a client for
a service. The rejected alternative was keeping the vendor name and explaining the independence in prose —
readers trust the name over the paragraph.

### Consequences
The repo slug, the marketplace key, the plugin name and both command namespaces now move together: renaming
any one of them again means renaming all four, plus every install line in the README. Example vocabulary in
`formats/` and `skills/` is part of the public surface and stays product-neutral — a borrowed term there
teaches the wrong language to every repo that adopts this.
