import { describe, expect, it } from 'vitest'
import { formatCategories, getFormatDefinition, supportedFormats } from './formats'

describe('format catalog', () => {
  it('contains seven categories and unique extensions', () => {
    expect(formatCategories).toHaveLength(7)
    const extensions = supportedFormats.map(format => format.extension)
    expect(new Set(extensions).size).toBe(extensions.length)
  })

  it('preserves PreviewDock formats and benchmark gaps', () => {
    for (const extension of [
      'wps', 'bpmn', 'vsdx', 'wmf', 'emf',
      'xlsb', 'numbers', 'typst', 'msg', 'mbox',
      'zipx', 'zst', 'heic', 'jxl', 'm3u8',
      'drawio', 'geojson', 'dwg', 'usdz', 'parquet',
    ]) {
      expect(getFormatDefinition(extension), extension).toBeDefined()
    }
  })

  it('covers the complete benchmark extension matrix', () => {
    const benchmarkExtensions = `
      zip zipx 7z rar tar gz gzip tgz bz2 bzip2 tbz tbz2 xz txz lzma zst tzst cab ar cpio iso xar lha lzh jar war ear apk cbz cbr
      glb gltf obj stl ply fbx dae 3ds 3mf amf usd usda usdc usdz kmz step stp iges igs ifc 3dm brep pcd wrl vrml xyz vtk vtp
      txt json js mjs cjs css java py html htm jsx ts tsx xml log vue yaml yml ini sh bash sql go rs php c cpp cc h hpp cs diff patch bundle bdl jsonc json5 ipynb toml proto hcl tex gv http react rb swift kt
      gif jpg jpeg bmp tiff tif png svg webp avif ico heic heif jxl
      doc docx docm dot dotx dotm ppt pptx pptm potx potm ppsx ppsm rtf odt odp xlsx xltx xlsm xlsb xls xlt xltm csv tsv ods fods numbers
      pdf ofd typ typst eml msg mbox olb dra gds oas oasis dxf dwg dwf dwfx xps geojson kml gpx shp excalidraw drawio dio mermaid mmd plantuml puml xmind epub umd md markdown
      mp4 webm m3u8 mp3 mpeg wav ogg oga opus m4a aac flac weba midi mid
      ttf otf woff woff2 psd ai eps sqlite wasm parquet avro webarchive
    `.trim().split(/\s+/)

    for (const extension of benchmarkExtensions) {
      expect(getFormatDefinition(extension), extension).toBeDefined()
    }
  })

  it('records MIME, adapter, resources and preview fidelity for every extension', () => {
    for (const format of supportedFormats) {
      expect(format.mimeTypes.length, format.extension).toBeGreaterThan(0)
      expect(format.adapter, format.extension).toMatch(/^@previewdock\/adapter-/)
      expect(Array.isArray(format.resources), format.extension).toBe(true)
      expect(['standard', 'structural'], format.extension).toContain(format.fidelity)
    }
  })
})
