<template>
  <div class="portal">
    <header v-if="false" class="portal-nav">
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
        <a href="#plans">{{ marketing.navPlans }}</a>
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

    <SiteHeader active="playground" :links="projectLinks" :locale="locale" @change-locale="locale = $event" />

    <main id="top" class="portal-main playground-main">
      <section v-if="false" class="hero-section">
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

      <section v-if="false" class="format-rail" :aria-label="marketing.supportedFormats">
        <span v-for="format in featuredFormats" :key="format" class="format-pill">{{ format }}</span>
      </section>

      <section v-if="false" id="features" class="portal-section features-section">
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

      <section v-if="false" class="architecture-section">
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

      <section v-if="false" id="plans" class="portal-section plans-section">
        <div class="section-heading section-heading--split">
          <div>
            <span>{{ marketing.plansKicker }}</span>
            <h2>{{ marketing.plansTitle }}</h2>
          </div>
          <p>{{ marketing.plansDescription }}</p>
        </div>

        <div class="plan-grid">
          <article v-for="(plan, index) in marketing.plans" :key="plan.title" class="plan-card" :class="{ 'plan-card--featured': plan.featured }">
            <div class="plan-card__topline">
              <span class="plan-card__index">0{{ index + 1 }}</span>
              <span v-if="plan.featured" class="plan-card__recommended">{{ marketing.recommended }}</span>
            </div>
            <h3>{{ plan.title }}</h3>
            <p>{{ plan.description }}</p>
            <div class="plan-card__cost">
              <span>{{ marketing.browserCost }}</span>
              <strong>{{ plan.cost }}</strong>
              <small>{{ plan.costNote }}</small>
            </div>
            <ul>
              <li v-for="capability in plan.capabilities" :key="capability"><span aria-hidden="true">✓</span>{{ capability }}</li>
            </ul>
            <code>{{ plan.pack }}</code>
          </article>
        </div>
        <p class="plans-note">{{ marketing.plansNote }}</p>
      </section>

      <section v-if="false" id="formats" class="portal-section formats-section">
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

      <section v-if="false" id="integration" class="integration-section">
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
<span class="code-purple">import</span> { createAllFormatEngine } <span class="code-purple">from</span> <span class="code-green">'@previewdock/preset-all'</span>

<span class="code-purple">const</span> engine = createAllFormatEngine()
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
          <span>{{ officialSampleCount }} {{ t('samples') }}</span>
        </div>
        <label class="search">
          <span aria-hidden="true">⌕</span>
          <input v-model.trim="query" type="search" :placeholder="t('searchFiles')">
        </label>
        <div class="file-categories">
          <section v-if="localSamples.length" class="file-category file-category--local">
            <div class="category-row category-row--static">
              <span class="category-row__mark">ME</span>
              <span class="category-row__copy">
                <strong>{{ t('localFiles') }}</strong>
                <small>{{ localSamples.length }} {{ t('files') }}</small>
              </span>
            </div>
            <div class="file-list">
              <button
                v-for="sample in localSamples"
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
          </section>

          <section
            v-for="group in sampleGroups"
            :key="group.id"
            class="file-category"
            :class="{ 'file-category--open': isCategoryOpen(group.id) }"
          >
            <button
              type="button"
              class="category-row"
              :aria-expanded="isCategoryOpen(group.id)"
              :aria-label="`${isCategoryOpen(group.id) ? t('collapseCategory') : t('expandCategory')}：${group.title}`"
              @click="toggleCategory(group.id)"
            >
              <span class="category-row__mark" :data-category="group.id">{{ group.mark }}</span>
              <span class="category-row__copy">
                <strong>{{ group.title }}</strong>
                <small>{{ group.formats }}</small>
              </span>
              <span class="category-row__count">{{ group.items.length }}</span>
              <span class="category-row__chevron" aria-hidden="true">›</span>
            </button>

            <div v-if="isCategoryOpen(group.id)" class="file-list">
              <template v-for="family in group.families" :key="family.id">
                <div class="file-family-row">
                  <strong>{{ family.title }}</strong>
                  <span>{{ family.formats }}</span>
                </div>
                <button
                  v-for="sample in family.items"
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
                    <small v-if="sample.formats?.length" class="file-row__formats">
                      {{ t('formatCoverage') }} {{ sample.formats.join(' · ') }}
                    </small>
                  </span>
                </button>
              </template>
            </div>
          </section>

          <p v-if="!visibleSampleCount" class="file-list__empty">{{ t('noMatchingFiles') }}</p>
        </div>
      </aside>

      <section ref="previewPanelRef" class="preview-panel" :class="{ 'preview-panel--fullscreen': isPreviewFullscreen }">
        <div class="tabbar">
          <span>{{ t('preview') }}</span>
          <strong class="tabbar__filename">{{ activeFile.name }}</strong>
          <button
            type="button"
            class="fullscreen-button"
            :aria-label="isPreviewFullscreen ? t('exitFullscreen') : t('enterFullscreen')"
            :title="isPreviewFullscreen ? t('exitFullscreen') : t('enterFullscreen')"
            :aria-pressed="isPreviewFullscreen"
            @click="togglePreviewFullscreen"
          >
            <svg v-if="!isPreviewFullscreen" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/>
            </svg>
            <em>{{ isPreviewFullscreen ? t('exitFullscreen') : t('enterFullscreen') }}</em>
          </button>
        </div>
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

    <footer v-if="false" class="portal-footer">
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
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ViewerEngine,
  formatCategories,
  getFormatDefinition,
  type FileSource,
  type OpenResult,
  type PreviewCapability,
  type ViewerStatus,
} from '@previewdock/core'
import { createAllFormatEngine } from '@previewdock/preset-all'
import { PreviewDock, viewerMessages, type ViewerLocale } from '@previewdock/vue'
import { strToU8, zipSync } from 'fflate'
import { getSiteLocale, setSiteLocale, SiteHeader } from '@previewdock/site-shell'
import '@previewdock/site-shell/style.css'
import { projectLinks } from '../../../config/project'
import { createVirtualLargeZip } from './virtual-large-zip'

const assetBase = import.meta.env.BASE_URL
const generatedSampleBase = `${assetBase}samples/generated/`

interface SampleFile {
  id: string
  name: string
  labelKey?: UiKey
  customLabel?: string
  customLabelEn?: string
  shortType: string
  kind: string
  source: FileSource
  size?: number
  formats?: string[]
}

type SampleCategoryId =
  | 'documents'
  | 'text-data'
  | 'archives'
  | 'images'
  | 'media'
  | 'diagrams'
  | '3d-cad'

