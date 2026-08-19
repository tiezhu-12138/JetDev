<script setup>
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

const galleryRef = ref(null)
const canvasHostRef = ref(null)
const fallbackRef = ref(null)
const sectionRef = ref(null)
const enhancementState = ref('checking')
const activeIndex = ref(0)
const galleryInstanceId = useId()
const instructionsId = `${galleryInstanceId}-instructions`
const statusId = `${galleryInstanceId}-status`

let galleryApp = null
let motionPreference = null
let startupObserver = null

const vertexShader = `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uSpeed;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequencyX;
  uniform float uWaveFrequencyY;
  uniform float uWaveVelocityScale;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 transformedPosition = position;
    float activity = min(abs(uSpeed) * uWaveVelocityScale, 1.0);
    float wave = sin(position.x * uWaveFrequencyX) + cos(position.y * uWaveFrequencyY);
    transformedPosition.z = wave * uWaveAmplitude * activity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uAlphaCutoff;
  varying vec2 vUv;

  void main() {
    vec4 colour = texture2D(tMap, vUv);

    if (colour.a < uAlphaCutoff) {
      discard;
    }

    gl_FragColor = colour;
  }
`

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

function tokenNumber(styles, name) {
  const value = Number.parseFloat(styles.getPropertyValue(name))

  if (!Number.isFinite(value)) {
    throw new Error(`Missing numeric gallery token: ${name}`)
  }

  return value
}

function tokenDuration(styles, name) {
  const rawValue = styles.getPropertyValue(name).trim()
  const value = Number.parseFloat(rawValue)

  if (!Number.isFinite(value)) {
    throw new Error(`Missing duration gallery token: ${name}`)
  }

  return rawValue.endsWith('ms') ? value : value * 1000
}

function readGalleryConfig(element) {
  const styles = window.getComputedStyle(element)

  return {
    alphaCutoff: tokenNumber(styles, '--opacity-gallery-alpha-cutoff'),
    autoplayFrameCap: tokenDuration(
      styles,
      '--motion-duration-gallery-autoplay-frame-cap',
    ),
    autoplayItemDuration: tokenDuration(
      styles,
      '--motion-duration-gallery-autoplay-item',
    ),
    autoplayResumeDelay: tokenDuration(
      styles,
      '--motion-duration-gallery-autoplay-resume-delay',
    ),
    bend: tokenNumber(styles, '--gallery-bend-depth'),
    cameraDepth: tokenNumber(styles, '--gallery-camera-depth'),
    cameraFov: tokenNumber(styles, '--gallery-camera-fov'),
    dragRatio: tokenNumber(styles, '--gallery-drag-ratio'),
    gapPixels: tokenNumber(styles, '--gallery-gap-pixels'),
    itemHeightFactor: tokenNumber(styles, '--gallery-item-height-factor'),
    itemWidthFactor: tokenNumber(styles, '--gallery-item-width-factor'),
    renderDprMax: tokenNumber(styles, '--gallery-render-dpr-max'),
    scrollEase: tokenNumber(styles, '--gallery-scroll-ease'),
    segmentCountBlock: tokenNumber(styles, '--gallery-segment-count-block'),
    segmentCountInline: tokenNumber(styles, '--gallery-segment-count-inline'),
    settleThreshold: tokenNumber(styles, '--gallery-settle-threshold'),
    snapDelay: tokenDuration(styles, '--motion-duration-gallery-snap-delay'),
    velocityLimit: tokenNumber(styles, '--gallery-velocity-limit'),
    waveAmplitude: tokenNumber(styles, '--gallery-wave-amplitude'),
    waveFrequencyX: tokenNumber(styles, '--gallery-wave-frequency-x'),
    waveFrequencyY: tokenNumber(styles, '--gallery-wave-frequency-y'),
    waveVelocityScale: tokenNumber(styles, '--gallery-wave-velocity-scale'),
    wheelLinePixels: tokenNumber(styles, '--gallery-wheel-line-pixels'),
    wheelRatio: tokenNumber(styles, '--gallery-wheel-ratio'),
  }
}

