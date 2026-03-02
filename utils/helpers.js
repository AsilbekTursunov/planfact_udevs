// ── Format helpers ──────────────────────────────────────────
export const formatDateRu = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const formatAmount = (v) => {
  const n = parseFloat(v)
  if (!v || isNaN(n)) return ''
  return n.toLocaleString('ru-RU')
}


export const formatPercent = (totalAmount, minAmount) => {
  const n = parseFloat(Number(minAmount) || 0)
  if (!minAmount || isNaN(n)) return ''
  return (n * Number(totalAmount) / 100).toLocaleString('ru-RU') + '%'
}