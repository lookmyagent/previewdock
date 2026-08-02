import { ViewerEngine } from './engine'
import { AdapterRegistry } from './registry'
import type { AdapterRegistration } from './types'

export interface AdapterPack {
  /** Stable identifier used by applications to describe an enabled capability group. */
  id: string
  /** Human-readable label for diagnostics and developer tools. */
  label?: string
  adapters: readonly AdapterRegistration[]
}

export function defineAdapterPack(pack: AdapterPack): AdapterPack {
  return pack
}

/**
 * Registers multiple capability packs and returns one disposer for the whole set.
 * Duplicate adapter ids fail immediately so a deployment cannot silently pick the
 * wrong renderer.
 */
export function registerAdapterPacks(
  registry: AdapterRegistry,
  packs: readonly AdapterPack[],
): () => void {
  const unregister: Array<() => void> = []
  try {
    for (const pack of packs) {
      for (const adapter of pack.adapters) {
        unregister.push(registry.register(adapter))
      }
    }
  } catch (error) {
    unregister.reverse().forEach(dispose => dispose())
    throw error
  }

  return () => unregister.reverse().forEach(dispose => dispose())
}

/** Creates a ready-to-use engine containing only the selected capability packs. */
export function createViewerEngine(packs: readonly AdapterPack[]): ViewerEngine {
  const registry = new AdapterRegistry()
  registerAdapterPacks(registry, packs)
  return new ViewerEngine(registry)
}
