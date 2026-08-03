import type { AdapterRegistration } from '@previewdock/core'
import type { LegacyOfficeAdapterOptions } from './index'

export function createLegacyOfficeAdapterManifest(
  options: LegacyOfficeAdapterOptions = {},
): AdapterRegistration {
  return {
    id: 'legacy-office',
    priority: 15,
    extensions: [
      'doc', 'dot', 'xls', 'xlt', 'xla', 'ppt',
      'wps', 'wpt', 'et', 'ett', 'dps', 'ott', 'otp',
      'vsd', 'wmf', 'emf',
    ],
    mimeTypes: [
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'application/vnd.ms-works',
    ],
    load: async () => {
      const office = await import('./index')
      return office.createLegacyOfficeAdapter(options)
    },
  }
}

export const legacyOfficeAdapterManifest = createLegacyOfficeAdapterManifest()
