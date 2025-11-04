function formatDate(dateStr) {
  if (!dateStr) return '—'

  const isoDateStr = dateStr.trim().replace(' ', 'T') + 'Z'
  const date = new Date(isoDateStr)

  if (isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function useDate() {
  return {
    formatDate,
  }
}
