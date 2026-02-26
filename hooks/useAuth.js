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
      const clientTypeId = apiConfig.ucode.clientTypeId
      const roleId = apiConfig.ucode.roleId
      const baseURL = apiConfig.ucode.baseURL
      const projectId = apiConfig.ucode.projectId

      const url = `${baseURL}/v2/invoke_function/planfact-plan-fact?project-id=${projectId}`

      const requestBody = {
        data: {
          auth: {
            data: {},
            type: 'apikey'
          },
          method: 'auth_login',
          object_data: {
            email: username,
            password: password,
            client_type_id: clientTypeId,
            role_id: roleId
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok || data.status === 'ERROR' || data.status === 'BAD_REQUEST') {
        throw new Error(data.description || data.data || 'Ошибка при входе')
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
      const response = await register({
        name: fullname,
        email,
        phone,
        password,
      })

      // Response is already parsed JSON from apiClient.invokeFunction
      // Check for API-level errors
      if (response.status === 'ERROR' || response.status === 'BAD_REQUEST') {
        const errorMessage = response.description || response.data || 'Ошибка при регистрации'
        throw new Error(errorMessage)
      }

      return response
    },
    onSuccess: (data) => {
      // Response structure: { status: "CREATED", data: { status: "success", data: {...} } }
      const responseData = data.data?.data || data.data || data
      const userData = responseData?.user_data || responseData?.userData || responseData?.user
      const tokenData = responseData?.token

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
