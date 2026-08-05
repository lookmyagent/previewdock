import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { copyPreviewDockAssets, runtimeAssetManifest } from './index'

let output = ''
afterEach(async () => {
  if (output) await rm(output, { recursive: true, force: true })
})

describe('runtime asset copier', () => {
  it('copies every declared self-hosted asset', async () => {
    output = await mkdtemp(join(tmpdir(), 'previewdock-assets-'))
    const copied = await copyPreviewDockAssets(output)
    expect(copied).toHaveLength(runtimeAssetManifest.length)
    for (const path of copied) {
      expect((await readFile(path)).byteLength).toBeGreaterThan(100)
    }
  })
})
