<script setup>
import { RouterView } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'

import SiteHeader from './components/site/SiteHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <SiteHeader />
  <RouterView />
  <Analytics />
</template>
