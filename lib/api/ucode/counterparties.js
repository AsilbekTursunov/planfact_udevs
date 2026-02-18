import axiosInstance from '../../axios'
import { apiConfig } from '../../config/api'

/**
 * Counterparties API
 * Handles all counterparties related requests
 */
export const counterpartiesAPI = {
  /**
   * Get counterparties using invoke_function endpoint with get_counterparties method
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of items per page (default: 50)
   * @returns {Promise} API response with counterparties data
   */
  getCounterpartiesInvokeFunction: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
    } = params

    const requestData = {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: apiConfig.ucode.appId,
        environment_id: apiConfig.ucode.environmentId,
        project_id: apiConfig.ucode.projectId,
        method: 'get_counterparties',
        user_id: '',
        object_data: {
          page,
          limit
        }
      }
    }
 

    const response = await axiosInstance.post(
      'https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact',
      requestData
    )

    console.log('getCounterpartiesInvokeFunction: Response:', response.data)

    return response.data
  },

  /**
   * Get counterparties groups using invoke_function endpoint with get_counterparties_group method
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of items per page (default: 50)
   * @returns {Promise} API response with counterparties groups data
   */
  getCounterpartiesGroupInvokeFunction: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
    } = params

    const requestData = {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: apiConfig.ucode.appId,
        environment_id: apiConfig.ucode.environmentId,
        project_id: apiConfig.ucode.projectId,
        method: 'get_counterparties_group',
        user_id: '',
        object_data: {
          page,
          limit
        }
      }
    }

    console.log('getCounterpartiesGroupInvokeFunction: Request data:', JSON.stringify(requestData, null, 2))

    const response = await axiosInstance.post(
      'https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact',
      requestData
    )

    console.log('getCounterpartiesGroupInvokeFunction: Response:', response.data)

    return response.data
  },
}
