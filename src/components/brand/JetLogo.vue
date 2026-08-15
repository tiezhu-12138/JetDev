<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

import {
  JET_LOGO_MARK_PATH,
  JET_LOGO_VIEWBOX_HEIGHT,
  JET_LOGO_VIEWBOX_WIDTH,
} from './jetLogoGeometry.js'
import {
  jetLogoFragmentShaderSource,
  jetLogoVertexShaderSource,
} from './jetLogoLiquidShader.js'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const TOKEN_NAMES = Object.freeze({
  primary: '--colour-logo-liquid-primary',
  secondary: '--colour-logo-liquid-secondary',
  tertiary: '--colour-logo-liquid-tertiary',
  highlight: '--colour-logo-liquid-highlight',
  shadow: '--colour-logo-liquid-shadow',
  dprMax: '--logo-liquid-dpr-max',
  speed: '--logo-liquid-speed',
  patternScale: '--logo-liquid-pattern-scale',
  distortion: '--logo-liquid-distortion',
  highlightWidth: '--logo-liquid-highlight-width',
  highlightStrength: '--logo-liquid-highlight-strength',
  shadowStrength: '--logo-liquid-shadow-strength',
  readyOpacity: '--opacity-logo-liquid-ready',
})

const logoRoot = ref(null)
const liquidCanvas = ref(null)
const isCanvasReady = ref(false)

const instanceId = useId().replaceAll(':', '')
const gradientId = `jet-logo-gradient-${instanceId}`
const viewBox = `0 0 ${JET_LOGO_VIEWBOX_WIDTH} ${JET_LOGO_VIEWBOX_HEIGHT}`

let animationFrameId = null
let contextIsLost = false
let destroyed = false
let elapsedSeconds = 0
let fragmentShader = null
let gl = null
let initialising = false
let lastFrameTimestamp = null
let maskHeight = 0
let maskTexture = null
let maskWidth = 0
let motionPreference = null
let program = null
let rendererConfiguration = null
let resizeObserver = null
let uniforms = null
let vertexBuffer = null
let vertexShader = null

function readCustomProperty(styles, name) {
  const value = styles.getPropertyValue(name).trim()
  return value || null
}

function readFiniteNumber(styles, name) {
  const rawValue = readCustomProperty(styles, name)
  if (rawValue === null) return null

  const value = Number(rawValue)
  return Number.isFinite(value) ? value : null
}

function readCssColour(styles, name) {
  const rawValue = readCustomProperty(styles, name)
  if (
    rawValue === null ||
    typeof CSS === 'undefined' ||
    typeof CSS.supports !== 'function' ||
    !CSS.supports('color', rawValue)
  ) {
    return null
  }

  try {
    const colourCanvas = document.createElement('canvas')
    colourCanvas.width = 1
    colourCanvas.height = 1

    const colourContext = colourCanvas.getContext('2d', { willReadFrequently: true })
    if (!colourContext) return null

    colourContext.fillStyle = rawValue
    colourContext.fillRect(0, 0, 1, 1)

    const colour = colourContext.getImageData(0, 0, 1, 1).data
    if (colour[3] !== 255) return null

    return [colour[0] / 255, colour[1] / 255, colour[2] / 255]
  } catch {
    return null
  }
}

