<template>
  <section class="ufv" :aria-busy="isBusy">
    <header v-if="showToolbar" class="ufv__toolbar">
      <div class="ufv__title">
        <span class="ufv__name">{{ activeName || resolvedEmptyTitle }}</span>
        <span v-if="descriptor" class="ufv__meta">
          {{ descriptor.extension.toUpperCase() || descriptor.mimeType }} · {{ formattedSize }}
        </span>
      </div>
      <span class="ufv__status">{{ translatedStatus }}</span>
    </header>

    <div class="ufv__host">
      <div ref="mountRef" class="ufv__mount"></div>
      <div v-if="!source && !isBusy" class="ufv__empty">{{ resolvedEmptyTitle }}</div>
      <div v-if="isBusy" class="ufv__loading">
        <span class="ufv__spinner" aria-hidden="true"></span>
        <span>{{ translatedStatus }}</span>
      </div>
      <div v-if="errorMessage" class="ufv__error" role="alert">
        <strong>{{ messages.previewUnavailable }}</strong>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  FileDescriptor,
  FileSource,
  OpenResult,
  ViewerStatus,
} from '@previewdock/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ViewerEngine } from '@previewdock/core'
import {
  viewerMessages,
  type ViewerLocale,
  type ViewerMessages,
} from './i18n'

const props = withDefaults(defineProps<{
  engine: ViewerEngine
  source?: FileSource | null
  fileName?: string
  mimeType?: string
  showToolbar?: boolean
  emptyTitle?: string
  locale?: ViewerLocale
  messages?: Partial<ViewerMessages>
}>(), {
  source: null,
  fileName: '',
  mimeType: '',
  showToolbar: true,
  emptyTitle: '',
  locale: 'en',
})

const emit = defineEmits<{
  ready: [result: OpenResult]
  error: [error: unknown]
  status: [status: ViewerStatus]
}>()

const mountRef = ref<HTMLElement>()
const descriptor = ref<FileDescriptor>()
const errorMessage = ref('')
const status = ref<ViewerStatus>({ phase: 'idle', message: 'Idle' })
let openRequestId = 0

const isBusy = computed(() => [
  'loading-source', 'detecting', 'loading-adapter', 'opening',
].includes(status.value.phase))

const messages = computed<ViewerMessages>(() => {
  const base = viewerMessages[props.locale]
  return {
    ...base,
    ...props.messages,
    phases: {
      ...base.phases,
      ...props.messages?.phases,
    },
  }
})

const resolvedEmptyTitle = computed(() => props.emptyTitle || messages.value.empty)
const translatedStatus = computed(() => messages.value.phases[status.value.phase])
const activeName = computed(() => props.fileName || descriptor.value?.name || '')

const formattedSize = computed(() => {
  const bytes = descriptor.value?.size || 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
})

const stopStatus = props.engine.onStatus(nextStatus => {
  status.value = nextStatus
  emit('status', nextStatus)
})

async function open(source: FileSource, fileName = props.fileName): Promise<void> {
  const requestId = ++openRequestId
  errorMessage.value = ''
  descriptor.value = undefined

  try {
    const result = await props.engine.open(source, {
      name: fileName || undefined,
      mimeType: props.mimeType || undefined,
    })
    if (requestId !== openRequestId || !mountRef.value) {
      await result.session.dispose()
      return
    }
    descriptor.value = result.descriptor
    await result.session.mount(mountRef.value, result.signal)
    emit('ready', result)
  } catch (error) {
    if (requestId !== openRequestId || (error instanceof DOMException && error.name === 'AbortError')) {
      return
    }
    const rawMessage = error instanceof Error ? error.message : String(error)
    errorMessage.value = rawMessage.startsWith('No preview adapter')
      ? messages.value.unsupported
      : rawMessage
    emit('error', error)
  }
}

