import axios from 'axios'

/**
 * Operations API
 */
export const operationsAPI = {
  /**
   * Получить список операций через новый API
   * @param {Object} params - Параметры запроса
   * @param {Object} params.date_range - Диапазон дат
   * @param {string} params.date_range.start_date - Дата начала (YYYY-MM-DD)
   * @param {string} params.date_range.end_date - Дата окончания (YYYY-MM-DD)
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество элементов на странице
   * @returns {Promise} Данные операций
   */
  getNewList: async (params = {}) => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const response = await axios.post('https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact', {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: process.env.NEXT_PUBLIC_APP_ID || '',
        environment_id: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
        project_id: process.env.NEXT_PUBLIC_PROJECT_ID || '',
        method: 'find_operations',
        user_id: '',
        object_data: {
          date_range: {
            start_date: params.date_range?.start_date || '2026-01-01',
            end_date: params.date_range?.end_date || '2026-12-31'
          },
          page: params.page || 1,
          limit: params.limit || 100
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    })
    
    return response.data
  },

  /**
   * Получить конкретную операцию по GUID
   * @param {string} guid - GUID операции
   * @returns {Promise} Данные операции
   */
  getOperation: async (guid) => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const response = await axios.post('https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact', {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: process.env.NEXT_PUBLIC_APP_ID || '',
        environment_id: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
        project_id: process.env.NEXT_PUBLIC_PROJECT_ID || '',
        method: 'get_operation',
        user_id: '',
        object_data: {
          guid: guid
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    })
    
    return response.data
  },

  /**
   * Создать операцию через новый API
   * @param {Object} operationData - Данные операции
   * @returns {Promise} Результат создания
   */
  createOperation: async (operationData) => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const response = await axios.post('https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact', {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: process.env.NEXT_PUBLIC_APP_ID || '',
        environment_id: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
        project_id: process.env.NEXT_PUBLIC_PROJECT_ID || '',
        method: 'create_operation',
        user_id: '',
        object_data: operationData
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    })
    
    return response.data
  }
}

/**
 * Получить список операций
 * @param {Object} params - Параметры запроса
 * @param {Object} params.date_range - Диапазон дат
 * @param {string} params.date_range.start_date - Дата начала (YYYY-MM-DD)
 * @param {string} params.date_range.end_date - Дата окончания (YYYY-MM-DD)
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @returns {Promise} Данные операций
 */
export const getOperations = async (params) => {
  return operationsAPI.getNewList(params)
}
