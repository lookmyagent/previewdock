import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'

const audioExtensions = new Set(['mp3', 'mpeg', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba'])
const midiExtensions = new Set(['mid', 'midi'])
const videoExtensions = new Set(['mp4', 'webm', 'ogv', 'mov', 'm4v', 'm3u8'])
const audioMimeTypes = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg',
  'audio/mp4', 'audio/aac', 'audio/flac', 'audio/opus',
])
const videoMimeTypes = new Set([
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
])

function mediaKind(file: FileDescriptor): 'audio' | 'video' | 'midi' | undefined {
  if (midiExtensions.has(file.extension)) return 'midi'
  if (audioMimeTypes.has(file.mimeType) || audioExtensions.has(file.extension)) return 'audio'
  if (videoMimeTypes.has(file.mimeType) || videoExtensions.has(file.extension)) return 'video'
  return undefined
}

export const mediaAdapter: PreviewAdapter = {
  id: 'media',
  label: 'Browser media player',
  supports: file => Boolean(mediaKind(file)),
  async open(file): Promise<PreviewSession> {
    const kind = mediaKind(file)
    if (!kind) throw new Error('Unsupported media format')
    if (kind === 'midi') {
      const { Midi } = await import('@tonejs/midi')
      const midi = new Midi(await file.blob.arrayBuffer())
      return {
        adapterId: 'media',
        adapterLabel: 'MIDI structure viewer',
        capabilities: ['preview', 'select-text', 'copy'],
        mount(container, signal) {
          if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
          const root = document.createElement('section')
          root.className = 'ufv-midi-preview'
          const title = document.createElement('h2')
          title.textContent = midi.name || file.name
          const summary = document.createElement('p')
          summary.textContent = `${midi.tracks.length} tracks · ${midi.duration.toFixed(2)} s · PPQ ${midi.header.ppq}`
          const table = document.createElement('table')
          const head = document.createElement('thead')
          head.innerHTML = '<tr><th>Track</th><th>Instrument</th><th>Channel</th><th>Notes</th></tr>'
          const body = document.createElement('tbody')
          midi.tracks.forEach((track, index) => {
            const row = document.createElement('tr')
            for (const value of [
              track.name || `${index + 1}`,
              track.instrument.name,
              `${track.channel + 1}`,
              `${track.notes.length}`,
            ]) {
              const cell = document.createElement('td')
              cell.textContent = value
              row.append(cell)
            }
            body.append(row)
          })
          table.append(head, body)
          const style = document.createElement('style')
          style.textContent = `.ufv-midi-preview{min-height:100%;box-sizing:border-box;padding:28px;background:#f4f7fb;color:#172033;font:14px/1.5 Inter,system-ui,sans-serif}.ufv-midi-preview h2{margin:0}.ufv-midi-preview p{color:#64748b}.ufv-midi-preview table{width:100%;border-collapse:collapse;background:#fff}.ufv-midi-preview th,.ufv-midi-preview td{padding:10px 12px;border:1px solid #dbe3ee;text-align:left}`
          root.append(style, title, summary, table)
          container.replaceChildren(root)
        },
        dispose() {},
      }
    }
    const objectUrl = URL.createObjectURL(file.blob)
    let media: HTMLMediaElement | undefined
    let hls: { destroy(): void } | undefined

    return {
      adapterId: 'media',
      adapterLabel: 'Browser media player',
      capabilities: ['preview', 'playback'],
      mount(container, signal) {
        if (signal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        media = document.createElement(kind)
        media.className = `ufv-media-preview ufv-media-preview--${kind}`
        media.controls = true
        media.preload = 'metadata'
        media.src = objectUrl
        if (file.extension === 'm3u8' && media instanceof HTMLVideoElement
          && !media.canPlayType('application/vnd.apple.mpegurl')) {
          void import('hls.js').then(({ default: Hls }) => {
            if (signal.aborted || !media || !(media instanceof HTMLVideoElement)) return
            if (!Hls.isSupported()) return
            const player = new Hls()
            player.loadSource(objectUrl)
            player.attachMedia(media)
            hls = player
          })
        }
        if (media instanceof HTMLVideoElement) media.playsInline = true
        container.replaceChildren(media)
      },
      dispose() {
        hls?.destroy()
        hls = undefined
        if (media) {
          media.pause()
          media.removeAttribute('src')
          media.load()
          media.remove()
        }
        media = undefined
        URL.revokeObjectURL(objectUrl)
      },
    }
  },
}
