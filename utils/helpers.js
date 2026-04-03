import { toJS } from "mobx"
import { appStore } from "../store/app.store"

// ── Format helpers ──────────────────────────────────────────
export const formatDateRu = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const formatPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return '';

  const d1 = new Date(startDate);
  const d2 = new Date(endDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';

  const shortMonths = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  const d1Day = String(d1.getDate()).padStart(2, '0');
  const d2Day = String(d2.getDate()).padStart(2, '0');

  const d1Month = shortMonths[d1.getMonth()];
  const d2Month = shortMonths[d2.getMonth()];

  const d1Year = String(d1.getFullYear()).slice(-2);
  const d2Year = String(d2.getFullYear()).slice(-2);

  if (d1Year !== d2Year) {
    return `${d1Day} ${d1Month} '${d1Year} – ${d2Day} ${d2Month} '${d2Year}`;
  } else {
    return `${d1Day} ${d1Month} – ${d2Day} ${d2Month} '${d2Year}`;
  }
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


export const getCurrencyIcon = (currency) => {
  return toJS(appStore.currencies.find(c => c.guid === currency))
}

export const formatTotalSumma = (summa) => {
  if (isNaN(summa)) return ''
  const num = Number(summa).toFixed(1)
  return num.toLocaleString('ru-RU')
}


//  format number with thousand separators

export function formatNumber(value) {
  const str = String(value).trim();
  const dotIndex = str.indexOf('.');
  
  const intPart = dotIndex !== -1 ? str.slice(0, dotIndex) : str;
  const decimalPart = dotIndex !== -1 ? str.slice(dotIndex) : '';

  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return formatted + decimalPart;
}
