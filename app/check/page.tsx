"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

interface AnnotationPoint {
  id: string
  position: { x: string; y: string }
  title: string
  description: string
  color: string
  gradientId: string
  scrollRange: { start: number; end: number }
}

const annotations: AnnotationPoint[] = [
  {
    id: "head",
    position: { x: "50%", y: "25%" },
    title: "AI Fraud Detection",
    description:
      "Advanced neural networks monitor every transaction, detecting suspicious patterns before they can harm your wealth",
    color: "cyan",
    gradientId: "grad1",
    scrollRange: { start: 0, end: 0.16 },
  },
  {
    id: "shoulder",
    position: { x: "35%", y: "35%" },
    title: "Multi-Layer Encryption",
    description: "Military-grade encryption shields your financial data like impenetrable armor plating",
    color: "blue",
    gradientId: "grad2",
    scrollRange: { start: 0.16, end: 0.33 },
  },
  {
    id: "chest",
    position: { x: "50%", y: "45%" },
    title: "Blockchain Vault",
    description:
      "Your assets are secured in an unbreachable digital fortress, protected by distributed ledger technology",
    color: "green",
    gradientId: "grad3",
    scrollRange: { start: 0.33, end: 0.5 },
  },
  {
    id: "core",
    position: { x: "50%", y: "55%" },
    title: "Lightning Payments",
    description: "Execute transactions at the speed of light while maintaining fortress-level security",
    color: "yellow",
    gradientId: "grad4",
    scrollRange: { start: 0.5, end: 0.66 },
  },
  {
    id: "lower",
    position: { x: "45%", y: "70%" },
    title: "Asset Recovery Shield",
    description: "Advanced recovery protocols ensure your wealth remains protected even in worst-case scenarios",
    color: "purple",
    gradientId: "grad5",
    scrollRange: { start: 0.66, end: 0.83 },
  },
  {
    id: "complete",
    position: { x: "50%", y: "85%" },
    title: "Total Financial Armor",
    description: "Complete protection suite - Your money, armored by blockchain technology",
    color: "red",
    gradientId: "grad6",
    scrollRange: { start: 0.83, end: 1 },
  },
]

