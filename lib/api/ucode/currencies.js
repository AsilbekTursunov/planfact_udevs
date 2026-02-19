import { ucodeRequest } from './base'

/**
 * Currencies API
 * Использует универсальную обертку для работы с валютами
 */

/**
 * Получить список валют
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы (по умолчанию: 1)
 * @param {number} params.limit - Количество элементов (по умолчанию: 100)
 * @returns {Promise<Object>} Список валют
 */
export const getCurrenciesList = async (params = {}) => {
  const {
    page = 1,
    limit = 100,
    ...otherParams
  } = params

  return ucodeRequest({
    method: 'get_currencies',
    data: {
      page,
      limit,
      ...otherParams
    }
  })
}

/**
 * Получить валюту по коду
 * @param {string} code - Код валюты (например, 'RUB', 'USD', 'EUR')
 * @returns {Promise<Object>} Данные валюты
 */
export const getCurrencyByCode = async (code) => {
  if (!code) {
    throw new Error('Код валюты обязателен')
  }

  return ucodeRequest({
    method: 'get_currency_by_code',
    data: { code }
  })
}

/**
 * Получить курсы валют
 * @param {Object} params - Параметры запроса
 * @param {string} params.baseCurrency - Базовая валюта (по умолчанию: 'RUB')
 * @param {string[]} params.targetCurrencies - Целевые валюты (опционально)
 * @param {string} params.date - Дата для курса (опционально, по умолчанию текущая)
 * @returns {Promise<Object>} Курсы валют
 */
export const getExchangeRates = async (params = {}) => {
  const {
    baseCurrency = 'RUB',
    targetCurrencies,
    date,
    ...otherParams
  } = params

  return ucodeRequest({
    method: 'get_exchange_rates',
    data: {
      baseCurrency,
      ...(targetCurrencies && { targetCurrencies }),
      ...(date && { date }),
      ...otherParams
    }
  })
}

/**
 * Получить список валют через invoke_function
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы (по умолчанию: 1)
 * @param {number} params.limit - Количество элементов (по умолчанию: 100)
 * @returns {Promise<Object>} Список валют
 */
export const getCurrenciesInvokeFunction = async (params = {}) => {
  const {
    page = 1,
    limit = 100,
    ...otherParams
  } = params

  return ucodeRequest({
    method: 'get_currencies',
    data: {
      page,
      limit,
      ...otherParams
    }
  })
}

// Экспортируем все методы как единый API объект
export const currenciesAPI = {
  getList: getCurrenciesList,
  getCurrenciesInvokeFunction,
  getByCode: getCurrencyByCode,
  getExchangeRates
}

export default currenciesAPI
