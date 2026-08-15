<script setup>
import { useId } from 'vue'

const instanceId = useId().replaceAll(':', '')
const gradientId = `jet-logo-gradient-${instanceId}`
const markPath =
  'M282 0H1460V107H1121V491H969V107H448V193H775V294H448V384H889V491H448V557H0V440H282Z'
</script>

<template>
  <svg
    class="jet-logo"
    viewBox="0 0 1460 557"
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
        x2="1460"
        y2="0"
        spreadMethod="repeat"
      >
        <stop class="jet-logo__stop jet-logo__stop--start" />
        <stop class="jet-logo__stop jet-logo__stop--teal" />
        <stop class="jet-logo__stop jet-logo__stop--orange" />
        <stop class="jet-logo__stop jet-logo__stop--end" />
      </linearGradient>
    </defs>

    <path :d="markPath" :fill="`url(#${gradientId})`" />
  </svg>
</template>
