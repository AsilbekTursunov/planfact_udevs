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
 * @returns {Promise<Object>} Список контрагентов
 */
export const getCounterpartiesInvokeFunction = async (params = {}) => {
  const { page = 1, limit = 50 } = params
  
  return ucodeRequest({
    method: 'get_counterparties',
    data: { page, limit }
  })
}

/**
 * Получить список групп контрагентов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 * @returns {Promise<Object>} Список групп контрагентов
 */
export const getCounterpartiesGroupInvokeFunction = async (params = {}) => {
  const { page = 1, limit = 50 } = params
  
  return ucodeRequest({
    method: 'get_counterparties_group',
    data: { page, limit }
  })
}

// Экспортируем все методы как единый API объект
export const counterpartiesAPI = {
  // Методы для контрагентов
  getCounterpartiesInvokeFunction,
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

