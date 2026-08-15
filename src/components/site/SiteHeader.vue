<script setup>
import {
  useMediaQuery,
  usePreferredReducedMotion,
  useWindowScroll,
} from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { externalLinks, navigationItems } from '../../content/home.js'
import JetLogo from '../brand/JetLogo.vue'

const menuId = 'primary-navigation-menu'
const isMenuOpen = ref(false)
const isHeaderVisible = ref(true)
const isHeaderFocusProtected = ref(false)
const isScrollSettingsReady = ref(false)
const autoHideMediaQuery = ref('not all')
const siteHeader = ref(null)
const menuToggle = ref(null)
const isAutoHideViewport = useMediaQuery(autoHideMediaQuery)
const reducedMotion = usePreferredReducedMotion()
const { y: scrollY } = useWindowScroll()

const isAutoHideEnabled = computed(
  () =>
    isScrollSettingsReady.value &&
    isAutoHideViewport.value &&
    reducedMotion.value !== 'reduce',
)

let directionThreshold = 0
let topProtection = 0
let programmaticNavigationGuardDuration = 0
let previousScrollY = 0
let accumulatedDistance = 0
let currentDirection = null
let isProgrammaticNavigation = false
let isPointerFocusPending = false
let navigationGuardTimer = null
let pointerFocusResetTimer = null

function readToken(tokenName) {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim()
}

function readPixelToken(tokenName) {
  const tokenValue = readToken(tokenName)

  if (!tokenValue.endsWith('px')) {
    return Number.NaN
  }

  return Number.parseFloat(tokenValue)
}

function readMillisecondToken(tokenName) {
  const tokenValue = readToken(tokenName)

  if (!tokenValue.endsWith('ms')) {
    return Number.NaN
  }

  return Number.parseFloat(tokenValue)
}

function resetScrollTracking(scrollPosition = scrollY.value) {
  previousScrollY = Math.max(scrollPosition, 0)
  accumulatedDistance = 0
  currentDirection = null
}

function showHeader() {
  isHeaderVisible.value = true
}

function initialiseScrollSettings() {
  const breakpoint = readToken('--breakpoint-navigation-auto-hide-max')
  const nextDirectionThreshold = readPixelToken(
    '--size-navigation-scroll-threshold',
  )
  const nextTopProtection = readPixelToken('--size-navigation-top-protection')
  const nextProgrammaticGuardDuration = readMillisecondToken(
    '--motion-duration-navigation-programmatic-guard',
  )

  if (
    !breakpoint ||
    !Number.isFinite(nextDirectionThreshold) ||
    nextDirectionThreshold <= 0 ||
    !Number.isFinite(nextTopProtection) ||
    nextTopProtection <= 0 ||
    !Number.isFinite(nextProgrammaticGuardDuration) ||
    nextProgrammaticGuardDuration <= 0
  ) {
    return
  }

  directionThreshold = nextDirectionThreshold
  topProtection = nextTopProtection
  programmaticNavigationGuardDuration = nextProgrammaticGuardDuration
  autoHideMediaQuery.value = `(max-width: ${breakpoint})`
  isScrollSettingsReady.value = true
  resetScrollTracking()
}

function handleScroll(scrollPosition) {
  const nextScrollY = Math.max(scrollPosition, 0)

  if (
    !isAutoHideEnabled.value ||
    isMenuOpen.value ||
    isHeaderFocusProtected.value ||
    isProgrammaticNavigation
  ) {
    showHeader()
    resetScrollTracking(nextScrollY)
    return
  }

  if (nextScrollY <= topProtection) {
    showHeader()
    resetScrollTracking(nextScrollY)
    return
  }

  const delta = nextScrollY - previousScrollY
  previousScrollY = nextScrollY

  if (delta === 0) {
    return
  }

  const nextDirection = delta > 0 ? 'down' : 'up'

  if (nextDirection !== currentDirection) {
    currentDirection = nextDirection
    accumulatedDistance = 0
  }

  accumulatedDistance += Math.abs(delta)

  if (accumulatedDistance < directionThreshold) {
    return
  }

  isHeaderVisible.value = nextDirection === 'up'
  accumulatedDistance = 0
}

