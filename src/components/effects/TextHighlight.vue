<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <span class="text-highlight" :data-active="active ? 'true' : 'false'">
    <slot />
  </span>
</template>
