import { apiConfig } from '../config/api'
import { apiClient } from './ucode/base'/**
 * Login to u-code API
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @param {string} credentials.clientTypeId - Client type ID (optional, uses default from config)
 * @param {string} credentials.roleId - Role ID (optional, uses default from config)
 * @returns {Promise<Object>} Login response with token
 */
export async function login({
  username,
  password,
  clientTypeId,
  roleId
}) {
  const baseURL = apiConfig.ucode.authBaseURL
  const projectId = apiConfig.ucode.projectId
  const environmentId = apiConfig.ucode['environment-id']
  
  // Get values from config - explicitly check
  const configClientTypeId = apiConfig.ucode.clientTypeId
  const configRoleId = apiConfig.ucode.roleId
  
  console.log('Config values:', {
    configClientTypeId,
    configRoleId,
    hasConfigClientTypeId: !!configClientTypeId,
    hasConfigRoleId: !!configRoleId
  })
  
  // Use provided values or fallback to config defaults
  const finalClientTypeId = clientTypeId || configClientTypeId
  const finalRoleId = roleId || configRoleId

  // Validate that required values are present
  if (!finalClientTypeId || !finalRoleId) {
    console.error('Missing client_type_id or role_id:', {
      finalClientTypeId,
      finalRoleId,
      clientTypeId,
      roleId,
      configClientTypeId,
      configRoleId
    })
    throw new Error('client_type_id and role_id must be provided or configured')
  }

  // Build URL with query parameters
  const url = `${baseURL}/v2/login/with-option?project-id=${projectId}&environment-id=${environmentId}`
  
  console.log('Login request:', {
    url,
    environmentId,
    projectId,
    clientTypeId: finalClientTypeId,
    roleId: finalRoleId
  })

  // Prepare headers - include environment-id in headers
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'environment-id': environmentId,
  }

  // Prepare body - client_type_id and role_id are in data
  // Ensure all required values are present
  if (!finalClientTypeId || !finalRoleId || !username || !password) {
    throw new Error('Missing required login parameters')
  }

  const requestBody = {
    login_strategy: 'LOGIN_PWD',
    data: {
      client_type_id: finalClientTypeId,
      role_id: finalRoleId,
      username: username,
      password: password,
    }
  }
  
  console.log('Login request body:', JSON.stringify(requestBody, null, 2))
  console.log('Values check:', {
    finalClientTypeId,
    finalRoleId,
    username,
    password,
    hasClientTypeId: !!finalClientTypeId,
    hasRoleId: !!finalRoleId,
    requestBodyData: requestBody.data
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    // Check for errors
    if (!response.ok || data.status === 'NOT_FOUND' || data.status === 'ERROR') {
      const errorMessage = data.data || data.description || 'Ошибка при входе'
      throw new Error(errorMessage)
    }

    // Don't save to localStorage here - this function runs on server
    // Token saving should be done on client side after receiving the response

    return data
  } catch (error) {
    // Re-throw with proper error message
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Ошибка при входе')
  }
}

/**
 * Register a new user in u-code API
 */

export async function register({
  name,
  email,
  phone,
  password
}) {
  try {
    const data = await apiClient.invokeFunction({
      method: 'auth_register',
      data: {
        name,
        password,
        email,
        phone
      }
    })

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Ошибка при регистрации')
  }
}

/**
 * Logout - clear stored tokens
 */
export function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userData')
}

/**
 * Get stored auth token
 */
export function getStoredAuthToken() {
  return localStorage.getItem('authToken')
}

/**
 * Get stored user data
 */
export function getStoredUserData() {
  const userData = localStorage.getItem('userData')
  return userData ? JSON.parse(userData) : null
}
