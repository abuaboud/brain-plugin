#!/usr/bin/env node
// SessionStart: hand the agent this project's brain rules.
//
// Only in a repo that keeps a `brain/` folder, or one whose own settings asked for it. Everywhere else it
// prints nothing and exits 0, so installing this plugin costs an unrelated repo zero tokens and zero
// instructions.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hasBrain, projectRoot, repoOptedIn } from './project.mjs'

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function rules() {
  const body = readFileSync(join(pluginRoot, 'RULES.md'), 'utf8').replaceAll('${CLAUDE_PLUGIN_ROOT}', pluginRoot)
  return `${body}\nThis repo keeps a brain/ folder. Grep it before you answer.\n`
}

// Nothing scaffolded yet, but the repo asked for this plugin: point at the way to fill it, once.
const BOOTSTRAP =
  'This repo enables the brain plugin but has no brain/ folder yet, so there is nothing to read. Offer in ' +
  'one line to scaffold and fill it from the repo — the `init` skill carries the procedure. Never leave an ' +
  'empty scaffold behind, and do not raise it again if the user passes.\n'

const emit = (additionalContext) =>
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } }))

// Take the root from the hook payload, the way stop.mjs does. Falling back to process.cwd() reads
// whatever directory the hook happened to be spawned in, which is not reliably the project.
let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {}

const root = projectRoot(input)
if (hasBrain(root)) emit(rules())
else if (repoOptedIn(root)) emit(BOOTSTRAP)
