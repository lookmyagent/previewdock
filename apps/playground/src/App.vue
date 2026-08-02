<template>
  <div class="portal">
    <header class="portal-nav">
      <a class="portal-brand" href="#top" aria-label="PreviewDock">
        <span class="portal-brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path d="M8.5 3.5h10l5 5v20h-15z" />
            <path d="M18.5 3.5v6h5" />
            <path d="M12 15.5h8M12 20h8M12 24.5h5" />
          </svg>
        </span>
        <span class="portal-brand__copy">
          <strong>PreviewDock</strong>
          <small>Browser-native preview runtime</small>
        </span>
      </a>

      <nav class="portal-nav__links" :aria-label="marketing.navigation">
        <a href="#features">{{ marketing.navFeatures }}</a>
        <a href="#formats">{{ marketing.navFormats }}</a>
        <a href="#integration">{{ marketing.navIntegration }}</a>
        <a href="#playground">{{ marketing.navPlayground }}</a>
      </nav>

      <div class="portal-nav__actions">
        <button class="portal-language" type="button" :aria-label="t('language')" @click="toggleMarketingLocale">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
          {{ locale === 'zh-CN' ? 'EN' : '中文' }}
        </button>
        <button class="portal-nav__cta" type="button" @click="scrollToSection('playground')">
          {{ marketing.openDemo }}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </header>

    <main id="top" class="portal-main">
      <section class="hero-section">
        <div class="hero-glow hero-glow--one" aria-hidden="true"></div>
        <div class="hero-glow hero-glow--two" aria-hidden="true"></div>

        <div class="hero-copy">
          <div class="hero-badge">
            <span aria-hidden="true"></span>
            {{ marketing.heroBadge }}
          </div>
          <h1>
            {{ marketing.heroTitle }}
            <span>{{ marketing.heroAccent }}</span>
          </h1>
          <p>{{ marketing.heroDescription }}</p>
          <div class="hero-actions">
            <button class="hero-button hero-button--primary" type="button" @click="scrollToSection('playground')">
              {{ marketing.tryNow }}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14 0M14 7l5 5-5 5"/></svg>
            </button>
            <button class="hero-button hero-button--ghost" type="button" @click="scrollToSection('integration')">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></svg>
              {{ marketing.viewIntegration }}
            </button>
          </div>

          <dl class="hero-metrics">
            <div v-for="metric in marketing.metrics" :key="metric.label">
              <dt>{{ metric.value }}</dt>
              <dd>{{ metric.label }}</dd>
            </div>
          </dl>
        </div>

        <div class="hero-product" aria-label="PreviewDock preview interface">
          <div class="product-window">
            <div class="product-window__bar">
              <span class="window-dots"><i></i><i></i><i></i></span>
              <span class="product-window__title">preview.workspace</span>
              <span class="product-window__secure">
                <svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z"/></svg>
                LOCAL
              </span>
            </div>
            <div class="product-window__body">
              <aside class="product-files">
                <span class="product-files__label">{{ marketing.heroFiles }}</span>
                <div class="product-file product-file--active"><i data-type="DOC">W</i><span><strong>proposal.docx</strong><small>1.8 MB</small></span></div>
                <div class="product-file"><i data-type="XLS">X</i><span><strong>metrics.xlsx</strong><small>624 KB</small></span></div>
                <div class="product-file"><i data-type="PDF">P</i><span><strong>report.pdf</strong><small>3.2 MB</small></span></div>
                <div class="product-file"><i data-type="3D">3D</i><span><strong>model.glb</strong><small>8.6 MB</small></span></div>
              </aside>
              <div class="product-preview">
                <div class="product-preview__toolbar">
                  <span>proposal.docx</span>
                  <div><i></i><i></i><i></i></div>
                </div>
                <div class="document-sheet">
                  <span class="document-sheet__eyebrow">PROJECT BRIEF</span>
                  <h2>Universal preview,<br>one component.</h2>
                  <div class="document-sheet__line document-sheet__line--long"></div>
                  <div class="document-sheet__line"></div>
                  <div class="document-sheet__line document-sheet__line--short"></div>
                  <div class="document-sheet__cards"><i></i><i></i><i></i></div>
                </div>
                <span class="product-preview__status"><i></i>{{ marketing.renderedLocally }}</span>
              </div>
            </div>
          </div>
          <div class="floating-format floating-format--office"><span>DOCX</span>{{ marketing.officeReady }}</div>
          <div class="floating-format floating-format--archive"><span>ZIP</span>{{ marketing.nestedReady }}</div>
          <div class="floating-format floating-format--model"><span>3D</span>{{ marketing.modelReady }}</div>
        </div>
      </section>

      <section class="format-rail" :aria-label="marketing.supportedFormats">
        <span v-for="format in featuredFormats" :key="format" class="format-pill">{{ format }}</span>
      </section>

      <section id="features" class="portal-section features-section">
        <div class="section-heading">
          <span>{{ marketing.featureKicker }}</span>
          <h2>{{ marketing.featureTitle }}</h2>
          <p>{{ marketing.featureDescription }}</p>
        </div>
        <div class="feature-cards">
          <article v-for="(feature, index) in marketing.features" :key="feature.title" class="feature-item">
            <span class="feature-item__number">0{{ index + 1 }}</span>
            <span class="feature-item__icon" v-html="feature.icon"></span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>

      <section class="architecture-section">
        <div class="architecture-copy">
          <span class="section-kicker">{{ marketing.architectureKicker }}</span>
          <h2>{{ marketing.architectureTitle }}</h2>
          <p>{{ marketing.architectureDescription }}</p>
          <ul>
            <li v-for="point in marketing.architecturePoints" :key="point"><span>✓</span>{{ point }}</li>
          </ul>
        </div>
        <div class="architecture-flow" aria-label="Lazy adapter architecture">
          <div class="flow-source">
            <span class="flow-source__icon">
              <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7zM14 3v5h4"/></svg>
            </span>
            <strong>File / Blob / URL</strong>
            <small>{{ marketing.detectSource }}</small>
          </div>
          <span class="flow-arrow">→</span>
          <div class="flow-core">
            <span>CORE</span>
            <strong>Detect &amp; Route</strong>
            <small>{{ marketing.lightweightCore }}</small>
          </div>
          <span class="flow-arrow">→</span>
          <div class="flow-adapters">
            <span v-for="adapter in adapterLabels" :key="adapter">{{ adapter }}</span>
            <small>{{ marketing.loadMatchedOnly }}</small>
          </div>
        </div>
      </section>

      <section id="formats" class="portal-section formats-section">
        <div class="section-heading section-heading--split">
          <div>
            <span>{{ marketing.formatsKicker }}</span>
            <h2>{{ marketing.formatsTitle }}</h2>
          </div>
          <p>{{ marketing.formatsDescription }}</p>
        </div>
        <div class="format-family-grid">
          <article v-for="family in marketing.formatFamilies" :key="family.title" class="format-family">
            <span class="format-family__icon" :style="{ '--family-color': family.color }">{{ family.mark }}</span>
            <div>
              <h3>{{ family.title }}</h3>
              <p>{{ family.formats }}</p>
              <small>{{ family.note }}</small>
            </div>
          </article>
        </div>
        <p class="format-disclaimer">{{ marketing.formatDisclaimer }}</p>
      </section>

      <section id="integration" class="integration-section">
        <div class="integration-copy">
          <span class="section-kicker">{{ marketing.integrationKicker }}</span>
          <h2>{{ marketing.integrationTitle }}</h2>
          <p>{{ marketing.integrationDescription }}</p>
          <div class="integration-tags"><span>Vue 3</span><span>TypeScript</span><span>Tree-shakable</span><span>Web Worker</span></div>
        </div>
        <div class="code-window">
          <div class="code-window__bar"><span><i></i><i></i><i></i></span><strong>Viewer.vue</strong><button type="button" @click="copyIntegrationCode">{{ codeCopied ? marketing.copied : marketing.copy }}</button></div>
          <pre><code><span class="code-muted">&lt;script setup lang="ts"&gt;</span>
