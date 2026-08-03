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
  'off', 'dxf', '3dm', 'ifc', 'step', 'stp', 'iges', 'igs', 'brep',
])
const MAX_INPUT_SIZE = 60 * 1024 * 1024

interface LoadedModel {
  object: Object3D
  animations: AnimationClip[]
  dispose?: () => void
}

export interface ModelAdapterOptions {
  /** URL of occt-import-js.wasm, required only for STEP, IGES and BREP files. */
  occtWasmUrl?: string
  /** Folder containing rhino3dm.js and rhino3dm.wasm, required only for 3DM files. */
  rhinoLibraryPath?: string
  /** Folder containing web-ifc.wasm, required only for IFC files. */
  ifcWasmPath?: string
}

interface OcctMesh {
  name?: string
  color?: number[]
  attributes: {
    position: { array: number[] }
    normal?: { array: number[] }
  }
  index?: { array: number[] }
}

interface OcctResult {
  success: boolean
  meshes: OcctMesh[]
}

interface OcctRuntime {
  ReadStepFile(content: Uint8Array, params: unknown): OcctResult
  ReadIgesFile(content: Uint8Array, params: unknown): OcctResult
  ReadBrepFile(content: Uint8Array, params: unknown): OcctResult
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
  options: ModelAdapterOptions,
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

  if (extension === '3dm') {
    if (!options.rhinoLibraryPath) {
      throw new Error('3DM preview requires a rhino3dm library path')
    }
    const { Rhino3dmLoader } = await import('three/addons/loaders/3DMLoader.js')
    const loader = new Rhino3dmLoader()
    loader.setLibraryPath(options.rhinoLibraryPath)
    loader.setWorkerLimit(2)
    const object = await parseWithCallback<Object3D>((resolve, reject) => {
      loader.parse(bytes.slice(0), resolve, reject)
    })
    return { object, animations: object.animations || [], dispose: () => loader.dispose() }
  }