function readRendererConfiguration() {
  const canvas = liquidCanvas.value
  if (!canvas) return null

  const styles = window.getComputedStyle(canvas)
  const primary = readCssColour(styles, TOKEN_NAMES.primary)
  const secondary = readCssColour(styles, TOKEN_NAMES.secondary)
  const tertiary = readCssColour(styles, TOKEN_NAMES.tertiary)
  const highlight = readCssColour(styles, TOKEN_NAMES.highlight)
  const shadow = readCssColour(styles, TOKEN_NAMES.shadow)
  const dprMax = readFiniteNumber(styles, TOKEN_NAMES.dprMax)
  const speed = readFiniteNumber(styles, TOKEN_NAMES.speed)
  const patternScale = readFiniteNumber(styles, TOKEN_NAMES.patternScale)
  const distortion = readFiniteNumber(styles, TOKEN_NAMES.distortion)
  const highlightWidth = readFiniteNumber(styles, TOKEN_NAMES.highlightWidth)
  const highlightStrength = readFiniteNumber(styles, TOKEN_NAMES.highlightStrength)
  const shadowStrength = readFiniteNumber(styles, TOKEN_NAMES.shadowStrength)
  const readyOpacity = readFiniteNumber(styles, TOKEN_NAMES.readyOpacity)

  if (
    !primary ||
    !secondary ||
    !tertiary ||
    !highlight ||
    !shadow ||
    dprMax === null ||
    dprMax <= 0 ||
    speed === null ||
    speed <= 0 ||
    patternScale === null ||
    patternScale <= 0 ||
    distortion === null ||
    distortion < 0 ||
    highlightWidth === null ||
    highlightWidth <= 0 ||
    highlightWidth > 1 ||
    highlightStrength === null ||
    highlightStrength < 0 ||
    highlightStrength > 1 ||
    shadowStrength === null ||
    shadowStrength < 0 ||
    shadowStrength > 1 ||
    readyOpacity === null ||
    readyOpacity <= 0 ||
    readyOpacity > 1
  ) {
    return null
  }

  return {
    primary,
    secondary,
    tertiary,
    highlight,
    shadow,
    dprMax,
    speed,
    patternScale,
    distortion,
    highlightWidth,
    highlightStrength,
    shadowStrength,
  }
}

function compileShader(context, type, source) {
  const shader = context.createShader(type)
  if (!shader) return null

  context.shaderSource(shader, source)
  context.compileShader(shader)

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    context.deleteShader(shader)
    return null
  }

  return shader
}

function collectUniforms(context, shaderProgram) {
  const names = [
    'u_mask',
    'u_time',
    'u_speed',
    'u_pattern_scale',
    'u_distortion',
    'u_highlight_width',
    'u_highlight_strength',
    'u_shadow_strength',
    'u_primary',
    'u_secondary',
    'u_tertiary',
    'u_highlight',
    'u_shadow',
  ]
  const locations = {}

  for (const name of names) {
    const location = context.getUniformLocation(shaderProgram, name)
    if (location === null) return null
    locations[name] = location
  }

  return locations
}

function applyRendererConfiguration() {
  if (!gl || !uniforms || !rendererConfiguration) return false

  gl.uniform1f(uniforms.u_speed, rendererConfiguration.speed)
  gl.uniform1f(uniforms.u_pattern_scale, rendererConfiguration.patternScale)
  gl.uniform1f(uniforms.u_distortion, rendererConfiguration.distortion)
  gl.uniform1f(uniforms.u_highlight_width, rendererConfiguration.highlightWidth)
  gl.uniform1f(uniforms.u_highlight_strength, rendererConfiguration.highlightStrength)
  gl.uniform1f(uniforms.u_shadow_strength, rendererConfiguration.shadowStrength)
  gl.uniform3fv(uniforms.u_primary, rendererConfiguration.primary)
  gl.uniform3fv(uniforms.u_secondary, rendererConfiguration.secondary)
  gl.uniform3fv(uniforms.u_tertiary, rendererConfiguration.tertiary)
  gl.uniform3fv(uniforms.u_highlight, rendererConfiguration.highlight)
  gl.uniform3fv(uniforms.u_shadow, rendererConfiguration.shadow)

  return true
}

function refreshRendererConfiguration() {
  const nextConfiguration = readRendererConfiguration()
  if (!nextConfiguration) return false

  rendererConfiguration = nextConfiguration
  return applyRendererConfiguration()
}

function createMaskCanvas(pixelWidth, pixelHeight) {
  if (typeof Path2D !== 'function') return null

  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = pixelWidth
  maskCanvas.height = pixelHeight

  const maskContext = maskCanvas.getContext('2d')
  if (!maskContext) return null

  try {
    const mark = new Path2D(JET_LOGO_MARK_PATH)
    const scale = Math.min(
      pixelWidth / JET_LOGO_VIEWBOX_WIDTH,
      pixelHeight / JET_LOGO_VIEWBOX_HEIGHT,
    )
    const offsetX = (pixelWidth - JET_LOGO_VIEWBOX_WIDTH * scale) / 2
    const offsetY = (pixelHeight - JET_LOGO_VIEWBOX_HEIGHT * scale) / 2

    maskContext.translate(offsetX, offsetY)
    maskContext.scale(scale, scale)
    maskContext.fill(mark)
  } catch {
    return null
  }

  return maskCanvas
}

