import { describe, expect, it } from 'vitest'
import { createAllFormatEngine, createAllFormatPack } from './index'

const expectedAdapterIds = [
  'text',
  'image',
  'pdf',
  'media',
  'advanced-image',
  'archive',
  'openxml',
  'legacy-office',
  'structured',
  'model-3d',
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
})