  if (extension === 'ifc') {
    if (!options.ifcWasmPath) {
      throw new Error('IFC preview requires a web-ifc WASM path')
    }
    const { IfcAPI } = await import('web-ifc')
    const api = new IfcAPI()
    api.SetWasmPath(options.ifcWasmPath, true)
    // Keep the optional IFC pack self-contained with one WASM file. The MT build
    // additionally requires a worker asset and offers little benefit for the
    // bounded sample sizes accepted by this browser viewer.
    await api.Init(undefined, true)
    let modelId = -1
    try {
      modelId = api.OpenModel(new Uint8Array(bytes), { COORDINATE_TO_ORIGIN: true })
      const flatMeshes = api.LoadAllGeometry(modelId)
      const positions: number[] = []
      const normals: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      const position = new THREE.Vector3()
      const normal = new THREE.Vector3()
      const matrix = new THREE.Matrix4()
      const normalMatrix = new THREE.Matrix3()
      for (let meshIndex = 0; meshIndex < flatMeshes.size(); meshIndex += 1) {
        const flatMesh = flatMeshes.get(meshIndex)
        for (let placedIndex = 0; placedIndex < flatMesh.geometries.size(); placedIndex += 1) {
          const placed = flatMesh.geometries.get(placedIndex)
          const rawGeometry = api.GetGeometry(modelId, placed.geometryExpressID)
          try {
            const vertexData = api.GetVertexArray(rawGeometry.GetVertexData(), rawGeometry.GetVertexDataSize())
            const indexData = api.GetIndexArray(rawGeometry.GetIndexData(), rawGeometry.GetIndexDataSize())
            matrix.fromArray(placed.flatTransformation)
            normalMatrix.getNormalMatrix(matrix)
            const vertexOffset = positions.length / 3
            for (let index = 0; index < vertexData.length; index += 6) {
              position.set(vertexData[index]!, vertexData[index + 1]!, vertexData[index + 2]!).applyMatrix4(matrix)
              normal.set(vertexData[index + 3]!, vertexData[index + 4]!, vertexData[index + 5]!).applyNormalMatrix(normalMatrix)
              positions.push(position.x, position.y, position.z)
              normals.push(normal.x, normal.y, normal.z)
              colors.push(placed.color.x, placed.color.y, placed.color.z)
            }
            for (const index of indexData) indices.push(vertexOffset + index)
          } finally {
            rawGeometry.delete()
          }
        }
        if (typeof flatMesh.delete === 'function') flatMesh.delete()
      }
      if (!positions.length) throw new Error('The IFC file contains no visible geometry')
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      geometry.setIndex(indices)
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        metalness: 0.02,
        roughness: 0.82,
      })
      return { object: new THREE.Mesh(geometry, material), animations: [] }
    } finally {
      if (modelId >= 0) api.CloseModel(modelId)
    }
  }

  if (extension === 'off') {
    const tokens = text().replace(/#[^\n]*/g, '').trim().split(/\s+/)
    if (tokens.shift()?.toUpperCase() !== 'OFF') throw new Error('Invalid OFF header')
    const vertexCount = Number(tokens.shift())
    const faceCount = Number(tokens.shift())
    tokens.shift()
    if (!Number.isFinite(vertexCount) || !Number.isFinite(faceCount)) {
      throw new Error('Invalid OFF geometry counts')
    }
    const vertices: number[] = []
    for (let index = 0; index < vertexCount * 3; index += 1) {
      vertices.push(Number(tokens.shift()))
    }
    const indices: number[] = []
    for (let face = 0; face < faceCount; face += 1) {
      const count = Number(tokens.shift())
      const polygon = Array.from({ length: count }, () => Number(tokens.shift()))
      for (let index = 1; index < polygon.length - 1; index += 1) {
        indices.push(polygon[0]!, polygon[index]!, polygon[index + 1]!)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({ color: 0x6f8fe9, roughness: 0.72 })
    return { object: new THREE.Mesh(geometry, material), animations: [] }
  }

  if (extension === 'dxf') {
    const { DxfParser } = await import('dxf-parser')
    const parsed = new DxfParser().parseSync(text()) as unknown as {
      entities?: Array<{
        type?: string
        vertices?: Array<{ x?: number, y?: number, z?: number }>
        center?: { x?: number, y?: number, z?: number }
        radius?: number
        startAngle?: number
        endAngle?: number
      }>
    }
    const positions: number[] = []
    const addPoint = (point: { x?: number, y?: number, z?: number }) => {
      positions.push(point.x || 0, point.y || 0, point.z || 0)
    }
    const addSegment = (
      from: { x?: number, y?: number, z?: number },
      to: { x?: number, y?: number, z?: number },
    ) => {
      addPoint(from)
      addPoint(to)
    }
    for (const entity of parsed.entities || []) {
      const vertices = entity.vertices || []
      if (['LINE', 'LWPOLYLINE', 'POLYLINE', '3DFACE', 'SOLID'].includes(entity.type || '')) {
        for (let index = 1; index < vertices.length; index += 1) {
          addSegment(vertices[index - 1]!, vertices[index]!)
        }
        if (['LWPOLYLINE', 'POLYLINE', '3DFACE', 'SOLID'].includes(entity.type || '') && vertices.length > 2) {
          addSegment(vertices[vertices.length - 1]!, vertices[0]!)
        }
      } else if (['CIRCLE', 'ARC'].includes(entity.type || '') && entity.center && entity.radius) {
        const start = entity.type === 'ARC' ? (entity.startAngle || 0) : 0
        const end = entity.type === 'ARC' ? (entity.endAngle || Math.PI * 2) : Math.PI * 2
        const steps = 48
        for (let index = 1; index <= steps; index += 1) {
          const angleA = start + (end - start) * ((index - 1) / steps)
          const angleB = start + (end - start) * (index / steps)
          addSegment(
            { x: (entity.center.x || 0) + Math.cos(angleA) * entity.radius, y: (entity.center.y || 0) + Math.sin(angleA) * entity.radius, z: entity.center.z },
            { x: (entity.center.x || 0) + Math.cos(angleB) * entity.radius, y: (entity.center.y || 0) + Math.sin(angleB) * entity.radius, z: entity.center.z },
          )
        }
      }
    }
    if (!positions.length) throw new Error('The DXF file contains no supported visible entities')
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    const material = new THREE.LineBasicMaterial({ color: 0x315ee7 })
    return { object: new THREE.LineSegments(geometry, material), animations: [] }
  }

  if (['step', 'stp', 'iges', 'igs', 'brep'].includes(extension)) {
    if (!options.occtWasmUrl) {
      throw new Error('STEP/IGES/BREP preview requires an occt-import-js WASM URL')
    }
    const module = await import('occt-import-js')
    const initialize = module.default as unknown as (
      options: { locateFile: (path: string) => string },
    ) => Promise<OcctRuntime>
    const occt = await initialize({ locateFile: () => options.occtWasmUrl! })
    const source = new Uint8Array(bytes)
    const result = ['step', 'stp'].includes(extension)
      ? occt.ReadStepFile(source, null)
      : ['iges', 'igs'].includes(extension)
        ? occt.ReadIgesFile(source, null)
        : occt.ReadBrepFile(source, null)
    if (!result.success || !result.meshes.length) {
      throw new Error('OpenCascade could not triangulate this engineering model')
    }
    const group = new THREE.Group()
    result.meshes.forEach((mesh, index) => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3))
      if (mesh.attributes.normal) {
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3))
      } else {
        geometry.computeVertexNormals()
      }
      if (mesh.index?.array.length) geometry.setIndex(mesh.index.array)
      const color = mesh.color && mesh.color.length >= 3
        ? new THREE.Color(mesh.color[0]! / 255, mesh.color[1]! / 255, mesh.color[2]! / 255)
        : new THREE.Color(0x6f8fe9)
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.04, roughness: 0.72 })
      const object = new THREE.Mesh(geometry, material)
      object.name = mesh.name || `Part ${index + 1}`
      group.add(object)
    })
    return { object: group, animations: [] }
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

export function createModelAdapter(options: ModelAdapterOptions = {}): PreviewAdapter {
  return {
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

        const model = await loadModel(bytes.slice(0), file.extension, options)
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
            if (!('geometry' in child) || !('material' in child)) return
            const renderable = child as Mesh
            renderable.geometry.dispose()
            const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material]
            materials.forEach(disposeMaterial)
          })
          model.dispose?.()
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
  }
}
}

export const modelAdapter = createModelAdapter()

export const modelAdapterManifest = {
  id: 'model-3d',
  extensions: [...modelExtensions],
  mimeTypes: ['model/gltf+json', 'model/gltf-binary', 'model/obj', 'model/stl'],
  load: async () => modelAdapter,
}