export default function ArmorShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    // Add global styles to prevent white background
    const style = document.createElement("style")
    style.textContent = `
      html, body {
        background-color: #000000 !important;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        z-index: -1;
      }
    `
    document.head.appendChild(style)

    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let renderer: THREE.WebGLRenderer
    let armorModel: THREE.Group | THREE.Object3D
    let mixer: THREE.AnimationMixer | null
    let titleMesh: THREE.Mesh
    let subtitleMesh: THREE.Mesh
    const backgroundElements: THREE.Line[] = []
    const particles: THREE.Mesh[] = []
    let rotationStarted = false
    let currentScrollY = 0
    let targetScrollY = 0

    const initThreeJS = async () => {
      try {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 0, -4)

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setClearColor(0x000000, 1) // Solid black background instead of transparent
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement)
        }

        // Enhanced lighting setup
        scene.add(new THREE.AmbientLight(0x404040, 0.4))

        const dirLight = new THREE.DirectionalLight(0xffffff, 1)
        dirLight.position.set(5, 10, 7)
        dirLight.castShadow = true
        dirLight.shadow.mapSize.width = 2048
        dirLight.shadow.mapSize.height = 2048
        scene.add(dirLight)

        const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5)
        rimLight.position.set(-5, 0, -10)
        scene.add(rimLight)

        // Create 3D text using canvas texture with better quality
        const createTextTexture = (text: string, fontSize: number, color: string) => {
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")!

          // Higher resolution for better quality
          canvas.width = 4096
          canvas.height = 1024

          // Clear canvas
          context.fillStyle = "transparent"
          context.fillRect(0, 0, canvas.width, canvas.height)

          // Better font rendering
          context.font = `bold ${fontSize * 2}px Arial, sans-serif` // Double size for higher res
          context.fillStyle = color
          context.textAlign = "center"
          context.textBaseline = "middle"
          context.imageSmoothingEnabled = true
          context.imageSmoothingQuality = "high"

          // Add glow effect
          context.shadowColor = color
          context.shadowBlur = 40
          context.fillText(text, canvas.width / 2, canvas.height / 2)

          // Add inner glow
          context.shadowBlur = 20
          context.fillText(text, canvas.width / 2, canvas.height / 2)

          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          return texture
        }

        // Create 3D title behind armor
        const titleTexture = createTextTexture("FINANCIAL FORTRESS", 120, "#00ffff")
        const titleGeometry = new THREE.PlaneGeometry(12, 3)
        const titleMaterial = new THREE.MeshBasicMaterial({
          map: titleTexture,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })
        titleMesh = new THREE.Mesh(titleGeometry, titleMaterial)
        titleMesh.position.set(0, 1, -12) // Far behind the armor
        scene.add(titleMesh)

        // Create 3D subtitle
        const subtitleTexture = createTextTexture("Your Money, Armored by Blockchain", 60, "#888888")
        const subtitleGeometry = new THREE.PlaneGeometry(10, 1.5)
        const subtitleMaterial = new THREE.MeshBasicMaterial({
          map: subtitleTexture,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        })
        subtitleMesh = new THREE.Mesh(subtitleGeometry, subtitleMaterial)
        subtitleMesh.position.set(0, -1, -12) // Far behind the armor
        scene.add(subtitleMesh)

        // Create animated background grid
        const createBackgroundGrid = () => {
          const gridSize = 50
          const divisions = 50

          // Horizontal lines
          for (let i = 0; i <= divisions; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(-gridSize, 0, (i - divisions / 2) * ((gridSize * 2) / divisions)),
              new THREE.Vector3(gridSize, 0, (i - divisions / 2) * ((gridSize * 2) / divisions)),
            ])
            const material = new THREE.LineBasicMaterial({
              color: 0x00ffff,
              transparent: true,
              opacity: 0.1,
            })
            const line = new THREE.Line(geometry, material)
            line.position.set(0, 0, -25) // Even further back
            line.rotation.x = Math.PI / 2
            backgroundElements.push(line)
            scene.add(line)
          }

          // Vertical lines
          for (let i = 0; i <= divisions; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3((i - divisions / 2) * ((gridSize * 2) / divisions), 0, -gridSize),
              new THREE.Vector3((i - divisions / 2) * ((gridSize * 2) / divisions), 0, gridSize),
            ])
            const material = new THREE.LineBasicMaterial({
              color: 0x00ffff,
              transparent: true,
              opacity: 0.1,
            })
            const line = new THREE.Line(geometry, material)
            line.position.set(0, 0, -25) // Even further back
            line.rotation.x = Math.PI / 2
            backgroundElements.push(line)
            scene.add(line)
          }
        }

        // Create floating energy orbs
        const createEnergyOrbs = () => {
          for (let i = 0; i < 20; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.1, 16, 16)
            const orbMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6),
              transparent: true,
              opacity: 0.7,
            })
            const orb = new THREE.Mesh(orbGeometry, orbMaterial)
            orb.position.set(
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 30,
              -20 + Math.random() * 10, // Behind armor but in front of text
            )
            orb.userData = {
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.01,
              ),
              originalPosition: orb.position.clone(),
              phase: Math.random() * Math.PI * 2,
            }
            particles.push(orb)
            scene.add(orb)
          }
        }

        // Create data streams
        const createDataStreams = () => {
          for (let i = 0; i < 8; i++) {
            const points = []
            const numPoints = 20
            for (let j = 0; j < numPoints; j++) {
              points.push(new THREE.Vector3(Math.sin(j * 0.5) * 5, j * 2 - 20, -30 + Math.cos(j * 0.3) * 3))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.8, 0.5),
              transparent: true,
              opacity: 0.6,
            })
            const stream = new THREE.Line(geometry, material)
            stream.rotation.y = (i / 8) * Math.PI * 2
            stream.userData = { rotationSpeed: 0.005 + Math.random() * 0.01 }
            backgroundElements.push(stream)
            scene.add(stream)
          }
        }

        createBackgroundGrid()
        createEnergyOrbs()
        createDataStreams()

        // Load the armor model
        const loader = new GLTFLoader()
        loader.load(
          "/models/sci-fi_armor.glb",
          (gltf) => {
            console.log("Model loaded successfully")
            armorModel = gltf.scene

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(armorModel)
            const center = box.getCenter(new THREE.Vector3())
            armorModel.position.sub(center)

            const size = box.getSize(new THREE.Vector3())
            const scale = 2 / Math.max(size.x, size.y, size.z)
            armorModel.scale.setScalar(scale)

            // Position armor in front of text but behind camera
            armorModel.position.z = -2 // In front of text (-12) but behind camera (-4)

            // Enable shadows and add glow effect
            armorModel.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true

                // Add subtle glow to armor
                if (child.material) {
                  child.material.emissive = new THREE.Color(0x001122)
                  child.material.emissiveIntensity = 0.1
                }
              }
            })

            scene.add(armorModel)

            if (gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(armorModel)
              mixer.clipAction(gltf.animations[0]).play()
            }
          },
          (progress) => {
            console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
          },
          (error) => {
            console.error("Error loading model:", error)
            // Create a fallback armor-like shape
            const group = new THREE.Group()

            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 2.5, 8)
            const bodyMaterial = new THREE.MeshLambertMaterial({
              color: 0x00aaff,
              emissive: 0x001122,
              emissiveIntensity: 0.1,
            })
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
            group.add(body)

            // Head
            const headGeometry = new THREE.SphereGeometry(0.5, 16, 16)
            const headMaterial = new THREE.MeshLambertMaterial({
              color: 0x0088cc,
              emissive: 0x001122,
              emissiveIntensity: 0.1,
            })
            const head = new THREE.Mesh(headGeometry, headMaterial)
            head.position.y = 1.8
            group.add(head)

            group.position.z = -2 // Same positioning as real armor
            armorModel = group
            scene.add(armorModel)
            console.log("Fallback armor created")
          },
        )

        // Camera animation path
        const cameraPath = [
          { pos: { x: 0, y: 0, z: -4 }, look: { x: 0, y: 0, z: -2 }, fov: 50 },
          { pos: { x: 1.5, y: 1.2, z: 0 }, look: { x: 0, y: 1, z: -2 }, fov: 38 },
          { pos: { x: 0, y: 0.5, z: -0.4 }, look: { x: 0, y: 0.4, z: -2 }, fov: 32 },
          { pos: { x: -1.2, y: -0.3, z: -0.2 }, look: { x: 0, y: -0.2, z: -2 }, fov: 34 },
          { pos: { x: 1.2, y: -1, z: 0.2 }, look: { x: 0, y: -0.8, z: -2 }, fov: 36 },
          { pos: { x: 0, y: 0.2, z: 4 }, look: { x: 0, y: 0, z: -2 }, fov: 60 },
        ]

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
        const smoothLerp = (start: number, end: number, factor: number) => start + (end - start) * easeOutCubic(factor)

        const updateCamera = (scrollPercent: number) => {
          scrollPercent = Math.max(0, Math.min(1, scrollPercent))
          setScrollProgress(scrollPercent)

          const totalSections = cameraPath.length - 1
          const sectionIndex = scrollPercent * totalSections
          const section = Math.floor(sectionIndex)
          const progress = sectionIndex - section

          const current = cameraPath[Math.min(section, totalSections)]
          const next = cameraPath[Math.min(section + 1, totalSections)]

          // Update active annotation
          const activeAnnot = annotations.find(
            (ann) => scrollPercent >= ann.scrollRange.start && scrollPercent <= ann.scrollRange.end,
          )
          setActiveAnnotation(activeAnnot?.id || null)

          rotationStarted = scrollPercent > 0.92

          camera.position.x = smoothLerp(current.pos.x, next.pos.x, progress)
          camera.position.y = smoothLerp(current.pos.y, next.pos.y, progress)
          camera.position.z = smoothLerp(current.pos.z, next.pos.z, progress)

          const lookAt = new THREE.Vector3(
            smoothLerp(current.look.x, next.look.x, progress),
            smoothLerp(current.look.y, next.look.y, progress),
            smoothLerp(current.look.z, next.look.z, progress),
          )
          camera.lookAt(lookAt)

          camera.fov = smoothLerp(current.fov, next.fov, progress)
          camera.updateProjectionMatrix()

          // Enhanced title animation with reappearance at the end
          if (titleMesh && subtitleMesh) {
            let titleOpacity: number
            let titleScale: number

            if (scrollPercent <= 0.7) {
              // Normal fade out during first part
              titleOpacity = Math.max(0, 1 - scrollPercent * 1.5)
              titleScale = 1 + scrollPercent * 0.8

              // Original positions during fade out
              titleMesh.position.set(0, 1 + scrollPercent * 3, -12)
              subtitleMesh.position.set(0, -1 + scrollPercent * 2, -12)

              // Keep text facing camera during fade out
              titleMesh.rotation.set(0, 0, 0)
              subtitleMesh.rotation.set(0, 0, 0)
            } else {
              // Reappear at the end, bigger and more prominent
              const endProgress = (scrollPercent - 0.7) / 0.3 // 0.7 to 1.0 mapped to 0 to 1
              titleOpacity = Math.min(1, endProgress * 2) // Fade in faster
              titleScale = 1.8 + endProgress * 0.5 // Start bigger

              // Position above the armor when it reappears - FIXED POSITIONING
              titleMesh.position.set(0, 4, -1) // Above armor, slightly behind camera
              subtitleMesh.position.set(0, 2.5, -1) // Above armor, below title, slightly behind camera

              // Make text always face the camera (billboard effect)
              titleMesh.lookAt(camera.position)
              subtitleMesh.lookAt(camera.position)

              // Add subtle floating animation
              const time = Date.now() * 0.001
              titleMesh.position.y = 4 + Math.sin(time * 0.5) * 0.2
              subtitleMesh.position.y = 2.5 + Math.sin(time * 0.7) * 0.15
            }

            // Apply effects to both title and subtitle
            titleMesh.material.opacity = titleOpacity
            titleMesh.scale.setScalar(titleScale)

            const subtitleOpacity = scrollPercent <= 0.7 ? titleOpacity * 0.8 : titleOpacity * 0.9
            subtitleMesh.material.opacity = subtitleOpacity
            subtitleMesh.scale.setScalar(titleScale * 0.8)
          }

          // Animate background elements
          backgroundElements.forEach((element, index) => {
            if (element.userData.rotationSpeed) {
              element.rotation.y += element.userData.rotationSpeed
            }

            // Fade grid based on scroll
            if (element.material && element.material.opacity !== undefined) {
              element.material.opacity = 0.1 * (1 - scrollPercent * 0.5)
            }
          })

          // Animate particles
          particles.forEach((particle, index) => {
            const time = Date.now() * 0.001
            particle.userData.phase += 0.02

            // Floating motion
            particle.position.y = particle.userData.originalPosition.y + Math.sin(particle.userData.phase) * 2
            particle.position.x = particle.userData.originalPosition.x + Math.cos(particle.userData.phase * 0.7) * 1

            // Color cycling
            particle.material.color.setHSL((time * 0.1 + index * 0.1) % 1, 0.8, 0.5 + Math.sin(time * 2 + index) * 0.2)

            // Opacity based on scroll
            particle.material.opacity = 0.7 * (1 - scrollPercent * 0.3)

            // Swirl around disappearing text
            if (scrollProgress > 0.1) {
              const angle = time + index * 0.5
              const radius = 8 + scrollPercent * 10
              particle.position.x = Math.cos(angle) * radius
              particle.position.z = -15 + Math.sin(angle * 2) * 5
            }
          })
        }

        const handleScroll = () => {
          targetScrollY = window.scrollY
        }

        const animate = () => {
          requestAnimationFrame(animate)

          currentScrollY += (targetScrollY - currentScrollY) * 0.1

          const scrollHeight = document.body.scrollHeight - window.innerHeight
          const scrollPercent = scrollHeight > 0 ? currentScrollY / scrollHeight : 0

          updateCamera(scrollPercent)

          if (mixer) mixer.update(0.02)

          if (rotationStarted && armorModel) {
            armorModel.rotation.y += 0.005
          }

          renderer.render(scene, camera)
        }

        const resize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        window.addEventListener("resize", resize)

        animate()

        return () => {
          window.removeEventListener("scroll", handleScroll)
          window.removeEventListener("resize", resize)
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement)
          }
          renderer.dispose()
          // Clean up the injected styles
          document.head.removeChild(style)
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
      }
    }

    initThreeJS()
  }, [])

  const getAnnotationOpacity = (annotation: AnnotationPoint) => {
    const { start, end } = annotation.scrollRange
    if (scrollProgress < start || scrollProgress > end) return 0

    const progress = (scrollProgress - start) / (end - start)
    if (progress <= 0.1) return (progress / 0.1) * 0.8
    if (progress >= 0.9) return ((1 - progress) / 0.1) * 0.8
    if (progress >= 0.3 && progress <= 0.7) return 1
    return 0.8
  }

  const getAnnotationScale = (annotation: AnnotationPoint) => {
    const opacity = getAnnotationOpacity(annotation)
    return 0.8 + opacity * 0.2
  }

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Fixed black background to prevent white showing */}
      <div className="fixed inset-0 bg-black z-0" />

      {/* 3D Canvas */}
      <div ref={containerRef} className="fixed inset-0 z-10" />

      {/* Annotations */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {annotations.map((annotation) => {
          const opacity = getAnnotationOpacity(annotation)
          const scale = getAnnotationScale(annotation)
          const isActive = activeAnnotation === annotation.id

          return (
            <div key={annotation.id}>
              {/* Annotation Point */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                style={{
                  left: annotation.position.x,
                  top: annotation.position.y,
                  opacity,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
              >
                <div
                  className={`w-4 h-4 bg-${annotation.color}-400 rounded-full shadow-lg animate-pulse`}
                  style={{
                    boxShadow: `0 0 20px rgba(${
                      annotation.color === "cyan"
                        ? "34, 211, 238"
                        : annotation.color === "blue"
                          ? "96, 165, 250"
                          : annotation.color === "green"
                            ? "74, 222, 128"
                            : annotation.color === "yellow"
                              ? "250, 204, 21"
                              : annotation.color === "purple"
                                ? "167, 139, 250"
                                : "248, 113, 113"
                    }, 0.5)`,
                  }}
                />
              </div>

              {/* Connection Line */}
              <svg className="absolute inset-0 w-full h-full">
                <line
                  x1={annotation.position.x}
                  y1={annotation.position.y}
                  x2={
                    annotation.id === "head"
                      ? "50%"
                      : annotation.id === "shoulder"
                        ? "35%"
                        : annotation.id === "chest"
                          ? "50%"
                          : annotation.id === "core"
                            ? "50%"
                            : annotation.id === "lower"
                              ? "45%"
                              : "50%"
                  }
                  y2={
                    annotation.id === "head"
                      ? "35%"
                      : annotation.id === "shoulder"
                        ? "45%"
                        : annotation.id === "chest"
                          ? "55%"
                          : annotation.id === "core"
                            ? "65%"
                            : annotation.id === "lower"
                              ? "80%"
                              : "90%"
                  }
                  stroke={`url(#${annotation.gradientId})`}
                  strokeWidth="2"
                  className="drop-shadow-lg transition-opacity duration-500"
                  style={{ opacity }}
                />
              </svg>

              {/* Annotation Text */}
              {isActive && opacity > 0.8 && (
                <div
                  className="absolute transform pointer-events-auto"
                  style={{
                    left:
                      annotation.id === "shoulder"
                        ? "10%"
                        : annotation.id === "chest"
                          ? "15%"
                          : annotation.id === "lower"
                            ? "10%"
                            : "75%",
                    top:
                      annotation.id === "head"
                        ? "20%"
                        : annotation.id === "shoulder"
                          ? "30%"
                          : annotation.id === "chest"
                            ? "40%"
                            : annotation.id === "core"
                              ? "50%"
                              : annotation.id === "lower"
                                ? "65%"
                                : "80%",
                    transform:
                      annotation.id === "shoulder" || annotation.id === "chest" || annotation.id === "lower"
                        ? "translateX(0)"
                        : "translateX(-100%)",
                  }}
                >
                  <div className="bg-black/90 backdrop-blur-md border border-white/30 rounded-lg p-4 max-w-xs animate-in slide-in-from-bottom-4 duration-700">
                    <h3 className={`text-lg font-bold text-${annotation.color}-300 mb-2`}>{annotation.title}</h3>
                    <p className="text-sm text-gray-200">{annotation.description}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* SVG Gradients */}
        <svg className="absolute inset-0 w-0 h-0">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="1" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 min-w-[3rem]">{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Scroll trigger areas */}
      <div className="relative z-20 pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-screen" />
        ))}
      </div>
    </div>
  )
}
