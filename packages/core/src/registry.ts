import type {
  AdapterRegistration,
  FileDescriptor,
  PreviewAdapter,
} from './types'

function normalizeMime(value: string): string {
  return value.toLowerCase().split(';')[0]?.trim() || value.toLowerCase()
}

function mimeMatches(pattern: string, actual: string): boolean {
  const normalizedPattern = normalizeMime(pattern)
  const normalizedActual = normalizeMime(actual)
  if (normalizedPattern.endsWith('/*')) {
    return normalizedActual.startsWith(normalizedPattern.slice(0, -1))
  }
  return normalizedPattern === normalizedActual
}

export class AdapterRegistry {
  private readonly registrations = new Map<string, AdapterRegistration>()
  private readonly loadedAdapters = new Map<string, PreviewAdapter>()

  register(registration: AdapterRegistration): () => void {
    if (this.registrations.has(registration.id)) {
      throw new Error(`Adapter "${registration.id}" is already registered`)
    }
    this.registrations.set(registration.id, {
      ...registration,
      extensions: registration.extensions?.map(value => value.toLowerCase()),
      mimeTypes: registration.mimeTypes?.map(value => value.toLowerCase()),
    })
    return () => this.unregister(registration.id)
  }

  unregister(id: string): void {
    this.registrations.delete(id)
    this.loadedAdapters.delete(id)
  }

  list(): AdapterRegistration[] {
    return [...this.registrations.values()]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  private matches(registration: AdapterRegistration, file: FileDescriptor): boolean {
    const extensionMatch = Boolean(
      file.extension && registration.extensions?.includes(file.extension),
    )
    const mimeMatch = Boolean(
      registration.mimeTypes?.some(pattern => mimeMatches(pattern, file.mimeType)),
    )
    return extensionMatch || mimeMatch
  }

  async resolve(file: FileDescriptor): Promise<PreviewAdapter | undefined> {
    for (const registration of this.list()) {
      if (!this.matches(registration, file)) {
        continue
      }
      const cached = this.loadedAdapters.get(registration.id)
      const adapter = cached || await registration.load()
      this.loadedAdapters.set(registration.id, adapter)
      if (adapter.supports(file)) {
        return adapter
      }
    }
    return undefined
  }
}
