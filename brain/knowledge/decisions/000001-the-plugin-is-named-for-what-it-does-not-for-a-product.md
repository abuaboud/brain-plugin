---
status: accepted
---

# The plugin is named for what it does, not for a product

## Decision

Name the plugin `brain`, with no reference to any product or vendor in the manifests, the commands, the
repo slug, or the example vocabulary in the format specs.

## Context

It was built inside a product and carried that product's name through five manifests, both command
namespaces, the homepage and author fields, and — less visibly — the worked examples in `formats/` and the
`grill-me` skill, which teach the format by demonstrating it in another product's vocabulary.

## Why

The plugin never depended on a control plane: no network call, no MCP tool, no auth anywhere in the runtime.
The only thing suggesting otherwise was the naming, which made a self-contained tool look like a client for
a service. The rejected alternative was keeping the vendor name and explaining the independence in prose —
readers trust the name over the paragraph.

## Consequences

The repo slug, the marketplace key, the plugin name and both command namespaces now move together: renaming
any one of them again means renaming all four, plus every install line in the README. Example vocabulary in
`formats/` and `skills/` is part of the public surface and stays product-neutral — a borrowed term there
teaches the wrong language to every repo that adopts this.
