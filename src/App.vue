<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <Nav />
    <main class="flex-grow-1 container">
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
