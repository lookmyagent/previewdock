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

    <div class="ufv__host" @scroll="syncWatermarkScroll">
      <div ref="mountRef" class="ufv__mount"></div>
      <div
        v-if="descriptor && watermarkBackground"
        class="ufv__watermark"
        aria-hidden="true"
        ref="watermarkRef"
        :style="{ backgroundImage: watermarkBackground }"
      ></div>
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
  createPreviewDockWatermarkBackground,
  type PreviewDockWatermark,
} from '@previewdock/web'
import {
  viewerMessages,
  type ViewerLocale,
  type ViewerMessages,
} from './i18n'
import '@previewdock/web/style.css'

const props = withDefaults(defineProps<{
  engine: ViewerEngine
  source?: FileSource | null
  fileName?: string
  mimeType?: string
  showToolbar?: boolean
  emptyTitle?: string
  locale?: ViewerLocale
  messages?: Partial<ViewerMessages>
  watermark?: PreviewDockWatermark
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
const watermarkRef = ref<HTMLElement>()
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
const watermarkBackground = computed(() => createPreviewDockWatermarkBackground(props.watermark))

function syncWatermarkScroll(event: Event): void {
  const surface = event.currentTarget as HTMLElement
  if (watermarkRef.value) {
    watermarkRef.value.style.transform = `translate(${surface.scrollLeft}px, ${surface.scrollTop}px)`
  }
}

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
    () => props.locale,
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
