import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'

const extensions = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'log',
  'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html', 'htm',
  'java', 'php', 'py', 'c', 'cpp', 'h', 'hpp', 'sql', 'sh',
])

const markdownExtensions = new Set(['md', 'markdown'])

function isTextFile(file: FileDescriptor): boolean {
  if (file.mimeType.startsWith('audio/') || file.mimeType.startsWith('video/')) {
    return false
  }
  return file.mimeType.startsWith('text/')
    || file.mimeType === 'application/json'
    || file.mimeType === 'application/xml'
    || extensions.has(file.extension)
}

function isChinese(): boolean {
  return document.documentElement.lang.toLowerCase().startsWith('zh')
}

function createPlainTextView(text: string): HTMLPreElement {
  const element = document.createElement('pre')
  element.className = 'ufv-text-preview'
  element.textContent = text
  return element
}

async function createMarkdownView(
  text: string,
  signal: AbortSignal,
): Promise<{ root: HTMLElement, dispose: () => void }> {
  const root = document.createElement('section')
  root.className = 'ufv-markdown-preview'

  const toolbar = document.createElement('header')
  toolbar.className = 'ufv-markdown-toolbar'
  const title = document.createElement('strong')
  const modes = document.createElement('div')
  modes.className = 'ufv-markdown-modes'
  const previewButton = document.createElement('button')
  const sourceButton = document.createElement('button')
  previewButton.type = 'button'
  sourceButton.type = 'button'
  previewButton.className = 'ufv-markdown-mode'
  sourceButton.className = 'ufv-markdown-mode'
  previewButton.dataset.mode = 'preview'
  sourceButton.dataset.mode = 'source'
  modes.append(previewButton, sourceButton)
  toolbar.append(title, modes)

  const body = document.createElement('div')
  body.className = 'ufv-markdown-body'
  const source = createPlainTextView(text)
  source.classList.add('ufv-text-preview--markdown')
  source.hidden = true
  const preview = document.createElement('article')
  preview.className = 'ufv-markdown-rendered'
  preview.setAttribute('aria-live', 'polite')
  body.append(preview, source)
  root.append(toolbar, body)

  const updateLabels = () => {
    const zh = isChinese()
    title.textContent = zh ? 'Markdown 查看方式' : 'Markdown view'
    previewButton.textContent = zh ? '格式化' : 'Preview'
    sourceButton.textContent = zh ? '原文' : 'Source'
    previewButton.setAttribute('aria-label', zh ? '查看格式化 Markdown' : 'View rendered Markdown')
    sourceButton.setAttribute('aria-label', zh ? '查看 Markdown 原文' : 'View Markdown source')
  }

  const setMode = (mode: 'preview' | 'source') => {
    const showPreview = mode === 'preview'
    preview.hidden = !showPreview
    source.hidden = showPreview
    previewButton.setAttribute('aria-pressed', String(showPreview))
    sourceButton.setAttribute('aria-pressed', String(!showPreview))
  }

  previewButton.addEventListener('click', () => setMode('preview'))
  sourceButton.addEventListener('click', () => setMode('source'))
  updateLabels()
  setMode('preview')

  try {
    const [{ marked }, { default: DOMPurify }] = await Promise.all([
      import('marked'),
      import('dompurify'),
    ])
    if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
    const parsed = await marked.parse(text, {
      gfm: true,
      breaks: false,
    })
    preview.innerHTML = DOMPurify.sanitize(parsed, {
      USE_PROFILES: { html: true },
    })
    for (const link of preview.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
  } catch (error) {
    if (signal.aborted) throw error
    preview.textContent = isChinese()
      ? '格式化渲染失败，请切换到“原文”查看。'
      : 'Rendered preview failed. Switch to Source to view the file.'
  }

  const observer = new MutationObserver(updateLabels)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  })

  return {
    root,
    dispose: () => observer.disconnect(),
  }
}

export const textAdapter: PreviewAdapter = {
  id: 'text',
  label: 'Text renderer',
  supports: isTextFile,
  async open(file, signal): Promise<PreviewSession> {
    const text = await file.blob.text()
    if (signal.aborted) {
      throw new DOMException('Preview was cancelled', 'AbortError')
    }
    let element: HTMLElement | undefined
    let disposeView: (() => void) | undefined

    return {
      adapterId: 'text',
      adapterLabel: markdownExtensions.has(file.extension)
        ? 'Markdown source and rendered preview'
        : 'Text renderer',
      capabilities: ['preview', 'select-text', 'copy'],
      async mount(container, mountSignal) {
        if (markdownExtensions.has(file.extension)) {
          const view = await createMarkdownView(text, mountSignal)
          element = view.root
          disposeView = view.dispose
        } else {
          element = createPlainTextView(text)
        }
        container.replaceChildren(element)
      },
      dispose() {
        disposeView?.()
        disposeView = undefined
        element?.remove()
        element = undefined
      },
    }
  },
}

export const textAdapterManifest = {
  id: 'text',
  extensions: [...extensions],
  mimeTypes: ['text/*', 'application/json', 'application/xml'],
  load: async () => textAdapter,
}