function beginProgrammaticNavigation() {
  isProgrammaticNavigation = true
  showHeader()
  resetScrollTracking()

  if (navigationGuardTimer !== null) {
    window.clearTimeout(navigationGuardTimer)
  }

  navigationGuardTimer = window.setTimeout(() => {
    navigationGuardTimer = null
    isProgrammaticNavigation = false
    resetScrollTracking()
  }, programmaticNavigationGuardDuration)
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleNavigationClick() {
  closeMenu()
  beginProgrammaticNavigation()
}

async function closeMenuAndRestoreFocus() {
  closeMenu()
  await nextTick()
  menuToggle.value?.focus()
}

function handleKeydown(event) {
  if (pointerFocusResetTimer !== null) {
    window.clearTimeout(pointerFocusResetTimer)
    pointerFocusResetTimer = null
  }

  isPointerFocusPending = false

  if (siteHeader.value?.contains(document.activeElement)) {
    isHeaderFocusProtected.value = true
  }

  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenuAndRestoreFocus()
  }
}

function handlePointerDown(event) {
  const isHeaderTarget = siteHeader.value?.contains(event.target) ?? false

  if (pointerFocusResetTimer !== null) {
    window.clearTimeout(pointerFocusResetTimer)
    pointerFocusResetTimer = null
  }

  isPointerFocusPending = isHeaderTarget
  isHeaderFocusProtected.value = false

  if (isHeaderTarget) {
    pointerFocusResetTimer = window.setTimeout(() => {
      pointerFocusResetTimer = null
      isPointerFocusPending = false
    })
  }
}

function handleHeaderFocusIn() {
  if (pointerFocusResetTimer !== null) {
    window.clearTimeout(pointerFocusResetTimer)
    pointerFocusResetTimer = null
  }

  isHeaderFocusProtected.value = !isPointerFocusPending
  isPointerFocusPending = false
}

async function handleHeaderFocusOut() {
  await nextTick()

  if (!siteHeader.value?.contains(document.activeElement)) {
    isHeaderFocusProtected.value = false
  }
}

onMounted(() => {
  initialiseScrollSettings()

  if (window.location.hash) {
    beginProgrammaticNavigation()
  }

  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('hashchange', beginProgrammaticNavigation)
  window.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('hashchange', beginProgrammaticNavigation)
  window.removeEventListener('pointerdown', handlePointerDown)

  if (navigationGuardTimer !== null) {
    window.clearTimeout(navigationGuardTimer)
  }

  if (pointerFocusResetTimer !== null) {
    window.clearTimeout(pointerFocusResetTimer)
  }
})

watch(scrollY, handleScroll)

watch([isAutoHideEnabled, isMenuOpen, isHeaderFocusProtected], () => {
  showHeader()
  resetScrollTracking()
})
</script>

<template>
  <header
    ref="siteHeader"
    class="site-header"
    :data-auto-hide="isAutoHideEnabled ? 'true' : 'false'"
    :data-visible="isHeaderVisible ? 'true' : 'false'"
    @focusin="handleHeaderFocusIn"
    @focusout="handleHeaderFocusOut"
  >
    <nav class="site-navigation site-navigation--rounded" aria-label="Primary navigation">
      <a
        class="site-navigation__brand"
        href="/#home"
        aria-label="JET home"
        @click="handleNavigationClick"
      >
        <JetLogo class="site-navigation__logo" />
      </a>

      <ul class="site-navigation__links" role="list">
        <li v-for="item in navigationItems" :key="item.href">
          <a
            class="site-navigation__link"
            :href="item.href"
            @click="handleNavigationClick"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>

      <div class="site-navigation__actions">
        <a
          v-if="externalLinks.resume"
          class="site-navigation__resume"
          :href="externalLinks.resume"
          download="Jiahang_SUN_Resume.pdf"
          aria-label="Download Resume PDF"
          @click="closeMenu"
        >
          Resume
        </a>

        <button
          ref="menuToggle"
          class="site-navigation__toggle"
          type="button"
          :aria-expanded="isMenuOpen"
          :aria-controls="menuId"
          @click="toggleMenu"
        >
          {{ isMenuOpen ? 'Close' : 'Menu' }}
        </button>
      </div>

      <div
        :id="menuId"
        class="site-navigation__panel"
        :data-open="isMenuOpen ? 'true' : 'false'"
        :hidden="!isMenuOpen"
      >
        <ul class="site-navigation__panel-links" role="list">
          <li v-for="item in navigationItems" :key="item.href">
            <a
              class="site-navigation__link"
              :href="item.href"
              @click="handleNavigationClick"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>
