import { useMutation } from '@tanstack/react-query'
import { apiConfig } from '@/lib/config/api'
import { showErrorNotification, showSuccessNotification } from '@/lib/utils/notifications'
import { authStore } from '@/store/auth.store'

/**
 * Login mutation hook
 * Handles user authentication - direct call to u-code API
 */
export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const baseURL = 'https://api.auth.u-code.io'
      const projectId = apiConfig.ucode.projectId
      const clientTypeId = apiConfig.ucode.clientTypeId
      const roleId = apiConfig.ucode.roleId

      const url = `${baseURL}/v2/login/with-option?project-id=${projectId}`

      const requestBody = {
        login_strategy: "EMAIL",
        data: {
            email,
            password,
            client_type_id: clientTypeId,
            role_id: roleId
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Environment-Id': 'fc258dff-47c0-4ab1-9beb-91a045b4847c',
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log('=== LOGIN RAW RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Response Text:', responseText)
      console.log('==========================')

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Invalid response from server')
      }

      if (!response.ok || data.status === 'ERROR' || data.status === 'BAD_REQUEST') {
        throw new Error(data.description || data.message || 'Ошибка при входе')
      }

      return data
    },
    onSuccess: (data) => {
      console.log('=== LOGIN SUCCESS ===')
      console.log('Full response:', JSON.stringify(data, null, 2))
      
      // Response structure: { status: "CREATED", data: { token: {...}, user_data: {...} } }
      const responseData = data.data
      const tokenData = responseData?.token?.access_token
      const refreshToken = responseData?.token?.refresh_token
      const userData = responseData?.user_data

      console.log('Extracted userData:', userData)
      console.log('Extracted token:', tokenData)
      console.log('========================')

      // Set authentication state through MobX store
      if (tokenData && userData) {
        authStore.setAuthentication({ 
          token: tokenData,
          refresh_token: refreshToken,
          user_data: userData 
        })
      }

      showSuccessNotification('Успешный вход!')
    },
    onError: (error) => {
      const errorMessage = error.message || 'Ошибка при входе'
      showErrorNotification(errorMessage)
    },
  })
}

/**
 * Register mutation hook
 * Handles user registration - direct call to new u-code auth API
 */
export function useRegister() {
  return useMutation({
    mutationFn: async ({ fullname, email, phone, password }) => {
      const baseURL = 'https://api.auth.u-code.io'
      const projectId = apiConfig.ucode.projectId
      const clientTypeId = apiConfig.ucode.clientTypeId
      const roleId = apiConfig.ucode.roleId

      const url = `${baseURL}/v2/register?project-id=${projectId}`

      const requestBody = {
        data: {
          type: 'email',
          name: fullname,
          phone: phone,
          password: password,
          email: email,
          client_type_id: clientTypeId,
          role_id: roleId
        }
      }

      console.log('=== REGISTER REQUEST (NEW API) ===')
      console.log('URL:', url)
      console.log('Request Body:', JSON.stringify(requestBody, null, 2))
      console.log('===================================')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Environment-Id': 'fc258dff-47c0-4ab1-9beb-91a045b4847c',
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log('=== RAW RESPONSE ===')
      console.log('Response Text:', responseText)
      console.log('====================')

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Invalid JSON response from server')
      }

      console.log('=== REGISTER RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Response Data:', JSON.stringify(data, null, 2))
      console.log('=========================')

      if (!response.ok) {
        const errorMessage = data.message || data.description || 'Ошибка при регистрации'
        throw new Error(errorMessage)
      }

      return data
    },
    onSuccess: (data) => {
      console.log('=== REGISTER SUCCESS ===')
      console.log('Full response:', JSON.stringify(data, null, 2))
      
      // Response structure for registration: { status: "CREATED", data: { token: {...}, user: {...}, user_id: "..." } }
      const responseData = data.data
      const tokenData = responseData?.token?.access_token
      const refreshToken = responseData?.token?.refresh_token
      const userData = responseData?.user
      const userEmail = userData?.email

      console.log('Extracted userData:', userData)
      console.log('Extracted token:', tokenData)
      console.log('Extracted email:', userEmail)
      console.log('========================')

      // Set authentication state through MobX store
      if (tokenData && userData) {
        authStore.setAuthentication({ 
          token: tokenData,
          refresh_token: refreshToken,
          user_data: {
            ...userData,
            email: userEmail
          }
        })
      }

      showSuccessNotification('Успешная регистрация!')
    },
    onError: (error) => {
      const errorMessage = error.message || 'Ошибка при регистрации'
      showErrorNotification(errorMessage)
    },
  })
}