class GalleryMedia {
  constructor({
    gl,
    geometry,
    item,
    scene,
    config,
    onTextureError,
    onTextureLoad,
  }) {
    this.gl = gl
    this.item = item
    this.baseCentre = 0
    this.width = 0
    this.span = 0

    this.texture = new Texture(gl, {
      generateMipmaps: false,
    })

    this.program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      uniforms: {
        tMap: { value: this.texture },
        uAlphaCutoff: { value: config.alphaCutoff },
        uSpeed: { value: 0 },
        uWaveAmplitude: { value: config.waveAmplitude },
        uWaveFrequencyX: { value: config.waveFrequencyX },
        uWaveFrequencyY: { value: config.waveFrequencyY },
        uWaveVelocityScale: { value: config.waveVelocityScale },
      },
    })

    this.plane = new Mesh(gl, { geometry, program: this.program })
    this.plane.setParent(scene)

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      this.texture.image = image
      onTextureLoad()
    }
    image.onerror = onTextureError
    image.src = item.image
    this.image = image
  }

  layout({ height, gap, cursor }) {
    const aspectRatio = this.item.width / this.item.height
    this.width = height * aspectRatio
    this.span = this.width + gap
    this.baseCentre = cursor + this.width / 2
    this.plane.scale.set(this.width, height, 1)

    return cursor + this.span
  }

  update({ scroll, totalWidth, viewportWidth, bend, velocity }) {
    const wrappedPosition = modulo(
      this.baseCentre - scroll + totalWidth / 2,
      totalWidth,
    ) - totalWidth / 2

    this.plane.position.x = wrappedPosition

    if (bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const halfViewport = viewportWidth / 2
      const bendMagnitude = Math.abs(bend)
      const radius =
        (halfViewport * halfViewport + bendMagnitude * bendMagnitude) / (2 * bendMagnitude)
      const effectivePosition = Math.min(Math.abs(wrappedPosition), halfViewport)
      const arc = radius - Math.sqrt(radius * radius - effectivePosition * effectivePosition)
      const direction = Math.sign(wrappedPosition)

      this.plane.position.y = bend > 0 ? -arc : arc
      this.plane.rotation.z =
        bend > 0
          ? -direction * Math.asin(effectivePosition / radius)
          : direction * Math.asin(effectivePosition / radius)
    }

    this.program.uniforms.uSpeed.value = velocity
  }

  destroy() {
    this.program.remove()
    this.gl.deleteTexture(this.texture.texture)
    this.image.onload = null
    this.image.onerror = null
  }
}

class GalleryApp {
  constructor({
    canvas,
    context,
    container,
    interactionElement,
    items,
    onActiveItemChange,
    onFailure,
  }) {
    this.canvas = canvas
    this.preflightContext = context
    this.container = container
    this.interactionElement = interactionElement
    this.items = items
    this.onActiveItemChange = onActiveItemChange
    this.onFailure = onFailure
    this.config = readGalleryConfig(interactionElement)
    this.scroll = { current: 0, target: 0, last: 0 }
    this.pointer = { active: false, startX: 0, startTarget: 0, id: null }
    this.totalWidth = 0
    this.viewport = { width: 0, height: 0 }
    this.screen = { width: 0, height: 0 }
    this.animationFrame = 0
    this.snapTimer = 0
    this.isVisible = false
    this.hasInitialLayout = false
    this.activeIndex = -1
    this.autoplay = {
      focused: false,
      hovered: false,
      loadedCount: 0,
      mediaReady: false,
      previousFrameTime: null,
      resumeAt: 0,
      resumeTimer: 0,
      standardWidth: 0,
    }

    try {
      this.createScene()
      this.createMedia()
      this.addEventListeners()
      this.observeSize()
      this.observeVisibility()
      this.resize()
      this.start()
    } catch (error) {
      this.destroy()
      throw error
    }
  }

  createScene() {
    this.renderer = new Renderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      depth: false,
      dpr: Math.min(window.devicePixelRatio, this.config.renderDprMax),
      powerPreference: 'high-performance',
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.renderer.gl.canvas.className = 'project-gallery__canvas'
    this.renderer.gl.canvas.setAttribute('aria-hidden', 'true')
    this.container.appendChild(this.renderer.gl.canvas)

    this.camera = new Camera(this.gl)
    this.camera.fov = this.config.cameraFov
    this.camera.position.z = this.config.cameraDepth
    this.scene = new Transform()
    this.geometry = new Plane(this.gl, {
      heightSegments: this.config.segmentCountBlock,
      widthSegments: this.config.segmentCountInline,
    })

    this.handleContextLoss = (event) => {
      event.preventDefault()
      this.onFailure()
    }
    this.renderer.gl.canvas.addEventListener('webglcontextlost', this.handleContextLoss)
  }

