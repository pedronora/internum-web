<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Criar Novo Aviso</h1>
      <router-link :to="{ name: 'NoticesList' }" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Voltar
      </router-link>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="saveNotice" class="needs-validation" novalidate>
          <div class="mb-3">
            <label for="title" class="form-label fw-semibold">Título</label>
            <input
              id="title"
              v-model.trim="form.title"
              type="text"
              class="form-control"
              placeholder="Digite o título do aviso"
              required
            />
          </div>

          <div class="mb-3">
            <label for="content" class="form-label fw-semibold">Conteúdo</label>
            <textarea
              id="content"
              v-model.trim="form.content"
              class="form-control"
              rows="5"
              placeholder="Digite o conteúdo do aviso"
              required
            ></textarea>
          </div>

          <div class="mt-4 d-flex justify-content-end gap-2">
            <router-link :to="{ name: 'NoticesList' }" class="btn btn-outline-secondary">
              Cancelar
            </router-link>
            <button type="submit" class="btn btn-success" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-check-circle me-1"></i> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { UsersService as NoticesService } from "@/services/notices.services";
import { success as successToast, error as errorToast } from "@/composables/useToast";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const form = ref({
  title: "",
  content: "",
});

async function saveNotice() {
  if (!form.value.title || !form.value.content) {
    errorToast("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await NoticesService.create({
      title: form.value.title,
      content: form.value.content,
    });

    successToast("Aviso criado com sucesso!");
    router.push({ name: "NoticesList" });
  } catch (err) {
    console.error("Erro ao criar aviso:", err);
    error.value =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Erro desconhecido";
    errorToast(error.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
