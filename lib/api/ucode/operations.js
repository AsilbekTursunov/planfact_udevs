import { ucodeRequest, createCRUDMethods } from './base'

/**
 * Operations API Service
 * Использует универсальную обертку для работы с операциями
 */

// Создаем базовые CRUD методы для операций
const baseCRUD = createCRUDMethods('operation')

/**
 * Получить список операций с фильтрацией и пагинацией
 * @param {Object} params - Параметры запроса
 * @param {Object} params.dateRange - Диапазон дат
 * @param {string} params.dateRange.startDate - Дата начала (YYYY-MM-DD)
 * @param {string} params.dateRange.endDate - Дата окончания (YYYY-MM-DD)
 * @param {number} params.page - Номер страницы (начиная с 1)
 * @param {number} params.limit - Количество элементов на странице
 * @param {Object} params.filters - Дополнительные фильтры
 * @returns {Promise<Object>} Список операций
 */
export const getOperationsList = async (params = {}) => {
  const {
    dateRange = {},
    page = 1,
    limit = 20,
    filters = {}
  } = params

  return ucodeRequest({
    method: 'find_operations',
    data: {
      date_range: {
        start_date: dateRange.startDate || '2025-01-01',
        end_date: dateRange.endDate || '2026-12-31'
      },
      page,
      limit,
      ...filters
    }
  })
}

/**
 * Экспортировать операции
 * @param {Object} params - Параметры экспорта
 * @param {string[]} params.guids - GUID операций для экспорта (опционально)
 * @param {string} params.format - Формат экспорта ('xlsx', 'csv')
 * @returns {Promise<Object>} Данные для экспорта
 */
export const exportOperations = async (params = {}) => {
  const { guids, format = 'xlsx' } = params

  return ucodeRequest({
    method: 'export_operations',
    data: {
      ...(guids && { guids }),
      format
    }
  })
}

/**
 * Получить структуру таблицы операций
 * @returns {Promise<Object>} Структура таблицы
 */
export const getOperationsTableStructure = async () => {
  return ucodeRequest({
    method: 'get_operations_table_structure',
    data: {}
  })
}

// Экспортируем все методы как единый API объект
export const operationsAPI = {
  // Базовые CRUD методы
  getList: getOperationsList,
  getByGuid: baseCRUD.getByGuid,
  getOperation: baseCRUD.getByGuid, // Alias for backward compatibility
  create: baseCRUD.create,
  update: baseCRUD.update,
  delete: baseCRUD.delete,
  
  // Специфичные методы для операций
  export: exportOperations,
  getTableStructure: getOperationsTableStructure
}

export default operationsAPI

