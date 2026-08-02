import { describe, expect, it } from 'vitest'
import { AdapterRegistry } from './registry'
import { defineAdapterPack, registerAdapterPacks } from './packs'

describe('adapter packs', () => {
  it('registers and disposes a selected set of adapters', () => {
    const registry = new AdapterRegistry()
    const pack = defineAdapterPack({
      id: 'basic',
      adapters: [{
        id: 'text',
        extensions: ['txt'],
        load: async () => ({
          id: 'text',
          label: 'Text',
          supports: () => true,
          open: async () => { throw new Error('not used') },
        }),
      }],
    })

    const dispose = registerAdapterPacks(registry, [pack])
    expect(registry.list().map(adapter => adapter.id)).toEqual(['text'])
    dispose()
    expect(registry.list()).toEqual([])
  })

  it('rolls back earlier registrations when packs contain a duplicate id', () => {
    const registry = new AdapterRegistry()
    const adapter = {
      id: 'same',
      load: async () => ({
        id: 'same',
        label: 'Same',
        supports: () => true,
        open: async () => { throw new Error('not used') },
      }),
    }

    expect(() => registerAdapterPacks(registry, [
      { id: 'one', adapters: [adapter] },
      { id: 'two', adapters: [adapter] },
    ])).toThrow('already registered')
    expect(registry.list()).toEqual([])
  })
})
