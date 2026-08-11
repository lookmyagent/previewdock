import { createAllFormatEngine } from '@previewdock/preset-all'

let converterPromise: Promise<Awaited<ReturnType<typeof createLegacyConverter>>> | undefined

async function createLegacyConverter() {
  const [{ createZetaOfficeConverter }, { default: zetaJsUrl }] = await Promise.all([
    import('@previewdock/converter-zetaoffice'),
    import('zetajs/zeta.js?url'),
  ])
  return createZetaOfficeConverter({ wasmPackage: 'free', zetaJsUrl })
}

export const previewEngine = createAllFormatEngine({
  assetBaseUrl: `${import.meta.env.BASE_URL}previewdock/`,
  legacyOffice: {
    converter: {
      id: 'zetaoffice-wasm',
      async convert(request) {
        converterPromise ||= createLegacyConverter()
        return (await converterPromise).convert(request)
      },
    },
  },
})
