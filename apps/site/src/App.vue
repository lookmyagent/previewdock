<script setup lang="ts">
import { computed, ref } from 'vue'
import { getLocalizedPath, getSiteLocale, setSiteLocale, type SiteLocale, SiteFooter, SiteHeader } from '@previewdock/site-shell'
import '@previewdock/site-shell/style.css'
import { projectLinks } from '../../../config/project'
import previewWorkbenchZh from './assets/preview-workbench-zh.webp'
import previewWorkbenchEn from './assets/preview-workbench-en.webp'
import previewCore from './assets/preview-core.webp'

const locale = ref<SiteLocale>(getSiteLocale())
const heroElement = ref<HTMLElement>()
const docsUrl = computed(() => getLocalizedPath(projectLinks.docs, locale.value))
const playgroundUrl = computed(() => getLocalizedPath(projectLinks.playground, locale.value))
const previewWorkbench = computed(() => locale.value === 'en' ? previewWorkbenchEn : previewWorkbenchZh)
const docsPage = (page: string) => locale.value === 'en' ? docsUrl.value : `${projectLinks.docs}${page}`

function changeLocale(nextLocale: SiteLocale) {
  locale.value = nextLocale
  setSiteLocale(nextLocale)
}

function moveHero(event: PointerEvent) {
  if (!heroElement.value || event.pointerType === 'touch') return
  const rect = heroElement.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width - .5) * 2
  const y = ((event.clientY - rect.top) / rect.height - .5) * 2
  heroElement.value.style.setProperty('--pointer-x', x.toFixed(3))
  heroElement.value.style.setProperty('--pointer-y', y.toFixed(3))
}

function resetHero() {
  heroElement.value?.style.setProperty('--pointer-x', '0')
  heroElement.value?.style.setProperty('--pointer-y', '0')
}

