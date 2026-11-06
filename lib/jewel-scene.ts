// Real-time 3D jewellery, built from simple shapes with Three.js.
// Loaded only in the browser, and only when a 3D component mounts (dynamic import),
// so Three.js never blocks the first paint or the server-rendered HTML that search engines read.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { JewelSpec, Metal } from '~~/shared/jewels'

export interface JewelHandle {
  /** 0 at the top of the hero, 1 when it has scrolled away. */
  setScroll(progress: number): void
  /** Pointer position, -1..1 on each axis. */
  setPointer(x: number, y: number): void
  dispose(): void
}

export interface JewelOptions {
  /** Drag to rotate (product page). */
  interactive?: boolean
  reducedMotion?: boolean
  /** How much of the frame the piece fills (1 = default). */
  framing?: number
  onReady?: () => void
}

const METALS: Record<Metal, { color: number; roughness: number }> = {
  silver: { color: 0xeceef2, roughness: 0.14 },
  gold: { color: 0xe9c27c, roughness: 0.18 },
  copper: { color: 0xdd8a5a, roughness: 0.3 },
  brass: { color: 0xdcb665, roughness: 0.26 },
}

function metalMaterial(metal: Metal) {
  const m = METALS[metal]
  return new THREE.MeshPhysicalMaterial({
    color: m.color,
    metalness: 1,
    roughness: m.roughness,
    clearcoat: 0.5,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
  })
}

function gemMaterial(hex: string) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    thickness: 0.9,
    ior: 2.1,
    dispersion: 4,
    attenuationColor: new THREE.Color(hex),
    attenuationDistance: 0.6,
    specularIntensity: 1,
    envMapIntensity: 3,
    flatShading: true,
  })
}

function pearlMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf3ebe0,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    sheen: 1,
    sheenColor: new THREE.Color(0xffd9e6),
    iridescence: 0.7,
    iridescenceIOR: 1.6,
    envMapIntensity: 1.2,
  })
}

function beadMaterial() {
  return new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 })
}

/** A round brilliant: eight-sided lathe, flat-shaded so each facet catches light separately. */
function brilliantGeometry() {
  const profile = [
    new THREE.Vector2(0, -0.42),
    new THREE.Vector2(0.5, 0),
    new THREE.Vector2(0.5, 0.05),
    new THREE.Vector2(0.3, 0.2),
    new THREE.Vector2(0, 0.2),
  ]
  return new THREE.LatheGeometry(profile, 8)
}

function starGeometry(outer = 0.38, inner = 0.17) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 === 0 ? outer : inner
    const x = Math.cos(a) * r
    const y = -Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 1 })
  g.center()
  return g
}

function placeAlong(mesh: THREE.InstancedMesh, positions: THREE.Vector3[], scale = 1, colors?: THREE.Color[]) {
  const m = new THREE.Matrix4()
  positions.forEach((p, i) => {
    m.compose(p, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale))
    mesh.setMatrixAt(i, m)
    if (colors) mesh.setColorAt(i, colors[i % colors.length]!)
  })
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

function necklaceCurve(width = 1.1, drop = 0.45) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-width, 1.6, -0.1),
    new THREE.Vector3(-width * 0.8, 0.6, 0.05),
    new THREE.Vector3(-width * 0.38, -drop + 0.2, 0.1),
    new THREE.Vector3(0, -drop, 0.12),
    new THREE.Vector3(width * 0.38, -drop + 0.2, 0.1),
    new THREE.Vector3(width * 0.8, 0.6, 0.05),
    new THREE.Vector3(width, 1.6, -0.1),
  ])
}

