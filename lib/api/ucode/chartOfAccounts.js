import axios from 'axios'
import { apiConfig } from '../../config/api'

/**
 * Chart of Accounts API
 * Handles all chart of accounts related requests
 */
export const chartOfAccountsAPI = {
  /**
   * Get chart of accounts tree using invoke_function (planfact-plan-fact)
   * Method: get_chart_of_accounts
   *
   * Request body format:
   * {
   *   auth: { type: 'apikey', data: {} },
   *   data: {
   *     app_id, environment_id, project_id,
   *     method: 'get_chart_of_accounts',
   *     user_id,
   *     object_data: { page, limit }
   *   }
   * }
   */
  getChartOfAccountsInvokeFunction: async (params = {}) => {
    const {
      page = 1,
      limit = 100,
      search,
      user_id = '',
      app_id,
      environment_id,
      project_id,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const objectData = {
      page,
      limit,
    }

    // Add search parameter only if provided
    if (search) {
      objectData.search = search
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
        method: 'get_chart_of_accounts',
        user_id,
        object_data: objectData,
      },
    }

    const url = `${apiConfig.ucode.baseURL}/v2/invoke_function/planfact-plan-fact`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
    })

    return response.data
  },

  /**
   * Create chart of account using invoke_function
   * Method: create_chart_of_account
   */
  createChartOfAccount: async (params = {}) => {
    const {
      nazvanie,
      tip,
      chart_of_accounts_id_2 = '',
      komentariy = '',
      static: isStatic = false,
      user_id = '',
      app_id,
      environment_id,
      project_id,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const requestBody = {
      auth: {
        type: 'apikey',
        data: {},
      },
      data: {
        app_id: app_id ?? apiConfig.ucode.appId ?? apiConfig.ucode.projectId,
        environment_id: environment_id ?? apiConfig.ucode['environment-id'],
        project_id: project_id ?? apiConfig.ucode.projectId,
        method: 'create_chart_of_account',
        user_id,
        object_data: {
          nazvanie,
          tip,
          chart_of_accounts_id_2,
          komentariy,
          static: isStatic,
        },
      },
    }

    const url = `${apiConfig.ucode.baseURL}/v2/invoke_function/planfact-plan-fact`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
    })

    return response.data
  },

  /**
   * Update chart of account using invoke_function
   * Method: update_chart_of_account
   */
  updateChartOfAccount: async (params = {}) => {
    const {
      guid,
      nazvanie,
      tip,
      komentariy,
      user_id = '',
      app_id,
      environment_id,
      project_id,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const requestBody = {
      auth: {
        type: 'apikey',
        data: {},
      },
      data: {
        app_id: app_id ?? apiConfig.ucode.appId ?? apiConfig.ucode.projectId,
        environment_id: environment_id ?? apiConfig.ucode['environment-id'],
        project_id: project_id ?? apiConfig.ucode.projectId,
        method: 'update_chart_of_account',
        user_id,
        object_data: {
          guid,
          nazvanie,
          tip,
          komentariy,
        },
      },
    }

    const url = `${apiConfig.ucode.baseURL}/v2/invoke_function/planfact-plan-fact`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
    })

    return response.data
  },

  /**
   * Delete chart of account using invoke_function
   * Method: delete_chart_of_account
   */
  deleteChartOfAccount: async (params = {}) => {
    const {
      guid,
      user_id = '',
      app_id,
      environment_id,
      project_id,
    } = params

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const requestBody = {
      auth: {
        type: 'apikey',
        data: {},
      },
      data: {
        app_id: app_id ?? apiConfig.ucode.appId ?? apiConfig.ucode.projectId,
        environment_id: environment_id ?? apiConfig.ucode['environment-id'],
        project_id: project_id ?? apiConfig.ucode.projectId,
        method: 'delete_chart_of_account',
        user_id,
        object_data: {
          guid,
        },
      },
    }

    const url = `${apiConfig.ucode.baseURL}/v2/invoke_function/planfact-plan-fact`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
    })

    return response.data
  },
}
