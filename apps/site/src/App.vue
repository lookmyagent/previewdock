<script setup lang="ts">
import { computed, ref } from 'vue'
import { getLocalizedPath, getSiteLocale, setSiteLocale, type SiteLocale, SiteFooter, SiteHeader } from '@previewdock/site-shell'
import '@previewdock/site-shell/style.css'
import { projectLinks, projectMeta } from '../../../config/project'

const locale = ref<SiteLocale>(getSiteLocale())
const docsUrl = computed(() => getLocalizedPath(projectLinks.docs, locale.value))
const playgroundUrl = computed(() => getLocalizedPath(projectLinks.playground, locale.value))
const docsPage = (page: string) => locale.value === 'en' ? docsUrl.value : `${projectLinks.docs}${page}`

function changeLocale(nextLocale: SiteLocale) {
  locale.value = nextLocale
  setSiteLocale(nextLocale)
}

const formats = [
  ['Office', 'DOCX · XLSX · PPTX · DOC · XLS · PPT'],
  ['Text & Data', 'TXT · MD · CSV · JSON · XML · Source'],
  ['Images', 'PNG · JPEG · SVG · TIFF · TGA · PSD'],
  ['Archives', 'ZIP · RAR · 7Z · TAR · GZIP · JAR'],
  ['Media & PDF', 'PDF · MP3 · WAV · MP4 · WebM'],
  ['3D Models', 'GLB · OBJ · STL · FBX · DAE · 3MF'],
]

const copy = computed(() => locale.value === 'en' ? {
  heroTitle: 'One component.', heroAccent: 'Preview almost any file.',
  heroDescription: 'A browser-native, local-first file preview runtime for modern web applications. Office, PDF, archives, images, media, and 3D share one lightweight lifecycle.',
  openPlayground: 'Open playground →', readDocs: 'Read integration docs', optionalPacks: '9 optional capability packs', noBackend: '0 required backend services',
  capabilityKicker: 'WHY PREVIEWDOCK', capabilityTitle: 'Designed for real products', capabilityDescription: 'Keep the core small and stable; deliver complex formats as independent capability packs.',
  capabilities: [
    { key: 'LOCAL', title: 'Files stay local', text: 'Detection and rendering happen in the browser by default. Remote processing is an explicit host choice.' },
    { key: 'LAZY', title: 'Load on match', text: 'Lightweight manifests route files first, so Office, 3D, and WASM stay out of unrelated first loads.' },
    { key: 'PACK', title: 'Compose capabilities', text: 'Install Basic, Office, Archive, Media, and 3D packs according to the product scenario.' },
  ],
  architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: 'Detect, route, and load on demand', architectureDescription: 'Opening a text file does not download Office, archive, CAD, or media engines.', architectureLink: 'Explore the architecture →',
  formatKicker: 'FORMAT COVERAGE', formatTitle: 'From documents to 3D models', formatDescription: 'Support levels and limitations stay explicit; recognizing an extension is not a promise of full fidelity.', formatLink: 'View the complete format matrix →',
  profilesKicker: 'INTEGRATION PROFILES', profilesTitle: 'Control capability and payload by scenario', profilesDescription: 'The portal shows typical combinations. Exact dependencies, deployment cost, and configuration live in the integration docs.', profilesLink: 'Compare all integration profiles →',
  profiles: [
    { title: 'Basic viewer', cost: '≈ 80 KB', packs: 'core + vue + basic', use: 'Attachments and file details' },
    { title: 'Business documents', cost: '≈ 1.3 MB incremental', packs: 'basic + modern-office', use: 'Knowledge bases and collaboration' },
    { title: 'File center', cost: '≈ 1.1 MB archive runtime', packs: 'basic + office + archive', use: 'Drives and digital asset libraries' },
  ],
  closingKicker: 'READY TO PREVIEW?', closingTitle: 'Validate with real files before integrating.', closingDescription: 'The online playground does not upload your files by default.', enterPlayground: 'Open playground', viewSource: 'View GitHub source',
} : {
  heroTitle: '一个组件，', heroAccent: '按需预览各种文件。',
  heroDescription: '面向现代 Web 应用的本地优先文件预览运行时。Office、PDF、压缩包、图片、音视频与 3D 模型，共用一套轻量生命周期。',
  openPlayground: '在线打开文件 →', readDocs: '阅读接入文档', optionalPacks: '9 个可选能力包', noBackend: '0 个强制后端服务',
  capabilityKicker: 'WHY PREVIEWDOCK', capabilityTitle: '为真正的业务系统设计', capabilityDescription: '核心保持小而稳定，复杂格式以独立能力包到达。',
  capabilities: [
    { key: 'LOCAL', title: '文件留在本地', text: '默认在浏览器内检测与渲染，远程处理必须由业务明确启用。' },
    { key: 'LAZY', title: '命中格式再加载', text: '轻量 manifest 先完成路由，Office、3D 与 WASM 不进入无关首屏。' },
    { key: 'PACK', title: '能力自由组合', text: 'Basic、Office、Archive、Media、3D 等能力包按系统需求安装。' },
  ],
  architectureKicker: 'LAZY ADAPTER ARCHITECTURE', architectureTitle: '识别、路由、按需加载', architectureDescription: '打开一个文本文件，不会下载 Office、归档、CAD 或媒体引擎。', architectureLink: '了解架构设计 →',
  formatKicker: 'FORMAT COVERAGE', formatTitle: '从文档到 3D 模型', formatDescription: '支持等级与限制公开记录，不因识别扩展名就宣称完整兼容。', formatLink: '查看完整格式支持矩阵 →',
  profilesKicker: 'INTEGRATION PROFILES', profilesTitle: '按使用场景控制体积', profilesDescription: '门户只展示典型组合；精确依赖、部署成本和配置方式在文档中持续维护。', profilesLink: '比较全部接入方案 →',
  profiles: [
    { title: '轻量预览', cost: '≈ 80 KB', packs: 'core + vue + basic', use: '附件、审批与文件详情' },
    { title: '办公文档', cost: '≈ 1.3 MB 增量', packs: 'basic + modern-office', use: '知识库与协作平台' },
    { title: '文件中心', cost: '≈ 1.1 MB 归档运行时', packs: 'basic + office + archive', use: '网盘与数字资产库' },
  ],
  closingKicker: 'READY TO PREVIEW?', closingTitle: '先用真实文件验证，再开始接入。', closingDescription: '在线预览默认不会上传你的文件。', enterPlayground: '进入在线预览', viewSource: '查看 GitHub 源码',
})
</script>

