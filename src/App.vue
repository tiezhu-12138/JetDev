<script setup>
import { RouterView } from 'vue-router'

import SiteHeader from './components/site/SiteHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <SiteHeader />
  <RouterView />
</template>
