#!/usr/bin/env node
// Self-check for stop.mjs's write-back detection. Run: node hooks/stop.test.mjs
import assert from 'node:assert/strict'
import { scanTranscript } from './stop.mjs'

const claude = (name, input) => JSON.stringify({ message: { role: 'assistant', content: [{ type: 'tool_use', name, input }] } })
const codex = (name, args) => JSON.stringify({ type: 'response_item', payload: { type: 'custom_tool_call', name, arguments: args } })

// A file written into brain/ counts as Brain-as-Code write-back...
assert.equal(scanTranscript([claude('Write', { file_path: '/repo/brain/decisions/foo.md', content: 'x' })]).wroteBrainFile, true)
assert.equal(scanTranscript([claude('Edit', { file_path: 'brain/memory.md' })]).wroteBrainFile, true)
assert.equal(scanTranscript([codex('apply_patch', '*** Add File: .agents/skills/run-a-thing/SKILL.md')]).wroteBrainFile, true)

// ...but a write elsewhere, or a mere READ of a brain file, does not.
assert.equal(scanTranscript([claude('Write', { file_path: '/repo/src/x.ts' })]).wroteBrainFile, false)
assert.equal(scanTranscript([claude('Read', { file_path: '/repo/brain/decisions/foo.md' })]).wroteBrainFile, false)

// Tool names still surface for the substantive / MCP-upsert checks in main().
const names = scanTranscript([claude('mcp__craftspace__upsert_page', {}), codex('apply_patch', 'src/y.ts')]).names
assert.deepEqual(names, ['mcp__craftspace__upsert_page', 'apply_patch'])

console.log('ok')
