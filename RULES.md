# Project context

This repo keeps its durable context in two files at the root:

- **`CONTEXT.md`** — what things ARE. The project's own vocabulary, one line per term, and where each lives in the code.
- **`ADR.md`** — WHY hard-to-reverse calls were made. Newest first.

## Read them before you answer

Before acting on anything about how this project works — its vocabulary, its structure, its decisions, its
gotchas — grep `CONTEXT.md` and `ADR.md` first. They are on disk and current to the working tree, so they
beat inferring from the code and they beat whatever you already assume.

If a term is defined in `CONTEXT.md`, use that word. Do not introduce a synonym for something already named.

## Update them the moment something resolves

Not at the end of the session. When the thing happens.

| What happened | Where it goes |
| --- | --- |
| A hard-to-reverse call with a real trade-off | a new entry at the top of `ADR.md` |
| A term this project uses in its own particular way | a line in `CONTEXT.md` |
| A gotcha that cost real time and will do it again | a bullet under `## Gotchas` in `CONTEXT.md` |
| Anything else | nowhere. Let it go. |

Read the format before you write: `${CLAUDE_PLUGIN_ROOT}/formats/ADR.md`, `${CLAUDE_PLUGIN_ROOT}/formats/CONTEXT.md`.

Both files are edited in place and ride your normal pull request. Grep before you add: if an entry already
covers the topic, **edit that entry**. A second entry on the same subject is a duplicate, not an update.

## The bar

**Most sessions record nothing, and that is the correct outcome.** These two files earn their keep by being
short enough that someone actually reads them. Every entry you add costs every future reader.

Record something only if it will still be true and still useful next month. Skip: one-off transients, a
flaky test you already fixed, general programming knowledge, anything a competent reader gets from the code
in ten seconds, and status updates ("migrated X today").

An ADR needs all three: **hard to reverse**, **surprising without the context**, and the result of a **real
trade-off**. Miss one and skip it — you will just reverse an easy call, nobody wonders about an unsurprising
one, and there is nothing to record when there was no alternative.

If a session produced several things worth keeping, write the most important one properly rather than all of
them thinly. One good entry beats four stubs.

## Never write

Do not put personal or secret data in either file. They are committed, public to everyone with repo access,
and permanent in the history.

- **No people.** No names, emails, usernames, handles, or phone numbers — not the team's, not a customer's.
  Write the role: "the on-call engineer", "a reviewer", "the reporting customer".
- **No customer or account identifiers.** No org names, account ids, subdomains, or ticket URLs that carry
  them. Describe the shape of the case, not whose it was.
- **No credentials.** No tokens, keys, passwords, connection strings, or internal hostnames — not even
  expired or example-looking ones.
- **No machine-local paths.** Nothing under a home directory. Repo-relative paths only.

If a fact cannot be written without one of these, it does not go in the file.