<span class="code-purple">import</span> { PreviewDock } <span class="code-purple">from</span> <span class="code-green">'@previewdock/vue'</span>
<span class="code-purple">import</span> { createViewerEngine } <span class="code-purple">from</span> <span class="code-green">'@previewdock/core'</span>

<span class="code-purple">const</span> engine = createViewerEngine([basicPack, officePack])
<span class="code-muted">&lt;/script&gt;</span>

<span class="code-muted">&lt;template&gt;</span>
  <span class="code-blue">&lt;PreviewDock</span> <span class="code-orange">:engine</span>=<span class="code-green">"engine"</span> <span class="code-orange">:source</span>=<span class="code-green">"file"</span> <span class="code-blue">/&gt;</span>
<span class="code-muted">&lt;/template&gt;</span></code></pre>
        </div>
      </section>

      <section id="playground" class="demo-section">
        <div class="section-heading demo-heading">
          <span>{{ marketing.demoKicker }}</span>
          <h2>{{ marketing.demoTitle }}</h2>
          <p>{{ marketing.demoDescription }}</p>
        </div>

        <div class="playground">
    <header class="topbar">
      <div class="topbar__title">
        <span class="topbar__live"><i></i>LIVE</span>
        <h2>{{ marketing.demoWorkspace }}</h2>
      </div>
      <div class="topbar__actions">
        <input ref="fileInputRef" class="sr-only" type="file" @change="handleFileInput">
        <button class="button button--primary" type="button" @click="fileInputRef?.click()">{{ t('openFile') }}</button>
        <select v-model="locale" :aria-label="t('language')">
          <option value="zh-CN">中文</option>
          <option value="en">English</option>
        </select>
        <select v-model="detectionMode" :aria-label="t('detectionMode')">
          <option value="auto">{{ t('autoDetect') }}</option>
          <option value="extension">{{ t('extensionFirst') }}</option>
          <option value="magic">{{ t('magicFirst') }}</option>
        </select>
      </div>
    </header>

    <main class="workspace">
      <aside class="source-panel">
        <div class="panel-title">
          <strong>{{ t('source') }}</strong>
          <span>{{ samples.length }} {{ t('samples') }}</span>
        </div>
        <label class="search">
          <span aria-hidden="true">⌕</span>
          <input v-model.trim="query" type="search" :placeholder="t('searchFiles')">
        </label>
        <div class="file-list">
          <button
            v-for="sample in filteredSamples"
            :key="sample.id"
            :data-sample-id="sample.id"
            type="button"
            class="file-row"
            :class="{ 'file-row--active': activeFile.id === sample.id }"
            @click="selectSample(sample)"
          >
            <span class="file-row__icon" :data-kind="sample.kind">{{ sample.shortType }}</span>
            <span class="file-row__content">
              <strong>{{ sample.name }}</strong>
              <small>{{ sampleLabel(sample) }} · {{ formatSize(sampleSize(sample)) }}</small>
            </span>
          </button>
        </div>
      </aside>

      <section class="preview-panel">
        <div class="tabbar"><span>{{ t('preview') }}</span></div>
        <PreviewDock
          :engine="engine"
          :source="activeFile.source"
          :file-name="activeFile.name"
          :locale="locale"
          :show-toolbar="false"
          @ready="handleReady"
          @status="handleStatus"
          @error="handleError"
        />
      </section>

      <aside class="inspector-panel">
        <div class="tabbar"><span>{{ t('inspector') }}</span></div>
        <div class="inspector">
          <InspectorItem :label="t('detectedFormat')" :value="detectedFormat" :ok="Boolean(inspectorState)" />
          <InspectorItem :label="t('renderer')" :value="rendererName" :ok="Boolean(inspectorState)" />
          <InspectorItem :label="t('loadingMode')" :value="t('lazyImport')" :ok="true" />

          <section class="inspector-section">
            <h2>{{ t('capabilities') }}</h2>
            <ul v-if="inspectorState?.capabilities.length" class="capability-list">
              <li v-for="capability in inspectorState.capabilities" :key="capability">
                <span aria-hidden="true">✓</span>{{ formatCapability(capability) }}
              </li>
            </ul>
            <p v-else class="muted">{{ t('waitingRenderer') }}</p>
          </section>

          <section class="inspector-section resource-grid">
            <h2>{{ t('resourceStatus') }}</h2>
            <span>{{ t('fileName') }}</span><strong>{{ activeFile.name }}</strong>
            <span>{{ t('fileSize') }}</span><strong>{{ formatSize(sampleSize(activeFile)) }}</strong>
            <span>{{ t('mimeType') }}</span><strong>{{ inspectorState?.mimeType || sampleMimeType(activeFile) }}</strong>
            <span>{{ t('adapter') }}</span><strong>{{ inspectorState?.adapterId || '—' }}</strong>
          </section>
        </div>
      </aside>
    </main>

    <footer class="statusbar">
      <span class="statusbar__state"><i></i>{{ translatedStatus }}</span>
      <span>{{ t('workerPlanned') }}</span>
      <span class="statusbar__spacer"></span>
      <span>{{ t('lazyFooter') }}</span>
    </footer>
        </div>
      </section>
    </main>

    <footer class="portal-footer">
      <div class="portal-footer__brand">
        <span class="portal-brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32"><path d="M8.5 3.5h10l5 5v20h-15z"/><path d="M18.5 3.5v6h5"/><path d="M12 15.5h8M12 20h8M12 24.5h5"/></svg>
        </span>
        <div><strong>PreviewDock</strong><small>{{ marketing.footerDescription }}</small></div>
      </div>
      <div class="portal-footer__meta"><span>Apache-2.0</span><span>Local-first</span><span>Vue 3</span></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, watch } from 'vue'
