import type { AdapterRegistration } from '@previewdock/core'
import type { LegacyOfficeAdapterOptions } from './index'

export function createLegacyOfficeAdapterManifest(
  options: LegacyOfficeAdapterOptions = {},
): AdapterRegistration {
  return {
    id: 'legacy-office',
    priority: 15,
    extensions: ['doc', 'xls', 'xlt', 'xla', 'ppt'],
    mimeTypes: [
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
    ],
    load: async () => {
      const office = await import('./index')
      return office.createLegacyOfficeAdapter(options)
    },
  }
}

export const legacyOfficeAdapterManifest = createLegacyOfficeAdapterManifest()
