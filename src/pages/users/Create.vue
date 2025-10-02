<template>
    <div class="container mt-4">
        <h1 class="mb-4">Criar Usuário</h1>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="submit" class="card shadow-sm p-3">
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

                <div class="col-md-6">
                    <label class="form-label">Senha</label>
                    <div class="input-group">
                        <input v-model="form.password" :type="showPassword1 ? 'text' : 'password'" required
                            class="form-control" autocomplete="current-password" />
                        <button type="button" @click="showPassword1 = !showPassword1" class="btn btn-outline-secondary"
                            :aria-pressed="showPassword1.toString()"
                            :title="showPassword1 ? 'Ocultar senha' : 'Mostrar senha'"><i
                                :class="showPassword1 ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                aria-hidden="true"></i></button>
                    </div>
                    <small class="text-muted">A senha requer 8-64 caracteres, com maiúscula, minúscula, número e
                        caractere especial.</small>

                </div>

                <div class="col-md-6">
                    <label class="form-label">Confirmação de senha</label>
                    <div class="input-group">
                        <input v-model="form.password_confirm" :type="showPassword2 ? 'text' : 'password'" required
                            class="form-control" autocomplete="current-password" />
                        <button type="button" @click="showPassword2 = !showPassword2" class="btn btn-outline-secondary"
                            :aria-pressed="showPassword2.toString()"
                            :title="showPassword2 ? 'Ocultar senha' : 'Mostrar senha'"><i
                                :class="showPassword2 ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                aria-hidden="true"></i></button>
                    </div>
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

                <div class="col-12 d-flex gap-2 justify-content-end">
                    <router-link to="/users" class="btn btn-outline-secondary">Cancelar</router-link>
                    <button class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"
                            aria-hidden="true"></span>
                        Criar
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UsersService } from '@/services/users.services';
import { success as successToast, error as errorToast } from '@/composables/useToast';
import * as yup from 'yup';

const router = useRouter();

const loading = ref(false);
const error = ref(null);
const showPassword1 = ref(false)
const showPassword2 = ref(false)

const setorOptions = [
    { value: 'registro', label: 'Registro' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'oficial', label: 'Oficial' },
];

const subsetorOptions = {
    'registro': [
        { value: 'analise', label: 'Análise' },
        { value: 'conferencia', label: 'Conferência' },
        { value: 'finalizacao_impressao', label: 'Finalização/Impressão' },
        { value: 'busca_certidao', label: 'Busca e Certidão' },
        { value: 'arquivo', label: 'Arquivo' },
    ],
    'administrativo': [
        { value: 'atendimento', label: 'Atendimento' },
        { value: 'digitalizacao', label: 'Digitalização' },
        { value: 'apoio', label: 'Apoio' },
    ],
    'oficial': [
        { value: 'titular', label: 'Titular' },
        { value: 'substituto', label: 'Substituto' },
    ],
};

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'Coord', label: 'Coordenador' },
    { value: 'user', label: 'Geral' },
];

const validationSchema = yup.object({
    name: yup
        .string()
        .required('O nome é obrigatório')
        .min(4, 'O nome deve ter pelo menos 4 caracteres'),

    username: yup
        .string()
        .required('O username é obrigatório')
        .matches(/^[a-zA-Z0-9_]+$/, 'O username só pode conter letras, números e underscore')
        .min(4, 'O username deve ter pelo menos 4 caracteres'),

    email: yup
        .string()
        .email('O email deve ser um email válido')
        .required('O email é obrigatório'),

    password: yup
        .string()
        .required('A senha é obrigatória')
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .max(64, 'A senha deve ter no máximo 64 caracteres')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
            'A senha requer 8-64 caracteres, com maiúscula, minúscula, número e caractere especial'
        ),

    password_confirm: yup
        .string()
        .required('A confirmação de senha é obrigatória')
        .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),

    setor: yup
        .string()
        .required('O setor é obrigatório'),

    subsetor: yup
        .string()
        .when('setor', {
            is: (setor) => setor && setor.length > 0,
            then: (schema) => schema.required('O subsetor é obrigatório'),
            otherwise: (schema) => schema.notRequired(),
        }),

    role: yup
        .string()
        .required('O perfil é obrigatório')
});

const form = ref({
    name: '',
    username: '',
    password: '',
    password_confirm: '',
    email: '',
    setor: '',
    subsetor: '',
    role: 'user',
    active: true,
});

async function submit() {
    error.value = null;

    try {
        await validationSchema.validate(form.value, { abortEarly: false });
    } catch (validationError) {
        if (validationError.inner && validationError.inner.length) {
            validationError.inner.forEach(e => errorToast(e.message));
            return;
        }
        error(validationError.message);
        return;
    }

    loading.value = true;
    try {
        const payload = { ...form.value };
        await UsersService.create(payload);
        successToast('Usuário criado com sucesso.');
        router.push({ name: 'UsersList' });
    } catch (err) {
        console.error(err);
        errorToast(err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Erro ao criar usuário');
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.input-group .btn-outline-secondary {
    border: 1px solid var(--bs-border-color);
    border-left: 0;
}
</style>
