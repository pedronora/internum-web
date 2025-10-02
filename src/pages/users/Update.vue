<template>
  <div class="container mt-4">
    <h1 class="mb-4">Editar Usuário</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading && !loadedOnce" class="text-center my-4">
      <div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>
    </div>

    <form v-if="loadedOnce" @submit.prevent="submit" class="card shadow-sm p-3">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Nome</label>
          <input v-model="form.name" required class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Username</label>
          <input v-model="form.username" required class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" required class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Setor</label>
          <select v-model="form.setor" class="form-select" required>
            <option v-for="s in setorOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Subsetor</label>
          <select v-model="form.subsetor" class="form-select">
            <option v-for="option in subsetorOptions[form.setor]" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Perfil</label>
          <select v-model="form.role" class="form-select" required>
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>

        <div class="col-12 d-flex align-items-center gap-3">
          <div class="ms-auto d-flex gap-2">
            <router-link :to="{ name: 'UsersList' }" class="btn btn-outline-secondary">Cancelar</router-link>
            <button class="btn btn-danger" type="button" @click="confirmDelete">Excluir</button>
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"
                aria-hidden="true"></span>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UsersService } from '@/services/users.services';
import { confirm as confirmToast, error as errorToast, success as successToast } from '@/composables/useToast'; 

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const loading = ref(false);
const loadedOnce = ref(false);
const error = ref(null);

const setorOptions = [
  { value: 'registro', label: 'Registro' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'oficial', label: 'Oficial' },
];

const subsetorOptions = {
  'registro': [
    { value: 'Analise', label: 'Análise' },
    { value: 'Conferencia', label: 'Conferência' },
    { value: 'Finalizacao_impressao', label: 'Finalização/Impressão' },
    { value: 'Busca_certidao', label: 'Busca e Certidão' },
    { value: 'Arquivo', label: 'Arquivo' },
  ],
  'administrativo': [
    { value: 'Atendimento', label: 'Atendimento' },
    { value: 'Digitalizacao', label: 'Digitalização' },
    { value: 'Apoio', label: 'Apoio' },
  ],
  'oficial': [
    { value: 'Titular', label: 'Titular' },
    { value: 'Substituto', label: 'Substituto' },
  ],
};

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'coord', label: 'Coordenador' },
  { value: 'user', label: 'Geral' },
];

const form = ref({
  name: '',
  username: '',
  email: '',
  setor: setorOptions[0].value,
  subsetor: '',
  role: 'user',
  active: true,
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const data = await UsersService.getById(id);
    form.value = {
      name: data.name ?? '',
      username: data.username ?? '',
      password: '',
      email: data.email ?? '',
      setor: data.setor ?? setorOptions[0].value,
      subsetor: data.subsetor ?? '',
      role: data.role ?? 'user',
      active: true,
    };
    loadedOnce.value = true;
  } catch (err) {
    console.error(err);
    error.value = err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Erro ao carregar usuário';
  } finally {
    loading.value = false;
  }
}

async function submit() {
  loading.value = true;
  try {
    const payload = { ...form.value };
    await UsersService.update(id, payload);
    successToast('Dados do usuário atualizados.');
    router.push({ name: 'UsersList' });
  } catch (err) {
    console.error(err);
    errorToast(err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Erro ao salvar usuário');
  } finally {
    loading.value = false;
  }
}


async function confirmDelete() {
  const ok = await confirmToast('Deseja excluir/desativar este usuário?', { title: 'Excluir usuário' });
  if (!ok) return;

  try {
    await UsersService.deactivate(id);
    successToast('Usuário excluído/desativado com sucesso.');
    router.push({ name: 'UsersList' });
  } catch (err) {
    console.error(err);
    errorToast(err?.response?.data?.detail || err?.message || 'Erro ao excluir usuário');
  }
}

onMounted(load);
</script>