interface SampleCategory {
  id: SampleCategoryId
  mark: string
  titleKey: UiKey
  formats: string
  families: readonly {
    id: string
    label: string
    labelZh: string
    extensions: readonly string[]
  }[]
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
    home: 'Home', online: 'Playground', docs: 'Docs', localNotice: 'Your file stays in this browser',
    openFile: 'Open file', language: 'Language', detectionMode: 'File detection mode',
    autoDetect: 'Auto detect', extensionFirst: 'Extension first', magicFirst: 'Magic bytes first',
    source: 'Sample files', samples: 'examples', searchFiles: 'Search names or formats', preview: 'Preview',
    files: 'files', localFiles: 'My files', formatCoverage: 'Also covers:',
    expandCategory: 'Expand category', collapseCategory: 'Collapse category',
    enterFullscreen: 'Full screen', exitFullscreen: 'Exit full screen', noMatchingFiles: 'No matching examples',
    categoryDocuments: 'Office & Documents', categoryTextData: 'Text & Data',
    categoryArchives: 'Archives', categoryImages: 'Images', categoryMedia: 'Media',
    categoryDiagrams: 'Diagrams', category3dCad: '3D & CAD',
    inspector: 'Inspector', detectedFormat: 'Detected format', renderer: 'Renderer',
    loadingMode: 'Loading mode', lazyImport: 'Lazy adapter import', capabilities: 'Capabilities',
    waitingRenderer: 'Waiting for renderer', resourceStatus: 'Resource status', fileName: 'File name',
    fileSize: 'File size', mimeType: 'MIME type', adapter: 'Adapter', unknown: 'Unknown',
    workerPlanned: 'Worker runtime: loaded on demand', lazyFooter: 'Adapters loaded on demand',
    markdown: 'Markdown', plainText: 'Plain text', csv: 'CSV', json: 'JSON',
    svgImage: 'SVG image', pdfDocument: 'PDF document', zipArchive: 'ZIP archive',
    wordDocument: 'Word document', spreadsheet: 'Spreadsheet', presentation: 'Presentation',
    bpmnWorkflow: 'Formatted BPMN workflow', xmindMap: 'XMind mind map', visioDiagram: 'Visio diagram',
    odfDocument: 'OpenDocument document', ofdDocument: 'OFD document', epubBook: 'EPUB book',
    emailMessage: 'Email message', rtfDocument: 'RTF document',
    wpsDocument: 'WPS Writer document', wpsSpreadsheet: 'WPS spreadsheet',
    wpsPresentation: 'WPS presentation', windowsMetafile: 'Windows metafile',
    dxfDrawing: 'Interactive DXF drawing', stepModel: 'Interactive STEP model',
    igesModel: 'Interactive IGES model', offModel: 'Interactive OFF model', rhinoModel: 'Interactive Rhino 3DM model',
    ifcModel: 'Interactive IFC building model',
    localFile: 'Local file', detecting: 'Detecting…', resolving: 'Resolving…',
  },
  'zh-CN': {
    home: '首页', online: '在线预览', docs: '文档', localNotice: '文件仅在当前浏览器中处理',
    openFile: '打开文件', language: '语言', detectionMode: '文件识别方式',
    autoDetect: '自动识别', extensionFirst: '扩展名优先', magicFirst: '文件特征优先',
    source: '示例文件', samples: '个示例', searchFiles: '搜索文件名或格式', preview: '预览',
    files: '个文件', localFiles: '我的文件', formatCoverage: '同时覆盖：',
    expandCategory: '展开类别', collapseCategory: '收起类别',
    enterFullscreen: '全屏预览', exitFullscreen: '退出全屏', noMatchingFiles: '没有匹配的示例',
    categoryDocuments: 'Office 与文档', categoryTextData: '文本与数据',
    categoryArchives: '压缩包', categoryImages: '图片', categoryMedia: '音视频',
    categoryDiagrams: '图表与流程', category3dCad: '3D 与 CAD',
    inspector: '检查器', detectedFormat: '识别格式', renderer: '渲染器',
    loadingMode: '加载方式', lazyImport: '适配器按需加载', capabilities: '具备能力',
    waitingRenderer: '等待渲染器', resourceStatus: '资源状态', fileName: '文件名',
    fileSize: '文件大小', mimeType: 'MIME 类型', adapter: '适配器', unknown: '未知',
    workerPlanned: 'Worker 运行时：按需加载', lazyFooter: '适配器按格式加载',
    markdown: 'Markdown', plainText: '纯文本', csv: 'CSV', json: 'JSON',
    svgImage: 'SVG 图片', pdfDocument: 'PDF 文档', zipArchive: 'ZIP 压缩包',
    wordDocument: 'Word 文档', spreadsheet: '电子表格', presentation: '演示文稿',
    bpmnWorkflow: '格式化 BPMN 工作流', xmindMap: 'XMind 思维导图', visioDiagram: 'Visio 流程图',
    odfDocument: 'OpenDocument 文档', ofdDocument: 'OFD 文档', epubBook: 'EPUB 电子书',
    emailMessage: '邮件消息', rtfDocument: 'RTF 富文本文档',
    wpsDocument: 'WPS 文字文档', wpsSpreadsheet: 'WPS 表格',
    wpsPresentation: 'WPS 演示文稿', windowsMetafile: 'Windows 图元文件',
    dxfDrawing: '交互式 DXF 图纸', stepModel: '交互式 STEP 模型',
    igesModel: '交互式 IGES 模型', offModel: '交互式 OFF 模型', rhinoModel: '交互式 Rhino 3DM 模型',
    ifcModel: '交互式 IFC 建筑模型',
    localFile: '本地文件', detecting: '识别中…', resolving: '加载中…',
  },
} as const

type UiKey = keyof typeof ui.en

const locale = ref<ViewerLocale>(getSiteLocale())
function t(key: UiKey): string {
  return ui[locale.value][key]
}

const categoryPresentation = {
  documents: { mark: 'DOC', titleKey: 'categoryDocuments' },
  'text-data': { mark: '{ }', titleKey: 'categoryTextData' },
  archives: { mark: 'ARC', titleKey: 'categoryArchives' },
  images: { mark: 'IMG', titleKey: 'categoryImages' },
  media: { mark: 'AV', titleKey: 'categoryMedia' },
  diagrams: { mark: 'MAP', titleKey: 'categoryDiagrams' },
  '3d-cad': { mark: '3D', titleKey: 'category3dCad' },
} as const

