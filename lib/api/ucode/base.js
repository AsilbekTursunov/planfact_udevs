import { NextResponse } from 'next/server'
import { apiConfig } from '../../config/api'

/**
 * ============================================
 * УНИВЕРСАЛЬНЫЙ API КЛИЕНТ ДЛЯ U-CODE
 * ============================================
 * Единая точка входа для всех API запросов
 */

/**
 * Базовый класс для работы с U-code API
 */
class UcodeAPIClient {
  constructor() {
    this.baseURL = 'https://api.admin.u-code.io'
    this.invokeFunctionEndpoint = '/v2/invoke_function/planfact-plan-fact'
    this.projectId = '3ed54a59-5eda-4cfe-b4ae-8a201c1ea4ed'
    this.environmentId = 'fc258dff-47c0-4ab1-9beb-91a045b4847c'
  }

  /**
   * Получить токен авторизации
   * @param {string} providedToken - Переданный токен
   * @returns {string|null} Токен авторизации
   */

  getAuthToken(providedToken = null) {
    if (providedToken) return providedToken

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        console.log('Using auth token from localStorage')
        return token
      }
    }

    console.warn('No auth token found')
    return null
  }

  /**
   * Построить заголовки запроса
   * @param {string} authToken - Токен авторизации
   * @param {Object} additionalHeaders - Дополнительные заголовки
   * @returns {Object} Заголовки
   */
  buildHeaders(authToken = null, additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    return headers
  }

  /**
   * Построить тело запроса для invoke_function
   * @param {string} method - Название метода API
   * @param {Object} data - Данные для object_data
   * @returns {Object} Тело запроса
   */
  buildInvokeFunctionBody(method, data = {}) {
    return {
      data: {
        auth: {
          data: {},
          type: 'apikey'
        },
        method,
        object_data: data
      }
    }
  }

  /**
   * Обработать ответ от API
   * @param {Response} response - Fetch response
   * @param {string} method - Название метода для логирования
   * @returns {Promise<Object>} Распарсенные данные
   */
  async handleResponse(response, method) {
    const responseText = await response.text()
    let responseData

    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error(`Failed to parse [${method}] response:`, parseError)
      console.error('Response text:', responseText)
      const error = new Error('Failed to parse response')
      error.status = 500
      error.details = responseText
      error.parseError = parseError.message
      throw error
    }

    console.log(`U-code API [${method}] response:`, responseData)

    // Проверяем статус в теле ответа (U-code API возвращает status в JSON)
    if (responseData.status === 'ERROR') {
      console.error(`U-code API [${method}] error in response body:`, {
        status: responseData.status,
        description: responseData.description,
        data: responseData.data,
        custom_message: responseData.custom_message
      })

      const error = new Error(responseData.description || responseData.custom_message || 'API Error')
      error.status = response.status
      error.statusText = response.statusText
      error.details = responseData
      error.url = response.url
      throw error
    }

    // Проверяем HTTP статус
    if (!response.ok) {
      console.error(`U-code API [${method}] HTTP error:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseData
      })

      const error = new Error(responseData?.description || response.statusText || 'API Error')
      error.status = response.status
      error.statusText = response.statusText
      error.details = responseData
      error.url = response.url
      throw error
    }

    return responseData
  }

  /**
   * Выполнить запрос к invoke_function API
   * @param {Object} params - Параметры запроса
   * @param {string} params.method - Название метода API
   * @param {Object} params.data - Данные для object_data
   * @param {string} params.authToken - Токен авторизации (опционально)
   * @param {Object} params.headers - Дополнительные заголовки (опционально)
   * @returns {Promise<Object>} Ответ от API
   */
  async invokeFunction({ method, data = {}, authToken: providedToken = null, headers: additionalHeaders = {} }) {
    const authToken = this.getAuthToken(providedToken)
    const url = `${this.baseURL}${this.invokeFunctionEndpoint}?project-id=${this.projectId}&environment-id=${this.environmentId}`
    const headers = this.buildHeaders(authToken, additionalHeaders)
    const body = this.buildInvokeFunctionBody(method, data)

    console.log(`U-code API [${method}] request:`, {
      url,
      method,
      headers: { ...headers, Authorization: authToken ? 'Bearer ***' : 'none' },
      bodyObject: body,
      bodyString: JSON.stringify(body, null, 2)
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      return await this.handleResponse(response, method)
    } catch (error) {
      // Если ошибка уже обработана, пробрасываем дальше
      if (error.status) {
        throw error
      }

      // Обрабатываем сетевые ошибки
      console.error(`U-code API [${method}] network error:`, error)
      const networkError = new Error('Network Error')
      networkError.status = 500
      networkError.statusText = 'Network Error'
      networkError.details = error.message || 'Failed to connect to server'
      networkError.url = url
      networkError.isNetworkError = true
      throw networkError
    }
  }
}

// Создаем единственный экземпляр клиента
const apiClient = new UcodeAPIClient()

/**
 * ============================================
 * ПУБЛИЧНЫЕ ФУНКЦИИ ДЛЯ ИСПОЛЬЗОВАНИЯ
 * ============================================
 */

/**
 * Очистить данные перед отправкой в API
 * Заменяет пустые массивы, пустые объекты и пустые строки на null
 * @param {Object} data - Данные для очистки
 * @returns {Object} Очищенные данные
 */
function cleanDataForAPI(data) {
  if (!data || typeof data !== 'object') return data

  const cleaned = {}

  for (const [key, value] of Object.entries(data)) {
    // Пропускаем undefined
    if (value === undefined) continue

    // Пустые строки -> null
    if (value === '') {
      cleaned[key] = null
      continue
    }

    // Пустые массивы -> null
    if (Array.isArray(value) && value.length === 0) {
      cleaned[key] = null
      continue
    }

    // Пустые объекты -> null (кроме специальных полей)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value)
      // Если объект пустой и это не специальное поле (auth, data)
      if (keys.length === 0 && key !== 'auth' && key !== 'data') {
        cleaned[key] = null
        continue
      }
    }

    // Остальные значения оставляем как есть
    cleaned[key] = value
  }

  return cleaned
}

/**
 * Универсальная функция для запросов к invoke_function API
 * @param {Object} params - Параметры запроса
 * @param {string} params.method - Название метода API
 * @param {Object} params.data - Данные для object_data
 * @param {string} params.authToken - Токен авторизации (опционально)
 * @returns {Promise<Object>} Ответ от API
 */
export async function ucodeRequest({ method, data = {}, authToken = null }) {
  // Для auth методов НЕ очищаем данные, так как auth.data должен быть пустым объектом
  const shouldCleanData = !method.startsWith('auth_')
  const cleanedData = shouldCleanData ? cleanDataForAPI(data) : data
  
  return apiClient.invokeFunction({ method, data: cleanedData, authToken })
}

/**
 * Создать CRUD методы для ресурса
 * @param {string} resourceName - Название ресурса (например, 'operation', 'counterparty')
 * @returns {Object} Объект с CRUD методами
 */
export function createCRUDMethods(resourceName) {
  const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1)

  return {
    /**
     * Получить список ресурсов
     * @param {Object} params - Параметры запроса (page, limit, filters)
     * @returns {Promise<Object>} Список ресурсов
     */
    getList: async (params = {}) => {
      const { page = 1, limit = 50, ...filters } = params
      return ucodeRequest({
        method: `get_${resourceName}s`,
        data: { page, limit, ...filters }
      })
    },

    /**
     * Получить ресурс по GUID
     * @param {string} guid - GUID ресурса
     * @returns {Promise<Object>} Данные ресурса
     */
    getByGuid: async (guid) => {
      if (!guid) throw new Error(`${capitalizedName} GUID is required`)
      return ucodeRequest({
        method: `get_${resourceName}`,
        data: { guid }
      })
    },

    /**
     * Создать ресурс
     * @param {Object} data - Данные ресурса
     * @returns {Promise<Object>} Созданный ресурс
     */
    create: async (data) => {
      const now = new Date().toISOString()
      return ucodeRequest({
        method: `create_${resourceName}`,
        data: {
          ...data,
          data_sozdaniya: now,
          attributes: data.attributes || {}
        }
      })
    },

    /**
     * Обновить ресурс
     * @param {Object} data - Данные ресурса (должен содержать guid)
     * @returns {Promise<Object>} Обновленный ресурс
     */
    update: async (data) => {
      if (!data.guid) throw new Error(`${capitalizedName} GUID is required for update`)
      const now = new Date().toISOString()
      return ucodeRequest({
        method: `update_${resourceName}`,
        data: {
          ...data,
          data_obnovleniya: now
        }
      })
    },

    /**
     * Удалить ресурсы
     * @param {string|string[]} guids - GUID или массив GUID для удаления
     * @returns {Promise<Object>} Результат удаления
     */
    delete: async (guids) => {
      const guidArray = Array.isArray(guids) ? guids : [guids]
      if (guidArray.length === 0) throw new Error(`At least one ${capitalizedName} GUID is required`)

      // Для одного элемента используем единственное число, для нескольких - множественное
      // Но для операций API использует единственное число даже для множественного удаления
      const method = guidArray.length === 1
        ? `delete_${resourceName}`
        : `delete_${resourceName}s`

      return ucodeRequest({
        method: `delete_${resourceName}`, // Всегда используем единственное число
        data: { guid: guidArray[0] } // API принимает только один guid за раз
      })
    }
  }
}

/**
 * Экспортируем клиент для расширенного использования
 */
export { apiClient }

/**
 * Make a request to u-code views API
 * @param {Object} params - Request parameters
 * @param {string} params.menuId - Menu ID
 * @param {string} params.viewId - View ID
 * @param {string} params.tableSlug - Table slug (e.g., 'chart_of_accounts', 'bank_accounts')
 * @param {string} params.projectId - Project ID (optional, uses default from config)
 * @param {Object} params.bodyData - Data to send in request body
 * @param {Object} params.headers - Additional headers (optional)
 * @returns {Promise<Response>} Fetch response
 */
export async function makeUcodeViewsRequest({
  menuId,
  viewId,
  tableSlug,
  projectId,
  bodyData = {},
  headers: additionalHeaders = {},
  authToken: providedToken = null
}) {
  const baseURL = apiConfig.ucode.baseURL
  // Use provided token, or try to get from localStorage (client-side), or fallback to config
  const authToken = providedToken || (
    typeof window !== 'undefined'
      ? (localStorage.getItem('authToken') || apiConfig.ucode.authToken)
      : apiConfig.ucode.authToken
  )
  const finalProjectId = projectId || apiConfig.ucode.projectId

  // Build URL
  const url = `${baseURL}/v3/menus/${menuId}/views/${viewId}/tables/${tableSlug}/items/list?project-id=${finalProjectId}`

  // Prepare base headers
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'origin': 'https://app.u-code.io',
    'referer': 'https://app.u-code.io/',
    ...additionalHeaders
  }

  // Override Authorization if provided in additionalHeaders
  if (additionalHeaders.Authorization) {
    headers.Authorization = additionalHeaders.Authorization
  }

  // Prepare body - matching u-code API structure
  const requestBody = {
    data: {
      row_view_id: viewId,
      offset: bodyData.offset || 0,
      order: bodyData.order || {},
      view_fields: bodyData.view_fields || [],
      limit: bodyData.limit || 20,
      search: bodyData.search || '',
      ...(bodyData.tip && { tip: bodyData.tip }),
      ...bodyData.extraFields // Allow additional fields
    }
  }

  console.log('U-code API request:', {
    url,
    headers: { ...headers, Authorization: 'Bearer ***' },
    body: requestBody
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    return response
  } catch (networkError) {
    console.error('U-code API network error:', networkError)
    // Re-throw as a structured error that will be caught by API route
    throw {
      status: 500,
      statusText: 'Network Error',
      details: {
        status: 'ERROR',
        description: 'Network error occurred',
        data: networkError.message || 'Failed to connect to server'
      },
      url,
      isNetworkError: true
    }
  }
}

/**
 * Handle u-code API response
 * @param {Response} response - Fetch response
 * @param {string} endpointName - Name of endpoint for logging
 * @returns {Promise<Object>} Parsed response data
 */
export async function handleUcodeResponse(response, endpointName = 'U-code API') {
  // Check if response is ok
  if (!response.ok) {
    let errorText = ''
    try {
      errorText = await response.text()
    } catch (e) {
      errorText = `Failed to read error response: ${e.message}`
    }

    console.error(`${endpointName} error response:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      headers: Object.fromEntries(response.headers.entries())
    })

    // Try to parse error as JSON
    let errorDetails = errorText || 'Empty response body'
    try {
      if (errorText) {
        const errorJson = JSON.parse(errorText)
        errorDetails = errorJson
      }
    } catch (e) {
      errorDetails = errorText || `Failed to parse error: ${e.message}`
    }

    throw {
      status: response.status,
      statusText: response.statusText,
      details: errorDetails,
      url: response.url
    }
  }

  // Parse JSON response
  const responseText = await response.text()
  let data
  try {
    data = responseText ? JSON.parse(responseText) : {}
  } catch (parseError) {
    console.error(`Failed to parse ${endpointName} JSON response:`, parseError)
    console.error('Response text:', responseText)
    throw {
      status: 500,
      details: responseText,
      parseError: parseError.message
    }
  }

  console.log('data:', data?.data?.data?.response)

  console.log(`${endpointName} response status:`, response.status)
  return data
}

