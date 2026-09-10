// Does this repo keep a brain, and did it ask for one?
//
// Every hook in this plugin routes through here and stays SILENT when the answer is no. That is what
// makes the plugin safe to install at user scope: it says nothing in the repos that never opted in, which
// is most of them.
//
// ponytail: root only, no tree walk. `brain/` sits at the repo root and nowhere else, so a walk would
// only find other projects' folders nested inside this one.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const BRAIN_DIR = 'brain'

// Signal one, and the common one: the folder is there, so there is something to read.
export function hasBrain(root) {
  return existsSync(join(root, BRAIN_DIR))
}

export function projectRoot(input = {}) {
  return input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
}

// Signal two: the repo's own committed `.claude/settings.json` turns this plugin on. That is a reviewed,
// in-repo decision, so a teammate who clones gets the offer to scaffold without running any command.
export function repoOptedIn(root) {
  try {
    const settings = JSON.parse(readFileSync(join(root, '.claude', 'settings.json'), 'utf8'))
    return Object.entries(settings.enabledPlugins ?? {}).some(([key, on]) => on && key.startsWith('brain@'))
  } catch {
    return false
  }
}
