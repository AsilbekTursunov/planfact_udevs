import { useMutation } from '@tanstack/react-query'
import { apiConfig } from '@/lib/config/api'
import { showErrorNotification, showSuccessNotification } from '@/lib/utils/notifications'

/**
 * Login mutation hook
 * Handles user authentication
 */
export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password }) => {
      // Get values from config
      const clientTypeId = apiConfig.ucode.clientTypeId
      const roleId = apiConfig.ucode.roleId

      // Prepare full request body with login_strategy and data
      const requestBody = {
        login_strategy: 'LOGIN_PWD',
        data: {
          client_type_id: clientTypeId,
          role_id: roleId,
          username,
          password,
        }
      }

      console.log('Login request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.data || errorData.description || 'Ошибка при входе')
      }

      const data = await response.json()

      // Check for API-level errors
      if (data.status === 'NOT_FOUND' || data.status === 'ERROR') {
        const errorMessage = data.data || data.description || 'Ошибка при входе'
        throw new Error(errorMessage)
      }

      return data
    },
    onSuccess: (data) => {
      // Save token to localStorage on client side
      if (data.data?.token?.access_token) {
        localStorage.setItem('authToken', data.data.token.access_token)
        localStorage.setItem('refreshToken', data.data.token.refresh_token)
        localStorage.setItem('userData', JSON.stringify(data.data.user_data))
      }

      // Set cookie for middleware
      document.cookie = 'isAuthenticated=true; path=/; max-age=86400'
      localStorage.setItem('isAuthenticated', 'true')

      if (data.data?.user_data) {
        localStorage.setItem('userEmail', data.data.user_data.login || '')
      }

      showSuccessNotification('Успешный вход!')
    },
    onError: (error) => {
      const errorMessage = error.message || 'Ошибка при входе'
      showErrorNotification(errorMessage)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ fullname, email, phone, password }) => {
      // Get values from config
      const clientTypeId = apiConfig.ucode.clientTypeId
      const roleId = apiConfig.ucode.roleId

      // Prepare full request body with login_strategy and data
      // Registration usually requires user info, adjust according to actual backend schema
      const requestBody = {
        login_strategy: 'LOGIN_PWD',
        data: {
          client_type_id: clientTypeId,
          role_id: roleId,
          name: fullname,
          email,
          phone,
          password,
        }
      }

      // Assuming there is or will be a register endpoint.
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.data || errorData.description || 'Ошибка при регистрации')
      }

      const data = await response.json()

      // Check for API-level errors
      if (data.status === 'NOT_FOUND' || data.status === 'ERROR') {
        const errorMessage = data.data || data.description || 'Ошибка при регистрации'
        throw new Error(errorMessage)
      }

      return data
    },
    onSuccess: (data) => {
      // Save token to localStorage on client side
      if (data.data?.token?.access_token) {
        localStorage.setItem('authToken', data.data.token.access_token)
        localStorage.setItem('refreshToken', data.data.token.refresh_token)
        localStorage.setItem('userData', JSON.stringify(data.data.user_data))
      }

      // Set cookie for middleware
      document.cookie = 'isAuthenticated=true; path=/; max-age=86400'
      localStorage.setItem('isAuthenticated', 'true')

      if (data.data?.user_data) {
        localStorage.setItem('userEmail', data.data.user_data.login || '')
      }

      showSuccessNotification('Успешный вход!')
    },
    onError: (error) => {
      const errorMessage = error.message || 'Ошибка при входе'
      showErrorNotification(errorMessage)
    },
  })
}
