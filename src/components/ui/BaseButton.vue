<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="w-full flex items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-all duration-150 select-none disabled:opacity-60 disabled:cursor-not-allowed"
    :class="[variantClass, sizeClass]"
    v-bind="$attrs"
  >
    <!-- Spinner -->
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'ghost'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const variantClass = computed(() => ({
  'bg-[var(--color-text-always-dark)] text-white hover:opacity-90 active:scale-[0.98]': props.variant === 'primary',
  'bg-white text-[var(--color-text-always-dark)] border border-[var(--color-text-always-dark)] hover:bg-[#f5f5f5] active:scale-[0.98]': props.variant === 'secondary',
  'bg-transparent text-[var(--color-text-always-dark)] hover:underline': props.variant === 'ghost',
}))

const sizeClass = computed(() => ({
  'px-4 py-2 text-sm': props.size === 'sm',
  'px-6 py-4': props.size === 'md',
  'px-8 py-5 text-base': props.size === 'lg',
}))
</script>