import {
  createViewerEngine,
  defineAdapterPack,
  ViewerEngine,
  type FileSource,
  type OpenResult,
  type PreviewCapability,
  type ViewerStatus,
} from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'
import { mediaAdapterManifest } from '@previewdock/adapter-media/manifest'
import { advancedImageAdapterManifest } from '@previewdock/adapter-advanced-image/manifest'
import { modelAdapterManifest } from '@previewdock/adapter-3d/manifest'
import { openXmlAdapterManifest } from '@previewdock/adapter-openxml/manifest'
import { createArchiveAdapterManifest } from '@previewdock/adapter-archive/manifest'
import { createLegacyOfficeAdapterManifest } from '@previewdock/adapter-legacy-office/manifest'
import { PreviewDock, viewerMessages, type ViewerLocale } from '@previewdock/vue'
import { strToU8, zipSync } from 'fflate'

interface SampleFile {
  id: string
  name: string
  labelKey?: UiKey
  customLabel?: string
  shortType: string
  kind: string
  source: FileSource
  size?: number
}

interface InspectorState {
  extension: string
  mimeType: string
  adapterId: string
  adapterLabel: string
  capabilities: PreviewCapability[]
}

const ui = {
  en: {
    openFile: 'Open file', language: 'Language', detectionMode: 'File detection mode',
    autoDetect: 'Auto detect', extensionFirst: 'Extension first', magicFirst: 'Magic bytes first',
    source: 'Source', samples: 'samples', searchFiles: 'Search files', preview: 'Preview',
    inspector: 'Inspector', detectedFormat: 'Detected format', renderer: 'Renderer',
    loadingMode: 'Loading mode', lazyImport: 'Lazy adapter import', capabilities: 'Capabilities',
    waitingRenderer: 'Waiting for renderer', resourceStatus: 'Resource status', fileName: 'File name',
    fileSize: 'File size', mimeType: 'MIME type', adapter: 'Adapter', unknown: 'Unknown',
    workerPlanned: 'Worker runtime: loaded on demand', lazyFooter: 'Adapters loaded on demand',
    markdown: 'Markdown', plainText: 'Plain text', csv: 'CSV', json: 'JSON',
    svgImage: 'SVG image', pdfDocument: 'PDF document', zipArchive: 'ZIP archive',
    wordDocument: 'Word document', spreadsheet: 'Spreadsheet', presentation: 'Presentation',
    localFile: 'Local file', detecting: 'Detecting…', resolving: 'Resolving…',
  },
  'zh-CN': {
    openFile: '打开文件', language: '语言', detectionMode: '文件识别方式',
    autoDetect: '自动识别', extensionFirst: '扩展名优先', magicFirst: '文件特征优先',
    source: '文件', samples: '个示例', searchFiles: '搜索文件', preview: '预览',
    inspector: '检查器', detectedFormat: '识别格式', renderer: '渲染器',
    loadingMode: '加载方式', lazyImport: '适配器按需加载', capabilities: '具备能力',
    waitingRenderer: '等待渲染器', resourceStatus: '资源状态', fileName: '文件名',
    fileSize: '文件大小', mimeType: 'MIME 类型', adapter: '适配器', unknown: '未知',
    workerPlanned: 'Worker 运行时：按需加载', lazyFooter: '适配器按格式加载',
    markdown: 'Markdown', plainText: '纯文本', csv: 'CSV', json: 'JSON',
    svgImage: 'SVG 图片', pdfDocument: 'PDF 文档', zipArchive: 'ZIP 压缩包',
    wordDocument: 'Word 文档', spreadsheet: '电子表格', presentation: '演示文稿',
    localFile: '本地文件', detecting: '识别中…', resolving: '加载中…',
  },
} as const

type UiKey = keyof typeof ui.en

const locale = ref<ViewerLocale>('zh-CN')
function t(key: UiKey): string {
  return ui[locale.value][key]
}

const featuredFormats = [
  'DOC / DOCX', 'XLS / XLSX', 'PPT / PPTX', 'PDF', 'ZIP / RAR / 7Z',
  'TIFF / PSD', 'GLB / OBJ / STL', 'MD / CSV / JSON', 'MP4 / MP3',
]

const adapterLabels = ['Text', 'Office', 'PDF', 'Image', 'Archive', 'Media', '3D']

