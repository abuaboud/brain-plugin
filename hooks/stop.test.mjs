#!/usr/bin/env node
// Self-check for the Stop hook. Run: node hooks/stop.test.mjs
import assert from 'node:assert/strict'
import { decide, scanTranscript } from './stop.mjs'

const claude = (name, input) => JSON.stringify({ message: { role: 'assistant', content: [{ type: 'tool_use', name, input }] } })
const codex = (name, args) => JSON.stringify({ type: 'response_item', payload: { type: 'custom_tool_call', name, arguments: args } })

// --- scanTranscript: which calls mutate, and which write into brain/ -----------------------------

const one = (line) => scanTranscript([line])[0]

assert.deepEqual(one(claude('Edit', { file_path: '/repo/brain/knowledge/context.md' })), { mutating: true, context: true })
assert.deepEqual(one(claude('Write', { file_path: '/repo/brain/knowledge/ADR.md' })), { mutating: true, context: true })
assert.deepEqual(one(claude('Write', { file_path: 'brain/knowledge/context.md' })), { mutating: true, context: true }, 'repo-relative')
assert.deepEqual(one(codex('apply_patch', '*** Update File: brain/knowledge/context.md')), { mutating: true, context: true })
assert.deepEqual(one(claude('Edit', { file_path: '/repo/src/x.ts' })), { mutating: true, context: false })

// Reading the brain is not writing to it.
assert.deepEqual(one(claude('Read', { file_path: '/repo/brain/knowledge/index.md' })), { mutating: false, context: false })
assert.deepEqual(one(claude('Grep', { pattern: 'brain/' })), { mutating: false, context: false })

// A near-miss folder must not count as the real one and silently suppress the nudge.
assert.equal(one(claude('Write', { file_path: '/repo/my-brain/notes.md' })).context, false)
assert.equal(one(claude('Write', { file_path: '/repo/rebrain/notes.md' })).context, false)
// The old flat layout is no longer the write-back.
assert.equal(one(claude('Write', { file_path: '/repo/CONTEXT.md' })).context, false)

// --- decide: the whole block-or-allow table ------------------------------------------------------

const code = { mutating: true, context: false }
const record = { mutating: true, context: true }
const read = { mutating: false, context: false }
const nudged = (opts) => decide({ stopHookActive: false, present: true, calls: [], ...opts }) !== null

// The one case that nudges: the repo has a brain, code changed, brain untouched.
assert.equal(nudged({ calls: [code] }), true)
assert.equal(nudged({ calls: [read, code, read] }), true)

// Every way it stays quiet.
assert.equal(nudged({ present: false, calls: [code] }), false, 'no brain/ folder')
assert.equal(nudged({ calls: [code, record] }), false, 'write-back happened')
assert.equal(nudged({ calls: [read, read] }), false, 'read-only session')
assert.equal(nudged({ calls: [] }), false, 'no tool calls at all')
assert.equal(nudged({ stopHookActive: true, calls: [code] }), false, 'nudge once, never twice')

console.log('ok')
