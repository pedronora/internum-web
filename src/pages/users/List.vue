<template>
    <div class="container mt-4">
        <h1 class="mb-4">Usuários</h1>

        <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 border rounded bg-body border-secondary border-opacity-25">
            <div class="mb-3 mb-md-0">
                <label class="d-flex align-items-center gap-2 text-nowrap text-body">
                    Mostrar
                    <select class="form-select form-select-sm w-auto" v-model.number="limit" @change="reload">
                        <option :value="5">5</option>
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                    </select>
                    por página
                </label>
            </div>

            <div class="d-flex gap-2 w-50 w-md-auto">
                <input class="form-control flex-grow-1" v-model="q" @keyup.enter="reload" placeholder="Pesquisar..." />
                <button class="btn btn-outline-primary text-nowrap" @click="reload">
                    <i class="bi bi-search me-1"></i> Buscar
                </button>
            </div>
        </div>

        <div v-if="loading" class="alert alert-info text-center" role="alert">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            Carregando...
        </div>

        <div v-else>
            <div v-if="!error" class="table-responsive shadow-sm rounded mb-4">
                <table class="table table-striped table-hover align-middle mb-0" v-if="users.length">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Username</th>
                            <th scope="col">Email</th>
                            <th scope="col">Setor</th>
                            <th scope="col">Perfil</th>
                            <th scope="col">Criado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in users" :key="u.id">
                            <td>{{ u.id }}</td>
                            <td>{{ u.name }}</td>
                            <td>{{ u.username }}</td>
                            <td>{{ u.email }}</td>
                            <td>
                                <span class="badge bg-secondary">{{ u.setor }}</span>
                            </td>
                            <td>
                                <span :class="['badge', {
                                    'bg-primary': u.role === 'admin',
                                    'bg-info': u.role === 'Coord',
                                    'bg-success': u.role === 'user'
                                }]">
                                    {{
                                        u.role === 'admin' ? 'Admin' :
                                            u.role === 'Coord' ? 'Coordenador' :
                                                'Geral'
                                    }}
                                </span>
                            </td>
                            <td>{{ formatDate(u.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="alert alert-warning text-center m-2" role="alert">
                    Nenhum usuário encontrado.
                </div>
            </div>



            <div class="d-flex justify-content-between align-items-center" v-if="meta.total !== null && totalPages > 1">
                <span class="text-muted">Página {{ page }} de {{ totalPages }}</span>

                <div class="btn-group" role="group" aria-label="Controles de Paginação">
                    <button type="button" class="btn btn-outline-secondary" :disabled="page === 1" @click="prev">
                        &laquo; Anterior
                    </button>
                    <button type="button" class="btn btn-outline-secondary" :disabled="page >= totalPages"
                        @click="next">
                        Próxima &raquo;
                    </button>
                </div>
            </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-4" role="alert">
            <strong>Erro:</strong> {{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const page = ref(1);
const limit = ref(10);
const q = ref("");

const meta = ref({
    total: null,
    offset: 0,
    limit: 10,
});

const totalPages = computed(() => {
    if (!meta.value.total) return 1;
    return Math.max(1, Math.ceil(meta.value.total / meta.value.limit));
});

function formatDate(dt) {
    if (!dt) return "-";
    try {
        return new Date(dt).toLocaleString();
    } catch {
        return dt;
    }
}

async function load() {
    loading.value = true;
    error.value = null;

    const offset = (page.value - 1) * limit.value;

    try {
        const res = await api.get("/api/v1/users/", {
            params: { offset, limit: limit.value, q: q.value || undefined },
        });

        const data = res.data;

        if (Array.isArray(data)) {
            users.value = data;
            meta.value = { total: data.length, offset, limit: limit.value };
        } else if (data && data.users) {
            users.value = data.users;
            meta.value = {
                total: data.meta?.total ?? (data.users.length + offset),
                offset: data.meta?.offset ?? offset,
                limit: data.meta?.limit ?? limit.value,
            };
        } else {
            users.value = data?.users ?? [];
            meta.value = { total: users.value.length, offset, limit: limit.value };
        }
    } catch (err) {
        console.error("Erro carregando usuários", err);
        error.value =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Erro desconhecido";
    } finally {
        loading.value = false;
    }
}

function reload() {
    page.value = 1;
    load();
}

function next() {
    if (page.value < totalPages.value) {
        page.value++;
        load();
    }
}
function prev() {
    if (page.value > 1) {
        page.value--;
        load();
    }
}

onMounted(() => {
    load();
});
</script>