const copy = computed(() => locale.value === 'en' ? {
  heroTitle: 'One component.', heroAccent: 'Preview almost any file on demand.',
  heroDescription: 'A browser-native, local-first file preview runtime for modern web applications. Office, PDF, archives, images, media, and 3D share one lightweight lifecycle.',
  openPlayground: 'Open a file', readDocs: 'Read integration docs',
  previewFile: 'product-brief.docx', previewTitle: 'Product brief', previewInspector: 'Document info', rendered: 'Rendered locally', adapterDock: 'Format capabilities',
  capabilityTitle: 'Designed for real products', capabilityDescription: 'One local-first runtime and seven product-facing format categories, ready to grow with your application.',
  capabilities: [
    { key: 'LOCAL', title: 'Files stay local', text: 'Detection and rendering happen in the browser by default. Remote processing is an explicit host choice.' },
    { key: 'LAZY', title: 'Open only what is needed', text: 'Document, archive, media, and model capabilities are activated only when the user opens that type of file.' },
    { key: 'PACK', title: 'Two clear integration modes', text: 'Choose the complete All preset or compose only the seven categories your product exposes.' },
  ],
  architectureTitle: 'Three steps from selection to preview', architectureDescription: 'Choose the coverage, connect the component, and give users one consistent preview experience.', architectureLink: 'View product usage',
  steps: [
    { no: '01', title: 'Choose coverage', text: 'Use All mode or select business categories', marks: ['ALL', 'DOC', 'IMG', '3D'] },
    { no: '02', title: 'Connect PreviewDock', text: 'Pass a local file, binary data, or an authorized URL', marks: ['VUE'] },
    { no: '03', title: 'Open and preview', text: 'Use one consistent interface across file families', marks: ['Docs', 'Images', 'Media', 'Models'] },
  ],
  formatTitle: 'Seven categories. One predictable runtime.', formatDescription: 'See the actual document, data, archive, image, media, diagram, and model types available to your product.', formatLink: 'View category and format details',
  integrationTitle: 'Choose All mode or category mode', integrationDescription: 'Both modes use the same Vue component and lazy-loading engine. The difference is whether all categories or only selected categories are installed.',
  modes: [
    { key: 'ALL', title: 'All mode', text: 'The fastest path for file centers and general-purpose preview.', install: 'pnpm add vue @previewdock/vue @previewdock/preset-all', importLine: "import { createAllFormatEngine } from '@previewdock/preset-all'", engineLine: 'const engine = createAllFormatEngine()', recommended: 'Recommended' },
    { key: 'CAT', title: 'Category mode', text: 'Install only the categories your business exposes.', install: 'pnpm add vue @previewdock/vue @previewdock/core @previewdock/preset-documents @previewdock/preset-images', importLine: "import { createViewerEngine } from '@previewdock/core'\nimport { documentsPack } from '@previewdock/preset-documents'\nimport { imagesPack } from '@previewdock/preset-images'", engineLine: 'const engine = createViewerEngine([documentsPack, imagesPack])', recommended: '' },
  ],
  integrationLink: 'Compare integration profiles', closingTitle: 'Give file preview to one composable runtime.', closingDescription: 'Validate PreviewDock with your real files before integrating.', viewSource: 'View GitHub source',
} : {
  heroTitle: '一个组件，', heroAccent: '按需预览各种文件。',
  heroDescription: '面向现代 Web 应用的本地优先文件预览运行时。Office、PDF、压缩包、图片、音视频与 3D 模型，共用一套轻量生命周期。',
  openPlayground: '在线打开文件', readDocs: '阅读接入文档',
  previewFile: '产品设计方案.docx', previewTitle: '产品设计方案', previewInspector: '文档信息', rendered: '已在本地渲染', adapterDock: '格式能力',
  capabilityTitle: '为真正的业务系统设计', capabilityDescription: '一套本地优先运行时、七个业务格式类别，可以随着应用持续扩展。',
  capabilities: [
    { key: 'LOCAL', title: '文件留在本地', text: '默认在浏览器内检测与渲染，远程处理必须由业务明确启用。' },
    { key: 'LAZY', title: '用到时再打开', text: '文档、压缩包、音视频和模型能力，只在用户打开对应文件时启用。' },
    { key: 'PACK', title: '两种清晰接入模式', text: '选择完整 All 预设，或只组合业务开放的七大格式类别。' },
  ],
  architectureTitle: '从选择到预览，只需三步', architectureDescription: '选择覆盖范围、接入统一组件，然后为用户提供一致的文件预览体验。', architectureLink: '查看产品使用方式',
  steps: [
    { no: '01', title: '选择覆盖范围', text: '使用 All 模式，或选择业务需要的类别', marks: ['ALL', 'DOC', 'IMG', '3D'] },
    { no: '02', title: '接入 PreviewDock', text: '传入本地文件、二进制数据或授权 URL', marks: ['VUE'] },
    { no: '03', title: '打开并预览', text: '不同文件类型使用一致的操作界面', marks: ['文档', '图片', '媒体', '模型'] },
  ],
  formatTitle: '七大类别，一套统一运行时', formatDescription: '详细查看系统可提供的办公文档、数据、压缩包、图片、音视频、图表和模型类型。', formatLink: '查看分类与格式详情',
  integrationTitle: '选择 All 模式或分类模式', integrationDescription: '两种模式使用相同的 Vue 组件和按需加载引擎；区别只在于安装全部类别，还是只安装选中的类别。',
  modes: [
    { key: 'ALL', title: 'All 模式', text: '适合文件中心和通用预览，接入路径最短。', install: 'pnpm add vue @previewdock/vue @previewdock/preset-all', importLine: "import { createAllFormatEngine } from '@previewdock/preset-all'", engineLine: 'const engine = createAllFormatEngine()', recommended: '推荐' },
    { key: 'CAT', title: '分类模式', text: '只安装业务实际开放的格式类别。', install: 'pnpm add vue @previewdock/vue @previewdock/core @previewdock/preset-documents @previewdock/preset-images', importLine: "import { createViewerEngine } from '@previewdock/core'\nimport { documentsPack } from '@previewdock/preset-documents'\nimport { imagesPack } from '@previewdock/preset-images'", engineLine: 'const engine = createViewerEngine([documentsPack, imagesPack])', recommended: '' },
  ],
  integrationLink: '比较全部接入方案', closingTitle: '把文件预览能力，交给一个可组合的运行时。', closingDescription: '先用真实文件验证 PreviewDock，再开始接入。', viewSource: '查看 GitHub 源码',
})

const primaryCapability = computed(() => copy.value.capabilities[0]!)
const secondaryCapabilities = computed(() => copy.value.capabilities.slice(1))

