import { useAuraTheme } from '../../hooks/useAuraTheme'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/** Decorative only: navigation and page content never depend on WebGL. */
export default function AuraSculpture({ paused }: { paused: boolean }) {
  const { theme } = useAuraTheme()
  const host = useRef<HTMLDivElement>(null)
  const pause = useRef(paused)
  useEffect(() => { pause.current = paused }, [paused])

  useEffect(() => {
    const element = host.current
    if (!element) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      // The CSS sculpture remains visible when WebGL is unavailable.
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.domElement.setAttribute('aria-hidden', 'true')
    element.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
    camera.position.z = 8.5
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture
    room.dispose()
    pmrem.dispose()

    const group = new THREE.Group()
    scene.add(group)
    const geometry = new THREE.TorusKnotGeometry(1.35, 0.42, 192, 32, 2, 3)
    const material = new THREE.MeshPhysicalMaterial({
      color: theme === 'light' ? '#3d69d5' : '#d5c0f6', metalness: 0.95, roughness: 0.2,
      iridescence: 0.7, iridescenceIOR: 1.4, iridescenceThicknessRange: [100, 450],
      clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.6,
    })
    const sculpture = new THREE.Mesh(geometry, material)
    sculpture.rotation.set(0.35, 0.2, -0.45)
    group.add(sculpture)
    const ringGeometry = new THREE.TorusGeometry(2.28, 0.012, 8, 160)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: theme === 'light' ? '#ff701f' : '#fd8655', transparent: true, opacity: 0.6 })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.set(1.15, 0.3, -0.3)
    group.add(ring)
    const orange = new THREE.PointLight('#ff6d30', 45, 15)
    orange.position.set(-3, -2, 3)
    scene.add(orange)
    const violet = new THREE.PointLight(theme === 'light' ? '#6b9eff' : '#ab8aff', 35, 15)
    violet.position.set(3, 2, 2)
    scene.add(violet)

    let visible = true
    let frame = 0
    let lastTime = 0
    let elapsed = 0
    let scroll = 0
    const pointer = { x: 0, y: 0 }
    const resize = () => {
      const { width, height } = element.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    intersection.observe(element)
    const move = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.5
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.4
    }
    const onScroll = () => { scroll = Math.min(window.scrollY / window.innerHeight, 2) }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    resize()
    renderer.render(scene, camera)
    element.dataset.ready = 'true'
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate)
      if (!visible || document.hidden || pause.current) { lastTime = time; return }
      const delta = time - lastTime
      if (delta < 1000 / 30) return
      elapsed += Math.min(delta, 100) / 1000
      lastTime = time
      sculpture.rotation.y = 0.2 + elapsed * 0.12 + scroll * 0.5
      sculpture.rotation.z = -0.45 + Math.sin(elapsed * 0.2) * 0.1
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, pointer.y, 0.05)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, pointer.x, 0.05)
      group.position.y = Math.sin(elapsed * 0.55) * 0.08
      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(animate)
    const lost = (event: Event) => { event.preventDefault(); delete element.dataset.ready; visible = false }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', onScroll)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      geometry.dispose()
      material.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      delete element.dataset.ready
    }
  }, [theme])

  return <div ref={host} className="aura-sculpture" aria-hidden="true" />
}
