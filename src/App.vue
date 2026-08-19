<template>
  <div
    id="app"
    class="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
  >
    <Nav />
    <main class="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <router-view />
      <Toasts />
    </main>
    <Footer />
  </div>
</template>

<script setup>
  import Toasts from '@/components/Toasts.vue'
  import Nav from '@/components/Nav.vue'
  import Footer from '@/components/Footer.vue'
</script>
