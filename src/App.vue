<template>
  <div id="app">
    <Nav />
    <main class="container">
      <router-view />
      <Toasts />
    </main>
  </div>
</template>

<script setup>
import Toasts from "@/components/Toasts.vue";
import Nav from "@/components/Nav.vue";
</script>
