#!/usr/bin/env node
// Craftspace Stop hook — the forcing function.
//
// Blocks the FIRST stop of a substantive session that wrote nothing back to the company brain, and
// hands the model a directive to record the decision/learning now (or explicitly decline). All of
// Claude Code, Codex, and Cursor feed the hook JSON on stdin and treat exit code 2 with a stderr
// message as "keep going, here is why".
//
// Loop-safe: nudges once. `stop_hook_active` is true when this stop was itself triggered by a stop
// hook — that is the escape hatch. Fail-open: any parse/read error allows the stop, so a hook bug
// can never trap a session.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Bare craftspace write-tool names (client prefixes/namespaces stripped before matching). These are
// the endpoint's actual write tools — keep in sync with mcp-server.ts, which merged create/edit into
// upsert. ponytail: named set, not a fetch of the live tool list; re-check on a server tool rename.
const WRITE_TOOLS = new Set(['upsert_decision', 'upsert_page', 'upsert_skill'])

// File-mutating tools: the "this session did real work" signal. Claude Code names on the left,
// Codex on the right (apply_patch = its edit tool).
const WORK_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'apply_patch'])

// Brain as Code write-back: a Shared brain's context is markdown under `brain/{decisions,skills,wiki}/`,
// so in a repo-backed brain the agent writes files there instead of calling upsert_* — and that IS the
// write-back. Match a work-tool call whose serialized input touches that path (Claude Code's file_path,
// Codex's apply_patch body both stringify to contain it). ponytail: fixed `brain/` base (what the connect
// UI writes); widen only if a custom base path ever ships.
// Anything under brain/, plus a skill in its tool-neutral home. brain/ is the whole tree now, so the old
// {decisions,skills,wiki} allowlist would miss every ordinary page written at the top of it.
const BRAIN_FILE = /(?:brain|\.agents\/skills|\.claude\/skills)\/[^"'\s]*\.md/

// The bare tool name from either transcript dialect: strip a Claude Code `mcp__server__` prefix.
const bareName = (name) => (typeof name === 'string' ? name.split('__').pop() : '')

function allow() {
  process.exit(0)
}

function block(reason) {
  process.stderr.write(reason)
  process.exit(2)
}

// One pass over the transcript in whichever dialect it is. Returns the tool names called and whether a
// work-tool wrote a `brain/` file (the Brain-as-Code write-back).
//   Claude Code: {message:{role:'assistant',content:[{type:'tool_use',name,input}]}}.
//   Codex: {type:'response_item',payload:{type:'function_call'|'custom_tool_call',name,arguments}}.
export function scanTranscript(lines) {
  const names = []
  let wroteBrainFile = false
  const brainWrite = (name, argsJson) => WORK_TOOLS.has(bareName(name)) && BRAIN_FILE.test(argsJson)
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
          names.push(block.name)
          if (brainWrite(block.name, JSON.stringify(block.input ?? ''))) wroteBrainFile = true
        }
      }
    }
    const payload = entry.type === 'response_item' ? entry.payload : undefined
    if (payload && (payload.type === 'function_call' || payload.type === 'custom_tool_call') && typeof payload.name === 'string') {
      names.push(payload.name)
      if (brainWrite(payload.name, JSON.stringify(payload.arguments ?? payload.input ?? ''))) wroteBrainFile = true
    }
  }
  return { names, wroteBrainFile }
}

function main() {
  let input
  try {
    input = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return allow()
  }
  if (input.stop_hook_active) return allow()
  if (!input.transcript_path) return allow()

  let scan
  try {
    scan = scanTranscript(readFileSync(input.transcript_path, 'utf8').split('\n'))
  } catch {
    return allow()
  }
  const { names, wroteBrainFile } = scan

  // Write-back landed either way: an MCP upsert (hosted brain) or a file written into brain/ (Brain as Code).
  const wroteBack = wroteBrainFile || names.some((n) => WRITE_TOOLS.has(bareName(n)))
  if (wroteBack) return allow()

  const didFileWork = names.some((n) => WORK_TOOLS.has(n) || WORK_TOOLS.has(bareName(n)))
  const substantive = didFileWork || names.length >= 6
  if (!substantive) return allow()

  return block(
    'Before you finish: this session did real work but recorded nothing to the Craftspace company ' +
      'brain. If this repo has a brain/ folder (Brain as Code), record the learning as a markdown file ' +
      'under brain/decisions/, .agents/skills/, or anywhere in brain/ (that IS the write-back — it rides your PR). ' +
      'Otherwise use the craftspace tools: a hard-to-reverse decision -> upsert_decision, a durable gotcha ' +
      'or learning -> upsert_page, a reusable procedure -> upsert_skill. Search first (grep brain/ or ' +
      'search_pages) so you extend rather than duplicate. If nothing here is genuinely worth keeping for ' +
      'the team, say so in one line and stop.',
  )
}

// Run only when invoked as the hook (node stop.mjs), not when imported by the self-test.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()