/** Builds the piece described by `spec`, centred at the origin. */
function buildJewel(spec: JewelSpec): THREE.Group {
  const g = new THREE.Group()
  const metal = metalMaterial(spec.metal)
  const gem = gemMaterial(spec.gem ?? '#f4f8ff')

  switch (spec.kind) {
    case 'solitaire': {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.085, 48, 180), metal))
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.22, 32), metal)
      head.position.y = 1.15
      g.add(head)
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2
        const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.42, 12), metal)
        prong.position.set(Math.cos(a) * 0.22, 1.36, Math.sin(a) * 0.22)
        prong.rotation.set(Math.sin(a) * -0.18, 0, Math.cos(a) * 0.18)
        g.add(prong)
      }
      const stone = new THREE.Mesh(brilliantGeometry(), gem)
      stone.scale.setScalar(0.56)
      stone.position.y = 1.44
      g.add(stone)
      g.rotation.x = -0.28
      break
    }
    case 'stack': {
      const tubes = [0.06, 0.08, 0.05]
      tubes.forEach((t, i) => {
        const band = new THREE.Mesh(new THREE.TorusGeometry(1, t, 32, 160), i === 1 ? metalMaterial('gold') : metal)
        if (i === 1) (band.material as THREE.MeshPhysicalMaterial).roughness = 0.42 // the hammered band
        band.position.z = (i - 1) * 0.2
        band.rotation.set((i - 1) * 0.12, (i - 1) * 0.18, 0)
        g.add(band)
      })
      g.rotation.set(-0.35, 0.5, 0)
      break
    }
    case 'signet': {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 48, 180), metal))
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.18, 64), metal)
      face.scale.z = 0.75
      face.position.y = 1.12
      g.add(face)
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.4, 48, 24), gemMaterial(spec.gem ?? '#9b1030'))
      ;(stone.material as THREE.MeshPhysicalMaterial).flatShading = false
      stone.scale.set(1, 0.28, 0.72)
      stone.position.y = 1.22
      g.add(stone)
      g.rotation.x = -0.55
      break
    }
    case 'pendant': {
      g.add(new THREE.Mesh(new THREE.TubeGeometry(necklaceCurve(), 320, 0.016, 8), metal))
      const bail = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 32), metal)
      bail.position.set(0, -0.52, 0.12)
      g.add(bail)
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 64), metal)
      disc.rotation.x = Math.PI / 2
      disc.position.set(0, -0.9, 0.12)
      g.add(disc)
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.04), metal)
        ray.position.set(Math.cos(a) * 0.42, -0.9 + Math.sin(a) * 0.42, 0.12)
        ray.rotation.z = a - Math.PI / 2
        g.add(ray)
      }
      break
    }
    case 'pearls': {
      const curve = necklaceCurve(1.25, 0.6)
      const count = 44
      const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 32, 16), pearlMaterial(), count)
      placeAlong(mesh, Array.from({ length: count }, (_, i) => curve.getPointAt(i / (count - 1))))
      g.add(mesh)
      break
    }
    case 'collar': {
      const colours = ['#b51f2e', '#1f4fb0', '#f2efe8', '#1f8a52', '#e8a326'].map((c) => new THREE.Color(c))
      colours.forEach((colour, band) => {
        const r = 1.15 - band * 0.12
        const count = Math.round((2 * Math.PI * r) / 0.1)
        const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.052, 16, 10), beadMaterial(), count)
        const pts = Array.from({ length: count }, (_, i) => {
          const a = (i / count) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
        })
        placeAlong(mesh, pts, 1, [colour])
        g.add(mesh)
      })
      g.rotation.x = -1.0
      break
    }
    case 'drops': {
      for (const x of [-0.55, 0.55]) {
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 12, 48, Math.PI * 1.3), metal)
        hook.position.set(x, 1.05, 0)
        hook.rotation.z = -0.15
        g.add(hook)
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.45, 8), metal)
        wire.position.set(x + 0.17, 0.75, 0)
        g.add(wire)
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 12), metal)
        bead.position.set(x + 0.17, 0.5, 0)
        g.add(bead)
        const star = new THREE.Mesh(starGeometry(), gemMaterial(spec.gem ?? '#2d5bd8'))
        star.position.set(x + 0.17, 0.05, 0)
        g.add(star)
      }
      break
    }
    case 'studs': {
      for (const x of [-0.5, 0.5]) {
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 64, 32), pearlMaterial())
        pearl.position.x = x
        g.add(pearl)
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12), metal)
        post.rotation.x = Math.PI / 2
        post.position.set(x, 0, -0.4)
        g.add(post)
      }
      g.rotation.y = 0.5
      break
    }
    case 'hoops': {
      for (const [x, ry] of [[-0.62, 0.45], [0.62, -0.45]] as const) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 24, 128), metal)
        hoop.position.x = x
        hoop.rotation.y = ry
        g.add(hoop)
      }
      break
    }
    case 'tennis': {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 24, 180), metal))
      const count = 36
      const stones = new THREE.InstancedMesh(brilliantGeometry(), gem, count)
      const m = new THREE.Matrix4()
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2
        m.compose(new THREE.Vector3(Math.cos(a), Math.sin(a), 0.06), q, new THREE.Vector3(0.15, 0.15, 0.15))
        stones.setMatrixAt(i, m)
      }
      g.add(stones)
      g.rotation.x = -1.05
      break
    }
    case 'beads': {
      const count = 22
      const colours = ['#8a5524', '#6e2a22', '#1b1a1c', '#a8692e'].map((c) => new THREE.Color(c))
      const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 32, 16), beadMaterial(), count)
      const pts = Array.from({ length: count + 1 }, (_, i) => {
        const a = (i / (count + 1)) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a), Math.sin(a), 0)
      })
      placeAlong(mesh, pts.slice(1), 1, colours)
      g.add(mesh)
      const accent = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16), metal)
      accent.position.copy(pts[0]!)
      g.add(accent)
      g.rotation.x = -0.95
      break
    }
    case 'cuff': {
      const start = Math.PI * 0.12
      const length = Math.PI * 2 - start * 2
      const band = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.62, 160, 1, true, start, length), metal)
      ;(band.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide
      g.add(band)
      for (const y of [-0.31, 0.31]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 12, 160, length), metal)
        rim.rotation.x = Math.PI / 2
        rim.rotation.z = -Math.PI / 2 + start
        rim.position.y = y
        g.add(rim)
      }
      g.rotation.set(-0.55, 0.4, 0)
      break
    }
  }

  // Normalise size and centre, so every piece frames the same way.
  const wrapper = new THREE.Group()
  wrapper.add(g)
  const box = new THREE.Box3().setFromObject(wrapper)
  const size = box.getSize(new THREE.Vector3())
  const centre = box.getCenter(new THREE.Vector3())
  g.position.sub(centre)
  wrapper.scale.setScalar(2.4 / Math.max(size.x, size.y, size.z))
  return wrapper
}

