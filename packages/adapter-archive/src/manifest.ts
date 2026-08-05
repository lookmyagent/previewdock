import type { AdapterRegistration } from '@previewdock/core'
import type { ArchiveRuntimeOptions } from './index'

export function createArchiveAdapterManifest(
  options: ArchiveRuntimeOptions = {},
): AdapterRegistration {
  return {
    id: 'archive',
    extensions: [
      'zip', 'zipx', 'jar', 'war', 'ear', 'apk', 'cbz', 'cbr',
      'tar', 'gz', 'gzip', 'tgz', 'bz2', 'bzip2', 'tbz', 'tbz2',
      'xz', 'txz', 'lzma', 'zst', 'tzst', 'rar', '7z',
      'cab', 'ar', 'cpio', 'iso', 'xar', 'lha', 'lzh',
    ],
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
