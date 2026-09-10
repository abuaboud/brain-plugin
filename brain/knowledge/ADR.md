# Decisions

Newest first. See `formats/ADR.md` for the shape and the bar.

## 0004 · The brain is a folder, not two files at the root
`accepted` · 2026-09-10

### Decision
Durable context lives in `brain/knowledge/` — `context.md` for what things are, `ADR.md` for why the
hard-to-reverse calls were made — replacing `CONTEXT.md` and `ADR.md` loose at the repo root. A shell script
scaffolds the structure; the agent fills it.

### Context
The flat layout put two loose files at the root of every adopting repo, and gave the plugin no room to grow
an Area page later without adding a third root file. The repos this plugin is meant for already kept a
`brain/` folder, so adopting it meant reconciling two shapes by hand.

### Why
A folder is one thing to find, one thing to delete, and one place for anything the format grows later. The
rejected alternative was one file per decision under `decisions/`, which removes the merge conflict that an
append-at-the-top file guarantees — but costs a reader the single scrollable history that makes `ADR.md`
worth opening, and doubles the paths every instruction has to name.

### Consequences
Every path in the hooks, the injected rules, the format specs and both skills names `brain/`, so the layout
is now a public contract — changing it again is a breaking change for every adopting repo. Two branches that
both add an entry at the top of `ADR.md` will conflict; that is the accepted cost.

## 0003 · A repo's own `.claude/settings.json` is a second opt-in signal
`accepted` · 2026-09-10

### Decision
The hooks treat a committed `.claude/settings.json` that enables `brain@brain` as the repo opting in, and on
such a repo with no `brain/` folder yet SessionStart offers once to scaffold it. Folder presence remains the
first signal; those two are the only ones.

### Context
Folder presence alone was the whole switch, so a fresh install was indistinguishable from no install: both
hooks print nothing, and the first thing a new user reports is that the plugin does not work.

### Why
The obvious fix — speak in any repo lacking the folder — was rejected: it would cost every unrelated repo on
the machine tokens and instructions, which is the property that makes user-scope install safe. A repo that
committed the setting has already asked, in a reviewed file, so it is the one place the plugin can speak
without being asked twice. `init` moved from a command to a skill in the same change, so plain English
reaches it and no one has to know a command name.

### Consequences
A team repo now needs no command at all. The solo user still makes one gesture, which is the deliberate
floor. Both hooks must keep failing closed on a malformed or absent settings file — silence, never a crash.

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
that is the trade, and it is the same trade `brain/` already makes. If Cursor ever ships a real plugin
surface, this is the entry to supersede.

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
