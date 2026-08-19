<template>
  <div
    class="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
  >
    <h1 class="mb-4 text-6xl font-bold">404</h1>
    <p class="mb-4 text-slate-500 dark:text-slate-400">
      Oops! Esta página não existe.
    </p>
    <router-link
      :to="{ name: 'Home' }"
      class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
      >Voltar</router-link
    >
  </div>
</template>
