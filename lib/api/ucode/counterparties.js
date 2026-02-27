import { ucodeRequest, createCRUDMethods } from './base'

/**
 * Counterparties API
 * Использует универсальную обертку для работы с контрагентами
 */

// Создаем базовые CRUD методы для контрагентов
const counterpartyCRUD = createCRUDMethods('counterparty')

// Создаем базовые CRUD методы для групп контрагентов
const counterpartyGroupCRUD = createCRUDMethods('counterparty_group')

/**
 * Получить список контрагентов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 * @param {string} params.searchString - Строка поиска
 * @param {string} params.operationDateStart - Дата начала для расчета метрик
 * @param {string} params.operationDateEnd - Дата окончания для расчета метрик
 * @param {string} params.calculationMethod - Метод расчета (Cashflow/Accrual)
 * @returns {Promise<Object>} Список контрагентов
 */
export const getCounterpartiesInvokeFunction = async (params = {}) => {
  const { 
    page = 1, 
    limit = 50, 
    searchString,
    operationDateStart,
    operationDateEnd,
    calculationMethod = 'Cashflow',
    ...rest 
  } = params

  const defaultStartDate = operationDateStart || '2025-01-01'
  const defaultEndDate = operationDateEnd || '2026-12-31'
  
  const data = { 
    page, 
    limit,
    operationDateStart: defaultStartDate,
    operationDateEnd: defaultEndDate,
    calculationMethod,
    ...rest 
  }
  
  // Добавляем searchString только если он не пустой
  if (searchString) {
    data.searchString = searchString
  }
  
  return ucodeRequest({
    method: 'get_counterparties',
    data
  })
}

/**
 * Получить контрагента по ID
 * @param {string} guid - GUID контрагента
 * @returns {Promise<Object>} Данные контрагента
 */
export const getCounterpartyById = async (guid) => {
  return ucodeRequest({
    method: 'get_counterparty_by_id',
    data: { guid }
  })
}

/**
 * Получить список групп контрагентов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 * @param {string} params.searchString - Строка поиска
 * @returns {Promise<Object>} Список групп контрагентов
 */
export const getCounterpartiesGroupInvokeFunction = async (params = {}) => {
  const { page = 1, limit = 50, searchString = '' } = params
  
  const data = { page, limit }
  
  // Добавляем searchString только если он не пустой
  if (searchString) {
    data.searchString = searchString
  }
  
  return ucodeRequest({
    method: 'get_counterparties_group',
    data
  })
}

// Экспортируем все методы как единый API объект
export const counterpartiesAPI = {
  // Методы для контрагентов
  getCounterpartiesInvokeFunction,
  getCounterpartyById,
  getList: counterpartyCRUD.getList,
  getByGuid: counterpartyCRUD.getByGuid,
  create: counterpartyCRUD.create,
  update: counterpartyCRUD.update,
  delete: counterpartyCRUD.delete,
  
  // Методы для групп контрагентов
  getCounterpartiesGroupInvokeFunction,
  createCounterpartyGroup: counterpartyGroupCRUD.create,
  updateCounterpartyGroup: counterpartyGroupCRUD.update,
  deleteCounterpartyGroup: (guid) => counterpartyGroupCRUD.delete(guid)
}

export default counterpartiesAPI

