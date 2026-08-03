import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const workspace = resolve(import.meta.dirname, '..')
const siteDist = resolve(workspace, 'apps/site/dist')
const surfaces = [
  [resolve(workspace, 'docs/.vitepress/dist'), resolve(siteDist, 'docs')],
  [resolve(workspace, 'apps/playground/dist'), resolve(siteDist, 'playground')],
]

for (const [source, target] of surfaces) {
  if (!existsSync(source)) throw new Error(`Missing built surface: ${source}`)
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  cpSync(source, target, { recursive: true })
}

console.log('Assembled portal, docs, and playground into apps/site/dist')
