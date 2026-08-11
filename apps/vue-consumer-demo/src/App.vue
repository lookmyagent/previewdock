<script setup lang="ts">
import { ref } from 'vue'
import { PreviewDock } from '@previewdock/vue'
import '@previewdock/vue/style.css'
import { previewEngine } from './preview-engine'

const fileInput = ref<HTMLInputElement>()
const source = ref<File | null>(new File([
  '# 欢迎使用 PreviewDock\n\n这是一个独立 Vue 项目中的预览组件。\n\n- 点击“选择文件”预览任意本地文件\n- 当前示例使用官方全格式预设\n- 复杂格式的解析器、Worker 和 WASM 都会按需加载\n',
], 'welcome.md', { type: 'text/markdown' }))
const selectedName = ref('welcome.md')
const status = ref('等待预览')
const error = ref('')

function chooseFile() {
  fileInput.value?.click()
}

function handleFile(event: Event) {
  const nextFile = (event.target as HTMLInputElement).files?.[0]
  if (!nextFile) return
  source.value = nextFile
  selectedName.value = nextFile.name
  error.value = ''
}

function restoreExample() {
  source.value = new File(['PreviewDock 会根据文件类型选择已注册的适配器。'], 'example.txt', { type: 'text/plain' })
  selectedName.value = source.value.name
  error.value = ''
}
</script>

<template>
  <main class="demo-page">
    <section class="demo-intro">
      <a class="brand" href="https://github.com/lookmyagent/previewdock" target="_blank" rel="noreferrer">PreviewDock</a>
      <h1>在一个 Vue 3 项目中接入文件预览</h1>
      <p>此页面是一个独立的消费端 demo：应用创建 Engine，然后将文件和 Engine 传给 <code>&lt;PreviewDock&gt;</code>。</p>
      <div class="actions">
        <input ref="fileInput" class="visually-hidden" type="file" @change="handleFile">
        <button class="primary" type="button" @click="chooseFile">选择文件</button>
        <button class="secondary" type="button" @click="restoreExample">恢复文本示例</button>
      </div>
      <p class="hint">文件选择不限制格式；当前使用官方全格式预设。当前文件：<strong>{{ selectedName }}</strong></p>
    </section>

    <section class="preview-frame" aria-label="文件预览">
      <PreviewDock
        :engine="previewEngine"
        :source="source"
        :file-name="selectedName"
        locale="zh-CN"
        empty-title="选择一个文件开始预览"
        @status="status = $event.message"
        @error="error = $event instanceof Error ? $event.message : String($event)"
      />
    </section>

    <p class="runtime-status" :class="{ 'runtime-status--error': error }">{{ error || status }}</p>
  </main>
</template>
