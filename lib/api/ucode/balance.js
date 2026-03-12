import { ucodeRequest } from './base'

/**
 * Получить отчет баланса
 * @param {Object} params - Параметры запроса
 * @param {string[]} params.account_ids - Массив ID счетов (опционально)
 * @param {string} params.as_of - Дата на которую строится баланс (YYYY-MM-DD)
 * @param {string[]} params.contr_agent_ids - Массив ID контрагентов (опционально)
 * @param {string} params.legal_entity_id - ID юридического лица (опционально)
 * @param {string} params.user_currency_code - Код валюты (по умолчанию RUB)
 * @returns {Promise<Object>} Данные отчета баланса
 */
export async function getBalanceReport({
  account_ids = [],
  as_of = new Date().toISOString().split('T')[0], // Текущая дата по умолчанию
  contr_agent_ids = [],
  legal_entity_id = '',
  user_currency_code = 'RUB'
} = {}) {
  try {
    const response = await ucodeRequest({
      method: 'balance_report',
      data: {
        account_ids,
        as_of,
        contr_agent_ids,
        legal_entity_id,
        user_currency_code
      }
    })

    return response
  } catch (error) {
    console.error('Error fetching balance report:', error)
    throw error
  }
}

/**
 * Получить отчет баланса с фильтрами по умолчанию
 * @param {string} date - Дата на которую строится баланс (YYYY-MM-DD)
 * @returns {Promise<Object>} Данные отчета баланса
 */
export async function getBalanceReportByDate(date) {
  return getBalanceReport({
    as_of: date
  })
}