const formats = computed(() => locale.value === 'en' ? [
  { kind: 'documents', title: 'Office & Documents', lines: ['Word  DOC · DOCX · DOCM', 'Excel  XLS · XLSX · XLSM', 'Slides  PPT · PPTX · PPTM', 'PDF · ODF · OFD · RTF · EPUB'], package: '@previewdock/preset-documents', tone: 'blue' },
  { kind: 'text', title: 'Text & Data', lines: ['TXT · MD · LOG · Source', 'CSV · TSV · JSON · XML'], package: '@previewdock/preset-text-data', tone: 'cyan' },
  { kind: 'archives', title: 'Archives', lines: ['ZIP · JAR · TAR · GZIP', 'TGZ · RAR · 7Z', 'ZIP/JAR up to 1 GB · others 100 MB'], package: '@previewdock/preset-archives', tone: 'green' },
  { kind: 'images', title: 'Images', lines: ['PNG · JPEG · GIF · WebP · SVG', 'BMP · ICO · TIFF · TGA · PSD'], package: '@previewdock/preset-images', tone: 'pink' },
  { kind: 'media', title: 'Media', lines: ['MP3 · WAV · OGG · AAC · FLAC', 'MP4 · WebM · MOV · M4V'], package: '@previewdock/preset-media', tone: 'violet' },
  { kind: 'diagrams', title: 'Diagrams', lines: ['BPMN · XMind · VSD · VSDX', 'WMF · EMF'], package: '@previewdock/preset-diagrams', tone: 'amber' },
  { kind: '3d', title: '3D & CAD', lines: ['GLB · OBJ · STL · FBX · 3MF', 'DXF · STEP · IGES · 3DM · IFC'], package: '@previewdock/preset-3d-cad', tone: 'blue' },
] : [
  { kind: 'documents', title: 'Office 与文档', lines: ['Word  DOC · DOCX · DOCM', 'Excel  XLS · XLSX · XLSM', '演示  PPT · PPTX · PPTM', 'PDF · ODF · OFD · RTF · EPUB'], package: '@previewdock/preset-documents', tone: 'blue' },
  { kind: 'text', title: '文本与数据', lines: ['TXT · MD · LOG · 各类源码', 'CSV · TSV · JSON · XML'], package: '@previewdock/preset-text-data', tone: 'cyan' },
  { kind: 'archives', title: '压缩包', lines: ['ZIP · JAR · TAR · GZIP', 'TGZ · RAR · 7Z', 'ZIP/JAR 最大 1 GB · 其他 100 MB'], package: '@previewdock/preset-archives', tone: 'green' },
  { kind: 'images', title: '图片', lines: ['PNG · JPEG · GIF · WebP · SVG', 'BMP · ICO · TIFF · TGA · PSD'], package: '@previewdock/preset-images', tone: 'pink' },
  { kind: 'media', title: '音视频', lines: ['MP3 · WAV · OGG · AAC · FLAC', 'MP4 · WebM · MOV · M4V'], package: '@previewdock/preset-media', tone: 'violet' },
  { kind: 'diagrams', title: '图表与流程图', lines: ['BPMN · XMind · VSD · VSDX', 'WMF · EMF'], package: '@previewdock/preset-diagrams', tone: 'amber' },
  { kind: '3d', title: '3D 与 CAD', lines: ['GLB · OBJ · STL · FBX · 3MF', 'DXF · STEP · IGES · 3DM · IFC'], package: '@previewdock/preset-3d-cad', tone: 'blue' },
])
</script>

