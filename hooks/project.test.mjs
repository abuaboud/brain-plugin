#!/usr/bin/env node
// Self-check for the two opt-in signals. Run: node hooks/project.test.mjs
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hasBrain, repoOptedIn } from './project.mjs'

// A repo root with an optional brain/ folder and an optional .claude/settings.json body.
function repo({ settings, brain = false, dirs = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'brain-'))
  if (brain) mkdirSync(join(root, 'brain', 'knowledge', 'decisions'), { recursive: true })
  for (const d of dirs) mkdirSync(join(root, d), { recursive: true })
  if (settings !== undefined) {
    mkdirSync(join(root, '.claude'))
    writeFileSync(join(root, '.claude', 'settings.json'), settings)
  }
  return root
}
const enabled = JSON.stringify({ enabledPlugins: { 'brain@brain': true } })

// --- signal 1: the folder itself -----------------------------------------------------------------
assert.equal(hasBrain(repo()), false)
assert.equal(hasBrain(repo({ brain: true })), true)
// A folder that merely contains the word is not the brain.
assert.equal(hasBrain(repo({ dirs: ['my-brain'] })), false)
assert.equal(hasBrain(repo({ dirs: ['src/brain'] })), false, 'nested, not at the root')

// --- signal 2: the repo's own settings.json ------------------------------------------------------
assert.equal(repoOptedIn(repo({ settings: enabled })), true)
// Any marketplace the plugin was installed from counts; the key is `<plugin>@<marketplace>`.
assert.equal(repoOptedIn(repo({ settings: JSON.stringify({ enabledPlugins: { 'brain@craftspace': true } }) })), true)

// Everything else is a repo that did not ask, and must read as silent.
assert.equal(repoOptedIn(repo()), false, 'no settings file')
assert.equal(repoOptedIn(repo({ settings: enabled.replace('true', 'false') })), false, 'explicitly disabled')
assert.equal(repoOptedIn(repo({ settings: '{}' })), false, 'no enabledPlugins key')
assert.equal(repoOptedIn(repo({ settings: JSON.stringify({ enabledPlugins: { 'other@x': true } }) })), false, 'another plugin')
// `brainstorm@x` must not match a prefix test on the plugin name.
assert.equal(repoOptedIn(repo({ settings: JSON.stringify({ enabledPlugins: { 'brainstorm@x': true } }) })), false, 'similar name')
// A broken or unreadable settings file fails closed: silence, never a crash.
assert.equal(repoOptedIn(repo({ settings: '{ not json' })), false, 'malformed')

console.log('ok')
