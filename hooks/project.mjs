// Does this repo keep project context files, and which ones?
//
// Every hook in this plugin routes through here and stays SILENT when the answer is none. That is what
// makes the plugin safe to install at user scope: it says nothing in the repos that never opted in, which
// is most of them.
//
// ponytail: root only, no tree walk. `/craftspace:init` puts both files at the repo root and nowhere else,
// so a walk would only find other projects' files nested inside this one.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const CONTEXT_FILES = ['CONTEXT.md', 'ADR.md']

export function contextFiles(root) {
  return CONTEXT_FILES.filter((name) => existsSync(join(root, name)))
}

export function projectRoot(input = {}) {
  return input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
}