const featureIcons = {
  local: '<svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
  lazy: '<svg viewBox="0 0 24 24"><path d="M13 2 5 13h6l-1 9 8-12h-6z"/></svg>',
  modules: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17.5 14v7M14 17.5h7"/></svg>',
  archive: '<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3M9 11h6M9 15h6"/></svg>',
  render: '<svg viewBox="0 0 24 24"><path d="M3 5h18v12H3zM8 21h8M12 17v4"/><path d="m8 12 2-2 2 2 4-4"/></svg>',
  safe: '<svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v11H5z"/><path d="M12 14v3"/></svg>',
}

const marketing = computed(() => {
  if (locale.value === 'zh-CN') {
    return {
      navigation: '门户导航',
      navFeatures: '核心能力', navFormats: '格式支持', navIntegration: '快速接入', navPlayground: '在线体验',
      openDemo: '打开体验台',
      heroBadge: '纯前端 · 本地优先 · 按需加载',
      heroTitle: '一个组件，', heroAccent: '预览几乎所有文件',
      heroDescription: '面向 Vue 与现代 Web 应用的多格式文件预览组件。Office、PDF、压缩包、图片、音视频与 3D 模型，在浏览器里统一、安全地打开。',
      tryNow: '立即在线体验', viewIntegration: '查看接入方式',
      metrics: [
        { value: '9', label: '可选能力包' },
        { value: '0', label: '强制后端服务' },
        { value: '100%', label: '文件本地优先' },
      ],
      heroFiles: '示例文件', renderedLocally: '已在浏览器本地渲染', officeReady: 'Office 就绪', nestedReady: '多级查看', modelReady: '交互模型', supportedFormats: '当前支持的代表格式',
      featureKicker: 'WHY PREVIEWDOCK', featureTitle: '为真实业务系统而设计',
      featureDescription: '不把所有解析器塞进首屏，也不把用户文件默默上传到远端。每项能力都可以独立选择、延迟加载和安全隔离。',
      features: [
        { title: '本地优先', description: '文件默认留在浏览器中，降低数据外传与跨域服务依赖。', icon: featureIcons.local },
        { title: '按需加载', description: '只有打开对应格式时才下载适配器与 WASM 资源。', icon: featureIcons.lazy },
        { title: '模块化接入', description: '基础、Office、压缩包、3D 等能力包可独立安装组合。', icon: featureIcons.modules },
        { title: '压缩包深度预览', description: '支持多级目录浏览、内嵌文件预览与原文件下载。', icon: featureIcons.archive },
        { title: '统一交互体验', description: '不同格式共用一套加载、错误、取消与生命周期协议。', icon: featureIcons.render },
        { title: '安全边界清晰', description: '宏、脚本与活动内容不执行，远程处理必须显式启用。', icon: featureIcons.safe },
      ],
      architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: '小内核，能力按格式到达',
      architectureDescription: '核心只负责识别、路由和生命周期。重型解析器在命中格式后再异步加载，业务首屏不为偶尔使用的格式买单。',
      architecturePoints: ['适配器清单轻量注册', 'Worker / WASM 可独立部署', '关闭预览时确定性释放资源'],
      detectSource: '文件名、MIME 与特征字节', lightweightCore: '轻量核心运行时', loadMatchedOnly: '只加载命中的适配器',
      formatsKicker: 'FORMAT COVERAGE', formatsTitle: '从办公文档到 3D 模型',
      formatsDescription: '当前实现以“能呈现有用内容”为支持标准，并明确区分原生、实验性与可选转换能力。',
      formatFamilies: [
        { mark: 'W', title: 'Office 办公文档', formats: 'DOC / DOCX · XLS / XLSX · PPT / PPTX', note: '新版高保真渲染，旧版格式按需转换', color: '#4263eb' },
        { mark: 'A', title: '压缩包', formats: 'ZIP · RAR · 7Z · TAR · GZIP · JAR', note: '目录树、多级打开、内嵌预览与下载', color: '#9a55d6' },
        { mark: 'I', title: '图片与设计素材', formats: 'PNG · JPEG · SVG · TIFF · TGA · PSD', note: '缩放、旋转、镜像与画布渲染', color: '#d95c7d' },
        { mark: '3D', title: '3D 模型', formats: 'GLB · glTF · OBJ · STL · FBX · DAE · 3MF', note: '轨道控制、动画、线框与重置视图', color: '#0f9f85' },
        { mark: 'T', title: '文本与数据', formats: 'TXT · MD · CSV · TSV · JSON · XML · Source', note: '源码与格式化视图，内容安全清洗', color: '#e28a32' },
        { mark: 'M', title: 'PDF 与媒体', formats: 'PDF · MP3 · WAV · MP4 · WebM · OGG', note: '浏览器原生能力，编解码支持取决于环境', color: '#3478c9' },
      ],
      formatDisclaimer: '格式兼容性与还原度取决于文件内容、浏览器和可选能力包；项目不会仅因识别了扩展名就宣称完整支持。',
      integrationKicker: 'DEVELOPER EXPERIENCE', integrationTitle: '几行代码接入，能力随项目选择',
      integrationDescription: '统一 Vue 组件承载预览界面，开发者只安装业务需要的适配器；基础包不会捆绑 Office、3D 或转换引擎。',
      copy: '复制代码', copied: '已复制',
      demoKicker: 'LIVE PLAYGROUND', demoTitle: '不要只看介绍，直接打开一个文件',
      demoDescription: '选择内置样例或你自己的本地文件，观察格式识别、适配器加载与预览结果。文件不会因为体验页面而自动上传。',
      demoWorkspace: '文件预览实验室',
      footerDescription: '面向现代 Web 应用的本地优先文件预览运行时',
    }
  }

  return {
    navigation: 'Portal navigation',
    navFeatures: 'Features', navFormats: 'Formats', navIntegration: 'Integration', navPlayground: 'Playground',
    openDemo: 'Open playground',
    heroBadge: 'Browser-native · Local-first · Lazy-loaded',
    heroTitle: 'One component.', heroAccent: 'Preview almost any file.',
    heroDescription: 'A multi-format file preview component for Vue and modern web apps. Open Office documents, PDFs, archives, images, media, and 3D models through one secure browser runtime.',
    tryNow: 'Try the live demo', viewIntegration: 'View integration',
    metrics: [
      { value: '9', label: 'optional packs' },
      { value: '0', label: 'required backends' },
      { value: '100%', label: 'local-first files' },
    ],
    heroFiles: 'Sample files', renderedLocally: 'Rendered locally in your browser', officeReady: 'Office ready', nestedReady: 'Nested browse', modelReady: 'Interactive', supportedFormats: 'Representative supported formats',
    featureKicker: 'WHY PREVIEWDOCK', featureTitle: 'Built for real product surfaces',
    featureDescription: 'Do not ship every parser on first load, and do not silently send user files away. Every capability can be selected, lazy-loaded, and isolated.',
    features: [
      { title: 'Local-first', description: 'Files stay in the browser by default, reducing data exposure and service dependencies.', icon: featureIcons.local },
      { title: 'Lazy-loaded', description: 'Adapters and WASM assets arrive only when their matching format is opened.', icon: featureIcons.lazy },
      { title: 'Modular packs', description: 'Install and combine basic, Office, archive, 3D, and other packs independently.', icon: featureIcons.modules },
      { title: 'Deep archive preview', description: 'Browse nested folders, preview embedded files, and download originals.', icon: featureIcons.archive },
      { title: 'One interaction model', description: 'Every format shares loading, error, cancellation, and lifecycle contracts.', icon: featureIcons.render },
      { title: 'Explicit safety', description: 'Macros, scripts, and active content never run; remote processing is opt-in.', icon: featureIcons.safe },
    ],
    architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: 'A small core. Capability on demand.',
    architectureDescription: 'The core handles detection, routing, and lifecycle. Heavy parsers load after a format match, so occasional formats never tax the application shell.',
    architecturePoints: ['Lightweight adapter manifests', 'Worker and WASM assets deploy independently', 'Deterministic cleanup when a preview closes'],
    detectSource: 'Name, MIME, and magic bytes', lightweightCore: 'Lightweight core runtime', loadMatchedOnly: 'Only the matching adapter loads',
    formatsKicker: 'FORMAT COVERAGE', formatsTitle: 'From office documents to 3D models',
    formatsDescription: 'Support means rendering useful content. Native, experimental, and optional conversion paths are intentionally distinguished.',
    formatFamilies: [
      { mark: 'W', title: 'Office documents', formats: 'DOC / DOCX · XLS / XLSX · PPT / PPTX', note: 'High-fidelity modern preview and optional legacy conversion', color: '#4263eb' },
      { mark: 'A', title: 'Archives', formats: 'ZIP · RAR · 7Z · TAR · GZIP · JAR', note: 'Trees, nested open, embedded preview, and downloads', color: '#9a55d6' },
      { mark: 'I', title: 'Images and design', formats: 'PNG · JPEG · SVG · TIFF · TGA · PSD', note: 'Zoom, rotate, mirror, and canvas rendering', color: '#d95c7d' },
      { mark: '3D', title: '3D models', formats: 'GLB · glTF · OBJ · STL · FBX · DAE · 3MF', note: 'Orbit controls, animation, wireframe, and reset', color: '#0f9f85' },
      { mark: 'T', title: 'Text and data', formats: 'TXT · MD · CSV · TSV · JSON · XML · Source', note: 'Source and rendered modes with safe sanitization', color: '#e28a32' },
      { mark: 'M', title: 'PDF and media', formats: 'PDF · MP3 · WAV · MP4 · WebM · OGG', note: 'Browser-native; codec coverage varies by environment', color: '#3478c9' },
    ],
    formatDisclaimer: 'Compatibility and fidelity depend on file content, browser capabilities, and optional packs. Recognition alone is never advertised as full support.',
    integrationKicker: 'DEVELOPER EXPERIENCE', integrationTitle: 'Integrate in a few lines. Choose every capability.',
    integrationDescription: 'A single Vue component hosts the preview while applications install only the adapters they need. The basic pack never bundles Office, 3D, or conversion engines.',
    copy: 'Copy code', copied: 'Copied',
    demoKicker: 'LIVE PLAYGROUND', demoTitle: 'Do not take our word for it. Open a file.',
    demoDescription: 'Choose a built-in sample or one of your own files and inspect detection, lazy adapter loading, and the rendered result. The demo does not upload your file.',
    demoWorkspace: 'File preview playground',
    footerDescription: 'A local-first file preview runtime for modern web applications',
  }
})