/**
 * Get CORS headers for responses
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

/**
 * Create OPTIONS handler response
 * @returns {NextResponse} OPTIONS response
 */
export function createOptionsResponse() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  })
}

/**
 * Make a POST request to u-code API for table structure
 * @param {Object} params - Request parameters
 * @param {string} params.menuId - Menu ID
 * @param {string} params.viewId - View ID
 * @param {string} params.tableSlug - Table slug
 * @param {string} params.projectId - Project ID (optional, uses default from config)
 * @param {Object} params.headers - Additional headers (optional)
 * @returns {Promise<Response>} Fetch response
 */
export async function makeUcodeGetRequest({
  menuId,
  viewId,
  tableSlug,
  projectId,
  headers: additionalHeaders = {},
  authToken: providedToken = null
}) {
  const baseURL = apiConfig.ucode.baseURL
  // Use provided token, or try to get from localStorage (client-side), or fallback to config
  const authToken = providedToken || (
    typeof window !== 'undefined'
      ? (localStorage.getItem('authToken') || apiConfig.ucode.authToken)
      : apiConfig.ucode.authToken
  )
  const finalProjectId = projectId || apiConfig.ucode.projectId

  // Build URL - POST to items/list endpoint for table structure
  const url = `${baseURL}/v3/menus/${menuId}/views/${viewId}/tables/${tableSlug}/items/list?project-id=${finalProjectId}`

  // Prepare base headers
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'origin': 'https://app.u-code.io',
    'referer': 'https://app.u-code.io/',
    ...additionalHeaders
  }

  // Override Authorization if provided in additionalHeaders
  if (additionalHeaders.Authorization) {
    headers.Authorization = additionalHeaders.Authorization
  }

  // Prepare body with empty data object
  const requestBody = {
    data: {}
  }

  console.log('U-code POST API request (table structure):', {
    url,
    headers: { ...headers, Authorization: 'Bearer ***' },
    body: requestBody
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    return response
  } catch (networkError) {
    console.error('U-code POST API network error (table structure):', networkError)
    // Re-throw as a structured error that will be caught by API route
    throw {
      status: 500,
      statusText: 'Network Error',
      details: {
        status: 'ERROR',
        description: 'Network error occurred',
        data: networkError.message || 'Failed to connect to server'
      },
      url,
      isNetworkError: true
    }
  }
}
