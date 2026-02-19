import axios from 'axios'
import { apiConfig } from '../../config/api'

/**
 * Profit and Loss API
 * Handles P&L report requests
 */
export const profitAndLossAPI = {
  /**
   * Get Profit and Loss report using invoke_function
   * Method: profit_and_loss
   *
   * @param {Object} params - Request parameters
   * @param {string} params.periodStartDate - Start date (YYYY-MM-DD)
   * @param {string} params.periodEndDate - End date (YYYY-MM-DD)
   * @param {string} params.periodType - Period type: 'monthly', 'quarterly', 'yearly'
   * @param {string} params.currencyCode - Currency code (e.g., 'RUB')
   * @param {boolean} params.isCalculation - Accrual method (true) or Cash method (false)
   * @param {boolean} params.isGrossProfit - Show gross profit rows
   * @param {boolean} params.isOperatingProfit - Show operating profit rows
   * @param {boolean} params.isEbitda - Show EBITDA rows
   * @param {boolean} params.isEbit - Show EBIT rows
   * @param {boolean} params.isEbt - Show EBT rows
   * @param {number} params.taxRatePercent - Tax rate percentage (optional)
   * @param {number} params.reportGenMethod - Report generation method (default: 0)
   * @param {boolean} params.includeTrendData - Include trend data (default: true)
   * @param {string} params.aggregationMode - Aggregation mode (default: 'autoAggregate')
   * @param {string[]} params.accountId - Filter by account IDs
   * @param {string[]} params.contrAgentId - Filter by counterparty IDs
   * @param {string[]} params.projectId - Filter by project IDs
   * @param {string[]} params.sellingDealId - Filter by selling deal IDs
   * @param {string[]} params.purchaseDealId - Filter by purchase deal IDs
   * @param {string[]} params.legalEntityId - Filter by legal entity IDs
   */
  getProfitAndLoss: async (params = {}) => {
    const {
      periodStartDate,
      periodEndDate,
      periodType = 'monthly',
      currencyCode = 'RUB',
      isCalculation = true,
      isGrossProfit = false,
      isOperatingProfit = true,
      isEbitda = true,
      isEbit = true,
      isEbt = true,
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
      user_id = '',
      app_id,
      environment_id,
      project_id,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const objectData = {
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
    }

    // Add taxRatePercent only if provided
    if (taxRatePercent !== undefined && taxRatePercent !== null) {
      objectData.taxRatePercent = taxRatePercent
    }

    const requestBody = {
      auth: {
        type: 'apikey',
        data: {},
      },
      data: {
        app_id: app_id ?? apiConfig.ucode.appId ?? apiConfig.ucode.projectId,
        environment_id: environment_id ?? apiConfig.ucode['environment-id'],
        project_id: project_id ?? apiConfig.ucode.projectId,
        method: 'profit_and_loss',
        user_id,
        object_data: objectData,
      },
    }

    console.log('🔵 P&L API Request Body:', JSON.stringify(requestBody, null, 2))

    const url = `${apiConfig.ucode.baseURL}/v2/invoke_function/planfact-plan-fact`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })

    console.log('🟢 P&L API Response:', JSON.stringify(response.data, null, 2))

    return response.data
  },
}

/**
 * Legacy function for backward compatibility
 */
export const getProfitAndLoss = profitAndLossAPI.getProfitAndLoss
