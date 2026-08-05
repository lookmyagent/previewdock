import { describe, expect, it } from 'vitest'
import { supportedFormats } from '@previewdock/core'
import { createAllFormatEngine, createAllFormatPack } from './index'

const expectedAdapterIds = [
  'pdf',
  'openxml',
  'legacy-office',
  'structured-documents',
  'structural-inspector-documents',
  'text',
  'structural-inspector-text-data',
  'archive',
  'structural-inspector-archives',
  'image',
  'advanced-image',
  'structural-inspector-images',
  'media',
  'structural-inspector-media',
  'structured-diagrams',
  'legacy-diagrams',
  'structural-inspector-diagrams',
  'model-3d',
  'structural-inspector-3d-cad',
]

describe('official all-format preset', () => {
  it('registers every official adapter manifest', () => {
    const pack = createAllFormatPack()
    expect(pack.id).toBe('all-formats')
    expect(pack.adapters.map(adapter => adapter.id)).toEqual(expectedAdapterIds)
  })

  it('creates a ready-to-use engine without loading adapter implementations', () => {
    const engine = createAllFormatEngine()
    expect(engine.registry.list().map(adapter => adapter.id).sort()).toEqual(
      [...expectedAdapterIds].sort(),
    )
  })

  it('registers every extension in the product catalog', () => {
    const pack = createAllFormatPack()
    const registered = new Set(pack.adapters.flatMap(adapter => adapter.extensions || []))
    expect(supportedFormats.filter(format => !registered.has(format.extension))).toEqual([])
  })
})
