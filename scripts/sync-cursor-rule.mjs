#!/usr/bin/env node
// Generates the Cursor rule from RULES.md.
//
// Cursor has no hook surface, so it needs the rules as a file. Cursor reads exactly one location —
// `.cursor/rules/*.mdc` inside the repo being worked on — and has no plugin manifest that can ship a rule
// from elsewhere, so this generated file is both what this repo uses on itself and what a user copies (or
// imports, via Cursor's GitHub rule import) into their own `.cursor/rules/`.
//
// It used to be a hand-maintained copy and it drifted — different tool names, different paths, different product name than the source it claimed
// to mirror. It is generated now, and `--check` fails the test run if it is stale.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, '.cursor/rules/brain.mdc')

const FRONTMATTER = [
  '---',
  'description: Read CONTEXT.md and ADR.md before acting; update them when a decision or a durable fact lands.',
  'alwaysApply: true',
  '---',
  '',
  '<!-- Generated from RULES.md by scripts/sync-cursor-rule.mjs. Do not edit. -->',
  '',
].join('\n')

// Cursor resolves no plugin-root variable, so the format specs are named by plugin-relative path and the
// footer says where to find them once the rule has been copied into someone else's repo.
const FOOTER =
  '\n---\n\n`formats/ADR.md` and `formats/CONTEXT.md` live in the brain plugin:\n' +
  'https://github.com/abuaboud/brain-plugin/tree/main/formats\n'
const body = readFileSync(join(root, 'RULES.md'), 'utf8').replaceAll('${CLAUDE_PLUGIN_ROOT}/', '')
const expected = FRONTMATTER + body + FOOTER

if (process.argv.includes('--check')) {
  let actual = ''
  try {
    actual = readFileSync(OUT, 'utf8')
  } catch {}
  if (actual !== expected) {
    console.error('.cursor-plugin/rules/context.mdc is stale. Run: node scripts/sync-cursor-rule.mjs')
    process.exit(1)
  }
  console.log('ok')
} else {
  writeFileSync(OUT, expected)
  console.log(`wrote ${OUT}`)
}
