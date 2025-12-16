<template>
  <div class="error-container">
    <h1>404</h1>
    <p>Oops! Esta página não existe.</p>
    <router-link :to="{ name: 'Home' }" class="btn btn-primary"
      >Voltar</router-link
    >
  </div>
</template>

<style scoped>
  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }

  .error-container h1 {
    font-size: 6rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
</style>
