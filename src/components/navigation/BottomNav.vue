<template>
  <!-- Mobile Bottom Navigation -->
  <nav
    class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden"
    aria-label="Mobile navigation"
  >
    <div class="flex items-center gap-1 bg-[#0A0A0A] rounded-full px-4 py-3 shadow-2xl">
      <button
        v-for="item in navItems"
        :key="item.name"
        @click="navigate(item.route)"
        :aria-label="item.name"
        class="relative flex flex-col items-center justify-center w-[52px] h-12 rounded-full transition-all duration-200"
        :class="isActive(item.route) ? '' : 'opacity-40 hover:opacity-60'"
      >
        <!-- Active glowing background -->
        <span
          v-if="isActive(item.route)"
          class="absolute inset-0 rounded-full"
          style="background: radial-gradient(circle, var(--color-primary) 0%, transparent 60%); opacity: 0.15;"
        />
        
        <component
          :is="item.icon"
          :size="20"
          :stroke-width="isActive(item.route) ? 2.5 : 2"
          :color="isActive(item.route) ? 'var(--color-primary)' : '#FFFFFF'"
          class="relative z-10 transition-all duration-200"
          :class="{ 'mb-2': isActive(item.route) }"
        />

        <!-- Active Dot Indicator -->
        <span
          v-if="isActive(item.route)"
          class="absolute bottom-2 w-1.5 h-1.5 rounded-full shadow-sm"
          style="background: var(--color-primary);"
        />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { Home, User, Calendar, BarChart2 } from 'lucide-vue-next'

const navItems = [
  { name: 'Home', route: '/dashboard', icon: Home },
  { name: 'Profile', route: '/dashboard/profile', icon: User },
  { name: 'Schedule', route: '/dashboard/schedule', icon: Calendar },
  { name: 'Analytics', route: '/dashboard/analytics', icon: BarChart2 },
]

const router = useRouter()
const route = useRoute()

function isActive(path) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/dashboard/'
  return route.path.startsWith(path)
}

function navigate(path) {
  router.push(path)
}
</script>