  createMedia() {
    this.medias = this.items.map(
      (item) =>
        new GalleryMedia({
          gl: this.gl,
          geometry: this.geometry,
          item,
          scene: this.scene,
          config: this.config,
          onTextureError: this.onFailure,
          onTextureLoad: () => this.onTextureLoad(),
        }),
    )
  }

  addEventListeners() {
    this.handlePointerDown = this.onPointerDown.bind(this)
    this.handlePointerMove = this.onPointerMove.bind(this)
    this.handlePointerUp = this.onPointerUp.bind(this)
    this.handlePointerEnter = this.onPointerEnter.bind(this)
    this.handlePointerLeave = this.onPointerLeave.bind(this)
    this.handleLostPointerCapture = this.onLostPointerCapture.bind(this)
    this.handleWheel = this.onWheel.bind(this)
    this.handleKeyDown = this.onKeyDown.bind(this)
    this.handleFocusIn = this.onFocusIn.bind(this)
    this.handleFocusOut = this.onFocusOut.bind(this)
    this.handleVisibilityChange = this.onVisibilityChange.bind(this)

    this.interactionElement.addEventListener('pointerdown', this.handlePointerDown)
    this.interactionElement.addEventListener('pointermove', this.handlePointerMove)
    this.interactionElement.addEventListener('pointerup', this.handlePointerUp)
    this.interactionElement.addEventListener('pointercancel', this.handlePointerUp)
    this.interactionElement.addEventListener('pointerenter', this.handlePointerEnter)
    this.interactionElement.addEventListener('pointerleave', this.handlePointerLeave)
    this.interactionElement.addEventListener(
      'lostpointercapture',
      this.handleLostPointerCapture,
    )
    this.interactionElement.addEventListener('wheel', this.handleWheel, { passive: false })
    this.interactionElement.addEventListener('keydown', this.handleKeyDown)
    this.interactionElement.addEventListener('focusin', this.handleFocusIn)
    this.interactionElement.addEventListener('focusout', this.handleFocusOut)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    this.autoplay.hovered = this.interactionElement.matches(':hover')
    this.autoplay.focused = this.interactionElement.contains(document.activeElement)

    if (this.autoplay.hovered || this.autoplay.focused) {
      this.pauseAutoplay()
    }
  }

  onTextureLoad() {
    this.autoplay.loadedCount += 1
    this.autoplay.mediaReady = this.autoplay.loadedCount >= this.items.length
    this.syncAutoplayTimer()
    this.start()
  }

  clearAutoplayResumeTimer() {
    window.clearTimeout(this.autoplay.resumeTimer)
    this.autoplay.resumeTimer = 0
  }

  setAutoplayState(isRunning) {
    const state = isRunning ? 'running' : 'paused'

    if (this.interactionElement.dataset.autoplay !== state) {
      this.interactionElement.dataset.autoplay = state
    }
  }

  shouldAutoplay(timestamp = window.performance.now()) {
    return (
      this.autoplay.mediaReady &&
      this.isVisible &&
      !document.hidden &&
      !this.autoplay.hovered &&
      !this.autoplay.focused &&
      !this.pointer.active &&
      this.autoplay.standardWidth > 0 &&
      timestamp >= this.autoplay.resumeAt
    )
  }

  pauseAutoplay() {
    this.clearAutoplayResumeTimer()
    this.autoplay.previousFrameTime = null
    this.autoplay.resumeAt = Number.POSITIVE_INFINITY
    this.setAutoplayState(false)
  }

  deferAutoplay() {
    this.clearAutoplayResumeTimer()
    this.autoplay.previousFrameTime = null
    this.autoplay.resumeAt =
      window.performance.now() + this.config.autoplayResumeDelay
    this.setAutoplayState(false)
    this.syncAutoplayTimer()
  }

