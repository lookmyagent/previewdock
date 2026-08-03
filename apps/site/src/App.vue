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
  previewFile: 'product-brief.docx', previewTitle: 'Product brief', previewInspector: 'Document info', rendered: 'Rendered locally', adapterDock: 'Adapters · lazy loaded',
  capabilityTitle: 'Designed for real products', capabilityDescription: 'Keep the core small and stable; deliver complex formats as independent capability packs.',
  capabilities: [
    { key: 'LOCAL', title: 'Files stay local', text: 'Detection and rendering happen in the browser by default. Remote processing is an explicit host choice.' },
    { key: 'LAZY', title: 'Load on match', text: 'Lightweight manifests route files first, so Office, 3D, and WASM stay out of unrelated first loads.' },
    { key: 'PACK', title: 'Compose capabilities', text: 'Install Basic, Office, Archive, Media, and 3D packs according to the product scenario.' },
  ],
  architectureTitle: 'Detect, route, and load on demand', architectureDescription: 'Opening a text file does not download Office, archive, CAD, or media engines.', architectureLink: 'Explore the architecture',
  steps: [
    { no: '01', title: 'File / Blob / URL', text: 'Read the name, MIME, and signature bytes', marks: ['TXT', 'PDF', 'IMG', '</>'] },
    { no: '02', title: 'Core detect & route', text: 'A lightweight manifest resolves the route', marks: ['CORE'] },
    { no: '03', title: 'Matched adapter', text: 'Only the selected renderer is loaded', marks: ['Basic', 'Office', 'Archive', 'Media', '3D'] },
  ],
  formatTitle: 'From documents to 3D models', formatDescription: 'Support levels and limitations stay explicit; recognizing an extension is not a promise of full fidelity.', formatLink: 'View the complete format matrix',
  integrationTitle: 'All formats in one preset. Heavy parsers still load on demand.', integrationDescription: 'Use the official preset for the shortest setup, or install individual adapters when bundle policy requires tighter control.',
  modules: [
    { key: 'ALL', title: 'Official all-format preset', text: 'Registers every maintained adapter with lazy loading', command: '@previewdock/preset-all' },
    { key: 'V', title: 'Vue host', text: 'The unified preview component', command: '@previewdock/vue' },
    { key: 'M', title: 'Modular option', text: 'Install individual adapters for strict package budgets', command: '@previewdock/adapter-text' },
  ],
  integrationLink: 'Compare integration profiles', closingTitle: 'Give file preview to one composable runtime.', closingDescription: 'Validate PreviewDock with your real files before integrating.', viewSource: 'View GitHub source',
} : {
  heroTitle: '一个组件，', heroAccent: '按需预览各种文件。',
  heroDescription: '面向现代 Web 应用的本地优先文件预览运行时。Office、PDF、压缩包、图片、音视频与 3D 模型，共用一套轻量生命周期。',
  openPlayground: '在线打开文件', readDocs: '阅读接入文档',
  previewFile: '产品设计方案.docx', previewTitle: '产品设计方案', previewInspector: '文档信息', rendered: '已在本地渲染', adapterDock: '适配器 · 按需加载',
  capabilityTitle: '为真正的业务系统设计', capabilityDescription: '核心保持小而稳定，复杂格式以独立能力包到达。',
  capabilities: [
    { key: 'LOCAL', title: '文件留在本地', text: '默认在浏览器内检测与渲染，远程处理必须由业务明确启用。' },
    { key: 'LAZY', title: '命中格式再加载', text: '轻量 manifest 先完成路由，Office、3D 与 WASM 不进入无关首屏。' },
    { key: 'PACK', title: '能力自由组合', text: 'Basic、Office、Archive、Media、3D 等能力包按系统需求安装。' },
  ],
  architectureTitle: '识别、路由、按需加载', architectureDescription: '打开一个文本文件，不会下载 Office、归档、CAD 或媒体引擎。', architectureLink: '了解架构设计',
  steps: [
    { no: '01', title: 'File / Blob / URL', text: '读取名称、MIME 与特征字节', marks: ['TXT', 'PDF', 'IMG', '</>'] },
    { no: '02', title: 'Core detect & route', text: '轻量 manifest 完成匹配', marks: ['CORE'] },
    { no: '03', title: 'Matched adapter', text: '只加载命中的解析器', marks: ['Basic', 'Office', 'Archive', 'Media', '3D'] },
  ],
  formatTitle: '从文档到 3D 模型', formatDescription: '支持等级与限制公开记录，不因识别扩展名就宣称完整兼容。', formatLink: '查看完整格式支持矩阵',
  integrationTitle: '一个全格式预设，重型解析器仍然按需加载', integrationDescription: '优先使用官方预设完成最短接入；需要严格控制安装依赖时，再改为单独选择适配器。',
  modules: [
    { key: 'ALL', title: '官方全格式预设', text: '一次注册全部已维护适配器，解析器保持按需加载', command: '@previewdock/preset-all' },
    { key: 'V', title: 'Vue 宿主', text: '统一的文件预览组件', command: '@previewdock/vue' },
    { key: 'M', title: '模块化方案', text: '对安装依赖有严格要求时单独选择适配器', command: '@previewdock/adapter-text' },
  ],
  integrationLink: '比较全部接入方案', closingTitle: '把文件预览能力，交给一个可组合的运行时。', closingDescription: '先用真实文件验证 PreviewDock，再开始接入。', viewSource: '查看 GitHub 源码',
})

