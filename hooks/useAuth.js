import { useMutation } from '@tanstack/react-query'
import { apiConfig } from '@/lib/config/api'
import { showErrorNotification, showSuccessNotification } from '@/lib/utils/notifications'
import { register } from '../lib/api/auth'
import { authStore } from '@/store/auth.store'

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
      // Set authentication state through MobX store
      if (data?.data) {
        authStore.setAuthentication(data.data)
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
      // Assuming there is or will be a register endpoint.
      const response = await register({
        name: fullname,
        email,
        phone,
        password,
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
      // Identify where the token and user data are located in the response 
      // (invokeFunction often returns data under `data.response`)
      const responseBody = data.data?.response || data.data || data
      const tokenData = responseBody?.token || responseBody
      const userData = responseBody?.user_data || responseBody

      // Set authentication state through MobX store
      authStore.setAuthentication({ token: tokenData, user_data: userData })

      showSuccessNotification('Успешная регистрация!')
    },
    onError: (error) => {
      const errorMessage = error.message || 'Ошибка при регистрации'
      showErrorNotification(errorMessage)
    },
  })
}
