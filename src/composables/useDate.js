function formatDate(dateStr, dateOnly = false) {
  if (!dateStr) return '—'
  if (dateOnly) {
    const datePart = dateStr.split('T')[0]
    const parts = datePart.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return datePart
  }

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
