import { apiConfig } from '../config/api'/**
 * Login to u-code API using invoke_function endpoint
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - Password
 * @param {string} credentials.clientTypeId - Client type ID (optional, uses default from config)
 * @param {string} credentials.roleId - Role ID (optional, uses default from config)
 * @returns {Promise<Object>} Login response with token
 */
export async function login({
  email,
  password,
  clientTypeId,
  roleId
}) {
  const baseURL = apiConfig.ucode.baseURL
  const projectId = apiConfig.ucode.projectId
  
  // Use provided values or fallback to config defaults
  const finalClientTypeId = clientTypeId || apiConfig.ucode.clientTypeId
  const finalRoleId = roleId || apiConfig.ucode.roleId

  // Validate required fields
  if (!email || !password || !finalClientTypeId || !finalRoleId) {
    throw new Error('email, password, client_type_id, and role_id are required')
  }

  // Build URL - using invoke_function endpoint
  const url = `${baseURL}/v2/login/with-option?project-id=${projectId}`

  // Prepare request body according to API documentation
  const requestBody = {
    login_strategy: "EMAIL",
    data: {
        email,
        password,
        client_type_id: finalClientTypeId,
        role_id: finalRoleId
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    // Check for errors
    if (!response.ok || data.status === 'ERROR' || data.status === 'BAD_REQUEST') {
      const errorMessage = data.description || data.data || 'Ошибка при входе'
      throw new Error(errorMessage)
    }

    // Return the response - token should be in data.data.token
    return data
  } catch (error) {
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
  const baseURL = apiConfig.ucode.baseURL
  const projectId = apiConfig.ucode.projectId
  
  const url = `${baseURL}/v2/invoke_function/planfact-plan-fact?project-id=${projectId}`

  const requestBody = {
    data: {
      auth: {
        data: {},
        type: 'apikey'
      },
      method: 'auth_register',
      object_data: {
        name,
        password,
        email,
        phone
      }
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  const data = await response.json()

  if (!response.ok || data.status === 'ERROR' || data.status === 'BAD_REQUEST') {
    throw new Error(data.description || 'Ошибка при регистрации')
  }

  return data
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