<template>
  <div class="site-shell site-shell--dark">
    <SiteHeader active="home" :links="projectLinks" :locale="locale" @change-locale="changeLocale" />

    <main>
      <section ref="heroElement" class="hero" :class="{ 'hero--en': locale === 'en' }" @pointermove="moveHero" @pointerleave="resetHero">
        <div class="hero-glow hero-glow--blue"></div>
        <div class="hero-glow hero-glow--violet"></div>
        <div class="hero-copy">
          <h1>{{ copy.heroTitle }}<span v-if="locale === 'en'">&nbsp;</span><em>{{ copy.heroAccent }}</em></h1>
          <p>{{ copy.heroDescription }}</p>
          <div class="hero-actions">
            <a class="button button-primary" :href="playgroundUrl">{{ copy.openPlayground }}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4"/></svg></a>
            <a class="button button-secondary" :href="docsUrl">{{ copy.readDocs }}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4h5a3 3 0 0 1 3 3v9a3 3 0 0 0-3-3H4zm12 0h-1a3 3 0 0 0-3 3v9a3 3 0 0 1 3-3h1z"/></svg></a>
          </div>
        </div>

        <div class="hero-visual" :aria-label="locale === 'en' ? 'PreviewDock multi-format preview workbench' : 'PreviewDock 多格式预览工作台'">
          <div class="hero-product-aura"></div>
          <img class="hero-product" :src="previewWorkbench" width="1536" height="1024" :alt="locale === 'en' ? 'PreviewDock preview workbench supporting DOCX, XLSX, BPMN and 3D files' : 'PreviewDock 支持 DOCX、XLSX、BPMN 与 3D 文件的预览工作台'">
        </div>
      </section>

      <section id="capabilities" class="section panel-section capability-section">
        <div class="section-heading"><h2>{{ copy.capabilityTitle }}</h2><p>{{ copy.capabilityDescription }}</p></div>
        <div class="capability-rail">
          <article class="capability-item capability-item--left"><span class="capability-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.8 6v5.5c0 4.5 2.8 7.8 7.2 9.5 4.4-1.7 7.2-5 7.2-9.5V6L12 3Z"/><rect x="8.5" y="10.5" width="7" height="5.5" rx="1.2"/><path d="M10.2 10.5V9.2a1.8 1.8 0 0 1 3.6 0v1.3"/></svg></span><div><small>{{ primaryCapability.key }}</small><h3>{{ primaryCapability.title }}</h3><p>{{ primaryCapability.text }}</p></div></article>
          <div class="core-visual"><img :src="previewCore" width="1254" height="1254" alt="PreviewDock Core"><strong>PreviewDock Core</strong></div>
          <div class="capability-stack">
            <article v-for="item in secondaryCapabilities" :key="item.key" class="capability-item"><span class="capability-icon"><svg v-if="item.key === 'LAZY'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg><svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 3.5h4v4a2 2 0 1 0 4 0v-4h4v5h-3a2 2 0 1 0 0 4h3v8h-8v-3a2 2 0 1 0-4 0v3h-5v-8h3a2 2 0 1 0 0-4h-3v-5h5Z"/></svg></span><div><small>{{ item.key }}</small><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article>
          </div>
        </div>
      </section>

      <section class="section panel-section workflow-section">
        <div class="section-heading"><h2>{{ copy.architectureTitle }}</h2><p>{{ copy.architectureDescription }}</p></div>
        <ol class="workflow">
          <li v-for="(step, index) in copy.steps" :key="step.no" :class="{ 'is-core': index === 1, 'is-matched': index === 2 }">
            <header><b>{{ step.no }}</b><strong>{{ step.title }}</strong></header>
            <p>{{ step.text }}</p>
            <div class="workflow-marks"><span v-for="mark in step.marks" :key="mark">{{ mark }}</span></div>
          </li>
        </ol>
        <a class="text-link" :href="docsPage('getting-started')">{{ copy.architectureLink }}<span>→</span></a>
      </section>

      <section id="formats" class="section panel-section format-section">
        <div class="section-heading section-heading--split"><div><h2>{{ copy.formatTitle }}</h2><p>{{ copy.formatDescription }}</p></div><a class="text-link" :href="docsPage('format-support')">{{ copy.formatLink }}<span>→</span></a></div>
        <div class="format-atlas">
          <article v-for="format in formats" :key="format.kind" :data-tone="format.tone">
            <span>
              <b v-if="format.kind === 'text'">{ }</b>
              <svg v-else-if="format.kind === 'media'" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="m13 10 9 6-9 6Z"/></svg>
              <svg v-else-if="format.kind === '3d'" viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 11 6.5v13L16 29 5 22.5v-13L16 3Z"/><path d="m5 9.5 11 6.3 11-6.3M16 15.8V29"/></svg>
              <svg v-else-if="format.kind === 'images'" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="5" width="24" height="22" rx="2"/><circle cx="11" cy="12" r="2"/><path d="m6 24 7-7 4 4 3-3 6 6"/></svg>
              <svg v-else-if="format.kind === 'archives'" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3h13l5 5v21H7Z"/><path d="M20 3v6h5M15 5h4m-4 4h4m-4 4h4m-4 4h4m-4 4h4"/></svg>
              <svg v-else-if="format.kind === 'diagrams'" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="5" width="9" height="7" rx="1"/><rect x="19" y="20" width="9" height="7" rx="1"/><path d="M13 8.5h7a4 4 0 0 1 4 4V20M8.5 12v8h10"/></svg>
              <svg v-else viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3h13l5 5v21H7Z"/><path d="M20 3v6h5M11 14h10M11 19h10M11 24h7"/></svg>
            </span>
            <h3>{{ format.title }}</h3><p><span v-for="line in format.lines" :key="line">{{ line }}</span></p><code>{{ format.package }}</code>
          </article>
        </div>
      </section>

      <section class="section panel-section integration-section">
        <div class="section-heading"><h2>{{ copy.integrationTitle }}</h2><p>{{ copy.integrationDescription }}</p></div>
        <div class="integration-modes">
          <article v-for="mode in copy.modes" :key="mode.key" class="integration-mode" :class="{ 'integration-mode--primary': mode.key === 'ALL' }">
            <header><span>{{ mode.key }}</span><div><h3>{{ mode.title }}</h3><p>{{ mode.text }}</p></div><small v-if="mode.recommended">{{ mode.recommended }}</small></header>
            <code class="install-command">{{ mode.install }}</code>
            <pre><span>{{ mode.importLine }}</span>
{{ mode.engineLine }}</pre>
          </article>
        </div>
        <a class="text-link" :href="docsPage('modular-integration')">{{ copy.integrationLink }}<span>→</span></a>
      </section>

      <section class="closing">
        <div class="closing-lines"></div>
        <h2>{{ copy.closingTitle }}</h2><p>{{ copy.closingDescription }}</p>
        <div><a class="button button-primary" :href="playgroundUrl">{{ copy.openPlayground }}</a><a class="button button-secondary" :href="projectLinks.github" target="_blank" rel="noreferrer">{{ copy.viewSource }}</a></div>
      </section>
    </main>

    <SiteFooter :links="projectLinks" :locale="locale" />
  </div>
</template>
