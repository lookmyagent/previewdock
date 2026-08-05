import { access, copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, parse } from 'node:path'

export interface RuntimeAssetEntry {
  id: string
  packageName: string
  source: string
  target: string
}

export const runtimeAssetManifest: readonly RuntimeAssetEntry[] = [
  { id: 'archive-worker', packageName: 'libarchive.js', source: 'dist/worker-bundle.js', target: 'libarchive/worker-bundle.js' },
  { id: 'archive-wasm', packageName: 'libarchive.js', source: 'dist/libarchive.wasm', target: 'libarchive/libarchive.wasm' },
  { id: 'occt-wasm', packageName: 'occt-import-js', source: 'dist/occt-import-js.wasm', target: 'occt/occt-import-js.wasm' },
  { id: 'rhino-js', packageName: 'rhino3dm', source: 'rhino3dm.js', target: 'rhino/rhino3dm.js' },
  { id: 'rhino-wasm', packageName: 'rhino3dm', source: 'rhino3dm.wasm', target: 'rhino/rhino3dm.wasm' },
  { id: 'ifc-wasm', packageName: 'web-ifc', source: 'web-ifc.wasm', target: 'ifc/web-ifc.wasm' },
] as const

async function resolvePackageRoot(require: NodeJS.Require, packageName: string): Promise<string> {
  let directory = dirname(require.resolve(packageName))
  const root = parse(directory).root
  while (directory !== root) {
    try {
      await access(join(directory, 'package.json'))
      return directory
    } catch {
      directory = dirname(directory)
    }
  }
  throw new Error(`Unable to locate package root for ${packageName}`)
}

export async function copyPreviewDockAssets(outputDirectory: string): Promise<string[]> {
  const require = createRequire(import.meta.url)
  const copied: string[] = []
  for (const asset of runtimeAssetManifest) {
    const packageRoot = await resolvePackageRoot(require, asset.packageName)
    const source = join(packageRoot, asset.source)
    const target = join(outputDirectory, asset.target)
    await mkdir(dirname(target), { recursive: true })
    await copyFile(source, target)
    copied.push(target)
  }
  return copied
}
