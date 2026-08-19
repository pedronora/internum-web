import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const REQUEST_STATUS = {
  draft: { label: 'Rascunho', color: 'slate' },
  submitted: { label: 'Enviado', color: 'info' },
  under_review: { label: 'Em Análise', color: 'warning' },
  approved: { label: 'Aprovado', color: 'success' },
  rejected: { label: 'Rejeitado', color: 'danger' },
  cancelled: { label: 'Cancelado', color: 'dark' },
}

export const ACCRUAL_STATUS = {
  acquisitive: { label: 'Em aquisição', color: 'info' },
  concessive: { label: 'Período concessivo', color: 'success' },
  expired: { label: 'Vencido', color: 'danger' },
  closed: { label: 'Regularizado', color: 'slate' },
}

export const GRANT_STATUS = {
  granted: { label: 'Aprovado (reservado)', color: 'info' },
  in_progress: { label: 'Em gozo', color: 'warning' },
  fruited: { label: 'Fruído', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'dark' },
  paid_double: { label: 'Pago em dobro', color: 'danger' },
}

export const GRANT_TYPE = {
  normal: 'Gozo normal',
  retroactive: 'Gozo retroativo',
  double_payment: 'Pagamento em dobro',
}

export const ACCRUAL_STATUS_ORDER = [
  'acquisitive',
  'concessive',
  'expired',
  'closed',
]

export function useVacation() {
  const authStore = useAuthStore()

  const isAdminOrCoord = computed(() => authStore.isAdminOrCoord)
  const isAdmin = computed(() => authStore.isAdmin)

  const isManager = isAdminOrCoord

  function requestStatus(status) {
    return REQUEST_STATUS[status] || { label: status, color: 'slate' }
  }

  function accrualStatus(status) {
    return ACCRUAL_STATUS[status] || { label: status, color: 'slate' }
  }

  function grantStatus(status) {
    return GRANT_STATUS[status] || { label: status, color: 'slate' }
  }

  function grantTypeLabel(type) {
    return GRANT_TYPE[type] || type
  }

  /** Períodos visíveis: para usuário comum, vencidos ficam ocultos. */
  function visiblePeriods(periods) {
    if (!periods) return []
    return periods.filter((p) => isManager.value || p.status !== 'expired')
  }

  /** Concessões visíveis: usuário comum vê apenas gozo normal. */
  function visibleGrants(grants) {
    if (!grants) return []
    return grants.filter((g) => isManager.value || g.grant_type === 'normal')
  }

  /**
   * Contadores de um período conforme o papel.
   * Durante a fase aquisitiva nenhum número de dias é exposto
   * (a API calcula dias proporcionais que só devem aparecer quando o
   * período estiver completo).
   */
  function periodCounters(period) {
    if (!period) return {}
    const isAcquisitive = period.status === 'acquisitive'
    const counters = {
      isAcquisitive,
      earned: isAcquisitive ? null : period.days_earned,
      reserved: isAcquisitive ? null : period.days_reserved,
      enjoyed: isAcquisitive ? null : period.days_enjoyed,
      available: isAcquisitive ? null : period.available_days,
    }
    if (isManager.value) {
      counters.sold = period.days_sold
      counters.doublePaid = period.days_double_paid
      counters.isDoubleEligible = period.is_double_eligible
    }
    return counters
  }

  /** Percentual decorrido do período aquisitivo (orientado por data). */
  function acquisitiveProgress(period) {
    if (!period?.acquisitive_start || !period?.acquisitive_end) return 0
    const start = new Date(period.acquisitive_start + 'T00:00:00')
    const end = new Date(period.acquisitive_end + 'T00:00:00')
    const now = new Date()
    const total = end - start
    if (total <= 0) return 0
    const elapsed = Math.min(Math.max(now - start, 0), total)
    return Math.round((elapsed / total) * 100)
  }

  /** Períodos onde o usuário ainda pode solicitar férias. */
  function requestablePeriods(periods) {
    if (!periods) return []
    return periods.filter(
      (p) => p.status === 'concessive' && p.available_days > 0,
    )
  }

  return {
    isAdminOrCoord,
    isAdmin,
    isManager,
    requestStatus,
    accrualStatus,
    grantStatus,
    grantTypeLabel,
    visiblePeriods,
    visibleGrants,
    periodCounters,
    acquisitiveProgress,
    requestablePeriods,
  }
}