const integrationCode = `<script setup lang="ts">
import { PreviewDock } from '@previewdock/vue'
import { createViewerEngine } from '@previewdock/core'

const engine = createViewerEngine([basicPack, officePack])
<${'/'}script>

<template>
  <PreviewDock :engine="engine" :source="file" />
</template>`
const codeCopied = ref(false)

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toggleMarketingLocale(): void {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}

async function copyIntegrationCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(integrationCode)
    codeCopied.value = true
    window.setTimeout(() => { codeCopied.value = false }, 1600)
  } catch {
    codeCopied.value = false
  }
}

const InspectorItem = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    ok: Boolean,
  },
  setup(props) {
    return () => h('section', { class: 'inspector-item' }, [
      h('div', [
        h('h2', props.label),
        h('p', props.value),
      ]),
      props.ok ? h('span', { class: 'check', 'aria-label': 'Ready' }, '✓') : null,
    ])
  },
})

const basicPack = defineAdapterPack({
  id: 'basic',
  label: 'Text, common images and PDF',
  adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
})

const richImagePack = defineAdapterPack({
  id: 'rich-image',
  label: 'TIFF, TGA and PSD',
  adapters: [advancedImageAdapterManifest],
})

const mediaPack = defineAdapterPack({
  id: 'media',
  label: 'Browser-native audio and video',
  adapters: [mediaAdapterManifest],
})

