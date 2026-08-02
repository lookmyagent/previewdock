import type { AdapterRegistration } from '@universal-file-viewer/core'
import type { ArchiveRuntimeOptions } from './index'

export function createArchiveAdapterManifest(
  options: ArchiveRuntimeOptions = {},
): AdapterRegistration {
  return {
    id: 'archive',
    extensions: ['zip', 'jar', 'tar', 'gz', 'gzip', 'tgz', 'rar', '7z'],
    mimeTypes: [
      'application/zip', 'application/java-archive',
      'application/gzip', 'application/x-gzip', 'application/x-tar',
      'application/vnd.rar', 'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
    load: async () => {
      const archive = await import('./index')
      archive.configureArchiveRuntime(options)
      return archive.archiveAdapter
    },
  }
}

export const archiveAdapterManifest = createArchiveAdapterManifest()