const sampleCategories: SampleCategory[] = formatCategories.map(category => ({
  id: category.id,
  ...categoryPresentation[category.id],
  formats: category.families.flatMap(family => family.extensions).map(value => value.toUpperCase()).join(' · '),
  families: category.families,
}))

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
      navFeatures: '核心能力', navPlans: '接入方案', navFormats: '格式支持', navIntegration: '快速接入', navPlayground: '在线体验',
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
        { title: '压缩包深度预览', description: '普通模式支持 100 MB；ZIP/JAR 大文件模式最高 1 GB，并按选中文件解压。', icon: featureIcons.archive },
        { title: '统一交互体验', description: '不同格式共用一套加载、错误、取消与生命周期协议。', icon: featureIcons.render },
        { title: '安全边界清晰', description: '宏、脚本与活动内容不执行，远程处理必须显式启用。', icon: featureIcons.safe },
      ],
      architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: '小内核，能力按格式到达',
      architectureDescription: '核心只负责识别、路由和生命周期。重型解析器在命中格式后再异步加载，业务首屏不为偶尔使用的格式买单。',
      architecturePoints: ['适配器清单轻量注册', 'Worker / WASM 可独立部署', '关闭预览时确定性释放资源'],
      detectSource: '文件名、MIME 与特征字节', lightweightCore: '轻量核心运行时', loadMatchedOnly: '只加载命中的适配器',
      plansKicker: 'INTEGRATION PROFILES', plansTitle: '按场景接入，也按体积取舍',
      plansDescription: '从轻量预览到专业格式支持，能力包自由组合。安装某项能力不等于把解析器塞进首屏，重型资源仍在首次命中对应格式时加载。',
      recommended: '推荐起步', browserCost: '关键增量体积',
      plans: [
        { title: '轻量基础版', description: '适合消息附件、审批附件和简单文件详情页。', cost: '约 80 KB', costNote: '基础浏览器代码，压缩前', capabilities: ['文本、Markdown 与数据文件', '常见图片与 SVG', '浏览器原生 PDF'], pack: 'core + vue + basic', featured: true },
        { title: '企业文档版', description: '适合知识库、协作平台和办公文档中心。', cost: '约 1.3 MB', costNote: 'Office 渲染器按类型加载', capabilities: ['包含轻量基础能力', 'DOCX / XLSX / PPTX', '现代 Office 高保真预览'], pack: 'basic + modern-office', featured: false },
        { title: '文件中心版', description: '适合网盘、资产库和需要查看压缩包内容的系统。', cost: '约 1.1 MB', costNote: 'RAR / 7Z Worker 与 WASM', capabilities: ['包含基础与 Office 能力', 'ZIP/JAR 最高 1 GB', '目录浏览与按文件解压'], pack: 'basic + office + archive', featured: false },
        { title: '专业全能力版', description: '适合设计资产、工程模型和复杂历史文档场景。', cost: '按需组合', costNote: '旧版 DOC / PPT 可选约 53 MB WASM', capabilities: ['PSD / TIFF 等高级图片', '主流 3D 模型交互预览', '可选旧版 Office 转换'], pack: 'selected packs + optional WASM', featured: false },
      ],
      plansNote: '以上为当前工作区的未压缩近似值；生产环境会受压缩、缓存、依赖去重与浏览器能力影响。',
      formatsKicker: 'FORMAT COVERAGE', formatsTitle: '从办公文档到 3D 模型',
      formatsDescription: '当前实现以“能呈现有用内容”为支持标准，并明确区分原生、实验性与可选转换能力。',
      formatFamilies: [
        { mark: 'W', title: 'Office 办公文档', formats: 'DOC / DOCX · XLS / XLSX · PPT / PPTX', note: '新版高保真渲染，旧版格式按需转换', color: '#4263eb' },
        { mark: 'A', title: '压缩包', formats: 'ZIP · RAR · 7Z · TAR · GZIP · JAR', note: '普通模式 100 MB；ZIP/JAR 大文件模式最高 1 GB', color: '#9a55d6' },
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
    navFeatures: 'Features', navPlans: 'Profiles', navFormats: 'Formats', navIntegration: 'Integration', navPlayground: 'Playground',
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
      { title: 'Deep archive preview', description: 'Standard mode supports 100 MB; ZIP/JAR large-file mode reaches 1 GB and extracts only the selected entry.', icon: featureIcons.archive },
      { title: 'One interaction model', description: 'Every format shares loading, error, cancellation, and lifecycle contracts.', icon: featureIcons.render },
      { title: 'Explicit safety', description: 'Macros, scripts, and active content never run; remote processing is opt-in.', icon: featureIcons.safe },
    ],
    architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: 'A small core. Capability on demand.',
    architectureDescription: 'The core handles detection, routing, and lifecycle. Heavy parsers load after a format match, so occasional formats never tax the application shell.',
    architecturePoints: ['Lightweight adapter manifests', 'Worker and WASM assets deploy independently', 'Deterministic cleanup when a preview closes'],
    detectSource: 'Name, MIME, and magic bytes', lightweightCore: 'Lightweight core runtime', loadMatchedOnly: 'Only the matching adapter loads',
    plansKicker: 'INTEGRATION PROFILES', plansTitle: 'Choose by use case and payload budget',
    plansDescription: 'Combine capability packs from a lightweight viewer to specialist formats. Installing a pack does not put its parser on the first load; heavy resources still arrive only after a matching file is opened.',
    recommended: 'Recommended start', browserCost: 'Key incremental payload',
    plans: [
      { title: 'Basic viewer', description: 'For message attachments, approval flows, and simple file detail pages.', cost: '≈ 80 KB', costNote: 'basic browser code, uncompressed', capabilities: ['Text, Markdown, and data files', 'Common images and SVG', 'Browser-native PDF'], pack: 'core + vue + basic', featured: true },
      { title: 'Business documents', description: 'For knowledge bases, collaboration suites, and document centers.', cost: '≈ 1.3 MB', costNote: 'Office renderers load per type', capabilities: ['Everything in Basic', 'DOCX / XLSX / PPTX', 'High-fidelity modern Office preview'], pack: 'basic + modern-office', featured: false },
      { title: 'File center', description: 'For drives, asset libraries, and products that inspect archives.', cost: '≈ 1.1 MB', costNote: 'RAR / 7Z Worker and WASM', capabilities: ['Basic and Office capabilities', 'ZIP/JAR up to 1 GB', 'Directory browsing and selected-entry extraction'], pack: 'basic + office + archive', featured: false },
      { title: 'Specialist viewer', description: 'For design assets, engineering models, and legacy documents.', cost: 'Compose as needed', costNote: 'legacy DOC / PPT adds optional ≈ 53 MB WASM', capabilities: ['PSD / TIFF advanced images', 'Interactive mainstream 3D models', 'Optional legacy Office conversion'], pack: 'selected packs + optional WASM', featured: false },
    ],
    plansNote: 'Figures are approximate uncompressed measurements from this workspace. Production compression, caching, deduplication, and browser support will affect the final cost.',
    formatsKicker: 'FORMAT COVERAGE', formatsTitle: 'From office documents to 3D models',
    formatsDescription: 'Support means rendering useful content. Native, experimental, and optional conversion paths are intentionally distinguished.',
    formatFamilies: [
      { mark: 'W', title: 'Office documents', formats: 'DOC / DOCX · XLS / XLSX · PPT / PPTX', note: 'High-fidelity modern preview and optional legacy conversion', color: '#4263eb' },
      { mark: 'A', title: 'Archives', formats: 'ZIP · RAR · 7Z · TAR · GZIP · JAR', note: '100 MB standard mode; ZIP/JAR large mode up to 1 GB', color: '#9a55d6' },
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
import { createAllFormatEngine } from '@previewdock/preset-all'

const engine = createAllFormatEngine()
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

let engine: ViewerEngine

engine = createAllFormatEngine({
  archive: {
    workerUrl: `${assetBase}libarchive/worker-bundle.js`,
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
  },
  model: {
    occtWasmUrl: `${assetBase}occt/occt-import-js.wasm`,
    rhinoLibraryPath: `${assetBase}rhino/`,
    ifcWasmPath: `${assetBase}ifc/`,
  },
  legacyOffice: {
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
  },
})

let chineseOfficeFontPromise: Promise<Array<{ name: string, data: ArrayBuffer }>> | undefined
function loadChineseOfficeFont(): Promise<Array<{ name: string, data: ArrayBuffer }>> {
  if (!chineseOfficeFontPromise) {
    chineseOfficeFontPromise = fetch(`${assetBase}fonts/NotoSansCJKsc-Regular.otf`).then(async response => {
      if (!response.ok) throw new Error(`中文字体加载失败：${response.status}`)
      return [{ name: 'NotoSansCJKsc-Regular.otf', data: await response.arrayBuffer() }]
    })
  }
  return chineseOfficeFontPromise
}
const fileInputRef = ref<HTMLInputElement>()
const previewPanelRef = ref<HTMLElement>()
const query = ref('')
const detectionMode = ref('auto')
const inspectorState = ref<InspectorState>()
const status = ref<ViewerStatus>({ phase: 'idle', message: 'Worker ready' })
const isPreviewFullscreen = ref(false)
const openCategory = ref<SampleCategoryId | null>('text-data')

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
    '项目说明.txt': 'PreviewDock 项目交付资料\n\n此压缩包用于演示目录浏览与按文件解压。',
    '文档/上线清单.md': '# 上线清单\n\n- 构建前端\n- 配置响应头\n- 验证在线预览',
    '配置/previewdock.json': JSON.stringify({ preset: 'all-formats', locale: 'zh-CN' }, null, 2),
  }, '项目资料包.zip', 'application/zip')
}