function uploadMask(pixelWidth, pixelHeight) {
  if (!gl || !maskTexture || !uniforms) return false

  const maskCanvas = createMaskCanvas(pixelWidth, pixelHeight)
  if (!maskCanvas) return false

  try {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, maskTexture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      maskCanvas,
    )
    gl.uniform1i(uniforms.u_mask, 0)
  } catch {
    return false
  }

  maskWidth = pixelWidth
  maskHeight = pixelHeight
  return true
}

function resizeRenderer() {
  const canvas = liquidCanvas.value
  const root = logoRoot.value
  if (!canvas || !root || !gl || !rendererConfiguration) return false

  const bounds = root.getBoundingClientRect()
  const devicePixelRatio = window.devicePixelRatio
  if (
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    !Number.isFinite(devicePixelRatio) ||
    devicePixelRatio <= 0
  ) {
    return false
  }

  const renderScale = Math.min(devicePixelRatio, rendererConfiguration.dprMax)
  const pixelWidth = Math.max(1, Math.round(bounds.width * renderScale))
  const pixelHeight = Math.max(1, Math.round(bounds.height * renderScale))
  const sizeChanged = canvas.width !== pixelWidth || canvas.height !== pixelHeight

  if (sizeChanged) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }

  gl.viewport(0, 0, pixelWidth, pixelHeight)

  if (sizeChanged || maskWidth !== pixelWidth || maskHeight !== pixelHeight) {
    return uploadMask(pixelWidth, pixelHeight)
  }

  return true
}

function drawFrame() {
  if (!gl || !uniforms || !program) return false

  try {
    gl.uniform1f(uniforms.u_time, elapsedSeconds)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    return true
  } catch {
    return false
  }
}

function shouldAnimate() {
  return (
    !destroyed &&
    !contextIsLost &&
    isCanvasReady.value &&
    motionPreference !== null &&
    !motionPreference.matches &&
    document.visibilityState !== 'hidden'
  )
}

function stopAnimation() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  lastFrameTimestamp = null
}

function animateFrame(timestamp) {
  animationFrameId = null
  if (!shouldAnimate()) return

  if (lastFrameTimestamp !== null) {
    elapsedSeconds += (timestamp - lastFrameTimestamp) / 1000
  }
  lastFrameTimestamp = timestamp

  if (!drawFrame()) {
    useStaticFallback(true)
    return
  }

  animationFrameId = window.requestAnimationFrame(animateFrame)
}

function startAnimation() {
  if (animationFrameId !== null || !shouldAnimate()) return
  lastFrameTimestamp = null
  animationFrameId = window.requestAnimationFrame(animateFrame)
}

function resetRendererReferences() {
  fragmentShader = null
  gl = null
  maskHeight = 0
  maskTexture = null
  maskWidth = 0
  program = null
  rendererConfiguration = null
  uniforms = null
  vertexBuffer = null
  vertexShader = null
}

function releaseRendererResources() {
  stopAnimation()

  const context = gl
  if (context && !context.isContextLost()) {
    if (maskTexture) context.deleteTexture(maskTexture)
    if (vertexBuffer) context.deleteBuffer(vertexBuffer)
    if (program) context.deleteProgram(program)
    if (vertexShader) context.deleteShader(vertexShader)
    if (fragmentShader) context.deleteShader(fragmentShader)
  }

  resetRendererReferences()
}

function useStaticFallback(releaseResources) {
  isCanvasReady.value = false
  stopAnimation()

  if (releaseResources) {
    releaseRendererResources()
  }
}

