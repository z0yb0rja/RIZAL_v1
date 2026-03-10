<template>
  <!-- Shared layout for all student dashboard pages -->
  <div class="min-h-screen" style="background: var(--color-bg); font-family: 'Manrope', sans-serif;">
    <!-- Desktop Sidebar (left) -->
    <SideNav />

    <!-- Main content area -->
    <main
      class="min-h-screen transition-all duration-300"
      :class="[
        'md:ml-[80px]',   // sidebar width offset on desktop
        'pb-28 md:pb-8',  // bottom padding for mobile nav
      ]"
    >
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- Mobile Bottom Nav -->
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import SideNav from '@/components/navigation/SideNav.vue'
import BottomNav from '@/components/navigation/BottomNav.vue'
</script>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
