/**
 * Константы для работы с операциями
 */

// Типы операций
export const OPERATION_TYPES = {
  INCOME: 'Поступление',
  PAYMENT: 'Выплата',
  TRANSFER: 'Перемещение',
  ACCRUAL: 'Начисление',
  CANCELLATION: 'Отмена',
  DELIVERY: 'Поставка'
}

// Маппинг типов для UI
export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.INCOME]: 'Поступление',
  [OPERATION_TYPES.PAYMENT]: 'Выплата',
  [OPERATION_TYPES.TRANSFER]: 'Перемещение',
  [OPERATION_TYPES.ACCRUAL]: 'Начисление',
  [OPERATION_TYPES.CANCELLATION]: 'Отмена',
  [OPERATION_TYPES.DELIVERY]: 'Поставка'
}

// Категории типов для стилизации
export const OPERATION_TYPE_CATEGORIES = {
  [OPERATION_TYPES.INCOME]: 'in',
  [OPERATION_TYPES.PAYMENT]: 'out',
  [OPERATION_TYPES.TRANSFER]: 'transfer',
  [OPERATION_TYPES.ACCRUAL]: 'transfer',
  [OPERATION_TYPES.CANCELLATION]: 'out',
  [OPERATION_TYPES.DELIVERY]: 'out'
}

// Статусы подтверждения
export const CONFIRMATION_STATUS = {
  CONFIRMED: true,
  NOT_CONFIRMED: false
}

// Секции для группировки операций по датам
export const DATE_SECTIONS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  OLDER: 'older'
}

// Названия секций
export const DATE_SECTION_LABELS = {
  [DATE_SECTIONS.TODAY]: 'Сегодня',
  [DATE_SECTIONS.YESTERDAY]: 'Вчера и ранее',
  [DATE_SECTIONS.OLDER]: 'Ранее'
}

// Форматы экспорта
export const EXPORT_FORMATS = {
  XLSX: 'xlsx',
  CSV: 'csv'
}

// Лимиты пагинации
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
  SCROLL_THRESHOLD: 10 // px до конца для загрузки следующей страницы
}

// Названия месяцев для форматирования дат
export const MONTH_NAMES_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
]

// Дефолтный диапазон дат (текущий год)
export const getDefaultDateRange = () => {
  const now = new Date()
  const year = now.getFullYear()
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  }
}

// Фиксированный диапазон дат для операций (2025-2026)
export const OPERATIONS_DATE_RANGE = {
  START_DATE: '2025-01-01',
  END_DATE: '2026-12-31'
}