  syncAutoplayTimer() {
    this.clearAutoplayResumeTimer()

    if (
      !this.autoplay.mediaReady ||
      !this.isVisible ||
      document.hidden ||
      this.autoplay.hovered ||
      this.autoplay.focused ||
      this.pointer.active ||
      !Number.isFinite(this.autoplay.resumeAt)
    ) {
      return
    }

    const remaining = this.autoplay.resumeAt - window.performance.now()

    if (remaining <= 0) {
      this.start()
      return
    }

    this.autoplay.resumeTimer = window.setTimeout(() => {
      this.autoplay.resumeTimer = 0
      this.autoplay.previousFrameTime = null
      this.syncAutoplayTimer()
    }, remaining)
  }

  syncActiveItem() {
    this.setActiveItem(this.nearestSnap(this.scroll.current).index)
  }

  observeSize() {
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.container)
  }

  observeVisibility() {
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting

      if (this.isVisible) {
        this.syncAutoplayTimer()
        this.start()
      } else {
        this.clearAutoplayResumeTimer()
        this.setAutoplayState(false)
        this.stop()
      }
    })
    this.intersectionObserver.observe(this.interactionElement)
  }

  resize() {
    this.config = readGalleryConfig(this.interactionElement)
    const isInitialLayout = !this.hasInitialLayout
    const currentItem = this.hasInitialLayout ? this.nearestSnap(this.scroll.target) : null

    this.screen.width = this.container.clientWidth
    this.screen.height = this.container.clientHeight

    if (this.screen.width === 0 || this.screen.height === 0) {
      return
    }

    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })

    const fieldOfView = (this.camera.fov * Math.PI) / 180
    this.viewport.height = 2 * Math.tan(fieldOfView / 2) * this.camera.position.z
    this.viewport.width = this.viewport.height * this.camera.aspect

    const largestAspectRatio = Math.max(
      ...this.items.map((item) => item.width / item.height),
    )
    const mediaHeight = Math.min(
      this.viewport.height * this.config.itemHeightFactor,
      (this.viewport.width * this.config.itemWidthFactor) / largestAspectRatio,
    )
    const mediaGap = (this.config.gapPixels / this.screen.width) * this.viewport.width
    let cursor = 0

    this.medias.forEach((media) => {
      cursor = media.layout({ height: mediaHeight, gap: mediaGap, cursor })
    })
    this.totalWidth = cursor
    const orderedWidths = this.medias
      .map((media) => media.width)
      .sort((first, second) => first - second)
    const middleIndex = Math.floor(orderedWidths.length / 2)
    this.autoplay.standardWidth = orderedWidths[middleIndex] ?? 0

    const targetIndex = currentItem?.index ?? 0
    const target = this.medias[targetIndex]?.baseCentre ?? 0
    this.scroll.current = target
    this.scroll.target = target
    this.scroll.last = target
    this.hasInitialLayout = true

    if (isInitialLayout) {
      this.setActiveItem(targetIndex)
    }

    this.render()
  }

  normaliseWheelDelta(event, delta) {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return delta * this.config.wheelLinePixels
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return delta * this.screen.width
    }

    return delta
  }

  onPointerEnter(event) {
    if (event.pointerType === 'touch') {
      return
    }

    this.autoplay.hovered = true
    this.pauseAutoplay()
  }

  onPointerLeave(event) {
    if (event.pointerType === 'touch') {
      return
    }

    this.autoplay.hovered = false
    this.deferAutoplay()
  }

  onFocusIn() {
    this.autoplay.focused = true
    this.syncActiveItem()
    this.pauseAutoplay()
  }

  onFocusOut(event) {
    this.autoplay.focused = this.interactionElement.contains(event.relatedTarget)

    if (!this.autoplay.focused) {
      this.deferAutoplay()
    }
  }

  onWheel(event) {
    this.deferAutoplay()
    const hasHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    const rawDelta = hasHorizontalIntent ? event.deltaX : event.shiftKey ? event.deltaY : 0

    if (rawDelta === 0) {
      return
    }

    event.preventDefault()
    const delta = this.normaliseWheelDelta(event, rawDelta)
    this.scroll.target += delta * this.config.wheelRatio
    this.scheduleSnap()
    this.start()
  }

  onPointerDown(event) {
    if (event.button !== 0) {
      return
    }

    this.pauseAutoplay()
    this.syncActiveItem()
    this.pointer.active = true
    this.pointer.id = event.pointerId
    this.pointer.startX = event.clientX
    this.pointer.startTarget = this.scroll.target
    this.interactionElement.setPointerCapture(event.pointerId)
    this.interactionElement.dataset.dragging = 'true'
    window.clearTimeout(this.snapTimer)
    this.start()
  }

  onPointerMove(event) {
    if (!this.pointer.active || event.pointerId !== this.pointer.id) {
      return
    }

    const screenDelta = this.pointer.startX - event.clientX
    const worldDelta = (screenDelta / this.screen.width) * this.viewport.width
    this.scroll.target = this.pointer.startTarget + worldDelta * this.config.dragRatio
  }

  onPointerUp(event) {
    if (!this.pointer.active || event.pointerId !== this.pointer.id) {
      return
    }

    this.pointer.active = false
    this.pointer.id = null
    this.interactionElement.dataset.dragging = 'false'

    if (this.interactionElement.hasPointerCapture(event.pointerId)) {
      this.interactionElement.releasePointerCapture(event.pointerId)
    }

    this.snapToNearest()
    this.deferAutoplay()
  }

  onLostPointerCapture(event) {
    if (!this.pointer.active || event.pointerId !== this.pointer.id) {
      return
    }

    this.pointer.active = false
    this.pointer.id = null
    this.interactionElement.dataset.dragging = 'false'
    this.snapToNearest()
    this.deferAutoplay()
  }

  onKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return
    }

    event.preventDefault()
    this.deferAutoplay()
    this.step(event.key === 'ArrowRight' ? 1 : -1)
    this.start()
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.clearAutoplayResumeTimer()
      this.setAutoplayState(false)
      this.stop()
    } else if (this.isVisible) {
      this.syncAutoplayTimer()
      this.start()
    }
  }

  nearestSnap(target) {
    if (!this.medias.length || this.totalWidth === 0) {
      return { index: 0, candidate: 0, cycle: 0 }
    }

    return this.medias.reduce((nearest, media, index) => {
      const cycle = Math.round((target - media.baseCentre) / this.totalWidth)
      const candidate = media.baseCentre + cycle * this.totalWidth
      const distance = Math.abs(target - candidate)

      if (!nearest || distance < nearest.distance) {
        return { index, candidate, cycle, distance }
      }

      return nearest
    }, null)
  }

  step(direction) {
    const nearest = this.nearestSnap(this.scroll.target)
    let nextIndex = nearest.index + direction
    let nextCycle = nearest.cycle

    if (nextIndex >= this.medias.length) {
      nextIndex = 0
      nextCycle += 1
    } else if (nextIndex < 0) {
      nextIndex = this.medias.length - 1
      nextCycle -= 1
    }

    this.scroll.target = this.medias[nextIndex].baseCentre + nextCycle * this.totalWidth
    this.setActiveItem(nextIndex)
  }

  scheduleSnap() {
    window.clearTimeout(this.snapTimer)
    this.snapTimer = window.setTimeout(() => this.snapToNearest(), this.config.snapDelay)
  }

  snapToNearest() {
    const nearest = this.nearestSnap(this.scroll.target)
    this.scroll.target = nearest.candidate
    this.setActiveItem(nearest.index)
    this.start()
  }

  setActiveItem(index) {
    if (index === this.activeIndex) {
      return
    }

    this.activeIndex = index
    this.onActiveItemChange(index)
  }

  normaliseScroll() {
    if (this.totalWidth === 0) {
      return
    }

    const completedCycles = Math.trunc(this.scroll.current / this.totalWidth)

    if (completedCycles === 0) {
      return
    }

    const offset = completedCycles * this.totalWidth
    this.scroll.current -= offset
    this.scroll.target -= offset
    this.scroll.last -= offset
  }

  update(timestamp) {
    this.animationFrame = 0

    if (!this.isVisible || document.hidden) {
      this.autoplay.previousFrameTime = null
      this.setAutoplayState(false)
      return
    }

    const isAutoplaying = this.shouldAutoplay(timestamp)
    this.setAutoplayState(isAutoplaying)

    if (isAutoplaying) {
      const previousFrameTime = this.autoplay.previousFrameTime
      const elapsed =
        previousFrameTime === null
          ? 0
          : Math.min(timestamp - previousFrameTime, this.config.autoplayFrameCap)
      const autoplayDistance =
        (this.autoplay.standardWidth * elapsed) / this.config.autoplayItemDuration
      this.scroll.current += autoplayDistance
      this.scroll.target += autoplayDistance
      this.autoplay.previousFrameTime = timestamp
    } else {
      this.autoplay.previousFrameTime = null
    }

    this.scroll.current +=
      (this.scroll.target - this.scroll.current) * this.config.scrollEase
    this.normaliseScroll()
    const rawVelocity = this.scroll.current - this.scroll.last
    const velocity = Math.max(
      -this.config.velocityLimit,
      Math.min(rawVelocity, this.config.velocityLimit),
    )

    this.medias.forEach((media) => {
      media.update({
        scroll: this.scroll.current,
        totalWidth: this.totalWidth,
        viewportWidth: this.viewport.width,
        bend: this.config.bend,
        velocity,
      })
    })

    this.render()
    this.scroll.last = this.scroll.current

    const isSettled =
      Math.abs(this.scroll.target - this.scroll.current) < this.config.settleThreshold

    if (isSettled) {
      this.scroll.current = this.scroll.target
      this.scroll.last = this.scroll.target
    }

    if (isAutoplaying || !isSettled || this.pointer.active) {
      this.start()
    }
  }

  render() {
    if (this.totalWidth === 0) {
      return
    }

    this.renderer.render({ scene: this.scene, camera: this.camera })
  }

  start() {
    if (this.animationFrame || !this.isVisible || document.hidden) {
      return
    }

    this.animationFrame = window.requestAnimationFrame((timestamp) =>
      this.update(timestamp),
    )
  }

  stop() {
    this.autoplay.previousFrameTime = null

    if (!this.animationFrame) {
      return
    }

    window.cancelAnimationFrame(this.animationFrame)
    this.animationFrame = 0
  }

  destroy() {
    this.stop()
    window.clearTimeout(this.snapTimer)
    this.clearAutoplayResumeTimer()
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()

    if (this.handlePointerDown) {
      this.interactionElement.removeEventListener('pointerdown', this.handlePointerDown)
      this.interactionElement.removeEventListener('pointermove', this.handlePointerMove)
      this.interactionElement.removeEventListener('pointerup', this.handlePointerUp)
      this.interactionElement.removeEventListener('pointercancel', this.handlePointerUp)
      this.interactionElement.removeEventListener('pointerenter', this.handlePointerEnter)
      this.interactionElement.removeEventListener('pointerleave', this.handlePointerLeave)
      this.interactionElement.removeEventListener(
        'lostpointercapture',
        this.handleLostPointerCapture,
      )
      this.interactionElement.removeEventListener('wheel', this.handleWheel)
      this.interactionElement.removeEventListener('keydown', this.handleKeyDown)
      this.interactionElement.removeEventListener('focusin', this.handleFocusIn)
      this.interactionElement.removeEventListener('focusout', this.handleFocusOut)
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }

    this.renderer?.gl?.canvas.removeEventListener('webglcontextlost', this.handleContextLoss)
    this.medias?.forEach((media) => media.destroy())
    this.geometry?.remove()
    const gl = this.renderer?.gl ?? this.preflightContext
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    this.renderer?.gl?.canvas.remove()
  }
}

