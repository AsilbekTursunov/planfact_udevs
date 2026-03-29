// ── Format helpers ──────────────────────────────────────────
export const formatDateRu = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const formatAmount = (v) => {
  if (v === null || v === undefined || v === '') return '0'
  const raw = String(v).replace(/\s/g, '').replace(/[^0-9.-]/g, '');
  const num = parseFloat(raw);
  if (isNaN(num)) return '0'
  return num.toLocaleString('ru-RU')
}


export const formatPercent = (totalAmount, minAmount) => {

  const n = parseFloat(Number(minAmount) || 0)
  if (!minAmount || isNaN(n)) return ''
  return (Number(totalAmount) * Number(minAmount) / 100).toLocaleString('ru-RU') + '%'
}

export const handlePercentBackspace = (e, currentValue, onChange) => {
  if (e.key === 'Backspace') {
    e.preventDefault();
    const val = String(currentValue || '');
    onChange(val.slice(0, -1));
  }
}

export const formatAmountWithPercent = (v) => {
  if (!v) return ''
  const raw = v?.replace(/%/g, '')?.replace(/\D/g, '')?.slice(0, 2);
  const n = parseFloat(raw);
  if (!v || isNaN(n)) return ''
  return n.toLocaleString('ru-RU')
}

export const calculatePercent = (totalAmount, minAmount) => {
  const total = parseFloat(Number(totalAmount) || 0)
  const received = parseFloat(Number(minAmount) || 0)

  if (total === 0) return '0%'
  const percent = (received / total) * 100
  return Math.round(percent) + '%'
}


export const returnNumber = (text) => {
  if (!text) return ''
  const raw = String(text).replace(/\s/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(raw);
  if (isNaN(num)) return ''
  return (num || '').toLocaleString('ru-RU')
}



export const StringtoNumber = (text) => {
  if (!text) return ''
  const raw = String(text).replace(/\s/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(raw);
  if (isNaN(num)) return ''
  return num
}
