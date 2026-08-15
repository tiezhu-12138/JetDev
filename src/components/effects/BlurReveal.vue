<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const paragraph = ref(null)
const entered = ref(false)

let observer
let reducedMotionQuery

function stopObserving() {
  observer?.disconnect()
  observer = undefined
}

function reveal() {
  if (entered.value) {
    return
  }

  entered.value = true
  stopObserving()
}

function handleMotionPreferenceChange(event) {
  if (event.matches) {
    reveal()
  }
}

function addMotionPreferenceListener() {
  if (!reducedMotionQuery) {
    return
  }

  if ('addEventListener' in reducedMotionQuery) {
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange)
    return
  }

  reducedMotionQuery.addListener(handleMotionPreferenceChange)
}

function removeMotionPreferenceListener() {
  if (!reducedMotionQuery) {
    return
  }

  if ('removeEventListener' in reducedMotionQuery) {
    reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange)
    return
  }

  reducedMotionQuery.removeListener(handleMotionPreferenceChange)
}

onMounted(() => {
  if ('matchMedia' in window) {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  }

  addMotionPreferenceListener()

  if (reducedMotionQuery?.matches) {
    reveal()
    return
  }

  if (!('IntersectionObserver' in window) || !paragraph.value) {
    reveal()
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        reveal()
      }
    },
    { threshold: 0 },
  )
  observer.observe(paragraph.value)
})

onBeforeUnmount(() => {
  stopObserving()
  removeMotionPreferenceListener()
})
</script>

<template>
  <p ref="paragraph" class="blur-reveal" :data-entered="entered ? 'true' : 'false'">
    <slot :entered="entered" />
  </p>
</template>
