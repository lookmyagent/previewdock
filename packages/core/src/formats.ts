export type FormatCategoryId =
  | 'documents'
  | 'text-data'
  | 'archives'
  | 'images'
  | 'media'
  | 'diagrams'
  | '3d-cad'

export type FormatFidelity = 'standard' | 'structural'
export type FormatRuntimeResource = 'worker' | 'wasm' | 'font' | 'vendor'

export interface FormatDefinition {
  extension: string
  mimeTypes: readonly string[]
  category: FormatCategoryId
  family: string
  adapter: string
  resources: readonly FormatRuntimeResource[]
  fidelity: FormatFidelity
}

export interface FormatCategory {
  id: FormatCategoryId
  label: string
  labelZh: string
  families: readonly {
    id: string
    label: string
    labelZh: string
    fidelity: FormatFidelity
    extensions: readonly string[]
  }[]
}

const family = (
  id: string,
  label: string,
  labelZh: string,
  extensions: string,
  fidelity: FormatFidelity = 'standard',
) => ({
  id,
  label,
  labelZh,
  fidelity,
  extensions: extensions.trim().split(/\s+/),
})

const mimeTypes: Readonly<Record<string, readonly string[]>> = {
  pdf: ['application/pdf'],
  ofd: ['application/ofd'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  odt: ['application/vnd.oasis.opendocument.text'],
  ods: ['application/vnd.oasis.opendocument.spreadsheet'],
  odp: ['application/vnd.oasis.opendocument.presentation'],
  rtf: ['application/rtf'],
  epub: ['application/epub+zip'],
  eml: ['message/rfc822'],
  txt: ['text/plain'],
  md: ['text/markdown'],
  markdown: ['text/markdown'],
  html: ['text/html'],
  htm: ['text/html'],
  xml: ['application/xml', 'text/xml'],
  csv: ['text/csv'],
  tsv: ['text/tab-separated-values'],
  json: ['application/json'],
  jsonc: ['application/json'],
  json5: ['application/json5'],
  yaml: ['application/yaml', 'text/yaml'],
  yml: ['application/yaml', 'text/yaml'],
  wasm: ['application/wasm'],
  sqlite: ['application/vnd.sqlite3'],
  parquet: ['application/vnd.apache.parquet'],
  zip: ['application/zip'],
  '7z': ['application/x-7z-compressed'],
  rar: ['application/vnd.rar'],
  tar: ['application/x-tar'],
  gz: ['application/gzip'],
  gzip: ['application/gzip'],
  bz2: ['application/x-bzip2'],
  xz: ['application/x-xz'],
  zst: ['application/zstd'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  jfif: ['image/jpeg'],
  gif: ['image/gif'],
  bmp: ['image/bmp'],
  webp: ['image/webp'],
  avif: ['image/avif'],
  svg: ['image/svg+xml'],
  tif: ['image/tiff'],
  tiff: ['image/tiff'],
  heic: ['image/heic'],
  heif: ['image/heif'],
  mp3: ['audio/mpeg'],
  mpeg: ['audio/mpeg', 'video/mpeg'],
  wav: ['audio/wav'],
  ogg: ['audio/ogg'],
  mp4: ['video/mp4'],
  webm: ['video/webm'],
  m3u8: ['application/vnd.apple.mpegurl', 'application/x-mpegurl'],
  midi: ['audio/midi'],
  mid: ['audio/midi'],
  glb: ['model/gltf-binary'],
  gltf: ['model/gltf+json'],
  obj: ['model/obj'],
  stl: ['model/stl'],
  step: ['model/step'],
  stp: ['model/step'],
  ifc: ['model/ifc'],
  geojson: ['application/geo+json'],
  kml: ['application/vnd.google-earth.kml+xml'],
  gpx: ['application/gpx+xml'],
  woff: ['font/woff'],
  woff2: ['font/woff2'],
  ttf: ['font/ttf'],
  otf: ['font/otf'],
}

function adapterFor(
  category: FormatCategoryId,
  familyId: string,
  fidelity: FormatFidelity,
  extension: string,
): string {
  if (familyId === 'modern-image' || familyId === 'design-raster') {
    return '@previewdock/adapter-advanced-image'
  }
  if (extension === 'svg') return '@previewdock/adapter-image'
  if (['wmf', 'emf', 'vsd'].includes(extension)) return '@previewdock/adapter-legacy-office'
  if (fidelity === 'structural') return '@previewdock/adapter-inspector'
  if (category === 'archives') return '@previewdock/adapter-archive'
  if (category === 'media') return '@previewdock/adapter-media'
  if (category === 'images') return '@previewdock/adapter-image'
  if (category === 'text-data') return '@previewdock/adapter-text'
  if (category === '3d-cad') return '@previewdock/adapter-3d'
  if (category === 'diagrams') return '@previewdock/adapter-structured'
  if (familyId === 'fixed-document') return '@previewdock/adapter-pdf'
  if (familyId === 'word' || familyId === 'spreadsheet' || familyId === 'presentation') {
    return '@previewdock/adapter-openxml'
  }
  return '@previewdock/adapter-structured'
}

function resourcesFor(adapter: string, extension: string): readonly FormatRuntimeResource[] {
  if (adapter === '@previewdock/adapter-archive') return ['worker', 'wasm']
  if (adapter === '@previewdock/adapter-3d') {
    return ['step', 'stp', 'iges', 'igs', 'brep', 'ifc', '3dm'].includes(extension)
      ? ['worker', 'wasm', 'vendor']
      : ['vendor']
  }
  if (adapter === '@previewdock/adapter-pdf') return ['worker', 'font']
  if (adapter === '@previewdock/adapter-openxml') return ['worker', 'wasm', 'font']
  return []
}

/**
 * Product-level format catalog. Presets, documentation and demos consume this
 * catalog so extension claims cannot drift between surfaces.
 */
export const formatCategories: readonly FormatCategory[] = [
  {
    id: 'documents',
    label: 'Office & Documents',
    labelZh: '办公与文档',
    families: [
      family('word', 'Word documents', '文字文档', 'doc docx docm dot dotx dotm wps wpt rtf odt ott fodt'),
      family('spreadsheet', 'Spreadsheets', '电子表格', 'xls xlsx xlsm xlsb xlt xltx xltm xla xlam et ett ods ots fods numbers'),
      family('presentation', 'Presentations', '演示文稿', 'ppt pptx pptm potx potm ppsx ppsm dps odp otp'),
      family('fixed-document', 'Fixed-layout documents', '版式文档', 'pdf ofd typ typst'),
      family('email', 'Email', '邮件', 'eml msg mbox', 'structural'),
      family('ebook', 'E-books', '电子书', 'epub umd', 'structural'),
    ],
  },
  {
    id: 'text-data',
    label: 'Text & Data',
    labelZh: '文本与数据',
    families: [
      family('plain-text', 'Text & markup', '文本与标记', 'txt md markdown log html htm xml csv tsv'),
      family(
        'source-code',
        'Source code',
        '源代码',
        'js mjs cjs jsx ts tsx vue react css java py php c cpp cc h hpp cs go rs rb swift kt sh bash sql',
      ),
      family(
        'config',
        'Configuration & exchange',
        '配置与交换',
        'json jsonc json5 yaml yml ini toml proto hcl tex gv http diff patch properties cfg conf',
      ),
      family('notebook-bundle', 'Notebooks & bundles', '笔记本与代码包', 'ipynb bundle bdl'),
      family('database', 'Databases & columnar data', '数据库与列式数据', 'sqlite parquet avro', 'structural'),
      family('runtime-data', 'Runtime & web archives', '运行时与网页归档', 'wasm webarchive', 'structural'),
    ],
  },
  {
    id: 'archives',
    label: 'Archives',
    labelZh: '压缩包',
    families: [
      family('zip', 'ZIP containers', 'ZIP 容器', 'zip zipx jar war ear apk cbz'),
      family('tar', 'TAR & streams', 'TAR 与流压缩', 'tar gz gzip tgz bz2 bzip2 tbz tbz2 xz txz lzma zst tzst'),
      family('general-archive', 'General archives', '通用压缩格式', '7z rar cbr cab ar cpio iso xar lha lzh'),
    ],
  },
  {
    id: 'images',
    label: 'Images & Design',
    labelZh: '图片与设计',
    families: [
      family('raster', 'Raster images', '位图', 'png jpg jpeg jfif gif bmp webp avif ico tif tiff tga'),
      family('modern-image', 'Modern image codecs', '现代图片编码', 'heic heif'),
      family('jpeg-xl', 'JPEG XL', 'JPEG XL', 'jxl', 'structural'),
      family('vector', 'Vector images', '矢量图片', 'svg wmf emf'),
      family('design-raster', 'Layered design files', '分层设计文件', 'psd'),
      family('design-source', 'Design source files', '设计源文件', 'ai eps', 'structural'),
      family('font', 'Fonts', '字体', 'ttf otf woff woff2', 'structural'),
    ],
  },
  {
    id: 'media',
    label: 'Media',
    labelZh: '音视频',
    families: [
      family('audio', 'Audio', '音频', 'mp3 mpeg wav ogg oga opus m4a aac flac weba'),
      family('midi', 'MIDI', 'MIDI 音乐', 'midi mid', 'structural'),
      family('video', 'Video', '视频', 'mp4 webm ogv mov m4v'),
      family('stream', 'Streaming media', '流媒体', 'm3u8'),
    ],
  },
  {
    id: 'diagrams',
    label: 'Diagrams & Engineering',
    labelZh: '图表与工程',
    families: [
      family('business-diagram', 'Business diagrams', '业务图表', 'bpmn xmind vsd vsdx'),
      family('drawing', 'Drawing languages', '绘图语言', 'excalidraw drawio dio mermaid mmd plantuml puml', 'structural'),
      family('geo', 'Geospatial', '地理空间', 'geojson kml gpx shp', 'structural'),
      family('eda', 'EDA layouts', '电子设计', 'olb dra gds oas oasis', 'structural'),
    ],
  },
  {
    id: '3d-cad',
    label: '3D & CAD',
    labelZh: '三维与 CAD',
    families: [
      family('cad', '2D CAD', '二维 CAD', 'dxf dwg dwf dwfx xps', 'structural'),
      family('mesh', 'Meshes & scenes', '网格与场景', 'glb gltf obj stl ply fbx dae 3ds 3mf amf kmz'),
      family('usd', 'Universal Scene Description', '通用场景描述', 'usd usda usdc', 'structural'),
      family('usdz', 'Packaged USD', 'USDZ 场景', 'usdz'),
      family('point-science', 'Point clouds & scientific models', '点云与科学模型', 'pcd xyz vtk vtp'),
      family('engineering-model', 'Engineering models', '工程模型', 'step stp iges igs ifc 3dm brep'),
      family('legacy-3d', 'Legacy 3D', '传统三维格式', 'wrl vrml off'),
    ],
  },
] as const

export const supportedFormats: readonly FormatDefinition[] = Object.freeze(
  formatCategories.flatMap(category =>
    category.families.flatMap(item =>
      item.extensions.map(extension => ({
        extension,
        mimeTypes: mimeTypes[extension] || ['application/octet-stream'],
        category: category.id,
        family: item.id,
        adapter: adapterFor(category.id, item.id, item.fidelity, extension),
        resources: resourcesFor(
          adapterFor(category.id, item.id, item.fidelity, extension),
          extension,
        ),
        fidelity: item.fidelity,
      })),
    ),
  ),
)

const formatByExtension = new Map(supportedFormats.map(format => [format.extension, format]))

export function getFormatDefinition(extension: string): FormatDefinition | undefined {
  return formatByExtension.get(extension.trim().toLowerCase().replace(/^\./, ''))
}

export function getCategoryExtensions(category: FormatCategoryId): readonly string[] {
  return supportedFormats
    .filter(format => format.category === category)
    .map(format => format.extension)
}
