import { ucodeRequest } from './base'

/**
 * Profit and Loss API
 * Использует универсальную обертку для работы с отчетами о прибылях и убытках
 */

/**
 * Получить отчет о прибылях и убытках
 * @param {Object} params - Параметры запроса
 * @param {string} params.periodStartDate - Дата начала (YYYY-MM-DD)
 * @param {string} params.periodEndDate - Дата окончания (YYYY-MM-DD)
 * @param {string} params.periodType - Тип периода: 'monthly', 'quarterly', 'yearly'
 * @param {string} params.currencyCode - Код валюты (например, 'RUB')
 * @param {boolean} params.isCalculation - Метод начисления (true) или кассовый метод (false)
 * @param {boolean} params.isGrossProfit - Показать валовую прибыль
 * @param {boolean} params.isOperatingProfit - Показать операционную прибыль
 * @param {boolean} params.isEbitda - Показать EBITDA
 * @param {boolean} params.isEbit - Показать EBIT
 * @param {boolean} params.isEbt - Показать EBT
 * @param {number} params.taxRatePercent - Процент налога (опционально)
 * @param {number} params.reportGenMethod - Метод генерации отчета (по умолчанию: 0)
 * @param {boolean} params.includeTrendData - Включить данные трендов (по умолчанию: true)
 * @param {string} params.aggregationMode - Режим агрегации (по умолчанию: 'autoAggregate')
 * @param {string[]} params.accountId - Фильтр по ID счетов
 * @param {string[]} params.contrAgentId - Фильтр по ID контрагентов
 * @param {string[]} params.projectId - Фильтр по ID проектов
 * @param {string[]} params.sellingDealId - Фильтр по ID сделок продажи
 * @param {string[]} params.purchaseDealId - Фильтр по ID сделок покупки
 * @param {string[]} params.legalEntityId - Фильтр по ID юрлиц
 * @returns {Promise<Object>} Данные отчета
 */
export const getProfitAndLoss = async (params = {}) => {
  const {
    periodStartDate,
    periodEndDate,
    periodType = 'monthly',
    currencyCode = 'RUB',
    isCalculation = true,
    isGrossProfit = false,
    isOperatingProfit = false,
    isEbitda = false,
    isEbit = false,
    isEbt = false,
    taxRatePercent,
    reportGenMethod = 0,
    includeTrendData = true,
    aggregationMode = 'autoAggregate',
    accountId = [],
    contrAgentId = [],
    projectId = [],
    sellingDealId = [],
    purchaseDealId = [],
    legalEntityId = [],
    ...otherParams
  } = params

  const requestData = {
    periodStartDate,
    periodEndDate,
    periodType,
    currencyCode,
    isCalculation,
    isGrossProfit,
    isOperatingProfit,
    isEbitda,
    isEbit,
    isEbt,
    reportGenMethod,
    includeTrendData,
    aggregationMode,
    accountId,
    contrAgentId,
    projectId,
    sellingDealId,
    purchaseDealId,
    legalEntityId,
    ...otherParams
  }

  // Добавляем taxRatePercent только если указан
  if (taxRatePercent !== undefined && taxRatePercent !== null) {
    requestData.taxRatePercent = taxRatePercent
  }

  return ucodeRequest({
    method: 'profit_and_loss',
    data: requestData
  })
}

/**
 * Экспортировать отчет о прибылях и убытках
 * @param {Object} params - Параметры экспорта
 * @param {string} params.format - Формат экспорта ('xlsx', 'csv', 'pdf')
 * @param {Object} params.reportParams - Параметры отчета (те же что и для getProfitAndLoss)
 * @returns {Promise<Object>} Данные для экспорта
 */
export const exportProfitAndLoss = async (params = {}) => {
  const { format = 'xlsx', reportParams = {} } = params

  return ucodeRequest({
    method: 'export_profit_and_loss',
    data: {
      format,
      ...reportParams
    }
  })
}

// Экспортируем все методы как единый API объект
export const profitAndLossAPI = {
  getProfitAndLoss,
  export: exportProfitAndLoss
}

export default profitAndLossAPI
