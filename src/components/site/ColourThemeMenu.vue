<script setup>
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const themeOptions = Object.freeze([
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
])

const root = ref(null)
const trigger = ref(null)
const optionButtons = ref([])
const isOpen = ref(false)
const activeOptionIndex = ref(0)
const menuId = `colour-theme-menu-${useId().replaceAll(':', '')}`

const selectedOption = computed(
  () =>
    themeOptions.find((option) => option.value === props.modelValue) ??
    themeOptions.at(-1),
)
const selectedOptionIndex = computed(() => {
  const index = themeOptions.findIndex(
    (option) => option.value === selectedOption.value.value,
  )

  return index === -1 ? themeOptions.length - 1 : index
})

function closeMenu() {
  isOpen.value = false
}

async function focusOption(index) {
  activeOptionIndex.value = index
  isOpen.value = true
  await nextTick()
  optionButtons.value[index]?.focus()
}

function toggleMenu() {
  if (isOpen.value) {
    closeMenu()
    return
  }

  focusOption(selectedOptionIndex.value)
}

async function selectTheme(value) {
  emit('update:modelValue', value)
  closeMenu()
  await nextTick()
  trigger.value?.focus()
}

async function closeMenuAndRestoreFocus() {
  closeMenu()
  await nextTick()
  trigger.value?.focus()
}

function handleTriggerKeydown(event) {
  const key = event.key.toLowerCase()

  if (key === 'arrowdown') {
    event.preventDefault()
    focusOption(0)
  } else if (key === 'arrowup') {
    event.preventDefault()
    focusOption(themeOptions.length - 1)
  } else if (key === 'enter' || key === ' ' || key === 'spacebar') {
    event.preventDefault()
    focusOption(selectedOptionIndex.value)
  }
}

function handleOptionKeydown(event, index) {
  const key = event.key.toLowerCase()

  if (key === 'arrowdown') {
    event.preventDefault()
    focusOption((index + 1) % themeOptions.length)
  } else if (key === 'arrowup') {
    event.preventDefault()
    focusOption((index - 1 + themeOptions.length) % themeOptions.length)
  } else if (key === 'home') {
    event.preventDefault()
    focusOption(0)
  } else if (key === 'end') {
    event.preventDefault()
    focusOption(themeOptions.length - 1)
  } else if (key === 'enter' || key === ' ' || key === 'spacebar') {
    event.preventDefault()
    selectTheme(themeOptions[index].value)
  }
}

function handleEscape(event) {
  if (event.key.toLowerCase() !== 'escape' || !isOpen.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  closeMenuAndRestoreFocus()
}

async function handleFocusOut() {
  await nextTick()

  if (!root.value?.contains(document.activeElement)) {
    closeMenu()
  }
}

onClickOutside(root, closeMenu)
</script>

<template>
  <div
    ref="root"
    class="colour-theme-menu"
    @focusout="handleFocusOut"
    @keydown="handleEscape"
  >
    <button
      ref="trigger"
      class="colour-theme-menu__trigger"
      type="button"
      aria-haspopup="menu"
      :aria-controls="menuId"
      :aria-expanded="isOpen"
      :aria-label="`Colour theme: ${selectedOption.label}`"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <span>Theme:</span>
      <span class="colour-theme-menu__current">{{ selectedOption.label }}</span>
    </button>

    <div
      v-if="isOpen"
      :id="menuId"
      class="colour-theme-menu__options"
      role="menu"
      aria-label="Colour theme"
    >
      <button
        v-for="(option, index) in themeOptions"
        :key="option.value"
        ref="optionButtons"
        class="colour-theme-menu__option"
        type="button"
        role="menuitemradio"
        :tabindex="activeOptionIndex === index ? 0 : -1"
        :aria-checked="modelValue === option.value"
        :data-selected="modelValue === option.value ? 'true' : 'false'"
        @click="selectTheme(option.value)"
        @keydown="handleOptionKeydown($event, index)"
      >
        <span>{{ option.label }}</span>
        <span
          v-if="modelValue === option.value"
          class="colour-theme-menu__selected"
        >
          Selected
        </span>
      </button>
    </div>
  </div>
</template>
