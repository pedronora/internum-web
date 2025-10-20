import { onMounted } from "vue";

export function useAuthInit(authStore) {
  onMounted(() => {
    if (authStore && typeof authStore.initFromStorage === "function") {
      try {
        authStore.initFromStorage();
      } catch (err) {
        console.error("auth init failed", err);
      }
    }
  });
}
