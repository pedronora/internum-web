export const PERMISSIONS = {
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_READ_SENSITIVE: 'users:read_sensitive',
  USERS_EDIT_PROFILE: 'users:edit_profile',
  USERS_EDIT_EMPLOYMENT: 'users:edit_employment',
  USERS_EDIT_SALARY: 'users:edit_salary',
  USERS_ASSIGN_ROLES: 'users:assign_roles',
  USERS_CHANGE_PASSWORD: 'users:change_password',
  LEGAL_BRIEFS_MANAGE: 'legal_briefs:manage',
  NOTICES_MANAGE: 'notices:manage',
  LIBRARY_MANAGE: 'library:manage',
  VACATION_READ_ALL: 'vacation:read_all',
  VACATION_MANAGE_ALL: 'vacation:manage_all',
  VACATION_CONFIRM_FRUITION: 'vacation:confirm_fruition',
}

export const UNIDADE_OPTIONS = [
  { value: 'direcao', label: 'Direção' },
  { value: 'registro', label: 'Registro' },
  { value: 'gestao', label: 'Gestão' },
]

// `subunidade` é texto livre. A lista serve apenas como sugestão de cadastro.
export const SUBUNIDADES_SUGERIDAS = [
  'Atendimento',
  'Digitalização',
  'Pessoas',
  'Financeiro',
  'Compras/Patrimônio',
  'TI',
]

export const ROLE_OPTIONS = [
  {
    value: 'oficial',
    label: 'Oficial',
    description:
      'Conta única, criada pelo seed. Atribui todos os perfis, exceto oficial, e troca a senha de qualquer usuário.',
  },
  {
    value: 'suboficial',
    label: 'Suboficial',
    description:
      'Atribui coordenação, gestão e colaboradores. Não atribui oficial nem suboficial e não troca a senha de terceiros.',
  },
  {
    value: 'coord_registro',
    label: 'Coordenador de Registro',
    description: 'Cria usuários sem perfil e gerencia a área de Registro.',
  },
  {
    value: 'coord_gestao',
    label: 'Coordenador de Gestão',
    description: 'Cria usuários sem perfil e gerencia a área de Gestão.',
  },
  {
    value: 'gestor_pessoas',
    label: 'Gestor de Pessoas',
    description: 'Cria usuários sem perfil, gerencia pessoas e edita salários.',
  },
  {
    value: 'colaborador_registro',
    label: 'Colaborador de Registro',
    description: 'Acesso de consulta ao diretório e aos dados do Registro.',
  },
  {
    value: 'colaborador_gestao',
    label: 'Colaborador de Gestão',
    description: 'Acesso de consulta ao diretório e aos dados da Gestão.',
  },
]

const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map((option) => [option.value, option.label]),
)

const ROLE_COLORS = {
  oficial: 'dark',
  suboficial: 'dark',
  coord_registro: 'info',
  coord_gestao: 'info',
  gestor_pessoas: 'warning',
  colaborador_registro: 'success',
  colaborador_gestao: 'success',
}

const ALL_ROLES = ROLE_OPTIONS.map((option) => option.value)

const ASSIGNABLE_ROLES = {
  oficial: ALL_ROLES.filter((role) => role !== 'oficial'),
  suboficial: ALL_ROLES.filter(
    (role) => role !== 'oficial' && role !== 'suboficial',
  ),
}

export function unidadeLabel(value) {
  return (
    UNIDADE_OPTIONS.find((option) => option.value === value)?.label || value
  )
}

export function roleLabel(value) {
  return ROLE_LABELS[value] || value
}

export function roleDescription(value) {
  return (
    ROLE_OPTIONS.find((option) => option.value === value)?.description || ''
  )
}

export function roleColor(value) {
  return ROLE_COLORS[value] || 'slate'
}

/** Conta do oficial só pode ser gerida pelo próprio oficial. */
export function isProtectedOficial(target, currentUserId) {
  return (
    Boolean(target?.roles?.includes('oficial')) &&
    String(target?.id) !== String(currentUserId)
  )
}

/** Perfis que o ator pode conceder/remover, conforme a hierarquia do backend. */
export function assignableRoles(actorRoles = []) {
  const allowed = new Set()
  for (const role of actorRoles) {
    ;(ASSIGNABLE_ROLES[role] || []).forEach((item) => allowed.add(item))
  }
  return ROLE_OPTIONS.filter((option) => allowed.has(option.value))
}
