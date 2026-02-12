import axiosInstance from '../../axios'
import { apiConfig } from '../../config/api'

/**
 * Legal Entities API
 * Handles all legal entities related requests
 */
export const legalEntitiesAPI = {
  /**
   * Get legal entities using invoke_function endpoint with get_legal_entities method
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of items per page (default: 50)
   * @returns {Promise} API response with legal entities data
   */
  getLegalEntitiesInvokeFunction: async (params = {}) => {
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
        method: 'get_legal_entities',
        user_id: '',
        object_data: {
          page,
          limit
        }
      }
    }

    console.log('getLegalEntitiesInvokeFunction: Request data:', JSON.stringify(requestData, null, 2))

    const response = await axiosInstance.post(
      'https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact',
      requestData
    )

    console.log('getLegalEntitiesInvokeFunction: Response:', response.data)

    return response.data
  },
}
