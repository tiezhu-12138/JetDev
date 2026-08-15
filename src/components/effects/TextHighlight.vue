<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  sequence: {
    type: String,
    default: 'first',
    validator: (value) => ['first', 'second'].includes(value),
  },
})
</script>

<template>
  <span
    class="text-highlight"
    :data-active="active ? 'true' : 'false'"
    :data-sequence="sequence"
  >
    <slot />
  </span>
</template>
