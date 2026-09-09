#!/usr/bin/env node
// Stop hook: nudge once when a session changed the codebase but left CONTEXT.md and ADR.md untouched.
//
// Four ways it stays quiet, and staying quiet is the common case by design. A nudge that fires on every
// session is a nudge nobody reads:
//   1. The repo keeps neither file. Nothing to update, so nothing to say.
//   2. The session mutated no file. Reading around a codebase is not a reason to write to it.
//   3. A context file was already edited. The write-back happened.
//   4. This stop was itself triggered by a stop hook (`stop_hook_active`) — nudge once, never twice.
// Any parse or read error allows the stop, so a bug here can never trap a session.
//
// PRIVACY: the transcript is read only to collect tool NAMES and to test one filename regex. No transcript
// content is stored, logged, or emitted anywhere — the message below is fixed text.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contextFiles, projectRoot } from './project.mjs'

// File-mutating tools. Claude Code's names, plus Codex's `apply_patch`.
const WORK_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'apply_patch'])

// A mutation whose serialized arguments name a context file. Claude Code's `file_path` and Codex's
// apply_patch body both stringify to contain it. Anchored on both sides so `ADR.md.bak` and `MY_CONTEXT.md`
// do not read as the real file and silently suppress the nudge.
const CONTEXT_FILE = /(?<![\w.\-])(?:CONTEXT|ADR)\.md(?![\w.])/

const NUDGE =
  'Before you finish: this session changed the codebase but left CONTEXT.md and ADR.md untouched. ' +
  'If a hard-to-reverse call was made here — one that is costly to undo, surprising without the context, ' +
  'and picked over a real alternative — add an entry at the top of ADR.md. If a term, a key path, or a ' +
  'gotcha came up that the next person will need, put it in CONTEXT.md. Read the format first, grep the ' +
  'file so you extend an existing entry rather than duplicating it, and write no names, customer ' +
  'identifiers, credentials, or home-directory paths. Most sessions record nothing and that is the right ' +
  'outcome — if nothing here clears that bar, say so in one line and stop.'

// The bare tool name from either transcript dialect: strip a Claude Code `mcp__server__` prefix.
const bareName = (name) => (typeof name === 'string' ? name.split('__').pop() : '')

// One pass over the transcript, in whichever dialect it is.
//   Claude Code: {message:{role:'assistant',content:[{type:'tool_use',name,input}]}}
//   Codex:       {type:'response_item',payload:{type:'function_call'|'custom_tool_call',name,arguments}}
// Returns one entry per tool call: was it a mutation, and did it touch a context file?
export function scanTranscript(lines) {
  const calls = []
  const add = (name, args) => {
    const mutating = WORK_TOOLS.has(bareName(name))
    calls.push({ mutating, context: mutating && CONTEXT_FILE.test(args) })
  }
  for (const line of lines) {
    if (!line.trim()) continue
    let entry
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    const msg = entry.message
    if (msg && msg.role === 'assistant' && Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block?.type === 'tool_use' && typeof block.name === 'string') {
          add(block.name, JSON.stringify(block.input ?? ''))
        }
      }
    }
    const payload = entry.type === 'response_item' ? entry.payload : undefined
    if (payload && (payload.type === 'function_call' || payload.type === 'custom_tool_call') && typeof payload.name === 'string') {
      add(payload.name, JSON.stringify(payload.arguments ?? payload.input ?? ''))
    }
  }
  return calls
}

// The whole decision, as one pure function so the table below it can be tested.
// Returns the reason to block, or null to allow.
export function decide({ stopHookActive, present, calls }) {
  if (stopHookActive) return null
  if (present.length === 0) return null
  if (calls.some((call) => call.context)) return null
  if (!calls.some((call) => call.mutating)) return null
  return NUDGE
}

function main() {
  let input
  try {
    input = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return process.exit(0)
  }

  let calls = []
  if (input.transcript_path) {
    try {
      calls = scanTranscript(readFileSync(input.transcript_path, 'utf8').split('\n'))
    } catch {
      return process.exit(0)
    }
  }

  const reason = decide({
    stopHookActive: input.stop_hook_active === true,
    present: contextFiles(projectRoot(input)),
    calls,
  })
  if (reason === null) return process.exit(0)
  process.stderr.write(reason)
  process.exit(2)
}

// Run only when invoked as the hook, not when imported by the test.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()
