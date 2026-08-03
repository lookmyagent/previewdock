import { describe, expect, it } from 'vitest'
import { threeDCadPack } from '@previewdock/preset-3d-cad'
import { archivesPack } from '@previewdock/preset-archives'
import { diagramsPack } from '@previewdock/preset-diagrams'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'
import { mediaPack } from '@previewdock/preset-media'
import { textDataPack } from '@previewdock/preset-text-data'

describe('official category presets', () => {
  it.each([
    ['documents', documentsPack, ['pdf', 'openxml', 'legacy-office', 'structured-documents']],
    ['text-data', textDataPack, ['text']],
    ['archives', archivesPack, ['archive']],
    ['images', imagesPack, ['image', 'advanced-image']],
    ['media', mediaPack, ['media']],
    ['diagrams', diagramsPack, ['structured-diagrams', 'legacy-diagrams']],
    ['3d-cad', threeDCadPack, ['model-3d']],
  ])('keeps the %s capability boundary explicit', (_id, pack, adapterIds) => {
    expect(pack.id).toBe(_id)
    expect(pack.adapters.map(adapter => adapter.id)).toEqual(adapterIds)
  })
})
