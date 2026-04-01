import { ucodeRequest } from './base'

/**
 * Cash Flow API
 * Использует универсальную обертку для работы с отчетами о движении денежных средств
 */

/**
 * Получить данные отчета о движении денежных средств
 * @param {Object} params - Параметры запроса
 * @param {string} params.periodStartDate - Дата начала периода (YYYY-MM-DD)
 * @param {string} params.periodEndDate - Дата окончания периода (YYYY-MM-DD)
 * @param {string} params.periodType - Тип периода (monthly, quarterly, yearly)
 * @param {string} params.currencyCode - Код валюты (RUB, USD, EUR)
 * @param {string[]} params.accountId - ID счетов (опционально)
 * @param {string[]} params.contrAgentId - ID контрагентов (опционально)
 * @param {string[]} params.legalEntityId - ID юрлиц (опционально)
 * @param {string[]} params.chartOfAccountsId - ID статей учета (опционально)
 * @param {boolean} params.includeTrendData - Включить данные трендов (опционально)
 * @param {boolean} params.isCalculation - Режим расчета (опционально)
 * @returns {Promise<Object>} Данные отчета
 */


export const getCashFlowReport = async (params = {}) => {
  const { 
    ...otherParams
  } = params

  const requestData = {
    ...otherParams
  }

  return ucodeRequest({
    method: 'cash_flow',
    data: requestData
  })
}

/**
 * Экспортировать отчет о движении денежных средств
 * @param {Object} params - Параметры экспорта
 * @param {string} params.format - Формат экспорта ('xlsx', 'csv', 'pdf')
 * @param {Object} params.reportParams - Параметры отчета (те же что и для getCashFlowReport)
 * @returns {Promise<Object>} Данные для экспорта
 */
export const exportCashFlowReport = async (params = {}) => {
  const { format = 'xlsx', reportParams = {} } = params

  return ucodeRequest({
    method: 'export_cash_flow',
    data: {
      format,
      ...reportParams
    }
  })
}

// Экспортируем все методы как единый API объект
export const cashFlowAPI = {
  getReport: getCashFlowReport,
  export: exportCashFlowReport
}

export default cashFlowAPI