<template>
  <div class="site-shell">
    <SiteHeader active="home" :links="projectLinks" :locale="locale" @change-locale="changeLocale" />

    <main>
      <section class="hero">
        <div class="hero-copy">
          <span class="stage"><i></i>{{ projectMeta.version }} · {{ projectMeta.stage }}</span>
          <h1>{{ copy.heroTitle }}<br><em>{{ copy.heroAccent }}</em></h1>
          <p>{{ copy.heroDescription }}</p>
          <div class="hero-actions">
            <a class="button button-primary" :href="playgroundUrl">{{ copy.openPlayground }}</a>
            <a class="button button-secondary" :href="docsUrl">{{ copy.readDocs }}</a>
          </div>
          <div class="hero-meta"><span>{{ copy.optionalPacks }}</span><span>{{ copy.noBackend }}</span><span>{{ projectMeta.license }}</span></div>
        </div>

        <div class="product" aria-label="PreviewDock 工作界面示意">
          <div class="product-bar"><span class="dots">● ● ●</span><strong>preview.workspace</strong><small>LOCAL</small></div>
          <div class="product-body">
            <aside><small>FILES</small><b class="active">proposal.docx</b><b>metrics.xlsx</b><b>archive.zip</b><b>model.glb</b></aside>
            <div class="canvas"><div class="toolbar">proposal.docx <span>100%</span></div><article><small>PROJECT BRIEF</small><h2>Universal preview,<br>one component.</h2><i></i><i></i><i class="short"></i></article><span class="local-state">● Rendered locally</span></div>
          </div>
        </div>
      </section>

      <section id="capabilities" class="section">
        <div class="section-head"><span>{{ copy.capabilityKicker }}</span><h2>{{ copy.capabilityTitle }}</h2><p>{{ copy.capabilityDescription }}</p></div>
        <div class="capability-grid"><article v-for="item in copy.capabilities" :key="item.key"><span>{{ item.key }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
      </section>

      <section class="flow-section">
        <div><span>{{ copy.architectureKicker }}</span><h2>{{ copy.architectureTitle }}</h2><p>{{ copy.architectureDescription }}</p><a :href="docsPage('architecture')">{{ copy.architectureLink }}</a></div>
        <ol><li><b>01</b><strong>File / Blob / URL</strong><small>读取名称、MIME 与特征字节</small></li><li><b>02</b><strong>Core detect & route</strong><small>轻量 manifest 完成匹配</small></li><li><b>03</b><strong>Matched adapter</strong><small>只加载命中的解析器</small></li></ol>
      </section>

      <section id="formats" class="section formats-section">
        <div class="section-head split"><div><span>{{ copy.formatKicker }}</span><h2>{{ copy.formatTitle }}</h2></div><p>{{ copy.formatDescription }}</p></div>
        <div class="format-grid"><article v-for="format in formats" :key="format[0]"><h3>{{ format[0] }}</h3><p>{{ format[1] }}</p></article></div>
        <a class="text-link" :href="docsPage('format-support')">{{ copy.formatLink }}</a>
      </section>

      <section class="section profiles-section">
        <div class="section-head"><span>{{ copy.profilesKicker }}</span><h2>{{ copy.profilesTitle }}</h2><p>{{ copy.profilesDescription }}</p></div>
        <div class="profile-grid"><article v-for="profile in copy.profiles" :key="profile.title"><small>{{ profile.use }}</small><h3>{{ profile.title }}</h3><strong>{{ profile.cost }}</strong><code>{{ profile.packs }}</code></article></div>
        <a class="text-link" :href="docsPage('modular-integration')">{{ copy.profilesLink }}</a>
      </section>

      <section class="closing"><span>{{ copy.closingKicker }}</span><h2>{{ copy.closingTitle }}</h2><p>{{ copy.closingDescription }}</p><div><a class="button button-primary" :href="playgroundUrl">{{ copy.enterPlayground }}</a><a class="button button-secondary dark" :href="projectLinks.github" target="_blank" rel="noreferrer">{{ copy.viewSource }}</a></div></section>
    </main>

    <SiteFooter :links="projectLinks" :locale="locale" />
  </div>
</template>
