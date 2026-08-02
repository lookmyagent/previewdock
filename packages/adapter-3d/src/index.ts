import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'
import type {
  AnimationClip,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Texture,
} from 'three'

const modelExtensions = new Set([
  'gltf', 'glb', 'obj', 'stl', 'ply', 'fbx', 'dae', '3ds', '3mf', 'wrl',
])
const MAX_INPUT_SIZE = 60 * 1024 * 1024

interface LoadedModel {
  object: Object3D
  animations: AnimationClip[]
}

function supportsModel(file: FileDescriptor): boolean {
  return modelExtensions.has(file.extension)
    || file.mimeType.startsWith('model/')
}

function localizedLabels(): {
  reset: string
  wireframe: string
  hint: string
  loading: string
} {
  const chinese = document.documentElement.lang.toLowerCase().startsWith('zh')
  return chinese
    ? {
        reset: '重置视角',
        wireframe: '线框',
        hint: '拖动旋转 · 滚轮缩放 · 右键平移',
        loading: '正在解析 3D 模型…',
      }
    : {
        reset: 'Reset view',
        wireframe: 'Wireframe',
        hint: 'Drag to rotate · Scroll to zoom · Right-drag to pan',
        loading: 'Parsing 3D model…',
      }
}

function parseWithCallback<T>(
  invoke: (resolve: (value: T) => void, reject: (error: unknown) => void) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => invoke(resolve, reject))
}

async function loadModel(
  bytes: ArrayBuffer,
  extension: string,
): Promise<LoadedModel> {
  const THREE = await import('three')
  const text = () => new TextDecoder().decode(bytes)

  if (extension === 'gltf' || extension === 'glb') {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    const gltf = await parseWithCallback<{
      scene: Object3D
      animations: AnimationClip[]
    }>((resolve, reject) => {
      loader.parse(extension === 'gltf' ? text() : bytes, '', resolve, reject)
    })
    return { object: gltf.scene, animations: gltf.animations || [] }
  }

  if (extension === 'obj') {
    const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js')
    return { object: new OBJLoader().parse(text()), animations: [] }
  }

  if (extension === 'stl') {
    const { STLLoader } = await import('three/addons/loaders/STLLoader.js')
    const geometry = new STLLoader().parse(bytes)
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({
      color: 0x6f8fe9,
      metalness: 0.08,
      roughness: 0.72,
    })
    return { object: new THREE.Mesh(geometry, material), animations: [] }
  }

  if (extension === 'ply') {
    const { PLYLoader } = await import('three/addons/loaders/PLYLoader.js')
    const geometry = new PLYLoader().parse(bytes)
    geometry.computeVertexNormals()
    const hasVertexColors = Boolean(geometry.getAttribute('color'))
    const material = new THREE.MeshStandardMaterial({
      color: hasVertexColors ? 0xffffff : 0x6f8fe9,
      vertexColors: hasVertexColors,
      metalness: 0.05,
      roughness: 0.78,
    })
    return { object: new THREE.Mesh(geometry, material), animations: [] }
  }

  if (extension === 'fbx') {
    const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js')
    const object = new FBXLoader().parse(bytes, '')
    return { object, animations: object.animations || [] }
  }

  if (extension === 'dae') {
    const { ColladaLoader } = await import('three/addons/loaders/ColladaLoader.js')
    const result = new ColladaLoader().parse(text(), '')
    return { object: result.scene, animations: result.scene.animations || [] }
  }

  if (extension === '3ds') {
    const { TDSLoader } = await import('three/addons/loaders/TDSLoader.js')
    return { object: new TDSLoader().parse(bytes, ''), animations: [] }
  }

  if (extension === '3mf') {
    const { ThreeMFLoader } = await import('three/addons/loaders/3MFLoader.js')
    return { object: new ThreeMFLoader().parse(bytes), animations: [] }
  }

  if (extension === 'wrl') {
    const { VRMLLoader } = await import('three/addons/loaders/VRMLLoader.js')
    return { object: new VRMLLoader().parse(text(), ''), animations: [] }
  }

  throw new Error(`Unsupported 3D model format: ${extension}`)
}

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (value && typeof value === 'object' && 'isTexture' in value) {
      ;(value as Texture).dispose()
    }
  }
  material.dispose()
}

