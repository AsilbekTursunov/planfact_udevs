import { ucodeRequest } from './base'

/**
 * Chart of Accounts API
 * Использует универсальную обертку для работы с планом счетов
 */

/**
 * Получить дерево плана счетов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы (по умолчанию: 1)
 * @param {number} params.limit - Количество элементов (по умолчанию: 100)
 * @param {string} params.search - Поисковый запрос (опционально)
 * @returns {Promise<Object>} Дерево плана счетов
 */
export const getChartOfAccountsInvokeFunction = async (params = {}) => {
  const {
    page = 1,
    limit = 100,
    search,
    ...otherParams
  } = params

  const requestData = {
    page,
    limit,
    ...(search && { search }),
    ...otherParams
  }

  return ucodeRequest({
    method: 'get_chart_of_accounts',
    data: requestData
  })
}

/**
 * Создать статью плана счетов
 * @param {Object} params - Параметры создания
 * @param {string} params.nazvanie - Название статьи
 * @param {string[]} params.tip - Тип статьи (массив)
 * @param {string} params.chart_of_accounts_id_2 - ID родительской статьи (опционально)
 * @param {string} params.komentariy - Комментарий (опционально)
 * @param {boolean} params.static - Статичная статья (опционально)
 * @returns {Promise<Object>} Созданная статья
 */
export const createChartOfAccount = async (params = {}) => {
  const {
    nazvanie,
    tip,
    chart_of_accounts_id_2 = '',
    komentariy = '',
    static: isStatic = false,
    ...otherParams
  } = params

  if (!nazvanie) {
    throw new Error('Название статьи обязательно')
  }
  if (!tip || !Array.isArray(tip)) {
    throw new Error('Тип статьи обязателен и должен быть массивом')
  }

  const now = new Date().toISOString()

  return ucodeRequest({
    method: 'create_chart_of_account',
    data: {
      nazvanie,
      tip,
      chart_of_accounts_id_2,
      komentariy,
      static: isStatic,
      data_sozdaniya: now,
      attributes: {},
      ...otherParams
    }
  })
}

/**
 * Обновить статью плана счетов
 * @param {Object} params - Параметры обновления
 * @param {string} params.guid - GUID статьи
 * @param {string} params.nazvanie - Название статьи
 * @param {string[]} params.tip - Тип статьи (массив)
 * @param {string} params.komentariy - Комментарий (опционально)
 * @returns {Promise<Object>} Обновленная статья
 */
export const updateChartOfAccount = async (params = {}) => {
  const {
    guid,
    nazvanie,
    tip,
    komentariy,
    ...otherParams
  } = params

  if (!guid) {
    throw new Error('GUID статьи обязателен для обновления')
  }

  const now = new Date().toISOString()

  return ucodeRequest({
    method: 'update_chart_of_account',
    data: {
      guid,
      nazvanie,
      tip,
      komentariy,
      data_obnovleniya: now,
      ...otherParams
    }
  })
}

/**
 * Удалить статью плана счетов
 * @param {Object} params - Параметры удаления
 * @param {string} params.guid - GUID статьи
 * @returns {Promise<Object>} Результат удаления
 */
export const deleteChartOfAccount = async (params = {}) => {
  const { guid } = params

  if (!guid) {
    throw new Error('GUID статьи обязателен для удаления')
  }

  return ucodeRequest({
    method: 'delete_chart_of_account',
    data: { guid }
  })
}

// Экспортируем все методы как единый API объект
export const chartOfAccountsAPI = {
  getChartOfAccountsInvokeFunction,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount
}

export default chartOfAccountsAPI