watch(
  [
    () => props.source,
    () => props.fileName,
    () => props.mimeType,
  ],
  ([source]) => {
    if (source !== null && source !== undefined) {
      void open(source)
    } else {
      descriptor.value = undefined
      errorMessage.value = ''
      mountRef.value?.replaceChildren()
      void props.engine.close()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  openRequestId += 1
  stopStatus()
  void props.engine.close()
})

defineExpose({ open })
</script>

<style>
.ufv {
  position: relative;
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  color: #172033;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.ufv__toolbar {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 18px;
  border-bottom: 1px solid #e3e8f0;
  background: #fff;
}

.ufv__title {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.ufv__name {
  overflow: hidden;
  color: #111827;
  font-size: 14px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv__meta,
.ufv__status {
  color: #778196;
  font-size: 12px;
}

.ufv__host {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #f7f9fc;
}

.ufv__mount {
  height: 100%;
  min-height: 100%;
}

.ufv__empty,
.ufv__loading,
.ufv__error {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #778196;
  background: #f7f9fc;
  font-size: 13px;
}

.ufv__error {
  flex-direction: column;
  color: #8f2630;
}

.ufv__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #cfd7e6;
  border-top-color: #315ee7;
  border-radius: 50%;
  animation: ufv-spin 0.75s linear infinite;
}

.ufv-text-preview {
  box-sizing: border-box;
  min-height: 100%;
  margin: 0;
  padding: 30px 36px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #fff;
  color: #263044;
  font: 13px/1.75 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  tab-size: 2;
}

.ufv-markdown-preview {
  display: grid;
  grid-template-rows: 46px minmax(0, 1fr);
  height: 100%;
  min-height: 320px;
  background: #fff;
}

.ufv-markdown-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid #e0e6ef;
  background: #fff;
}

.ufv-markdown-toolbar strong {
  color: #172033;
  font-size: 13px;
}

.ufv-markdown-modes {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 7px;
  background: #eef2f7;
}

.ufv-markdown-mode {
  min-width: 64px;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #667187;
  cursor: pointer;
  font: 12px/1 inherit;
}

.ufv-markdown-mode:hover {
  color: #263044;
}

.ufv-markdown-mode[aria-pressed="true"] {
  background: #fff;
  box-shadow: 0 1px 3px rgb(31 43 68 / 12%);
  color: #315ee7;
  font-weight: 650;
}

.ufv-markdown-body {
  min-height: 0;
  overflow: auto;
  background: #fff;
}

.ufv-markdown-body > [hidden] {
  display: none;
}

.ufv-text-preview--markdown {
  min-height: 100%;
}

.ufv-markdown-rendered {
  box-sizing: border-box;
  width: min(900px, calc(100% - 48px));
  min-height: 100%;
  margin: 0 auto;
  padding: 38px 24px 64px;
  color: #29344a;
  font-size: 14px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.ufv-markdown-rendered h1,
.ufv-markdown-rendered h2,
.ufv-markdown-rendered h3,
.ufv-markdown-rendered h4 {
  margin: 1.5em 0 0.65em;
  color: #172033;
  line-height: 1.3;
}

.ufv-markdown-rendered h1 {
  margin-top: 0;
  padding-bottom: 0.4em;
  border-bottom: 1px solid #e1e6ee;
  font-size: 28px;
}

.ufv-markdown-rendered h2 {
  padding-bottom: 0.35em;
  border-bottom: 1px solid #e8ecf2;
  font-size: 21px;
}

.ufv-markdown-rendered h3 {
  font-size: 17px;
}

.ufv-markdown-rendered a {
  color: #315ee7;
}

.ufv-markdown-rendered blockquote {
  margin: 1em 0;
  padding: 0.2em 1em;
  border-left: 4px solid #9db2f6;
  background: #f7f9fd;
  color: #647087;
}

.ufv-markdown-rendered code {
  padding: 0.14em 0.38em;
  border-radius: 4px;
  background: #eef2f7;
  color: #c0344b;
  font: 0.9em/1.5 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.ufv-markdown-rendered pre {
  overflow: auto;
  padding: 16px;
  border: 1px solid #e0e6ef;
  border-radius: 7px;
  background: #172033;
  color: #e8edf7;
}

.ufv-markdown-rendered pre code {
  padding: 0;
  background: transparent;
  color: inherit;
}

.ufv-markdown-rendered table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-spacing: 0;
  border-collapse: collapse;
}

.ufv-markdown-rendered th,
.ufv-markdown-rendered td {
  padding: 7px 12px;
  border: 1px solid #dfe5ee;
}

.ufv-markdown-rendered th {
  background: #f5f7fb;
}

.ufv-markdown-rendered img {
  max-width: 100%;
}

.ufv-image-preview {
  display: block;
  max-width: calc(100% - 48px);
  max-height: calc(100% - 48px);
  margin: 24px auto;
  object-fit: contain;
}

.ufv-model-preview {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  background: #f0f3f8;
}

.ufv-model-toolbar {
  z-index: 1;
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid #dce2eb;
  background: rgb(255 255 255 / 94%);
  box-shadow: 0 1px 5px rgb(30 42 66 / 5%);
}

.ufv-model-toolbar > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.ufv-model-toolbar strong {
  overflow: hidden;
  color: #263044;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-model-toolbar span {
  color: #8994a7;
  font-size: 11px;
  white-space: nowrap;
}

.ufv-model-toolbar button {
  padding: 6px 10px;
  border: 1px solid #cdd7e6;
  border-radius: 5px;
  background: #fff;
  color: #40506a;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
}

.ufv-model-toolbar button:hover,
.ufv-model-toolbar button[aria-pressed="true"] {
  border-color: #7893ea;
  background: #edf2ff;
  color: #315ee7;
}

.ufv-model-stage {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.ufv-model-stage canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.ufv-model-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #72809a;
  font-size: 12px;
}

.ufv-advanced-image {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 380px;
  overflow: hidden;
  background:
    linear-gradient(45deg, #e9edf3 25%, transparent 25%) 0 0 / 20px 20px,
    linear-gradient(-45deg, #e9edf3 25%, transparent 25%) 0 10px / 20px 20px,
    linear-gradient(45deg, transparent 75%, #e9edf3 75%) 10px -10px / 20px 20px,
    linear-gradient(-45deg, transparent 75%, #e9edf3 75%) -10px 0 / 20px 20px,
    #f4f6f9;
}

.ufv-advanced-image-toolbar {
  z-index: 1;
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid #dce2eb;
  background: rgb(255 255 255 / 96%);
  box-shadow: 0 1px 5px rgb(30 42 66 / 5%);
}

.ufv-advanced-image-toolbar > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.ufv-advanced-image-toolbar strong {
  overflow: hidden;
  color: #263044;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-advanced-image-toolbar span {
  color: #8994a7;
  font-size: 11px;
  white-space: nowrap;
}

.ufv-advanced-image-toolbar button {
  padding: 6px 9px;
  border: 1px solid #cdd7e6;
  border-radius: 5px;
  background: #fff;
  color: #40506a;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
}

.ufv-advanced-image-toolbar button:hover,
.ufv-advanced-image-toolbar button[aria-pressed="true"] {
  border-color: #7893ea;
  background: #edf2ff;
  color: #315ee7;
}

.ufv-advanced-image-stage {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 0;
  place-items: center;
  overflow: auto;
  padding: 24px;
}

.ufv-advanced-image-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 8px 28px rgb(30 42 66 / 18%);
  object-fit: contain;
  transition: transform 160ms ease;
}

.ufv-advanced-image-loading {
  color: #72809a;
  font-size: 12px;
}

.ufv-pdf-preview {
  display: block;
  width: 100%;
  min-height: 100%;
  height: 100%;
  border: 0;
  background: #e8ebf0;
}

.ufv-media-preview {
  display: block;
  width: min(760px, calc(100% - 48px));
  margin: 48px auto;
}

.ufv-media-preview--video {
  max-height: calc(100vh - 180px);
  background: #111827;
}

.ufv-archive-preview,
.ufv-office-preview {
  box-sizing: border-box;
  width: min(980px, calc(100% - 48px));
  min-height: calc(100% - 48px);
  margin: 24px auto;
  padding: 28px 32px;
  border: 1px solid #e0e6ef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(30 42 66 / 6%);
  color: #253047;
  font-size: 13px;
  line-height: 1.7;
}

.ufv-docx-preview {
  box-sizing: border-box;
  min-height: 100%;
  padding: 28px;
  background: #e9edf3;
}

.ufv-docx-preview__body .docx-wrapper {
  padding: 0 !important;
  background: transparent !important;
}

.ufv-docx-preview__body .docx-wrapper > section.docx {
  width: min(100%, 816px) !important;
  max-width: 100%;
  margin: 0 auto 24px;
  border: 1px solid #d7dde7;
  box-shadow: 0 10px 30px rgb(30 42 66 / 12%);
}

.ufv-sheet-preview {
  display: grid;
  grid-template-rows: 46px minmax(0, 1fr) 38px;
  height: 100%;
  min-height: 360px;
  overflow: hidden;
  background: #fff;
  color: #263044;
  font-size: 12px;
}

.ufv-legacy-conversion {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 360px;
  place-items: center;
  background: #f2f4f8;
}

.ufv-legacy-conversion-status {
  display: grid;
  width: min(420px, calc(100% - 48px));
  gap: 12px;
  padding: 24px;
  border: 1px solid #dce2ec;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(30 42 66 / 8%);
  color: #263044;
}

.ufv-legacy-conversion-status strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-legacy-conversion-status span {
  color: #72809a;
  font-size: 12px;
}

.ufv-legacy-conversion-status progress {
  width: 100%;
  accent-color: #315ee7;
}

.ufv-sheet-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid #dfe5ed;
  background: #fff;
}

.ufv-sheet-toolbar strong {
  overflow: hidden;
  color: #172033;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-sheet-toolbar span {
  flex: none;
  padding: 3px 8px;
  border-radius: 10px;
  background: #eef4ff;
  color: #315ee7;
  font-size: 11px;
}

.ufv-sheet-stage {
  min-height: 0;
  overflow: auto;
  background: #f7f9fc;
}

.ufv-sheet-panel {
  min-width: max-content;
  min-height: 100%;
  background: #fff;
}

.ufv-sheet-panel[hidden] {
  display: none;
}

.ufv-sheet-preview table {
  border-spacing: 0;
  border-collapse: separate;
  table-layout: fixed;
  min-width: 100%;
  background: #fff;
}

.ufv-sheet-preview th,
.ufv-sheet-preview td {
  box-sizing: border-box;
  min-width: 112px;
  height: 28px;
  padding: 4px 8px;
  overflow: hidden;
  border: 0;
  border-right: 1px solid #e2e7ee;
  border-bottom: 1px solid #e2e7ee;
  background: #fff;
  font-weight: 400;
  line-height: 19px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-sheet-preview thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 26px;
  background: #f2f5f9;
  color: #657187;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.ufv-sheet-preview tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 44px;
  width: 44px;
  background: #f2f5f9;
  color: #657187;
  font-size: 11px;
  text-align: center;
}

.ufv-sheet-preview .ufv-sheet-corner {
  left: 0;
  z-index: 3;
  min-width: 44px;
  width: 44px;
}

.ufv-sheet-preview tbody tr:first-child td {
  color: #172033;
  font-weight: 600;
}

.ufv-sheet-tabs {
  display: flex;
  align-items: stretch;
  gap: 2px;
  overflow-x: auto;
  padding: 0 10px;
  border-top: 1px solid #dfe5ed;
  background: #f3f6fa;
}

.ufv-sheet-tab {
  position: relative;
  flex: none;
  min-width: 88px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: #5d687d;
  cursor: pointer;
  font: inherit;
}

.ufv-sheet-tab:hover {
  background: #e9eef6;
  color: #24314a;
}

.ufv-sheet-tab[aria-selected="true"] {
  background: #fff;
  color: #22663d;
  font-weight: 650;
}

.ufv-sheet-tab[aria-selected="true"]::after {
  position: absolute;
  right: 10px;
  bottom: 0;
  left: 10px;
  height: 2px;
  background: #28905a;
  content: "";
}

.ufv-pptx-preview {
  box-sizing: border-box;
  min-height: 100%;
  padding: 28px;
  overflow: hidden;
  background: #e9edf3;
}

.ufv-pptx-preview__stage {
  width: min(1120px, 100%);
  min-height: 100%;
  margin: 0 auto;
}

.ufv-pptx-preview__stage > div {
  margin-right: auto;
  margin-left: auto;
}

.ufv-document-summary {
  margin: -28px -32px 24px;
  padding: 14px 20px;
  border-bottom: 1px solid #e0e6ef;
  background: #f9fbfe;
  color: #647087;
  font-size: 12px;
}

.ufv-archive-browser {
  container-type: inline-size;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  width: min(1180px, calc(100% - 48px));
  height: calc(100% - 48px);
  min-height: 420px;
  padding: 0;
  overflow: hidden;
}

.ufv-archive-summary {
  margin: 0;
}

.ufv-archive-breadcrumbs {
  display: flex;
  align-items: center;
  min-height: 40px;
  gap: 4px;
  overflow-x: auto;
  padding: 0 14px;
  border-bottom: 1px solid #e0e6ef;
  background: #fff;
  white-space: nowrap;
}

.ufv-archive-breadcrumbs > span {
  color: #a3adbd;
}

.ufv-archive-breadcrumbs button {
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #315ee7;
  cursor: pointer;
  font: 12px/1.4 inherit;
}

.ufv-archive-breadcrumbs button:hover {
  background: #eef3ff;
}

.ufv-archive-workspace {
  display: grid;
  grid-template-columns: minmax(220px, 31%) minmax(0, 1fr);
  min-height: 0;
}

.ufv-archive-entries {
  min-height: 0;
  overflow: auto;
  padding: 8px;
  border-right: 1px solid #e0e6ef;
  background: #f8fafc;
}

.ufv-archive-entry {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 20px;
  align-items: center;
  width: 100%;
  min-height: 52px;
  gap: 8px;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #263044;
  cursor: pointer;
  text-align: left;
}

.ufv-archive-entry:hover {
  border-color: #dce3ee;
  background: #fff;
}

.ufv-archive-entry--selected {
  border-color: #b8c9fb;
  background: #edf2ff;
}

.ufv-archive-entry-icon {
  color: #7184ac;
  font-size: 19px;
  text-align: center;
}

.ufv-archive-entry-details {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.ufv-archive-entry-details strong {
  overflow: hidden;
  color: #253047;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-archive-entry-details small {
  overflow: hidden;
  color: #8a95a8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-archive-entry-action {
  color: #9ca7b8;
  font-size: 17px;
  text-align: center;
}

.ufv-archive-file-preview {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.ufv-archive-file-header {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 15px;
  border-bottom: 1px solid #e0e6ef;
}

.ufv-archive-file-header > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.ufv-archive-file-header span {
  color: #8a95a8;
  font-size: 10px;
  text-transform: uppercase;
}

.ufv-archive-file-header strong {
  overflow: hidden;
  color: #253047;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ufv-archive-download {
  flex: none;
  padding: 6px 10px;
  border: 1px solid #cdd7e6;
  border-radius: 5px;
  color: #315ee7;
  font-size: 11px;
  text-decoration: none;
}

.ufv-archive-file-content {
  min-height: 0;
  overflow: auto;
}

.ufv-archive-preview-empty {
  display: flex;
  height: 100%;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  color: #8a95a8;
  text-align: center;
}

.ufv-archive-preview-empty > span {
  color: #aab6c9;
  font-size: 34px;
}

.ufv-archive-preview-empty p,
.ufv-archive-folder-empty {
  margin: 0;
  color: #8a95a8;
  font-size: 12px;
}

.ufv-archive-folder-empty {
  padding: 28px 14px;
  text-align: center;
}

.ufv-archive-text-content {
  box-sizing: border-box;
  min-height: 100%;
  margin: 0;
  padding: 22px 24px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: #263044;
  font: 12px/1.7 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.ufv-archive-image-content {
  display: block;
  max-width: calc(100% - 32px);
  max-height: calc(100% - 32px);
  margin: 16px auto;
  object-fit: contain;
}

.ufv-archive-pdf-content {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 360px;
  border: 0;
}

.ufv-archive-media-content {
  display: block;
  width: min(720px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  margin: 24px auto;
}

@container (max-width: 700px) {
  .ufv-archive-workspace {
    grid-template-rows: minmax(150px, 40%) minmax(220px, 60%);
    grid-template-columns: 1fr;
  }

  .ufv-archive-entries {
    border-right: 0;
    border-bottom: 1px solid #e0e6ef;
  }
}

.ufv-archive-preview table,
.ufv-office-preview table {
  width: 100%;
  border-collapse: collapse;
}

.ufv-archive-preview th,
.ufv-archive-preview td,
.ufv-office-preview th,
.ufv-office-preview td {
  padding: 8px 10px;
  border: 1px solid #e3e8f0;
  text-align: left;
  vertical-align: top;
}

.ufv-archive-preview th {
  background: #f5f7fb;
}

.ufv-office-preview h2 {
  margin: 24px 0 12px;
  font-size: 16px;
}

.ufv-office-slide {
  min-height: 220px;
  margin: 18px 0;
  padding: 22px 26px;
  border: 1px solid #dfe5ee;
  border-radius: 6px;
  background: linear-gradient(145deg, #fff, #f7f9fc);
}

.ufv-office-empty {
  margin: 48px;
  color: #778196;
  text-align: center;
}

@media (max-width: 720px) {
  .ufv-docx-preview,
  .ufv-pptx-preview {
    padding: 12px;
  }

  .ufv-docx-preview__body {
    overflow-x: auto;
  }

  .ufv-office-preview {
    width: calc(100% - 24px);
    margin: 12px auto;
    padding: 20px;
  }

  .ufv-document-summary {
    margin: -20px -20px 18px;
  }
}

@keyframes ufv-spin {
  to { transform: rotate(360deg); }
}
</style>
