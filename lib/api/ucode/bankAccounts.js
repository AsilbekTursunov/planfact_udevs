import axiosInstance from '../../axios'
import { apiConfig } from '../../config/api'

/**
 * Bank Accounts API
 * Handles all bank accounts related requests
 */
export const bankAccountsAPI = {
  /**
   * Get list of bank accounts items
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of items to return (default: 20)
   * @param {number} params.offset - Number of items to skip (default: 0)
   * @param {Object} params.order - Sort order
   * @param {string} params.search - Search query
   * @param {string[]} params.view_fields - Fields to include in response
   * @param {string} params.menuId - Menu ID (optional, uses default if not provided)
   * @param {string} params.viewId - View ID (optional, uses default if not provided)
   * @param {string} params.projectId - Project ID (optional, uses default from config)
   * @returns {Promise} API response
   */
  getList: async (params = {}) => {
    const {
      limit = 20,
      offset = 0,
      order = {},
      search = '',
      view_fields = [],
      menuId = apiConfig.ucode.bankAccounts.menuId,
      viewId = apiConfig.ucode.bankAccounts.viewId,
      projectId = apiConfig.ucode.projectId,
      environmentId,
      resourceId,
      ...otherParams
    } = params

    const response = await axiosInstance.post('/bank-accounts', {
      projectId,
      menuId,
      viewId,
      tableSlug: apiConfig.ucode.bankAccounts.tableSlug,
      row_view_id: viewId,
      offset,
      order,
      view_fields,
      limit,
      search,
      ...(environmentId && { 'environment-id': environmentId }),
      ...(resourceId && { 'resource-id': resourceId }),
      ...otherParams
    })
    
    return response.data
  },

  /**
   * Get bank accounts using invoke_function endpoint with get_bank_accounts method
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of items per page (default: 50)
   * @returns {Promise} API response with hierarchical data
   */
  getBankAccountsInvokeFunction: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const requestData = {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: apiConfig.ucode.appId,
        environment_id: apiConfig.ucode.environmentId,
        project_id: apiConfig.ucode.projectId,
        method: 'get_my_accounts',
        user_id: '',
        object_data: {
          page,
          limit
        }
      }
    }

    console.log('getBankAccountsInvokeFunction: Request data:', JSON.stringify(requestData, null, 2))

    const response = await fetch('https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify(requestData)
    })

    const data = await response.json()
    console.log('getBankAccountsInvokeFunction: Response:', data)

    return data
  },

  /**
   * Delete bank account (my account)
   * @param {string} guid - Account GUID
   * @returns {Promise} API response
   */
  deleteMyAccount: async (guid) => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const requestData = {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: apiConfig.ucode.appId,
        environment_id: apiConfig.ucode.environmentId,
        project_id: apiConfig.ucode.projectId,
        method: 'delete_my_account',
        user_id: '',
        object_data: {
          guid
        }
      }
    }

    const response = await fetch('https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify(requestData)
    })

    const data = await response.json()
    return data
  },
}
