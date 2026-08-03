import type { AdapterRegistration } from '@previewdock/core'
import type { LegacyOfficeAdapterOptions } from './index'

const officeExtensions = [
  'doc', 'dot', 'xls', 'xlt', 'xla', 'ppt',
  'wps', 'wpt', 'et', 'ett', 'dps', 'ott', 'otp',
]

const officeMimeTypes = [
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-works',
]

const diagramExtensions = ['vsd', 'wmf', 'emf']

function createLegacyManifest(
  id: string,
  extensions: string[],
  mimeTypes: string[],
  options: LegacyOfficeAdapterOptions,
): AdapterRegistration {
  return {
    id,
    priority: 15,
    extensions,
    mimeTypes,
    load: async () => {
      const office = await import('./index')
      return office.createLegacyOfficeAdapter(options)
    },
  }
}

export function createLegacyOfficeDocumentAdapterManifest(
  options: LegacyOfficeAdapterOptions = {},
): AdapterRegistration {
  return createLegacyManifest('legacy-office', officeExtensions, officeMimeTypes, options)
}

export function createLegacyDiagramAdapterManifest(
  options: LegacyOfficeAdapterOptions = {},
): AdapterRegistration {
  return createLegacyManifest(
    'legacy-diagrams',
    diagramExtensions,
    ['application/vnd.visio'],
    options,
  )
}

export function createLegacyOfficeAdapterManifest(
  options: LegacyOfficeAdapterOptions = {},
): AdapterRegistration {
  return createLegacyManifest(
    'legacy-office',
    [...officeExtensions, ...diagramExtensions],
    [...officeMimeTypes, 'application/vnd.visio'],
    options,
  )
}

export const legacyOfficeAdapterManifest = createLegacyOfficeAdapterManifest()