const archivePack = defineAdapterPack({
  id: 'archive',
  label: 'ZIP, JAR, TAR, GZIP, RAR and 7Z',
  adapters: [createArchiveAdapterManifest({
    workerUrl: '/libarchive/worker-bundle.js',
    async previewEntry({ file, container, signal }) {
      if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
      const nestedEngine = new ViewerEngine(engine.registry)
      const abort = () => { void nestedEngine.close() }
      signal.addEventListener('abort', abort, { once: true })
      try {
        const result = await nestedEngine.open(file, {
          name: file.name,
          mimeType: file.type,
        })
        if (signal.aborted) {
          await nestedEngine.close()
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        await result.session.mount(container, result.signal)
        return async () => {
          signal.removeEventListener('abort', abort)
          await nestedEngine.close()
        }
      } catch (error) {
        signal.removeEventListener('abort', abort)
        await nestedEngine.close()
        throw error
      }
    },
  })],
})

const modelPack = defineAdapterPack({
  id: 'model-3d',
  label: 'Interactive 3D models',
  adapters: [modelAdapterManifest],
})

const officePack = defineAdapterPack({
  id: 'office',
  label: 'Modern and legacy Microsoft Office',
  adapters: [
    openXmlAdapterManifest,
    createLegacyOfficeAdapterManifest({
      converter: {
        id: 'zetaoffice-wasm',
        async convert(request) {
        const { createZetaOfficeConverter } = await import(
          '@previewdock/converter-zetaoffice'
        )
        const { default: zetaJsUrl } = await import('zetajs/zeta.js?url')
        const wasmPackage = import.meta.env.VITE_ZETAOFFICE_ASSET_URL || 'free'
        const fonts = await loadChineseOfficeFont()
        return createZetaOfficeConverter({
          wasmPackage,
          zetaJsUrl,
          fontFiles: fonts,
        }).convert(request)
        },
      },
    }),
  ],
})

let chineseOfficeFontPromise: Promise<Array<{ name: string, data: ArrayBuffer }>> | undefined
function loadChineseOfficeFont(): Promise<Array<{ name: string, data: ArrayBuffer }>> {
  if (!chineseOfficeFontPromise) {
    chineseOfficeFontPromise = fetch('/fonts/NotoSansCJKsc-Regular.otf').then(async response => {
      if (!response.ok) throw new Error(`中文字体加载失败：${response.status}`)
      return [{ name: 'NotoSansCJKsc-Regular.otf', data: await response.arrayBuffer() }]
    })
  }
  return chineseOfficeFontPromise
}
const engine: ViewerEngine = createViewerEngine([
  basicPack,
  richImagePack,
  mediaPack,
  archivePack,
  modelPack,
  officePack,
])
const fileInputRef = ref<HTMLInputElement>()
const query = ref('')
const detectionMode = ref('auto')
const inspectorState = ref<InspectorState>()
const status = ref<ViewerStatus>({ phase: 'idle', message: 'Worker ready' })

function fileFromBase64(base64: string, name: string, type: string): File {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  return new File([bytes], name, { type })
}

function fileFromOpenXml(
  parts: Record<string, string>,
  name: string,
  type: string,
): File {
  const encodedParts = Object.fromEntries(
    Object.entries(parts).map(([path, content]) => [path, strToU8(content)]),
  )
  const zipped = zipSync(encodedParts, { level: 6 })
  const bytes = new Uint8Array(zipped.byteLength)
  bytes.set(zipped)
  return new File([bytes.buffer], name, { type })
}

function createArchiveSample(): File {
  return fileFromOpenXml({
    'hello.txt': 'Hello from inside the archive.',
    'docs/readme.md': '# Archive preview\n\nThis Markdown file is stored inside `docs/`.',
    'docs/guides/setup.txt': '1. Open the archive.\n2. Enter docs/guides.\n3. Select this file.',
  }, 'sample.zip', 'application/zip')
}

function createDocxSample(): File {
  return fileFromOpenXml({
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
      </Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`,
    'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      </Relationships>`,
    'word/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
          <w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Title">
          <w:name w:val="Title"/><w:basedOn w:val="Normal"/>
          <w:rPr><w:b/><w:color w:val="315EE7"/><w:sz w:val="36"/></w:rPr>
        </w:style>
      </w:styles>`,
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>PreviewDock</w:t></w:r></w:p>
          <w:p><w:r><w:t>High-fidelity DOCX preview rendered entirely in your browser.</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Features</w:t></w:r></w:p>
          <w:p><w:r><w:t>Page layout and typography</w:t></w:r></w:p>
          <w:p><w:r><w:t>Headers, footers, tables and images</w:t></w:r></w:p>
          <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708"/>
          </w:sectPr>
        </w:body>
      </w:document>`,
  }, 'sample.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
}

function createPptxSample(): File {
  return fileFromOpenXml({
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
        <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
      </Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
      </Relationships>`,
    'ppt/presentation.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst>
        <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
        <p:notesSz cx="6858000" cy="9144000"/>
      </p:presentation>`,
    'ppt/_rels/presentation.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
      </Relationships>`,
    'ppt/slides/_rels/slide1.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
    'ppt/slides/slide1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld name="Demo">
          <p:bg><p:bgPr><a:solidFill><a:srgbClr val="F6F8FC"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
          <p:spTree>
            <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
            <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
            <p:sp>
              <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
              <p:spPr><a:xfrm><a:off x="914400" y="1371600"/><a:ext cx="10363200" cy="1219200"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
              <p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="3000" b="1"><a:solidFill><a:srgbClr val="315EE7"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>PreviewDock</a:t></a:r><a:endParaRPr lang="en-US" sz="3000"/></a:p></p:txBody>
            </p:sp>
            <p:sp>
              <p:nvSpPr><p:cNvPr id="3" name="Subtitle"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
              <p:spPr><a:xfrm><a:off x="1371600" y="3048000"/><a:ext cx="9448800" cy="1066800"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="E8EEFF"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="9CB2F8"/></a:solidFill></a:ln></p:spPr>
              <p:txBody><a:bodyPr anchor="ctr" lIns="228600" rIns="228600"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" sz="1600"><a:solidFill><a:srgbClr val="253047"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>High-fidelity PPTX rendering in the browser</a:t></a:r><a:endParaRPr lang="en-US" sz="1600"/></a:p></p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
        <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
      </p:sld>`,
  }, 'sample.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
}

function createPdfSample(): File {
  const stream = 'BT /F1 24 Tf 72 700 Td (PreviewDock) Tj 0 -38 Td /F1 14 Tf (Browser-native PDF preview) Tj ET\n'
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${new TextEncoder().encode(stream).byteLength} >>\nstream\n${stream}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]
  let content = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(new TextEncoder().encode(content).byteLength)
    content += object
  }
  const xrefOffset = new TextEncoder().encode(content).byteLength
  content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  content += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  content += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new File([content], 'sample.pdf', { type: 'application/pdf' })
}

const xlsxSampleBase64 = 'UEsDBBQAAAAIALNz/1x9j8M5SgAAAE0AAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLMJqSxILVaoyM3JK7ZVyigpKbDS1y9OzkjNTSzWyy9IzQPKpOUX5SaWALlF6foFicnZiemp+kYGBmb6yfl5Jal5JbolIDOU9O0AUEsDBBQAAAAIALNz/1yRt7JrcgAAAKUAAAAUAAAAeGwvc2hhcmVkU3RyaW5ncy54bWxljkEKwkAMRa8iPYApLlxIzEq6FjxBsNEpNDNhkoLHd9SF0C7/e2/x0T12L52zn7sUYScAvydR9n0xyc08SlWONusT3Krw6EkkdIZD3x9BecodoU+EQcO3RQhC+JAfvQXH4mt6vQybcDErNWT8C2j/6A1QSwMEFAAAAAgAs3P/XGDIfyKMAAAAAgEAABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWxdj90KAiEQRl9l8QEaNegiVCh6ETHLaP3BGXZ7/GwJkb2b+c7MYUatub4xeE/TJ84JNQtE5QyALvho8ZCLT408co2WWlufgKV6e9+W4gyS8xNE+0rMqC27WbJG1bxOVTPRUvcrLoJNpBm2fjFcwWIUuD+7jkx0Bs3RRbKL5DAsd6KRHXciGK6D/rb5AlBLAQIUABQAAAAIALNz/1x9j8M5SgAAAE0AAAATAAAAAAAAAAAAAAAAAAAAAABbQ29udGVudF9UeXBlc10ueG1sUEsBAhQAFAAAAAgAs3P/XJG3smtyAAAApQAAABQAAAAAAAAAAAAAAAAAewAAAHhsL3NoYXJlZFN0cmluZ3MueG1sUEsBAhQAFAAAAAgAs3P/XGDIfyKMAAAAAgEAABgAAAAAAAAAAAAAAAAAHwEAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbFBLBQYAAAAAAwADAMkAAADhAQAAAAA='

const readmeText = `# PreviewDock

PreviewDock is a local-first, extensible browser runtime for previewing many file formats.

> Files stay in the browser unless a host explicitly enables a remote provider.

## Current prototype

- Framework-agnostic TypeScript core
- Lazy adapter registry
- Vue 3 host component
- Safe text renderer
- Browser-native image renderer
- Cancellation and deterministic cleanup

| Adapter | Loading |
| --- | --- |
| Text | Immediate |
| Office | On demand |

\`\`\`ts
const viewer = new ViewerEngine(registry)
\`\`\`

## Architecture

Files are detected before an adapter is imported. Heavy Office, CAD, archive, and media engines will run inside dedicated Web Workers and WebAssembly runtimes.

## Next

The next adapters are PDF, OpenXML Office, archives, media, and common 3D models.
`

const svgSample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <rect width="800" height="520" fill="#f7f9fc"/>
  <rect x="140" y="80" width="520" height="360" rx="18" fill="#fff" stroke="#dce3ef"/>
  <circle cx="270" cy="215" r="62" fill="#315ee7" opacity=".92"/>
  <path d="M210 370l105-112 72 70 62-56 141 98z" fill="#9db2f6"/>
  <text x="400" y="135" text-anchor="middle" font-family="Arial" font-size="26" fill="#172033">Image adapter</text>
</svg>`

const samples = ref<SampleFile[]>([
  {
    id: 'legacy-doc-chinese-regression',
    name: '案例专辑+历年真题 勘误.doc',
    customLabel: '旧版 Word · 中文验证',
    shortType: 'DOC',
    kind: 'document',
    source: '/samples/案例专辑+历年真题 勘误.doc',
    size: 1043456,
  },
  {
    id: 'archive-rar',
    name: 'sample.rar',
    customLabel: 'RAR 压缩包',
    shortType: 'RAR',
    kind: 'archive',
    source: '/samples/archives/sample.rar',
    size: 95351,
  },
  {
    id: 'archive-7z',
    name: 'sample.7z',
    customLabel: '7Z 压缩包',
    shortType: '7Z',
    kind: 'archive',
    source: '/samples/archives/sample.7z',
    size: 340,
  },
  {
    id: 'archive-tar',
    name: 'sample.tar',
    customLabel: 'TAR 压缩包',
    shortType: 'TAR',
    kind: 'archive',
    source: '/samples/archives/sample.tar',
    size: 14848,
  },
  {
    id: 'archive-gzip',
    name: 'sample.gzip',
    customLabel: 'GZIP 压缩包',
    shortType: 'GZ',
    kind: 'archive',
    source: '/samples/archives/sample.gzip',
    size: 145,
  },
  {
    id: 'archive-jar',
    name: 'sample.jar',
    customLabel: 'JAR 压缩包',
    shortType: 'JAR',
    kind: 'archive',
    source: '/samples/archives/sample.jar',
    size: 735,
  },
  {
    id: 'readme',
    name: 'README.md',
    labelKey: 'markdown',
    shortType: 'MD',
    kind: 'text',
    source: new File([readmeText], 'README.md', { type: 'text/markdown' }),
  },
  {
    id: 'notes',
    name: 'notes.txt',
    labelKey: 'plainText',
    shortType: 'TXT',
    kind: 'text',
    source: new File(['Preview adapters are loaded only when a matching file is opened.'], 'notes.txt', { type: 'text/plain' }),
  },
  {
    id: 'data',
    name: 'data.csv',
    labelKey: 'csv',
    shortType: 'CSV',
    kind: 'table',
    source: new File(['format,status\\nPDF,planned\\nDOCX,planned\\nDWG,research'], 'data.csv', { type: 'text/csv' }),
  },
  {
    id: 'config',
    name: 'viewer.json',
    labelKey: 'json',
    shortType: 'JSON',
    kind: 'code',
    source: new File([JSON.stringify({ runtime: 'browser', lazy: true, workers: true }, null, 2)], 'viewer.json', { type: 'application/json' }),
  },
  {
    id: 'image',
    name: 'sample.svg',
    labelKey: 'svgImage',
    shortType: 'SVG',
    kind: 'image',
    source: new File([svgSample], 'sample.svg', { type: 'image/svg+xml' }),
  },
  {
    id: 'pdf',
    name: 'sample.pdf',
    labelKey: 'pdfDocument',
    shortType: 'PDF',
    kind: 'document',
    source: createPdfSample(),
  },
  {
    id: 'archive',
    name: 'sample.zip',
    labelKey: 'zipArchive',
    shortType: 'ZIP',
    kind: 'archive',
    source: createArchiveSample(),
  },
  {
    id: 'docx',
    name: 'sample.docx',
    labelKey: 'wordDocument',
    shortType: 'DOCX',
    kind: 'document',
    source: createDocxSample(),
  },
  {
    id: 'xlsx',
    name: 'sample.xlsx',
    labelKey: 'spreadsheet',
    shortType: 'XLSX',
    kind: 'table',
    source: fileFromBase64(xlsxSampleBase64, 'sample.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
  },
  {
    id: 'pptx',
    name: 'sample.pptx',
    labelKey: 'presentation',
    shortType: 'PPTX',
    kind: 'presentation',
    source: createPptxSample(),
  },
])

const activeFile = ref(
  samples.value.find(sample => sample.id === 'readme') || samples.value[0] as SampleFile,
)
const filteredSamples = computed(() => {
  const keyword = query.value.toLowerCase()
  return keyword
    ? samples.value.filter(item => item.name.toLowerCase().includes(keyword))
    : samples.value
})

const detectedFormat = computed(() => {
  const result = inspectorState.value
  if (!result) return t('detecting')
  return `${result.extension.toUpperCase() || t('unknown')} (${result.mimeType})`
})
const rendererLabels: Record<ViewerLocale, Record<string, string>> = {
  en: {
    text: 'Text renderer', image: 'Browser image renderer', pdf: 'Browser PDF viewer',
    media: 'Browser media player', archive: 'Archive browser', 'model-3d': 'Interactive 3D model viewer',
    'advanced-image': 'TIFF, TGA and PSD renderer', 'legacy-office': 'Legacy Office preview',
    openxml: 'High-fidelity Office preview',
  },
  'zh-CN': {
    text: '文本渲染器', image: '浏览器图片渲染器', pdf: '浏览器 PDF 查看器',
    media: '浏览器媒体播放器', archive: '压缩包浏览器', 'model-3d': '交互式 3D 模型查看器',
    'advanced-image': 'TIFF、TGA 与 PSD 渲染器', 'legacy-office': '旧版 Office 预览',
    openxml: '高保真 Office 预览',
  },
}
const rendererName = computed(() => {
  const result = inspectorState.value
  if (!result) return t('resolving')
  return rendererLabels[locale.value][result.adapterId] || result.adapterLabel
})
const translatedStatus = computed(() => viewerMessages[locale.value].phases[status.value.phase])

watch(locale, nextLocale => {
  document.documentElement.lang = nextLocale
}, { immediate: true })

function selectSample(sample: SampleFile): void {
  inspectorState.value = undefined
  activeFile.value = sample
}

function handleFileInput(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const sample: SampleFile = {
    id: `local-${file.name}-${file.lastModified}`,
    name: file.name,
    customLabel: file.type || t('localFile'),
    shortType: file.name.split('.').pop()?.toUpperCase().slice(0, 4) || 'FILE',
    kind: 'local',
    source: file,
  }
  samples.value = [sample, ...samples.value]
  selectSample(sample)
  ;(event.target as HTMLInputElement).value = ''
}

function handleReady(result: OpenResult): void {
  inspectorState.value = {
    extension: result.descriptor.extension,
    mimeType: result.descriptor.mimeType,
    adapterId: result.session.adapterId,
    adapterLabel: result.session.adapterLabel,
    capabilities: [...result.session.capabilities],
  }
}

function handleStatus(nextStatus: ViewerStatus): void {
  status.value = nextStatus
}

function handleError(): void {
  inspectorState.value = undefined
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function sampleSize(sample: SampleFile): number {
  if (sample.source instanceof Blob) return sample.source.size
  if (sample.source instanceof ArrayBuffer) return sample.source.byteLength
  if (sample.source instanceof Uint8Array) return sample.source.byteLength
  return sample.size || 0
}

function sampleMimeType(sample: SampleFile): string {
  return sample.source instanceof Blob && sample.source.type
    ? sample.source.type
    : sample.name.endsWith('.doc')
      ? 'application/msword'
      : t('unknown')
}

function formatCapability(capability: PreviewCapability): string {
  const translations: Record<ViewerLocale, Partial<Record<PreviewCapability, string>>> = {
    en: {
      preview: 'Preview', 'select-text': 'Select text', copy: 'Copy',
      pages: 'Pages', print: 'Print', playback: 'Playback',
    },
    'zh-CN': {
      preview: '预览', 'select-text': '选择文本', copy: '复制',
      pages: '分页', print: '打印', playback: '播放',
    },
  }
  const translated = translations[locale.value][capability]
  if (translated) return translated
  return capability.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join(' ')
}

function sampleLabel(sample: SampleFile): string {
  return sample.labelKey ? t(sample.labelKey) : sample.customLabel || t('localFile')
}
</script>
