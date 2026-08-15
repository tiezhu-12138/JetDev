<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { externalLinks, navigationItems } from '../../content/home.js'
import JetLogo from '../brand/JetLogo.vue'

const menuId = 'primary-navigation-menu'
const isMenuOpen = ref(false)
const menuToggle = ref(null)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

async function closeMenuAndRestoreFocus() {
  closeMenu()
  await nextTick()
  menuToggle.value?.focus()
}

function handleKeydown(event) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenuAndRestoreFocus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="site-header">
    <nav class="site-navigation site-navigation--rounded" aria-label="Primary navigation">
      <a class="site-navigation__brand" href="/#home" aria-label="JET home" @click="closeMenu">
        <JetLogo class="site-navigation__logo" />
      </a>

      <ul class="site-navigation__links" role="list">
        <li v-for="item in navigationItems" :key="item.href">
          <a class="site-navigation__link" :href="item.href" @click="closeMenu">
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
            <a class="site-navigation__link" :href="item.href" @click="closeMenu">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>