function createGalleryCanvas() {
  if (
    typeof ResizeObserver === 'undefined' ||
    typeof IntersectionObserver === 'undefined'
  ) {
    return null
  }

  const canvas = document.createElement('canvas')
  const attributes = {
    alpha: true,
    antialias: true,
    depth: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
    stencil: false,
  }

  try {
    const context =
      canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes)

    return context ? { canvas, context } : null
  } catch {
    return null
  }
}

function destroyGallery() {
  galleryApp?.destroy()
  galleryApp = null

  if (canvasHostRef.value) {
    canvasHostRef.value.replaceChildren()
  }
}

function cancelPendingInitialisation() {
  startupObserver?.disconnect()
  startupObserver = null
}

function showFallback() {
  cancelPendingInitialisation()
  destroyGallery()
  enhancementState.value = 'fallback'
}

function initialiseGallery() {
  cancelPendingInitialisation()
  destroyGallery()

  if (
    motionPreference?.matches ||
    !galleryRef.value ||
    !canvasHostRef.value ||
    props.items.length === 0
  ) {
    enhancementState.value = 'fallback'
    return
  }

  const webGlSurface = createGalleryCanvas()

  if (!webGlSurface) {
    enhancementState.value = 'fallback'
    return
  }

  try {
    galleryApp = new GalleryApp({
      canvas: webGlSurface.canvas,
      context: webGlSurface.context,
      container: canvasHostRef.value,
      interactionElement: galleryRef.value,
      items: props.items,
      onActiveItemChange: (index) => {
        activeIndex.value = index
      },
      onFailure: showFallback,
    })
    enhancementState.value = 'enhanced'
  } catch {
    showFallback()
  }
}

