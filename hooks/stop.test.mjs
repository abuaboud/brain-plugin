#!/usr/bin/env node
// Self-check for the Stop hook. Run: node hooks/stop.test.mjs
import assert from 'node:assert/strict'
import { decide, scanTranscript } from './stop.mjs'

const claude = (name, input) => JSON.stringify({ message: { role: 'assistant', content: [{ type: 'tool_use', name, input }] } })
const codex = (name, args) => JSON.stringify({ type: 'response_item', payload: { type: 'custom_tool_call', name, arguments: args } })

// --- scanTranscript: which calls mutate, and which touch a context file --------------------------

const one = (line) => scanTranscript([line])[0]

assert.deepEqual(one(claude('Edit', { file_path: '/repo/ADR.md' })), { mutating: true, context: true })
assert.deepEqual(one(claude('Write', { file_path: '/repo/CONTEXT.md' })), { mutating: true, context: true })
assert.deepEqual(one(codex('apply_patch', '*** Update File: CONTEXT.md')), { mutating: true, context: true })
assert.deepEqual(one(claude('Edit', { file_path: '/repo/src/x.ts' })), { mutating: true, context: false })

// Reading a context file is not writing one.
assert.deepEqual(one(claude('Read', { file_path: '/repo/ADR.md' })), { mutating: false, context: false })
assert.deepEqual(one(claude('Grep', { pattern: 'ADR.md' })), { mutating: false, context: false })

// A near-miss filename must not count as the real one.
assert.equal(one(claude('Write', { file_path: '/repo/docs/ADR.md.bak' })).context, false)

// --- decide: the whole block-or-allow table ------------------------------------------------------

const BOTH = ['CONTEXT.md', 'ADR.md']
const code = { mutating: true, context: false }
const record = { mutating: true, context: true }
const read = { mutating: false, context: false }

// Blocks exactly once: real code changes, opted-in repo, nothing recorded.
assert.equal(typeof decide({ stopHookActive: false, present: BOTH, calls: [code] }), 'string')

// Allows when the repo never opted in — the bug that made this hook demand the impossible.
assert.equal(decide({ stopHookActive: false, present: [], calls: [code] }), null)

// Allows a read-only session, however long. Reading is not a reason to write.
assert.equal(decide({ stopHookActive: false, present: BOTH, calls: Array(40).fill(read) }), null)

// Allows once a context file was written.
assert.equal(decide({ stopHookActive: false, present: BOTH, calls: [code, record] }), null)

// Allows a session that only touched the context files.
assert.equal(decide({ stopHookActive: false, present: BOTH, calls: [record] }), null)

// Never nudges twice.
assert.equal(decide({ stopHookActive: true, present: BOTH, calls: [code] }), null)

// One file present is enough to be opted in.
assert.equal(typeof decide({ stopHookActive: false, present: ['CONTEXT.md'], calls: [code] }), 'string')

// The message never leaks transcript content: it is the same string whatever the session did.
const a = decide({ stopHookActive: false, present: BOTH, calls: [code] })
const b = decide({ stopHookActive: false, present: ['ADR.md'], calls: [code, code, read] })
assert.equal(a, b)

console.log('ok')