/** A soft round shadow under the piece, cheaper and softer than real-time shadows. */
function contactShadow() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.65)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -1.5
  mesh.scale.set(1, 0.55, 1)
  return mesh
}

export function mountJewel(canvas: HTMLCanvasElement, spec: JewelSpec, opts: JewelOptions = {}): JewelHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTexture

  // Warm key light from above, cool green rim from behind: the "jewellery counter" look.
  const key = new THREE.SpotLight(0xfff0d8, 60, 0, 0.5, 0.8)
  key.position.set(2.5, 5, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x8ff0c4, 1.6)
  rim.position.set(-4, 1.5, -3)
  scene.add(rim)
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  const baseDistance = 7 / (opts.framing ?? 1)
  camera.position.set(0, 0.2, baseDistance)

  const jewel = buildJewel(spec)
  scene.add(jewel)
  scene.add(contactShadow())

  let controls: OrbitControls | undefined
  if (opts.interactive) {
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = !opts.reducedMotion
    controls.autoRotateSpeed = 1.6
    controls.minPolarAngle = Math.PI * 0.2
    controls.maxPolarAngle = Math.PI * 0.62
    controls.addEventListener('change', () => opts.reducedMotion && render())
    // OrbitControls blocks all touch scrolling; let vertical swipes still scroll the page on phones.
    canvas.style.touchAction = 'pan-y'
  }

  let scroll = 0
  const pointer = new THREE.Vector2()
  const tilt = new THREE.Vector2()
  let visible = true
  let frame = 0
  let readyFired = false
  const clock = new THREE.Clock()

  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    const { clientWidth: w, clientHeight: h } = parent
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Pull back on tall, narrow screens so the piece never crops.
    camera.position.z = baseDistance * Math.max(1, 0.9 / camera.aspect)
    camera.updateProjectionMatrix()
    render()
  }

  function render() {
    renderer.render(scene, camera)
    if (!readyFired) {
      readyFired = true
      opts.onReady?.()
    }
  }

  function tick() {
    frame = requestAnimationFrame(tick)
    if (!visible) return
    const t = clock.getElapsedTime()
    if (controls) {
      controls.update()
    } else {
      tilt.lerp(pointer, 0.05)
      jewel.rotation.y = t * 0.35 + tilt.x * 0.5 + scroll * 1.4
      jewel.rotation.x = tilt.y * 0.25 + scroll * 0.5
      jewel.position.y = Math.sin(t * 0.9) * 0.06 + scroll * 0.8
      camera.position.z = baseDistance * Math.max(1, 0.9 / camera.aspect) + scroll * 3
    }
    render()
  }

  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  resize()

  // Stop rendering when the canvas is off screen, to save battery.
  const io = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting))
  io.observe(canvas)

  if (opts.reducedMotion && !controls) {
    jewel.rotation.y = 0.6
    render()
  } else {
    tick()
  }

  return {
    setScroll(p) {
      scroll = Math.min(Math.max(p, 0), 1)
    },
    setPointer(x, y) {
      pointer.set(x, y)
    },
    dispose() {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      controls?.dispose()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      })
      envTexture.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
