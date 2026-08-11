import { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PreviewDock } from '@previewdock/react'
import '@previewdock/web/style.css'
import { previewEngine } from './preview-engine'
import './styles.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(new File(['# PreviewDock React\n\n官方全格式预设已启用。'], 'welcome.md', { type: 'text/markdown' }))
  const [status, setStatus] = useState('等待预览')
  const [error, setError] = useState('')

  function selectFile(next: File | undefined) {
    if (!next) return
    setFile(next)
    setError('')
  }

  return <main className="demo-page">
    <section className="demo-intro">
      <span className="brand">PreviewDock / React</span>
      <h1>React 项目全格式文件预览</h1>
      <p>通过 <code>@previewdock/react</code> 与 <code>@previewdock/preset-all</code> 接入。选择任意本地文件后自动检测格式。</p>
      <input ref={inputRef} className="visually-hidden" type="file" onChange={event => selectFile(event.target.files?.[0])} />
      <div className="actions">
        <button className="primary" type="button" onClick={() => inputRef.current?.click()}>选择文件</button>
        <button className="secondary" type="button" onClick={() => selectFile(new File(['PreviewDock React 示例'], 'example.txt', { type: 'text/plain' }))}>恢复文本示例</button>
      </div>
      <p className="hint">当前文件：<strong>{file?.name || '未选择'}</strong></p>
    </section>
    <section className="preview-frame" aria-label="文件预览">
      <PreviewDock engine={previewEngine} source={file} fileName={file?.name} locale="zh-CN" emptyTitle="选择一个文件开始预览" onStatus={next => setStatus(next.message)} onError={next => setError(next instanceof Error ? next.message : String(next))} />
    </section>
    <p className={`runtime-status ${error ? 'runtime-status--error' : ''}`}>{error || status}</p>
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