function scheduleGalleryInitialisation() {
  cancelPendingInitialisation()
  destroyGallery()

  if (motionPreference?.matches || props.items.length === 0) {
    enhancementState.value = 'fallback'
    return
  }

  if (!sectionRef.value || typeof IntersectionObserver === 'undefined') {
    initialiseGallery()
    return
  }

  enhancementState.value = 'checking'
  const rootMargin = window
    .getComputedStyle(sectionRef.value)
    .getPropertyValue('--gallery-preload-root-margin')
    .trim()
  const options = rootMargin ? { rootMargin } : undefined

  startupObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      initialiseGallery()
    }
  }, options)
  startupObserver.observe(sectionRef.value)
}

function handleMotionPreferenceChange() {
  if (motionPreference.matches) {
    showFallback()
  } else {
    scheduleGalleryInitialisation()
  }
}

function handleFallbackKeyDown(event) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return
  }

  const scroller = fallbackRef.value
  const items = Array.from(scroller?.children ?? [])

  if (!scroller || items.length === 0) {
    return
  }

  event.preventDefault()
  const viewportCentre = scroller.scrollLeft + scroller.clientWidth / 2
  const nearestIndex = items.reduce(
    (nearest, item, index) => {
      const itemCentre = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(viewportCentre - itemCentre)

      return distance < nearest.distance ? { distance, index } : nearest
    },
    { distance: Number.POSITIVE_INFINITY, index: 0 },
  ).index
  const direction = event.key === 'ArrowRight' ? 1 : -1
  const targetIndex = Math.max(0, Math.min(nearestIndex + direction, items.length - 1))
  const target = items[targetIndex]

  scroller.scrollTo({
    left: target.offsetLeft + target.offsetWidth / 2 - scroller.clientWidth / 2,
    behavior: 'auto',
  })
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', handleMotionPreferenceChange)
  scheduleGalleryInitialisation()
})

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
  cancelPendingInitialisation()
  destroyGallery()
})
</script>