function createOdfSample(kind: 'spreadsheet' | 'presentation'): File {
  const spreadsheetBody = `
    <table:table table:name="季度数据">
      <table:table-row>
        <table:table-cell><text:p>季度</text:p></table:table-cell>
        <table:table-cell><text:p>收入（万元）</text:p></table:table-cell>
        <table:table-cell><text:p>增长率</text:p></table:table-cell>
      </table:table-row>
      <table:table-row>
        <table:table-cell><text:p>Q1</text:p></table:table-cell>
        <table:table-cell><text:p>1280</text:p></table:table-cell>
        <table:table-cell><text:p>18%</text:p></table:table-cell>
      </table:table-row>
      <table:table-row>
        <table:table-cell><text:p>Q2</text:p></table:table-cell>
        <table:table-cell><text:p>1540</text:p></table:table-cell>
        <table:table-cell><text:p>20%</text:p></table:table-cell>
      </table:table-row>
    </table:table>`
  const presentationBody = `
    <draw:page draw:name="page1">
      <draw:frame><draw:text-box>
        <text:h>PreviewDock 产品发布</text:h>
        <text:p>七类格式，一套统一运行时</text:p>
      </draw:text-box></draw:frame>
    </draw:page>`
  const name = kind === 'spreadsheet' ? '季度经营数据.ods' : '产品发布方案.odp'
  const mediaType = kind === 'spreadsheet'
    ? 'application/vnd.oasis.opendocument.spreadsheet'
    : 'application/vnd.oasis.opendocument.presentation'
  return fileFromOpenXml({
    mimetype: mediaType,
    'content.xml': `<?xml version="1.0" encoding="UTF-8"?>
      <office:document-content
        xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
        xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
        xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0">
        <office:body>
          <office:${kind === 'spreadsheet' ? 'spreadsheet' : 'presentation'}>
            ${kind === 'spreadsheet' ? spreadsheetBody : presentationBody}
          </office:${kind === 'spreadsheet' ? 'spreadsheet' : 'presentation'}>
        </office:body>
      </office:document-content>`,
  }, name, mediaType)
}

function createFlatOdfSample(kind: 'document' | 'spreadsheet'): File {
  const body = kind === 'document'
    ? '<office:text><text:h>PreviewDock 接入确认单</text:h><text:p>文件在浏览器本地解析，适配器按需加载。</text:p></office:text>'
    : `<office:spreadsheet><table:table table:name="能力清单">
        <table:table-row><table:table-cell><text:p>类别</text:p></table:table-cell><table:table-cell><text:p>状态</text:p></table:table-cell></table:table-row>
        <table:table-row><table:table-cell><text:p>Office</text:p></table:table-cell><table:table-cell><text:p>可预览</text:p></table:table-cell></table:table-row>
      </table:table></office:spreadsheet>`
  const extension = kind === 'document' ? 'fodt' : 'fods'
  return new File([`<?xml version="1.0" encoding="UTF-8"?>
    <office:document
      xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
      xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
      xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0">
      <office:body>${body}</office:body>
    </office:document>`], `接入确认单.${extension}`, { type: 'application/xml' })
}

