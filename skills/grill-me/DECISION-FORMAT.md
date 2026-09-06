# Decision Format

## When to offer one

Offer a Decision only when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for reasons

If any of the three is missing, skip it. Easy to reverse? You'll just reverse it. Not surprising?
Nobody will wonder why. No real alternative? There's nothing to record beyond "we did the obvious thing."

## What qualifies

- **Architectural shape.** "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between subsystems.** Which two things talk, and over what.
- **Technology choices carrying lock-in.** Database, queue, auth provider, deployment target. Not every
  library, just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** The explicit no's as much as the yes's.
- **Deliberate deviations from the obvious path.** Anything a reasonable reader would assume the
  opposite of. These stop the next person from "fixing" something that was intentional.
- **Constraints not visible in the code.** A compliance limit, a partner SLA, a customer commitment.
- **Rejected alternatives whose rejection is non-obvious.** Otherwise someone proposes it again in six
  months.

## Shape

Title it as the claim itself, so the sidebar reads as a list of positions:

```
Worker is the Sandbox
Pieces are distributed as links, resolved lazily
Approval links require a POST confirmation on a dedicated route
```

Body is one to three sentences: what the context was, what was decided, why. A Decision can be a
single paragraph — the value is in recording *that* a call was made and *why*, not in filling out
sections.

Add more only when it earns its place:

- **Rejected alternatives** — when someone would otherwise propose them again.
- **Consequences** — when a downstream effect is non-obvious.
- **`status`** frontmatter (`proposed | accepted | superseded by <slug>`) — when a call is still open,
  or when it gets revisited.

Nest it under the Area page it belongs to, and add it to that page's trailing decisions line. In a
`brain/` repo it is a file in `brain/decisions/`, numbered one above the highest already there.
