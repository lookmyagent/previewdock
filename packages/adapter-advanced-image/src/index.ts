import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'

const extensions = new Set(['tif', 'tiff', 'tga', 'psd'])
const MAX_INPUT_SIZE = 80 * 1024 * 1024
const MAX_PIXELS = 50_000_000

interface DecodedImage {
  canvas: HTMLCanvasElement
  width: number
  height: number
  layers?: number
}

function supportsAdvancedImage(file: FileDescriptor): boolean {
  return extensions.has(file.extension)
    || file.mimeType === 'image/tiff'
    || file.mimeType === 'image/vnd.adobe.photoshop'
}

function makeCanvas(
  width: number,
  height: number,
  data: Uint8Array | Uint8ClampedArray,
  flipY = false,
): HTMLCanvasElement {
  if (width <= 0 || height <= 0 || width * height > MAX_PIXELS) {
    throw new Error('Image dimensions exceed the browser preview limit')
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D rendering is unavailable')
  const imageData = new ImageData(new Uint8ClampedArray(data), width, height)
  if (!flipY) {
    context.putImageData(imageData, 0, 0)
    return canvas
  }
  const temporary = document.createElement('canvas')
  temporary.width = width
  temporary.height = height
  const temporaryContext = temporary.getContext('2d')
  if (!temporaryContext) throw new Error('Canvas 2D rendering is unavailable')
  temporaryContext.putImageData(imageData, 0, 0)
  context.translate(0, height)
  context.scale(1, -1)
  context.drawImage(temporary, 0, 0)
  return canvas
}

async function decodeNative(blob: Blob): Promise<DecodedImage | undefined> {
  if (!('createImageBitmap' in window)) return undefined
  try {
    const bitmap = await createImageBitmap(blob)
    if (bitmap.width * bitmap.height > MAX_PIXELS) {
      bitmap.close()
      throw new Error('Image dimensions exceed the browser preview limit')
    }
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D rendering is unavailable')
    context.drawImage(bitmap, 0, 0)
    bitmap.close()
    return { canvas, width: canvas.width, height: canvas.height }
  } catch {
    return undefined
  }
}

async function decodeImage(
  bytes: ArrayBuffer,
  blob: Blob,
  extension: string,
): Promise<DecodedImage> {
  const native = await decodeNative(blob)
  if (native) return native

  if (extension === 'tif' || extension === 'tiff') {
    const { TIFFLoader } = await import('three/addons/loaders/TIFFLoader.js')
    const image = new TIFFLoader().parse(new Uint8Array(bytes))
    return {
      canvas: makeCanvas(image.width, image.height, image.data, image.flipY),
      width: image.width,
      height: image.height,
    }
  }

  if (extension === 'tga') {
    const { TGALoader } = await import('three/addons/loaders/TGALoader.js')
    const image = new TGALoader().parse(bytes) as unknown as {
      data: Uint8Array
      width: number
      height: number
      flipY: boolean
    }
    const canvas = makeCanvas(image.width, image.height, image.data, image.flipY)
    return { canvas, width: image.width, height: image.height }
  }

  if (extension === 'psd') {
    const { initializeCanvas, readPsd } = await import('ag-psd')
    initializeCanvas(
      (width, height) => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        return canvas
      },
      (width, height) => new ImageData(width, height),
    )
    const psd = readPsd(bytes, {
      skipLayerImageData: true,
    })
    if (!psd.canvas) throw new Error('PSD does not contain a composite preview')
    const source = psd.canvas as HTMLCanvasElement
    if (source.width * source.height > MAX_PIXELS) {
      throw new Error('Image dimensions exceed the browser preview limit')
    }
    const canvas = document.createElement('canvas')
    canvas.width = source.width
    canvas.height = source.height
    canvas.getContext('2d')?.drawImage(source, 0, 0)
    return {
      canvas,
      width: canvas.width,
      height: canvas.height,
      layers: psd.children?.length ?? 0,
    }
  }

  throw new Error(`Unsupported advanced image format: ${extension}`)
}

function localizedLabels(): {
  reset: string
  rotateLeft: string
  rotateRight: string
  mirror: string
  zoomIn: string
  zoomOut: string
  loading: string
  layers: (count: number) => string
} {
  const chinese = document.documentElement.lang.toLowerCase().startsWith('zh')
  return chinese
    ? {
        reset: '适应窗口',
        rotateLeft: '左转',
        rotateRight: '右转',
        mirror: '镜像',
        zoomIn: '放大',
        zoomOut: '缩小',
        loading: '正在解析图像…',
        layers: count => `${count} 个顶层图层`,
      }
    : {
        reset: 'Fit',
        rotateLeft: 'Rotate left',
        rotateRight: 'Rotate right',
        mirror: 'Mirror',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        loading: 'Decoding image…',
        layers: count => `${count} top-level layers`,
      }
}