function createThreeMfSample(): File {
  return fileFromOpenXml({
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
      </Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
      </Relationships>`,
    '3D/3dmodel.model': `<?xml version="1.0" encoding="UTF-8"?>
      <model unit="millimeter" xml:lang="zh-CN" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
        <metadata name="Title">PreviewDock 产品展台</metadata>
        <resources>
          <object id="1" type="model"><mesh>
            <vertices>
              <vertex x="0" y="0" z="0"/><vertex x="20" y="0" z="0"/>
              <vertex x="20" y="20" z="0"/><vertex x="0" y="20" z="0"/>
              <vertex x="10" y="10" z="25"/>
            </vertices>
            <triangles>
              <triangle v1="0" v2="1" v3="4"/><triangle v1="1" v2="2" v3="4"/>
              <triangle v1="2" v2="3" v3="4"/><triangle v1="3" v2="0" v3="4"/>
              <triangle v1="0" v2="3" v3="2"/><triangle v1="0" v2="2" v3="1"/>
            </triangles>
          </mesh></object>
        </resources>
        <build><item objectid="1"/></build>
      </model>`,
  }, '产品展台.3mf', 'model/3mf')
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
          <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>PreviewDock 季度经营报告</w:t></w:r></w:p>
          <w:p><w:r><w:t>本季度文件预览服务运行稳定，Office、图片、压缩包和 3D 模型均通过浏览器统一打开。</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>关键进展</w:t></w:r></w:p>
          <w:p><w:r><w:t>七大类别能力包完成统一接入</w:t></w:r></w:p>
          <w:p><w:r><w:t>ZIP 与 JAR 支持大文件按条目读取</w:t></w:r></w:p>
          <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708"/>
          </w:sectPr>
        </w:body>
      </w:document>`,
  }, '季度经营报告.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
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
              <p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:r><a:rPr lang="zh-CN" sz="3000" b="1"><a:solidFill><a:srgbClr val="315EE7"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>PreviewDock 产品路线图</a:t></a:r><a:endParaRPr lang="zh-CN" sz="3000"/></a:p></p:txBody>
            </p:sp>
            <p:sp>
              <p:nvSpPr><p:cNvPr id="3" name="Subtitle"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
              <p:spPr><a:xfrm><a:off x="1371600" y="3048000"/><a:ext cx="9448800" cy="1066800"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="E8EEFF"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="9CB2F8"/></a:solidFill></a:ln></p:spPr>
              <p:txBody><a:bodyPr anchor="ctr" lIns="228600" rIns="228600"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="zh-CN" sz="1600"><a:solidFill><a:srgbClr val="253047"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>统一运行时 · 分类能力包 · 本地优先预览</a:t></a:r><a:endParaRPr lang="zh-CN" sz="1600"/></a:p></p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
        <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
      </p:sld>`,
  }, '产品路线图.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
}

function createPdfSample(): File {
  const stream = 'BT /F1 24 Tf 72 700 Td (PreviewDock Product Brief) Tj 0 -38 Td /F1 14 Tf (Seven format categories, one browser runtime.) Tj 0 -28 Td (Local-first preview with lazy-loaded adapters.) Tj ET\n'
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
  return new File([content], '产品白皮书.pdf', { type: 'application/pdf' })
}

const xlsxSampleBase64 = 'UEsDBBQAAAAIALNz/1x9j8M5SgAAAE0AAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLMJqSxILVaoyM3JK7ZVyigpKbDS1y9OzkjNTSzWyy9IzQPKpOUX5SaWALlF6foFicnZiemp+kYGBmb6yfl5Jal5JbolIDOU9O0AUEsDBBQAAAAIALNz/1yRt7JrcgAAAKUAAAAUAAAAeGwvc2hhcmVkU3RyaW5ncy54bWxljkEKwkAMRa8iPYApLlxIzEq6FjxBsNEpNDNhkoLHd9SF0C7/e2/x0T12L52zn7sUYScAvydR9n0xyc08SlWONusT3Krw6EkkdIZD3x9BecodoU+EQcO3RQhC+JAfvQXH4mt6vQybcDErNWT8C2j/6A1QSwMEFAAAAAgAs3P/XGDIfyKMAAAAAgEAABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWxdj90KAiEQRl9l8QEaNegiVCh6ETHLaP3BGXZ7/GwJkb2b+c7MYUatub4xeE/TJ84JNQtE5QyALvho8ZCLT408co2WWlufgKV6e9+W4gyS8xNE+0rMqC27WbJG1bxOVTPRUvcrLoJNpBm2fjFcwWIUuD+7jkx0Bs3RRbKL5DAsd6KRHXciGK6D/rb5AlBLAQIUABQAAAAIALNz/1x9j8M5SgAAAE0AAAATAAAAAAAAAAAAAAAAAAAAAABbQ29udGVudF9UeXBlc10ueG1sUEsBAhQAFAAAAAgAs3P/XJG3smtyAAAApQAAABQAAAAAAAAAAAAAAAAAewAAAHhsL3NoYXJlZFN0cmluZ3MueG1sUEsBAhQAFAAAAAgAs3P/XGDIfyKMAAAAAgEAABgAAAAAAAAAAAAAAAAAHwEAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbFBLBQYAAAAAAwADAMkAAADhAQAAAAA='

const readmeText = `# PreviewDock 产品说明

PreviewDock 为业务系统提供统一的浏览器文件预览能力。你可以在消息附件、项目资料库、审批详情和资产管理系统中使用同一套预览界面。

> 默认在当前浏览器内处理文件，在线体验不会自动上传用户选择的本地文件。

## 七大能力类别

- Office 与文档
- 文本与数据
- 压缩包
- 图片
- 音视频
- 图表与流程
- 3D 与 CAD

| 使用方式 | 适用场景 |
| --- | --- |
| 全格式预设 | 文件中心、网盘、综合资料库 |
| 分类能力包 | 审批附件、图片库、模型查看等明确场景 |

## 在线体验

请从左侧类别中选择示例文件。预览区域支持全屏查看，压缩包支持逐级进入目录并打开内部文件。
`

const svgSample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <rect width="800" height="520" fill="#f7f9fc"/>
  <rect x="140" y="80" width="520" height="360" rx="18" fill="#fff" stroke="#dce3ef"/>
  <circle cx="270" cy="215" r="62" fill="#315ee7" opacity=".92"/>
  <path d="M210 370l105-112 72 70 62-56 141 98z" fill="#9db2f6"/>
  <text x="400" y="135" text-anchor="middle" font-family="Arial" font-size="26" fill="#172033">Image adapter</text>
</svg>`

function generatedSample(
  id: string,
  path: string,
  name: string,
  shortType: string,
  kind: string,
  size: number,
  customLabel: string,
  customLabelEn: string,
  formats?: string[],
): SampleFile {
  return {
    id,
    name,
    shortType,
    kind,
    size,
    customLabel,
    customLabelEn,
    formats,
    source: `${generatedSampleBase}${path}`,
  }
}

const samples = ref<SampleFile[]>([
  {
    id: 'model-ifc',
    name: '双层住宅建筑.ifc',
    labelKey: 'ifcModel',
    shortType: 'IFC',
    kind: 'model',
    source: `${assetBase}samples/models/Duplex.ifc`,
    size: 1297114,
  },
  {
    id: 'model-3dm',
    name: '径向发动机.3dm',
    labelKey: 'rhinoModel',
    shortType: '3DM',
    kind: 'model',
    source: `${assetBase}samples/models/Motore_Radiale_14_Cilindri.3dm`,
    size: 1282442,
  },
  {
    id: 'cad-dxf',
    name: '设备平面图.dxf',
    labelKey: 'dxfDrawing',
    shortType: 'DXF',
    kind: 'model',
    source: `${assetBase}samples/models/all.dxf`,
    size: 398490,
  },
  {
    id: 'cad-step',
    name: '游戏手柄.STEP',
    labelKey: 'stepModel',
    shortType: 'STEP',
    kind: 'model',
    source: `${assetBase}samples/models/游戏手柄.STEP`,
    size: 375035,
    formats: ['STEP', 'STP'],
  },
  {
    id: 'cad-iges',
    name: '机械零件.iges',
    labelKey: 'igesModel',
    shortType: 'IGES',
    kind: 'model',
    source: `${assetBase}samples/models/ceshi001.iges`,
    size: 229554,
    formats: ['IGES', 'IGS'],
  },
  {
    id: 'model-off',
    name: '几何体网格.off',
    labelKey: 'offModel',
    shortType: 'OFF',
    kind: 'model',
    source: `${assetBase}samples/models/sample.off`,
    size: 167,
  },
  {
    id: 'wps-document',
    name: '项目需求说明书.wps',
    labelKey: 'wpsDocument',
    shortType: 'WPS',
    kind: 'document',
    source: `${assetBase}samples/office/基层党建指挥平台项目需求书.wps`,
    size: 13312,
    formats: ['WPS', 'WPT'],
  },
  {
    id: 'wps-spreadsheet',
    name: '年度销售数据.et',
    labelKey: 'wpsSpreadsheet',
    shortType: 'ET',
    kind: 'table',
    source: `${assetBase}samples/office/工作簿1.et`,
    size: 20992,
    formats: ['ET', 'ETT'],
  },
  {
    id: 'wps-presentation',
    name: '产品演示样例.dps',
    labelKey: 'wpsPresentation',
    shortType: 'DPS',
    kind: 'presentation',
    source: `${generatedSampleBase}office/product-presentation.dps`,
    size: 125440,
  },
  {
    id: 'windows-metafile',
    name: '系统架构图.wmf',
    labelKey: 'windowsMetafile',
    shortType: 'WMF',
    kind: 'image',
    source: `${assetBase}samples/images/image54.wmf`,
    size: 2012,
    formats: ['WMF', 'EMF'],
  },
  {
    id: 'bpmn-approval-flow',
    name: '采购审批流程.bpmn',
    labelKey: 'bpmnWorkflow',
    shortType: 'BPMN',
    kind: 'diagram',
    source: `${assetBase}samples/structured/approval_of_bookmarks.bpmn`,
    size: 12355,
  },
  {
    id: 'xmind-architecture-study',
    name: '系统架构规划.xmind',
    labelKey: 'xmindMap',
    shortType: 'XMIND',
    kind: 'diagram',
    source: `${assetBase}samples/structured/系统架构师备考.xmind`,
    size: 1934624,
  },
  {
    id: 'visio-tpch-module',
    name: '酒店预订办理流程.vsdx',
    labelKey: 'visioDiagram',
    shortType: 'VSDX',
    kind: 'diagram',
    source: `${generatedSampleBase}diagrams/process-overview.vsdx`,
    size: 34167,
    formats: ['VSDX', 'VSD'],
  },
  {
    id: 'ofd-document',
    name: '电子票据示例.ofd',
    labelKey: 'ofdDocument',
    shortType: 'OFD',
    kind: 'document',
    source: `${assetBase}samples/structured/fileTest.ofd`,
    size: 82318,
  },
  {
    id: 'odt-document',
    name: '会员申请表.odt',
    labelKey: 'odfDocument',
    shortType: 'ODT',
    kind: 'document',
    source: `${assetBase}samples/structured/bh_fiche_adhesion.odt`,
    size: 172220,
    formats: ['ODT', 'OTT'],
  },
  {
    id: 'epub-book',
    name: '经典读物节选.epub',
    labelKey: 'epubBook',
    shortType: 'EPUB',
    kind: 'document',
    source: `${assetBase}samples/structured/The Moon and Sixpence.epub`,
    size: 608912,
  },
  {
    id: 'email-message',
    name: '项目周报.eml',
    labelKey: 'emailMessage',
    shortType: 'EML',
    kind: 'document',
    source: `${assetBase}samples/structured/sample.eml`,
    size: 112,
  },
  {
    id: 'rtf-document',
    name: '会议纪要.rtf',
    labelKey: 'rtfDocument',
    shortType: 'RTF',
    kind: 'document',
    source: `${assetBase}samples/structured/sample.rtf`,
    size: 94,
  },
  {
    id: 'legacy-doc-chinese-regression',
    name: '案例资料勘误.doc',
    customLabel: '旧版 Word 中文文档',
    customLabelEn: 'Legacy Word document',
    shortType: 'DOC',
    kind: 'document',
    source: `${assetBase}samples/案例专辑+历年真题 勘误.doc`,
    size: 1043456,
    formats: ['DOC', 'DOT'],
  },
  {
    id: 'archive-rar',
    name: '项目交付包.rar',
    customLabel: 'RAR 项目归档',
    customLabelEn: 'RAR project archive',
    shortType: 'RAR',
    kind: 'archive',
    source: `${assetBase}samples/archives/sample.rar`,
    size: 95351,
  },
  {
    id: 'archive-7z',
    name: '配置备份.7z',
    customLabel: '7Z 配置备份',
    customLabelEn: '7Z configuration backup',
    shortType: '7Z',
    kind: 'archive',
    source: `${assetBase}samples/archives/sample.7z`,
    size: 340,
  },
  {
    id: 'archive-tar',
    name: '服务器日志.tar',
    customLabel: 'TAR 日志归档',
    customLabelEn: 'TAR log archive',
    shortType: 'TAR',
    kind: 'archive',
    source: `${assetBase}samples/archives/sample.tar`,
    size: 14848,
  },
  {
    id: 'archive-gzip',
    name: '运行日志.gzip',
    customLabel: 'GZIP 单文件压缩',
    customLabelEn: 'GZIP compressed log',
    shortType: 'GZ',
    kind: 'archive',
    source: `${assetBase}samples/archives/sample.gzip`,
    size: 145,
    formats: ['GZ', 'GZIP'],
  },
  {
    id: 'archive-jar',
    name: '应用资源包.jar',
    customLabel: 'JAR 应用资源',
    customLabelEn: 'JAR application resources',
    shortType: 'JAR',
    kind: 'archive',
    source: `${assetBase}samples/archives/sample.jar`,
    size: 735,
  },
  generatedSample('archive-tgz', 'archives/project-logs.tgz', '项目日志归档.tgz', 'TGZ', 'archive', 800, 'TGZ 多文件压缩包', 'TGZ multi-file archive'),
  {
    id: 'readme',
    name: '产品说明.md',
    labelKey: 'markdown',
    shortType: 'MD',
    kind: 'text',
    source: new File([readmeText], 'README.md', { type: 'text/markdown' }),
  },
  {
    id: 'notes',
    name: '接入说明.txt',
    labelKey: 'plainText',
    shortType: 'TXT',
    kind: 'text',
    source: new File(['PreviewDock 接入说明\n\n1. 选择全格式预设或按业务模块引入。\n2. 传入 File、Blob 或可访问的 URL。\n3. 适配器只在命中格式时加载。'], '接入说明.txt', { type: 'text/plain' }),
    formats: ['TXT', 'LOG'],
  },
  {
    id: 'data',
    name: '格式支持矩阵.csv',
    labelKey: 'csv',
    shortType: 'CSV',
    kind: 'table',
    source: new File(['类别,格式,状态\nOffice,DOCX,可预览\n图片,TIFF,可预览\n压缩包,ZIP,按文件解压\n3D 与 CAD,GLB,可交互'], '格式支持矩阵.csv', { type: 'text/csv' }),
    formats: ['CSV', 'TSV'],
  },
  {
    id: 'config',
    name: '运行时配置.json',
    labelKey: 'json',
    shortType: 'JSON',
    kind: 'code',
    source: new File([JSON.stringify({
      runtime: 'browser',
      preset: 'all-formats',
      lazyAdapters: true,
      workerIsolation: true,
      archiveLargeFileMode: 'range',
    }, null, 2)], '运行时配置.json', { type: 'application/json' }),
  },
  {
    id: 'image',
    name: '产品架构图.svg',
    labelKey: 'svgImage',
    shortType: 'SVG',
    kind: 'image',
    source: new File([svgSample], 'sample.svg', { type: 'image/svg+xml' }),
  },
  {
    id: 'pdf',
    name: '产品白皮书.pdf',
    labelKey: 'pdfDocument',
    shortType: 'PDF',
    kind: 'document',
    source: createPdfSample(),
  },
  {
    id: 'archive',
    name: '项目资料包.zip',
    labelKey: 'zipArchive',
    shortType: 'ZIP',
    kind: 'archive',
    source: createArchiveSample(),
  },
  {
    id: 'archive-large-demo',
    name: '大型项目资料库.zip',
    customLabel: '110 MB 大文件模式 · 110 个文件按需读取',
    customLabelEn: '110 MB large-file mode · 110 files read on demand',
    shortType: 'ZIP',
    kind: 'archive',
    source: createVirtualLargeZip(),
    formats: ['ZIP', 'HTTP Range'],
  },
  {
    id: 'docx',
    name: '季度经营报告.docx',
    labelKey: 'wordDocument',
    shortType: 'DOCX',
    kind: 'document',
    source: createDocxSample(),
    formats: ['DOCX', 'DOCM', 'DOTX', 'DOTM'],
  },
  {
    id: 'xlsx',
    name: '销售预测.xlsx',
    labelKey: 'spreadsheet',
    shortType: 'XLSX',
    kind: 'table',
    source: fileFromBase64(xlsxSampleBase64, 'sample.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    formats: ['XLSX', 'XLSM', 'XLTX', 'XLTM', 'XLAM'],
  },
  {
    id: 'pptx',
    name: '产品路线图.pptx',
    labelKey: 'presentation',
    shortType: 'PPTX',
    kind: 'presentation',
    source: createPptxSample(),
    formats: ['PPTX', 'PPTM', 'POTX', 'POTM', 'PPSX', 'PPSM'],
  },
  {
    id: 'legacy-spreadsheet',
    name: '历史销售台账.xls',
    customLabel: '旧版 Excel 工作簿',
    customLabelEn: 'Legacy Excel workbook',
    shortType: 'XLS',
    kind: 'table',
    source: `${assetBase}samples/office/工作簿1.et`,
    size: 20992,
    formats: ['XLS', 'XLT', 'XLA'],
  },
  {
    id: 'legacy-presentation',
    name: '产品演示样例.ppt',
    customLabel: '旧版 PowerPoint 演示',
    customLabelEn: 'Legacy PowerPoint deck',
    shortType: 'PPT',
    kind: 'presentation',
    source: `${generatedSampleBase}office/product-presentation.ppt`,
    size: 125440,
  },
  {
    id: 'odf-spreadsheet',
    name: '季度经营数据.ods',
    customLabel: 'OpenDocument 表格',
    customLabelEn: 'OpenDocument spreadsheet',
    shortType: 'ODS',
    kind: 'table',
    source: createOdfSample('spreadsheet'),
    formats: ['ODS', 'OTS'],
  },
  {
    id: 'odf-presentation',
    name: '产品发布方案.odp',
    customLabel: 'OpenDocument 演示文稿',
    customLabelEn: 'OpenDocument presentation',
    shortType: 'ODP',
    kind: 'presentation',
    source: createOdfSample('presentation'),
    formats: ['ODP', 'OTP'],
  },
  {
    id: 'flat-odf-document',
    name: '接入确认单.fodt',
    customLabel: 'Flat OpenDocument 文档',
    customLabelEn: 'Flat OpenDocument text',
    shortType: 'FODT',
    kind: 'document',
    source: createFlatOdfSample('document'),
  },
  {
    id: 'flat-odf-spreadsheet',
    name: '能力清单.fods',
    customLabel: 'Flat OpenDocument 表格',
    customLabelEn: 'Flat OpenDocument spreadsheet',
    shortType: 'FODS',
    kind: 'table',
    source: createFlatOdfSample('spreadsheet'),
  },
  {
    id: 'text-xml',
    name: '订单数据.xml',
    customLabel: '结构化 XML 数据',
    customLabelEn: 'Structured XML data',
    shortType: 'XML',
    kind: 'code',
    source: new File([
      '<?xml version="1.0" encoding="UTF-8"?>\n<orders><order id="PD-2026-0803"><customer>示例客户</customer><amount currency="CNY">12800</amount><status>confirmed</status></order></orders>',
    ], '订单数据.xml', { type: 'application/xml' }),
  },
  {
    id: 'text-typescript',
    name: 'preview-config.ts',
    customLabel: 'TypeScript 接入配置',
    customLabelEn: 'TypeScript integration config',
    shortType: 'TS',
    kind: 'code',
    source: new File([
      "import { createAllFormatEngine } from '@previewdock/preset-all'\n\nexport const previewEngine = createAllFormatEngine()\n",
    ], 'preview-config.ts', { type: 'text/typescript' }),
    formats: ['JS', 'TS'],
  },
  {
    id: 'text-web',
    name: 'preview-shell.html',
    customLabel: 'Web 页面示例',
    customLabelEn: 'Web page sample',
    shortType: 'HTML',
    kind: 'code',
    source: new File([
      '<!doctype html>\\n<html lang="zh-CN"><head><title>PreviewDock</title><style>.viewer{min-height:480px}</style></head><body><main class="viewer">文件预览区域</main></body></html>',
    ], 'preview-shell.html', { type: 'text/html' }),
    formats: ['HTML', 'CSS'],
  },
  {
    id: 'text-backend',
    name: 'preview-audit.sql',
    customLabel: '预览审计查询',
    customLabelEn: 'Preview audit query',
    shortType: 'SQL',
    kind: 'code',
    source: new File([
      "SELECT format, COUNT(*) AS preview_count\\nFROM preview_events\\nWHERE created_at >= CURRENT_DATE - INTERVAL '7 days'\\nGROUP BY format\\nORDER BY preview_count DESC;",
    ], 'preview-audit.sql', { type: 'text/plain' }),
    formats: ['JAVA', 'PHP', 'PY', 'SQL', 'SH'],
  },
  generatedSample('image-png', 'images/product-dashboard.png', 'NASA 蓝色弹珠地球.png', 'PNG', 'image', 1298920, 'PNG NASA 地球影像', 'PNG NASA Earth image'),
  generatedSample('image-jpeg', 'images/product-dashboard.jpg', 'NASA 蓝色弹珠地球.jpg', 'JPG', 'image', 317871, 'JPEG NASA 地球影像', 'JPEG NASA Earth image', ['JPG', 'JPEG', 'JFIF']),
  generatedSample('image-gif', 'images/product-dashboard.gif', 'NASA 地球缩放动效.gif', 'GIF', 'image', 1324489, 'GIF NASA 地球动效', 'GIF NASA Earth animation'),
  generatedSample('image-webp', 'images/product-dashboard.webp', 'NASA 蓝色弹珠地球.webp', 'WEBP', 'image', 167028, 'WebP NASA 地球影像', 'WebP NASA Earth image'),
  generatedSample('image-bmp', 'images/product-dashboard.bmp', 'NASA 蓝色弹珠地球.bmp', 'BMP', 'image', 2764854, 'BMP NASA 地球影像', 'BMP NASA Earth image'),
  generatedSample('image-ico', 'images/product-dashboard.ico', 'NASA 地球图标.ico', 'ICO', 'image', 205086, 'ICO NASA 地球图标', 'ICO NASA Earth icon'),
  generatedSample('image-tiff', 'images/product-dashboard.tiff', 'NASA 蓝色弹珠地球.tiff', 'TIFF', 'image', 1521053, 'TIFF NASA 地球影像', 'TIFF NASA Earth image', ['TIF', 'TIFF']),
  generatedSample('image-tga', 'images/product-dashboard.tga', 'NASA 蓝色弹珠地球.tga', 'TGA', 'image', 1697678, 'TGA NASA 地球影像', 'TGA NASA Earth image'),
  generatedSample('image-psd', 'images/product-dashboard.psd', 'NASA 蓝色弹珠地球.psd', 'PSD', 'image', 3434034, 'PSD NASA 地球影像', 'PSD NASA Earth image'),
  generatedSample('media-mp3', 'media/preview-tone.mp3', '霸王龙吼声音效.mp3', 'MP3', 'media', 39868, 'MP3 霸王龙吼声', 'MP3 T-Rex roar'),
  generatedSample('media-wav', 'media/preview-tone.wav', '霸王龙吼声音效.wav', 'WAV', 'media', 365970, 'WAV 霸王龙吼声', 'WAV T-Rex roar'),
  generatedSample('media-ogg', 'media/preview-tone.ogg', '霸王龙吼声音效.ogg', 'OGG', 'media', 35634, 'Ogg 霸王龙吼声', 'Ogg T-Rex roar', ['OGG', 'OGA']),
  generatedSample('media-m4a', 'media/preview-tone.m4a', '霸王龙吼声音效.m4a', 'M4A', 'media', 34401, 'M4A / AAC 霸王龙吼声', 'M4A / AAC T-Rex roar', ['M4A', 'AAC']),
  generatedSample('media-flac', 'media/preview-tone.flac', '霸王龙吼声音效.flac', 'FLAC', 'media', 263052, 'FLAC 霸王龙吼声', 'FLAC T-Rex roar'),
  generatedSample('media-opus', 'media/preview-tone.opus', '霸王龙吼声音效.opus', 'OPUS', 'media', 26680, 'Opus 霸王龙吼声', 'Opus T-Rex roar'),
  generatedSample('media-mp4', 'media/product-tour.mp4', '花朵延时摄影.mp4', 'MP4', 'media', 1128375, 'MP4 花朵延时视频', 'MP4 flower time-lapse', ['MP4', 'M4V', 'MOV']),
  generatedSample('media-webm', 'media/product-tour.webm', '花朵延时摄影.webm', 'WEBM', 'media', 554058, 'WebM 花朵延时视频', 'WebM flower time-lapse', ['WEBM', 'OGV']),
  generatedSample('model-glb', 'models/product-demo.glb', '飞行动效模型.glb', 'GLB', 'model', 77428, 'GLB 动画模型', 'GLB animated model'),
  generatedSample('model-gltf', 'models/product-scene.gltf', '产品展台.gltf', 'GLTF', 'model', 1399, 'glTF 场景模型', 'glTF scene model'),
  generatedSample('model-obj', 'models/product-scene.obj', '产品展台.obj', 'OBJ', 'model', 238, 'OBJ 网格模型', 'OBJ mesh model'),
  generatedSample('model-stl', 'models/product-scene.stl', '打印件.stl', 'STL', 'model', 531, 'STL 3D 打印模型', 'STL print model'),
  generatedSample('model-ply', 'models/product-scene.ply', '扫描网格.ply', 'PLY', 'model', 266, 'PLY 扫描网格', 'PLY scan mesh'),
  generatedSample('model-fbx', 'models/product-demo.fbx', '角色动画.fbx', 'FBX', 'model', 3681360, 'FBX 动画模型', 'FBX animated model'),
  generatedSample('model-dae', 'models/product-scene.dae', '产品展台.dae', 'DAE', 'model', 2086, 'Collada 场景', 'Collada scene'),
  generatedSample('model-3ds', 'models/product-demo.3ds', '工业设备.3ds', '3DS', 'model', 119053, '3DS 工业模型', '3DS industrial model'),
  {
    id: 'model-3mf',
    name: '产品展台.3mf',
    customLabel: '3MF 制造模型',
    customLabelEn: '3MF manufacturing model',
    shortType: '3MF',
    kind: 'model',
    source: createThreeMfSample(),
  },
  generatedSample('model-wrl', 'models/product-scene.wrl', '虚拟展台.wrl', 'WRL', 'model', 523, 'VRML 虚拟场景', 'VRML virtual scene'),
  generatedSample('model-brep', 'models/product-cylinder.brep', '精密实体.brep', 'BREP', 'model', 48711, 'Open CASCADE BREP 模型', 'Open CASCADE BREP model'),
])

const activeFile = ref(
  samples.value.find(sample => sample.id === 'readme') || samples.value[0] as SampleFile,
)

function sampleCategory(sample: SampleFile): SampleCategoryId | undefined {
  if (sample.kind === 'local') return undefined
  if (sample.kind === 'archive') return 'archives'
  if (sample.kind === 'media') return 'media'
  if (sample.kind === 'model') return '3d-cad'
  if (sample.kind === 'diagram' || sample.id === 'windows-metafile') return 'diagrams'
  if (sample.kind === 'image') return 'images'
  if (sample.kind === 'document' || sample.kind === 'presentation') return 'documents'
  if (sample.kind === 'table' && sample.id !== 'data') return 'documents'
  return 'text-data'
}

function matchesQuery(sample: SampleFile): boolean {
  const keyword = query.value.trim().toLocaleLowerCase()
  if (!keyword) return true
  const haystack = [
    sample.name,
    sample.shortType,
    sampleLabel(sample),
    ...(sample.formats || []),
  ].join(' ').toLocaleLowerCase()
  return haystack.includes(keyword)
}

const officialSampleCount = computed(() => samples.value.filter(sample => sample.kind !== 'local').length)
const localSamples = computed(() => samples.value.filter(sample => sample.kind === 'local' && matchesQuery(sample)))

function sampleFamilyId(sample: SampleFile): string | undefined {
  const candidates = [
    ...(sample.formats || []),
    sample.shortType,
    sample.name.split('.').pop() || '',
  ].flatMap(value => value.split(/[\/\s,·]+/))
  for (const candidate of candidates) {
    const definition = getFormatDefinition(candidate)
    if (definition) return definition.family
  }
  return undefined
}

const sampleGroups = computed(() => sampleCategories
  .map(category => {
    const items = samples.value.filter(sample => sampleCategory(sample) === category.id && matchesQuery(sample))
    const families = category.families
      .map(family => ({
        id: family.id,
        title: locale.value === 'zh-CN' ? family.labelZh : family.label,
        formats: family.extensions.map(value => value.toUpperCase()).join(' · '),
        items: items.filter(sample => sampleFamilyId(sample) === family.id),
      }))
      .filter(family => !query.value || family.items.length)
    const assigned = new Set(families.flatMap(family => family.items.map(sample => sample.id)))
    const otherItems = items.filter(sample => !assigned.has(sample.id))
    if (otherItems.length) {
      families.push({
        id: 'other',
        title: locale.value === 'zh-CN' ? '其他示例' : 'Other examples',
        formats: '',
        items: otherItems,
      })
    }
    return { ...category, title: t(category.titleKey), items, families }
  })
  .filter(group => !query.value || group.items.length))
const visibleSampleCount = computed(() => (
  localSamples.value.length + sampleGroups.value.reduce((total, group) => total + group.items.length, 0)
))

function isCategoryOpen(category: SampleCategoryId): boolean {
  return Boolean(query.value) || openCategory.value === category
}

function toggleCategory(category: SampleCategoryId): void {
  openCategory.value = openCategory.value === category ? null : category
}

function setPreviewFullscreen(next: boolean): void {
  isPreviewFullscreen.value = next
  document.documentElement.classList.toggle('previewdock-preview-open', next)
}

function togglePreviewFullscreen(): void {
  if (!previewPanelRef.value) return
  setPreviewFullscreen(!isPreviewFullscreen.value)
}

function handleFullscreenKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isPreviewFullscreen.value) {
    setPreviewFullscreen(false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleFullscreenKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleFullscreenKeydown)
  document.documentElement.classList.remove('previewdock-preview-open')
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
    openxml: 'High-fidelity Office preview', structured: 'Structured document renderer',
  },
  'zh-CN': {
    text: '文本渲染器', image: '浏览器图片渲染器', pdf: '浏览器 PDF 查看器',
    media: '浏览器媒体播放器', archive: '压缩包浏览器', 'model-3d': '交互式 3D 模型查看器',
    'advanced-image': 'TIFF、TGA 与 PSD 渲染器', 'legacy-office': '旧版 Office 预览',
    openxml: '高保真 Office 预览', structured: '结构化文档渲染器',
  },
}
const rendererName = computed(() => {
  const result = inspectorState.value
  if (!result) return t('resolving')
  return rendererLabels[locale.value][result.adapterId] || result.adapterLabel
})
const translatedStatus = computed(() => viewerMessages[locale.value].phases[status.value.phase])

watch(locale, nextLocale => {
  setSiteLocale(nextLocale)
}, { immediate: true })

function selectSample(sample: SampleFile): void {
  inspectorState.value = undefined
  activeFile.value = sample
  const category = sampleCategory(sample)
  if (category) openCategory.value = category
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
  if (sample.labelKey) return t(sample.labelKey)
  if (locale.value === 'en' && sample.customLabelEn) return sample.customLabelEn
  return sample.customLabel || t('localFile')
}
</script>
