<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Usuário</h1>
      <div>
        <router-link
          :to="{ name: 'UsersList' }"
          class="btn btn-outline-secondary me-2"
          >Cancelar</router-link
        >
        <router-link
          :to="{ name: 'UsersEdit', params: { id } }"
          class="btn btn-outline-primary me-2"
          >Editar</router-link
        >
        <button class="btn btn-danger" @click="confirmDelete">Excluir</button>
      </div>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="user" class="card shadow-sm p-3">
      <dl class="row mb-0">
        <dt class="col-sm-3">ID</dt>
        <dd class="col-sm-9">{{ user.id }}</dd>

        <dt class="col-sm-3">Nome</dt>
        <dd class="col-sm-9">{{ user.name }}</dd>

        <dt class="col-sm-3">Username</dt>
        <dd class="col-sm-9">{{ user.username }}</dd>

        <dt class="col-sm-3">Email</dt>
        <dd class="col-sm-9">{{ user.email }}</dd>

        <dt class="col-sm-3">Data de Aniversário</dt>
        <dd class="col-sm-9">{{ formatDate(user.birthday, true) }}</dd>
        <dt class="col-sm-3">Setor</dt>
        <dd class="col-sm-9">
          <span class="badge bg-secondary">{{ user.setor }}</span>
        </dd>

        <dt class="col-sm-3">Subsetor</dt>
        <dd class="col-sm-9">{{ user.subsetor }}</dd>

        <dt class="col-sm-3">Perfil</dt>
        <dd class="col-sm-9">
          <span :class="['badge', roleClass(user.role)]">
            {{ roleLabel(user.role) }}
          </span>
        </dd>

        <dt class="col-sm-3">Ativo</dt>
        <dd class="col-sm-9">{{ user.active ? 'Sim' : 'Não' }}</dd>

        <dt class="col-sm-3">Criado em</dt>
        <dd class="col-sm-9">{{ formatDate(user.created_at) }}</dd>

        <dt class="col-sm-3">Atualizado em</dt>
        <dd class="col-sm-9">{{ formatDate(user.updated_at) }}</dd>
      </dl>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UsersService } from '@/services/users.services'
  import {
    confirm as confirmToast,
    error as errorToast,
    success as successToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'

  const route = useRoute()
  const router = useRouter()
  const { formatDate } = useDate()
  const id = route.params.id

  const loading = ref(false)
  const user = ref(null)
  const error = ref(null)

  function roleLabel(role) {
    return role === 'admin'
      ? 'Admin'
      : role === 'coord'
        ? 'Coordenador'
        : 'Geral'
  }
  function roleClass(role) {
    return {
      'bg-primary': role === 'admin',
      'bg-info': role === 'coord',
      'bg-success': role === 'user',
    }
  }

  async function load() {
    loading.value = true
    try {
      user.value = await UsersService.getById(id)
    } catch (err) {
      console.error(err)
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro ao carregar usuário'
      errorToast(msg)
    } finally {
      loading.value = false
    }
  }

  async function confirmDelete() {
    const ok = await confirmToast('Deseja excluir/desativar este usuário?', {
      title: 'Excluir usuário',
    })
    if (!ok) return

    try {
      await UsersService.deactivate(id)
      successToast('Usuário excluído/desativado com sucesso.')
      router.push({ name: 'UsersList' })
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.message ||
          'Erro ao excluir usuário',
      )
    }
  }

  onMounted(load)
</script>
