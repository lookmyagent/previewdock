import Vue from 'vue'
import { PreviewDock } from '@previewdock/vue2'
import '@previewdock/web/style.css'
import './styles.css'
import { previewEngine } from './preview-engine'

new Vue({
  components: { PreviewDock },
  data() {
    const source = new File([
      '# 欢迎使用 PreviewDock\n\n这是一个独立 Vue 2 项目中的预览组件。\n\n- 点击“选择文件”预览任意本地文件\n- 当前示例使用官方全格式预设\n- DOC/PPT 也已配置可选的 Office WASM 转换器\n',
    ], 'welcome.md', { type: 'text/markdown' })
    return { source, selectedName: source.name, status: '等待预览', error: '' }
  },
  methods: {
    chooseFile() {
      (this.$refs.fileInput as HTMLInputElement | undefined)?.click()
    },
    handleFile(event: Event) {
      const nextFile = (event.target as HTMLInputElement).files?.[0]
      if (!nextFile) return
      this.source = nextFile
      this.selectedName = nextFile.name
      this.error = ''
    },
    restoreExample() {
      this.source = new File(['PreviewDock 会根据文件类型选择已注册的适配器。'], 'example.txt', { type: 'text/plain' })
      this.selectedName = this.source.name
      this.error = ''
    },
    updateStatus(status: { message: string }) {
      this.status = status.message
    },
    showError(error: unknown) {
      this.error = error instanceof Error ? error.message : String(error)
    },
  },
  render(h) {
    return h('main', { class: 'demo-page' }, [
      h('section', { class: 'demo-intro' }, [
        h('a', { class: 'brand', attrs: { href: 'https://github.com/lookmyagent/previewdock', target: '_blank', rel: 'noreferrer' } }, 'PreviewDock'),
        h('h1', '在一个 Vue 2 项目中接入文件预览'),
        h('p', ['此页面是一个独立的消费端 demo：应用创建 Engine，然后将文件和 Engine 传给 ', h('code', '<PreviewDock>'), '。']),
        h('div', { class: 'actions' }, [
          h('input', { ref: 'fileInput', class: 'visually-hidden', attrs: { type: 'file' }, on: { change: this.handleFile } }),
          h('button', { class: 'primary', attrs: { type: 'button' }, on: { click: this.chooseFile } }, '选择文件'),
          h('button', { class: 'secondary', attrs: { type: 'button' }, on: { click: this.restoreExample } }, '恢复文本示例'),
        ]),
        h('p', { class: 'hint' }, ['文件选择不限制格式；当前使用官方全格式预设。当前文件：', h('strong', this.selectedName)]),
      ]),
      h('section', { class: 'preview-frame', attrs: { 'aria-label': '文件预览' } }, [
        h('PreviewDock', {
          props: { engine: previewEngine, source: this.source, fileName: this.selectedName, locale: 'zh-CN', emptyTitle: '选择一个文件开始预览' },
          on: { status: this.updateStatus, error: this.showError },
        }),
      ]),
      h('p', { class: ['runtime-status', { 'runtime-status--error': this.error }] }, this.error || this.status),
    ])
  },
}).$mount('#app')