function initialiseRenderer() {
  const canvas = liquidCanvas.value
  if (
    initialising ||
    destroyed ||
    contextIsLost ||
    !canvas ||
    !resizeObserver ||
    !motionPreference ||
    motionPreference.matches
  ) {
    return
  }

  initialising = true
  isCanvasReady.value = false
  releaseRendererResources()

  try {
    rendererConfiguration = readRendererConfiguration()
    if (!rendererConfiguration) return

    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })
    if (!gl || gl.isContextLost()) return

    vertexShader = compileShader(gl, gl.VERTEX_SHADER, jetLogoVertexShaderSource)
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, jetLogoFragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    program = gl.createProgram()
    if (!program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    uniforms = collectUniforms(gl, program)
    if (!uniforms) return

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    if (positionLocation < 0) return

    vertexBuffer = gl.createBuffer()
    maskTexture = gl.createTexture()
    if (!vertexBuffer || !maskTexture) return

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    if (!applyRendererConfiguration() || !resizeRenderer()) return

    elapsedSeconds = 0
    if (!drawFrame() || gl.getError() !== gl.NO_ERROR) return

    isCanvasReady.value = true
    startAnimation()
  } finally {
    initialising = false
    if (!isCanvasReady.value) {
      releaseRendererResources()
    }
  }
}

function handleResize() {
  if (
    destroyed ||
    contextIsLost ||
    !motionPreference ||
    motionPreference.matches
  ) {
    return
  }

  if (!gl) {
    initialiseRenderer()
    return
  }

  if (!refreshRendererConfiguration() || !resizeRenderer()) {
    useStaticFallback(true)
    return
  }

  if (document.visibilityState !== 'hidden' && !drawFrame()) {
    useStaticFallback(true)
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    stopAnimation()
    return
  }

  if (!gl && !contextIsLost) {
    initialiseRenderer()
    return
  }

  startAnimation()
}

function handleMotionPreferenceChange(event) {
  if (event.matches) {
    useStaticFallback(true)
    return
  }

  initialiseRenderer()
}

function handleContextLost(event) {
  event.preventDefault()
  contextIsLost = true
  isCanvasReady.value = false
  stopAnimation()
  resetRendererReferences()
}

function handleContextRestored() {
  contextIsLost = false
  initialiseRenderer()
}

function addMotionPreferenceListener() {
  if (!motionPreference) return

  if (typeof motionPreference.addEventListener === 'function') {
    motionPreference.addEventListener('change', handleMotionPreferenceChange)
    return
  }

  motionPreference.addListener(handleMotionPreferenceChange)
}

function removeMotionPreferenceListener() {
  if (!motionPreference) return

  if (typeof motionPreference.removeEventListener === 'function') {
    motionPreference.removeEventListener('change', handleMotionPreferenceChange)
    return
  }

  motionPreference.removeListener(handleMotionPreferenceChange)
}

onMounted(() => {
  const canvas = liquidCanvas.value
  const root = logoRoot.value
  if (!canvas || !root) return

  destroyed = false
  motionPreference = window.matchMedia(REDUCED_MOTION_QUERY)
  addMotionPreferenceListener()

  canvas.addEventListener('webglcontextlost', handleContextLost)
  canvas.addEventListener('webglcontextrestored', handleContextRestored)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', handleResize)

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(root)
  }

  initialiseRenderer()
})

onBeforeUnmount(() => {
  destroyed = true
  isCanvasReady.value = false

  const canvas = liquidCanvas.value
  canvas?.removeEventListener('webglcontextlost', handleContextLost)
  canvas?.removeEventListener('webglcontextrestored', handleContextRestored)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('resize', handleResize)
  removeMotionPreferenceListener()
  motionPreference = null

  resizeObserver?.disconnect()
  resizeObserver = null

  releaseRendererResources()
})
</script>

<template>
  <span
    ref="logoRoot"
    class="jet-logo"
    :data-liquid-ready="isCanvasReady ? 'true' : 'false'"
    aria-hidden="true"
  >
    <svg
      class="jet-logo__fallback"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          :id="gradientId"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          :x2="JET_LOGO_VIEWBOX_WIDTH"
          y2="0"
        >
          <stop class="jet-logo__metal--blue-start" />
          <stop class="jet-logo__metal--teal-first" />
          <stop class="jet-logo__metal--highlight-first" />
          <stop class="jet-logo__metal--shadow" />
          <stop class="jet-logo__metal--teal-second" />
          <stop class="jet-logo__metal--orange" />
          <stop class="jet-logo__metal--highlight-second" />
          <stop class="jet-logo__metal--blue-end" />
        </linearGradient>
      </defs>

      <path :d="JET_LOGO_MARK_PATH" :fill="`url(#${gradientId})`" />
    </svg>

    <canvas
      ref="liquidCanvas"
      class="jet-logo__canvas"
      aria-hidden="true"
    />
  </span>
</template>