const primaryCapability = computed(() => copy.value.capabilities[0]!)
const secondaryCapabilities = computed(() => copy.value.capabilities.slice(1))

const formats = [
  { mark: '▤', title: 'Office', text: 'DOCX · XLSX · PPTX · DOC · XLS · PPT', tone: 'blue' },
  { mark: '{}', title: 'Text & Data', text: 'TXT · MD · JSON · CSV · XML', tone: 'cyan' },
  { mark: '▥', title: 'Archives', text: 'ZIP · RAR · 7Z · TAR · JAR', tone: 'green' },
  { mark: '▧', title: 'Images', text: 'PNG · SVG · TIFF · TGA · PSD', tone: 'pink' },
  { mark: '▶', title: 'Media', text: 'MP3 · WAV · MP4 · WebM · MOV', tone: 'violet' },
  { mark: '◇', title: '3D & CAD', text: 'GLB · OBJ · STL · FBX · DXF · IFC', tone: 'blue' },
]
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
        <a class="text-link" :href="docsPage('architecture')">{{ copy.architectureLink }}<span>→</span></a>
      </section>

      <section id="formats" class="section panel-section format-section">
        <div class="section-heading section-heading--split"><div><h2>{{ copy.formatTitle }}</h2><p>{{ copy.formatDescription }}</p></div><a class="text-link" :href="docsPage('format-support')">{{ copy.formatLink }}<span>→</span></a></div>
        <div class="format-atlas">
          <article v-for="format in formats" :key="format.title" :data-tone="format.tone"><span><b v-if="format.title === 'Text & Data'">{ }</b><svg v-else-if="format.title === 'Media'" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="m13 10 9 6-9 6Z"/></svg><svg v-else-if="format.title === '3D & CAD'" viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 11 6.5v13L16 29 5 22.5v-13L16 3Z"/><path d="m5 9.5 11 6.3 11-6.3M16 15.8V29"/></svg><svg v-else-if="format.title === 'Images'" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="5" width="24" height="22" rx="2"/><circle cx="11" cy="12" r="2"/><path d="m6 24 7-7 4 4 3-3 6 6"/></svg><svg v-else-if="format.title === 'Archives'" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3h13l5 5v21H7Z"/><path d="M20 3v6h5M15 5h4m-4 4h4m-4 4h4m-4 4h4m-4 4h4"/></svg><svg v-else viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3h13l5 5v21H7Z"/><path d="M20 3v6h5M11 14h10M11 19h10M11 24h7"/></svg></span><h3>{{ format.title }}</h3><p>{{ format.text }}</p></article>
        </div>
      </section>

      <section class="section panel-section integration-section">
        <div class="section-heading"><h2>{{ copy.integrationTitle }}</h2><p>{{ copy.integrationDescription }}</p></div>
        <div class="integration-grid">
          <div class="code-window">
            <header><span>● ● ●</span><code>pnpm add vue @previewdock/vue @previewdock/preset-all</code></header>
            <pre><i>1</i><span>import</span> { createAllFormatEngine } <span>from</span> <b>'@previewdock/preset-all'</b>
<i>2</i><span>import</span> { PreviewDock } <span>from</span> <b>'@previewdock/vue'</b>
<i>3</i>
<i>4</i><span>const</span> engine = createAllFormatEngine()</pre>
          </div>
          <div class="module-list"><article v-for="module in copy.modules" :key="module.key"><span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 11 6.5v13L16 29 5 22.5v-13L16 3Z"/><path d="m5 9.5 11 6.3 11-6.3M16 15.8V29"/></svg></span><div><h3>{{ module.title }}</h3><p>{{ module.text }}</p></div><code>pnpm add {{ module.command }}</code></article></div>
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
