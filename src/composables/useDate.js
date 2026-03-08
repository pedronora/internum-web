function formatDate(dateStr, dateOnly = false) {
  if (!dateStr) return '—'

  if (dateOnly) {
    if (typeof dateStr === 'string') {
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (match) {
        const [, year, month, day] = match
        return `${day}/${month}/${year}`
      }
    }

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  const date = new Date(dateStr)
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

function toInputDate(dateValue) {
  if (!dateValue) return ''

  if (typeof dateValue === 'string') {
    const match = dateValue.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) {
      return match[1]
    }
  }

  const date = new Date(dateValue)
  if (isNaN(date.getTime())) {
    return ''
  }

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().split('T')[0]
}

export function useDate() {
  return {
    formatDate,
    toInputDate,
  }
}