export const advancedImageAdapter: PreviewAdapter = {
  id: 'advanced-image',
  label: 'TIFF, TGA and PSD renderer',
  supports: supportsAdvancedImage,
  async open(file, signal): Promise<PreviewSession> {
    if (file.size > MAX_INPUT_SIZE) {
      throw new Error('Image exceeds the 80 MB browser preview limit')
    }
    const bytes = await file.blob.arrayBuffer()
    if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')

    let root: HTMLElement | undefined
    let languageObserver: MutationObserver | undefined

    return {
      adapterId: 'advanced-image',
      adapterLabel: 'TIFF, TGA and PSD renderer',
      capabilities: ['preview', 'zoom', 'rotate', 'layers'],
      async mount(container, mountSignal) {
        root = document.createElement('section')
        root.className = 'ufv-advanced-image'
        const toolbar = document.createElement('header')
        toolbar.className = 'ufv-advanced-image-toolbar'
        const details = document.createElement('div')
        const title = document.createElement('strong')
        title.textContent = file.name
        const metadata = document.createElement('span')
        details.append(title, metadata)
        const actions = document.createElement('div')
        const rotateLeft = document.createElement('button')
        const rotateRight = document.createElement('button')
        const mirror = document.createElement('button')
        const zoomOut = document.createElement('button')
        const zoomIn = document.createElement('button')
        const reset = document.createElement('button')
        for (const button of [
          rotateLeft, rotateRight, mirror, zoomOut, zoomIn, reset,
        ]) {
          button.type = 'button'
          actions.append(button)
        }
        toolbar.append(details, actions)
        const stage = document.createElement('div')
        stage.className = 'ufv-advanced-image-stage'
        const loading = document.createElement('div')
        loading.className = 'ufv-advanced-image-loading'
        stage.append(loading)
        root.append(toolbar, stage)
        container.replaceChildren(root)

        let labels = localizedLabels()
        const updateLabels = () => {
          labels = localizedLabels()
          rotateLeft.textContent = labels.rotateLeft
          rotateRight.textContent = labels.rotateRight
          mirror.textContent = labels.mirror
          zoomOut.textContent = labels.zoomOut
          zoomIn.textContent = labels.zoomIn
          reset.textContent = labels.reset
          loading.textContent = labels.loading
          if (metadata.textContent) {
            const layerLabel = decodedImage?.layers === undefined
              ? ''
              : ` · ${labels.layers(decodedImage.layers)}`
            metadata.textContent = decodedImage
              ? `${decodedImage.width} × ${decodedImage.height}${layerLabel}`
              : ''
          }
        }
        let decodedImage: DecodedImage | undefined
        updateLabels()
        languageObserver = new MutationObserver(updateLabels)
        languageObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['lang'],
        })

        decodedImage = await decodeImage(bytes.slice(0), file.blob, file.extension)
        if (mountSignal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        const decoded = decodedImage
        decoded.canvas.className = 'ufv-advanced-image-canvas'
        loading.remove()
        stage.append(decoded.canvas)
        const layerLabel = decoded.layers === undefined
          ? ''
          : ` · ${labels.layers(decoded.layers)}`
        metadata.textContent = `${decoded.width} × ${decoded.height}${layerLabel}`

        let angle = 0
        let mirrored = false
        let zoom = 1
        const renderTransform = () => {
          decoded.canvas.style.transform =
            `rotate(${angle}deg) scale(${zoom}) scaleX(${mirrored ? -1 : 1})`
        }
        rotateLeft.addEventListener('click', () => {
          angle -= 90
          renderTransform()
        })
        rotateRight.addEventListener('click', () => {
          angle += 90
          renderTransform()
        })
        mirror.addEventListener('click', () => {
          mirrored = !mirrored
          mirror.setAttribute('aria-pressed', String(mirrored))
          renderTransform()
        })
        zoomOut.addEventListener('click', () => {
          zoom = Math.max(0.25, zoom - 0.25)
          renderTransform()
        })
        zoomIn.addEventListener('click', () => {
          zoom = Math.min(4, zoom + 0.25)
          renderTransform()
        })
        reset.addEventListener('click', () => {
          angle = 0
          mirrored = false
          zoom = 1
          mirror.setAttribute('aria-pressed', 'false')
          renderTransform()
        })
      },
      dispose() {
        languageObserver?.disconnect()
        languageObserver = undefined
        root?.remove()
        root = undefined
      },
    }
  },
}

export const advancedImageAdapterManifest = {
  id: 'advanced-image',
  extensions: [...extensions],
  mimeTypes: ['image/tiff', 'image/vnd.adobe.photoshop'],
  load: async () => advancedImageAdapter,
}