export const modelAdapter: PreviewAdapter = {
  id: 'model-3d',
  label: 'Interactive 3D model viewer',
  supports: supportsModel,
  async open(file, signal): Promise<PreviewSession> {
    if (file.size > MAX_INPUT_SIZE) {
      throw new Error('3D model exceeds the 60 MB browser preview limit')
    }
    const bytes = await file.blob.arrayBuffer()
    if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')

    let root: HTMLElement | undefined
    let disposeViewer: (() => void) | undefined

    return {
      adapterId: 'model-3d',
      adapterLabel: 'Interactive 3D model viewer',
      capabilities: ['preview', 'zoom', 'rotate'],
      async mount(container, mountSignal) {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
        if (mountSignal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }

        root = document.createElement('section')
        root.className = 'ufv-model-preview'
        const toolbar = document.createElement('header')
        toolbar.className = 'ufv-model-toolbar'
        const titleGroup = document.createElement('div')
        const title = document.createElement('strong')
        title.textContent = file.name
        const hint = document.createElement('span')
        titleGroup.append(title, hint)
        const actions = document.createElement('div')
        const wireframeButton = document.createElement('button')
        const resetButton = document.createElement('button')
        wireframeButton.type = 'button'
        resetButton.type = 'button'
        wireframeButton.setAttribute('aria-pressed', 'false')
        actions.append(wireframeButton, resetButton)
        toolbar.append(titleGroup, actions)

        const stage = document.createElement('div')
        stage.className = 'ufv-model-stage'
        const loading = document.createElement('div')
        loading.className = 'ufv-model-loading'
        stage.append(loading)
        root.append(toolbar, stage)
        container.replaceChildren(root)

        const updateLabels = () => {
          const copy = localizedLabels()
          hint.textContent = copy.hint
          resetButton.textContent = copy.reset
          wireframeButton.textContent = copy.wireframe
          loading.textContent = copy.loading
        }
        updateLabels()

        const model = await loadModel(bytes.slice(0), file.extension)
        if (mountSignal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        loading.remove()

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        stage.append(renderer.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf0f3f8)
        const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.screenSpacePanning = true

        scene.add(new THREE.HemisphereLight(0xffffff, 0x465269, 2.1))
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6)
        keyLight.position.set(4, 7, 5)
        scene.add(keyLight)
        const fillLight = new THREE.DirectionalLight(0x9db8ff, 1.2)
        fillLight.position.set(-5, 2, -4)
        scene.add(fillLight)
        scene.add(model.object)

        const box = new THREE.Box3().setFromObject(model.object)
        if (box.isEmpty()) throw new Error('The 3D model contains no visible geometry')
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        model.object.position.sub(center)
        const radius = Math.max(size.x, size.y, size.z, 0.01)
        const initialPosition = new THREE.Vector3(radius * 1.35, radius * 0.9, radius * 1.35)
        camera.near = Math.max(radius / 1000, 0.001)
        camera.far = Math.max(radius * 1000, 100)
        camera.position.copy(initialPosition)
        camera.updateProjectionMatrix()
        controls.target.set(0, 0, 0)
        controls.update()

        const grid = new THREE.GridHelper(radius * 2.4, 12, 0xaab5c8, 0xd2d9e5)
        grid.position.y = -size.y / 2
        scene.add(grid)

        const mixer = model.animations.length
          ? new THREE.AnimationMixer(model.object)
          : undefined
        for (const clip of model.animations) mixer?.clipAction(clip).play()

        const resetView = () => {
          camera.position.copy(initialPosition)
          controls.target.set(0, 0, 0)
          controls.update()
        }
        resetButton.addEventListener('click', resetView)

        let wireframe = false
        const updateWireframe = () => {
          model.object.traverse(child => {
            if (!('isMesh' in child) || !child.isMesh) return
            const mesh = child as Mesh
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            for (const material of materials) {
              if ('wireframe' in material) {
                ;(material as MeshStandardMaterial).wireframe = wireframe
              }
            }
          })
        }
        wireframeButton.addEventListener('click', () => {
          wireframe = !wireframe
          wireframeButton.setAttribute('aria-pressed', String(wireframe))
          updateWireframe()
        })

        const resize = () => {
          const width = Math.max(stage.clientWidth, 1)
          const height = Math.max(stage.clientHeight, 1)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }
        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(stage)
        resize()

        let frameId = 0
        let disposed = false
        let lastTime = performance.now()
        const renderFrame = (time: number) => {
          if (disposed) return
          frameId = requestAnimationFrame(renderFrame)
          const delta = Math.min((time - lastTime) / 1000, 0.1)
          lastTime = time
          mixer?.update(delta)
          controls.update()
          renderer.render(scene, camera)
        }
        renderFrame(lastTime)

        const languageObserver = new MutationObserver(updateLabels)
        languageObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['lang'],
        })

        disposeViewer = () => {
          disposed = true
          cancelAnimationFrame(frameId)
          languageObserver.disconnect()
          resizeObserver.disconnect()
          controls.dispose()
          mixer?.stopAllAction()
          model.object.traverse(child => {
            if (!('isMesh' in child) || !child.isMesh) return
            const mesh = child as Mesh
            mesh.geometry.dispose()
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            materials.forEach(disposeMaterial)
          })
          renderer.dispose()
          renderer.domElement.remove()
        }
      },
      dispose() {
        disposeViewer?.()
        disposeViewer = undefined
        root?.remove()
        root = undefined
      },
    }
  },
}

export const modelAdapterManifest = {
  id: 'model-3d',
  extensions: [...modelExtensions],
  mimeTypes: ['model/gltf+json', 'model/gltf-binary', 'model/obj', 'model/stl'],
  load: async () => modelAdapter,
}
