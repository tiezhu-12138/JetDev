<script setup>
// Adapted from Inspira UI Particles Background with square geometry and reduced-motion support.
import { useDevicePixelRatio } from "@vueuse/core";
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

const canvasContainer = ref(null);
const canvas = ref(null);
const isReady = ref(false);
const { pixelRatio } = useDevicePixelRatio();

let context;
let particles = [];
let particleTokens;
let animationFrame;
let resizeFrame;
let resizeObserver;
let intersectionObserver;
let motionPreference;
let stopPixelRatioWatch;
let lastTimestamp;
let isInViewport = false;
let isDocumentVisible = true;
let reducedMotion = true;
let canvasWidth = 0;
let canvasHeight = 0;

function readRootToken(name) {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function readNumberToken(name) {
  return Number.parseFloat(readRootToken(name));
}

function loadParticleTokens() {
  const colours = [
    readRootToken("--colour-particle-primary"),
    readRootToken("--colour-particle-secondary"),
    readRootToken("--colour-particle-tertiary"),
  ];
  const nextTokens = {
    colours,
    quantity: Math.floor(readNumberToken("--particle-quantity")),
    sizeMin: readNumberToken("--particle-size-min"),
    sizeMax: readNumberToken("--particle-size-max"),
    opacityMin: readNumberToken("--particle-opacity-min"),
    opacityMax: readNumberToken("--particle-opacity-max"),
    speedMin: readNumberToken("--particle-speed-min"),
    speedMax: readNumberToken("--particle-speed-max"),
    dprMax: readNumberToken("--particle-dpr-max"),
  };
  const numericTokens = Object.values(nextTokens).filter(
    (value) => typeof value === "number",
  );

  if (
    colours.some((colour) => !colour) ||
    numericTokens.some((value) => !Number.isFinite(value)) ||
    nextTokens.quantity < 1 ||
    nextTokens.sizeMin <= 0 ||
    nextTokens.sizeMax < nextTokens.sizeMin ||
    nextTokens.opacityMin < 0 ||
    nextTokens.opacityMax > 1 ||
    nextTokens.opacityMax < nextTokens.opacityMin ||
    nextTokens.speedMin < 0 ||
    nextTokens.speedMax < nextTokens.speedMin ||
    nextTokens.dprMax < 1
  ) {
    return null;
  }

  return nextTokens;
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function createParticle() {
  const direction = Math.random() * Math.PI * 2;
  const speed = randomBetween(
    particleTokens.speedMin,
    particleTokens.speedMax,
  );

  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: randomBetween(particleTokens.sizeMin, particleTokens.sizeMax),
    opacity: randomBetween(
      particleTokens.opacityMin,
      particleTokens.opacityMax,
    ),
    colour:
      particleTokens.colours[
        Math.floor(Math.random() * particleTokens.colours.length)
      ],
    velocityX: Math.cos(direction) * speed,
    velocityY: Math.sin(direction) * speed,
  };
}

function seedParticles() {
  particles = [];

  for (let index = 0; index < particleTokens.quantity; index += 1) {
    particles.push(createParticle());
  }
}

function drawParticles() {
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach((particle) => {
    context.globalAlpha = particle.opacity;
    context.fillStyle = particle.colour;
    context.fillRect(particle.x, particle.y, particle.size, particle.size);
  });

  context.globalAlpha = 1;
}

function updateParticles(deltaSeconds) {
  particles.forEach((particle) => {
    particle.x += particle.velocityX * deltaSeconds;
    particle.y += particle.velocityY * deltaSeconds;

    if (particle.x < -particle.size) {
      particle.x = canvasWidth + particle.size;
    } else if (particle.x > canvasWidth + particle.size) {
      particle.x = -particle.size;
    }

    if (particle.y < -particle.size) {
      particle.y = canvasHeight + particle.size;
    } else if (particle.y > canvasHeight + particle.size) {
      particle.y = -particle.size;
    }
  });
}

function shouldAnimate() {
  return !reducedMotion && isInViewport && isDocumentVisible;
}

function animate(timestamp) {
  animationFrame = undefined;

  if (!shouldAnimate()) {
    return;
  }

  if (lastTimestamp !== undefined) {
    updateParticles((timestamp - lastTimestamp) / 1000);
    drawParticles();
  }

  lastTimestamp = timestamp;
  animationFrame = window.requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationFrame !== undefined) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }

  lastTimestamp = undefined;
}

function startAnimation() {
  if (animationFrame !== undefined || !shouldAnimate()) {
    return;
  }

  lastTimestamp = undefined;
  animationFrame = window.requestAnimationFrame(animate);
}

function syncAnimation() {
  if (reducedMotion) {
    stopAnimation();
    drawParticles();
    return;
  }

  if (shouldAnimate()) {
    startAnimation();
    return;
  }

  stopAnimation();
}

function resizeCanvas() {
  if (!canvasContainer.value || !canvas.value) {
    return;
  }

  const nextTokens = loadParticleTokens();

  if (!nextTokens) {
    stopAnimation();
    isReady.value = false;
    return;
  }

  particleTokens = nextTokens;
  const bounds = canvasContainer.value.getBoundingClientRect();
  canvasWidth = bounds.width;
  canvasHeight = bounds.height;

  if (canvasWidth <= 0 || canvasHeight <= 0) {
    stopAnimation();
    return;
  }

  const devicePixelRatio = Math.min(
    Math.max(pixelRatio.value, 1),
    particleTokens.dprMax,
  );
  canvas.value.width = Math.floor(canvasWidth * devicePixelRatio);
  canvas.value.height = Math.floor(canvasHeight * devicePixelRatio);
  context = canvas.value.getContext("2d");

  if (!context) {
    stopAnimation();
    isReady.value = false;
    return;
  }

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  seedParticles();
  drawParticles();
  syncAnimation();
}

function scheduleResize() {
  if (resizeFrame !== undefined) {
    return;
  }

  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = undefined;
    resizeCanvas();
  });
}

function handleVisibilityChange() {
  isDocumentVisible = document.visibilityState === "visible";
  syncAnimation();
}

function handleMotionPreferenceChange(event) {
  reducedMotion = event.matches;
  syncAnimation();
}

onMounted(async () => {
  particleTokens = loadParticleTokens();

  if (!particleTokens) {
    return;
  }

  isReady.value = true;
  await nextTick();

  if (!canvasContainer.value || !canvas.value) {
    isReady.value = false;
    return;
  }

  motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion = motionPreference.matches;
  isDocumentVisible = document.visibilityState === "visible";
  motionPreference.addEventListener("change", handleMotionPreferenceChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", scheduleResize);

  resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(canvasContainer.value);

  intersectionObserver = new IntersectionObserver(([entry]) => {
    isInViewport = entry?.isIntersecting ?? false;
    syncAnimation();
  });
  intersectionObserver.observe(canvasContainer.value);

  stopPixelRatioWatch = watch(pixelRatio, scheduleResize);
  resizeCanvas();
});

onBeforeUnmount(() => {
  stopAnimation();

  if (resizeFrame !== undefined) {
    window.cancelAnimationFrame(resizeFrame);
  }

  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  stopPixelRatioWatch?.();
  motionPreference?.removeEventListener("change", handleMotionPreferenceChange);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("resize", scheduleResize);
});
</script>

<template>
  <div
    v-if="isReady"
    ref="canvasContainer"
    class="particles-background"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="particles-background__canvas"
    />
  </div>
</template>
