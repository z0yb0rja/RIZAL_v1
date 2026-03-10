<template>
  <!-- University Banner Card - full lime-green bg, school logo on right -->
  <div
    class="relative rounded-3xl overflow-hidden w-full"
    style="background: var(--color-primary); min-height: 200px;"
  >
    <!-- Text content -->
    <div class="relative z-10 p-5 flex flex-col justify-between h-full" style="min-height: 200px;">
      <div>
        <p class="text-[13px] font-semibold opacity-80" style="color: var(--color-banner-text);">Welcome to</p>
        <h2 class="text-[28px] font-extrabold leading-tight mt-0.5" style="color: var(--color-banner-text); max-width: 55%;">
          {{ schoolName }}
        </h2>
      </div>

      <!-- Announcement Button -->
      <button
        @click="$emit('announcement-click')"
        class="mt-4 flex items-center gap-3 rounded-full pl-3 pr-5 py-2.5 self-start transition-all duration-150 hover:scale-105 active:scale-95 group"
        style="background: var(--color-text-always-dark);"
      >
        <span
          class="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors"
        >
          <ArrowRight :size="14" color="var(--color-surface)" :stroke-width="2.5" />
        </span>
        <span class="text-[12px] font-semibold" style="color: var(--color-surface);">Latest Announcement</span>
      </button>
    </div>

    <!-- University Logo (right side) -->
    <div class="absolute right-0 bottom-0 top-0 flex items-center justify-end pr-3 pointer-events-none">
      <img
        :src="schoolLogo"
        :alt="schoolName + ' logo'"
        class="h-[120px] w-[120px] md:h-[140px] md:w-[140px] object-contain drop-shadow-xl opacity-90"
        @error="onLogoError"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  schoolName: {
    type: String,
    default: 'University Name',
  },
  schoolLogo: {
    type: String,
    default: '/logos/university_logo.svg',
  },
})

defineEmits(['announcement-click'])

const logoFailed = ref(false)

function onLogoError(e) {
  logoFailed.value = true
  e.target.style.display = 'none'
}
</script>