<template>
  <section
    ref="sectionRef"
    class="project-gallery"
    :aria-label="label"
    aria-roledescription="carousel"
  >
    <div
      ref="galleryRef"
      class="project-gallery__enhancement"
      :data-state="enhancementState"
      data-autoplay="paused"
      data-dragging="false"
      role="group"
      aria-label="Screenshot viewer"
      :tabindex="enhancementState === 'enhanced' ? 0 : -1"
      :aria-describedby="
        enhancementState === 'enhanced' ? `${instructionsId} ${statusId}` : undefined
      "
      :aria-hidden="enhancementState === 'enhanced' ? undefined : 'true'"
    >
      <div ref="canvasHostRef" class="project-gallery__canvas-host"></div>
    </div>

    <p
      v-if="enhancementState !== 'checking'"
      :id="instructionsId"
      class="visually-hidden"
    >
      Use the left and right arrow keys or horizontal gestures to browse the screenshots.
    </p>

    <p
      v-if="enhancementState === 'enhanced'"
      :id="statusId"
      class="visually-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      Screenshot {{ activeIndex + 1 }} of {{ items.length }}. {{ items[activeIndex]?.alt }}
    </p>

    <template v-if="enhancementState !== 'fallback'">
      <ol class="visually-hidden">
        <li v-for="item in items" :key="item.image">{{ item.alt }}</li>
      </ol>
    </template>

    <ul
      v-else-if="enhancementState === 'fallback'"
      ref="fallbackRef"
      class="project-gallery__fallback"
      tabindex="0"
      :aria-describedby="instructionsId"
      @keydown="handleFallbackKeyDown"
    >
      <li v-for="item in items" :key="item.image" class="project-gallery__fallback-item">
        <img
          :src="item.image"
          :width="item.width"
          :height="item.height"
          :alt="item.alt"
          loading="lazy"
          decoding="async"
        />
      </li>
    </ul>
  </section>
</template>
