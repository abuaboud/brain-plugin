#!/usr/bin/env node
// SessionStart: hand the agent this project's context rules.
//
// Only in a repo that keeps CONTEXT.md or ADR.md. Everywhere else it prints nothing and exits 0, so
// installing this plugin costs an unrelated repo zero tokens and zero instructions.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTEXT_FILES, contextFiles, projectRoot } from './project.mjs'

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function context(found) {
  const rules = readFileSync(join(pluginRoot, 'RULES.md'), 'utf8').replaceAll('${CLAUDE_PLUGIN_ROOT}', pluginRoot)
  const missing = CONTEXT_FILES.filter((name) => !found.includes(name))
  const status =
    missing.length === 0
      ? `\nBoth files exist in this repo. Grep them before you answer.\n`
      : `\nThis repo has ${found.join(' and ')}. There is no ${missing.join(' or ')} yet — create it the` +
        ` first time there is something real to put in it, never as an empty scaffold.\n`
  return rules + status
}

const found = contextFiles(projectRoot())
if (found.length > 0) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context(found) },
    }),
  )
}
