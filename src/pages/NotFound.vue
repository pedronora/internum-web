<template>
  <div class="error-container">
    <div ref="lottieContainer" class="lottie-animation"></div>
    <div class="error-content">
      <h1>404</h1>
      <p>Oops! Esta página não existe.</p>
      <router-link :to="{ name: 'Home' }" class="btn btn-primary"
        >Voltar</router-link
      >
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import lottie from 'lottie-web'

  const lottieContainer = ref(null)

  onMounted(() => {
    if (lottieContainer.value) {
      lottie.loadAnimation({
        container: lottieContainer.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/d987597c-7676-4424-8817-7fca6dc1a33e/BVrFXsaeui.json',
      })
    }
  })
</script>

<style scoped>
  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }

  .error-content {
    text-align: center;
  }

  .error-content h1 {
    font-size: 6rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .error-content p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  .lottie-animation {
    max-width: 400px;
    margin-bottom: 2rem;
  }
</style>
