"use client"
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLogo } from '@/constants/icons'
import styles from './styles.module.scss'
import Input from '@/components/shared/Input'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import { useUcodeRequestMutation } from '../../../hooks/useDashboard'

export default function LoginPage() {
  const router = useRouter()
  const [fromType, setFromType] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '+998',
    branchName: '',
    checked: false,
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const phoneInputRef = useRef(null)

  // Login & Register mutations
  const loginMutation = useLogin()
  const { mutateAsync: registerAsync, isPending: isRegistering } = useUcodeRequestMutation()

  // Format phone number with mask
  const formatPhoneNumber = (value) => {
    // Remove all non-digits except the leading +
    const digits = value.replace(/[^\d]/g, '')

    // Always start with +998
    if (!value.startsWith('+998')) {
      return '+998'
    }

    // Limit to 12 digits total (+998 + 9 digits)
    const limitedDigits = digits.slice(0, 12)

    // Apply mask: +998 XX XXX XX XX
    if (limitedDigits.length <= 3) {
      return '+998'
    } else if (limitedDigits.length <= 5) {
      return `+998 ${limitedDigits.slice(3)}`
    } else if (limitedDigits.length <= 8) {
      return `+998 ${limitedDigits.slice(3, 5)} ${limitedDigits.slice(5)}`
    } else if (limitedDigits.length <= 10) {
      return `+998 ${limitedDigits.slice(3, 5)} ${limitedDigits.slice(5, 8)} ${limitedDigits.slice(8)}`
    } else {
      return `+998 ${limitedDigits.slice(3, 5)} ${limitedDigits.slice(5, 8)} ${limitedDigits.slice(8, 10)} ${limitedDigits.slice(10)}`
    }
  }

  // Get clean phone number for API (only digits)
  const getCleanPhoneNumber = (formattedPhone) => {
    return formattedPhone.replace(/[^\d]/g, '')
  }

  // Validate password (no special characters)
  const validatePassword = (password) => {
    // Only allow letters, numbers, and basic characters
    const validPasswordRegex = /^[a-zA-Z0-9а-яА-Я]+$/
    return validPasswordRegex.test(password)
  }

  const handlePhoneChange = (e) => {
    const input = e.target
    const value = input.value
    const cursorPosition = input.selectionStart

    // Prevent deleting +998
    if (!value.startsWith('+998')) {
      return
    }

    // Get old value to compare
    const oldValue = formData.phone
    const oldDigits = oldValue.replace(/[^\d]/g, '')
    const newDigits = value.replace(/[^\d]/g, '')

    // Format the new value
    const formatted = formatPhoneNumber(value)

    // Calculate new cursor position
    let newCursorPosition = cursorPosition

    // If we're adding digits
    if (newDigits.length > oldDigits.length) {
      // Count spaces before cursor in formatted string
      const spacesBeforeCursor = formatted.slice(0, cursorPosition).split(' ').length - 1
      const oldSpacesBeforeCursor = oldValue.slice(0, cursorPosition).split(' ').length - 1

      // Adjust cursor if a space was added
      if (spacesBeforeCursor > oldSpacesBeforeCursor) {
        newCursorPosition = cursorPosition + 1
      }
    }
    // If we're deleting digits
    else if (newDigits.length < oldDigits.length) {
      // Keep cursor at same position
      newCursorPosition = cursorPosition
    }

    setFormData({ ...formData, phone: formatted })
    setFieldErrors({ ...fieldErrors, phone: '' })

    // Restore cursor position after React updates
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  const handlePasswordChange = (e, field = 'password') => {
    const value = e.target.value

    // Block special characters
    if (value && !validatePassword(value)) {
      return
    }

    if (field === 'password') {
      setFormData({ ...formData, password: value })
      setFieldErrors({ ...fieldErrors, password: '' })
    } else {
      setConfirmPassword(value)
      setFieldErrors({ ...fieldErrors, confirmPassword: '' })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (fromType === 'register') {
      if (!formData.branchName.trim()) {
        errors.branchName = 'Введите название организации'
      }
      if (!formData.name.trim()) {
        errors.name = 'Введите ФИО'
      }
      if (!formData.email.trim()) {
        errors.email = 'Введите email'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Неверный формат email'
      }
      const cleanPhone = getCleanPhoneNumber(formData.phone)
      if (cleanPhone.length !== 12) {
        errors.phone = 'Введите полный номер телефона'
      }
      if (!formData.password) {
        errors.password = 'Введите пароль'
      } else if (formData.password.length < 6) {
        errors.password = 'Пароль должен быть не менее 6 символов'
      }
      if (!confirmPassword) {
        errors.confirmPassword = 'Подтвердите пароль'
      } else if (formData.password !== confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают'
      }
      if (!formData.checked) {
        errors.terms = 'Необходимо согласиться с условиями'
      }
    } else {
      if (!formData.email.trim()) {
        errors.email = 'Введите email'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Неверный формат email'
      }
      if (!formData.password) {
        errors.password = 'Введите пароль'
      }
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      if (fromType === 'login') {
        console.log('=== STARTING LOGIN ===')
        console.log('Email:', formData.email)
        
        const result = await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        })
        
        console.log('Login mutation result:', result)
        console.log('=== LOGIN COMPLETED ===')
      } else {
        console.log('=== STARTING REGISTRATION ===')
        const cleanPhone = getCleanPhoneNumber(formData.phone)
        console.log('Registration data:', {
          name: formData.name,
          email: formData.email,
          phone: cleanPhone,
          branch_name: formData.branchName
        })
        
        const response = await registerAsync({
          method: 'auth_register_legal_entity',
          data: {
            name: formData.name,
            email: formData.email,
            phone: cleanPhone,
            password: formData.password,
            legal_entity_name: formData.name,
            branch_name: formData.branchName,
          }
        })
        
        console.log('=== REGISTRATION RESPONSE ===')
        console.log('Full response:', response)
        console.log('Response data:', response?.data)
        console.log('Response data.data:', response?.data?.data)
        console.log('Response data.data.data:', response?.data?.data?.data)
        
        // Сохраняем токен после успешной регистрации
        // Структура может быть: response.data.data.data.token или response.data.data.token
        const innerData = response?.data?.data?.data || response?.data?.data
        const tokenData = innerData?.token?.access_token || innerData?.token
        const userData = innerData?.user_data || innerData?.userData || innerData?.user || {
          email: formData.email,
          name: formData.name,
          phone: cleanPhone
        }
        
        console.log('Inner data:', innerData)
        console.log('Token data:', tokenData)
        console.log('User data:', userData)
        
        if (tokenData) {
          console.log('✅ Token found!')
          
          // Используем authStore для сохранения
          const { authStore } = await import('@/store/auth.store')
          console.log('Setting authentication in authStore...')
          
          authStore.setAuthentication({
            token: tokenData,
            user_data: userData
          })
          
          console.log('✅ Authentication set successfully')
          console.log('authStore state:', {
            isAuthenticated: authStore.isAuthenticated,
            authToken: authStore.authToken,
            userEmail: authStore.userEmail,
            userData: authStore.userData
          })
          
          console.log('localStorage check:', {
            authToken: localStorage.getItem('authToken'),
            isAuthenticated: localStorage.getItem('isAuthenticated'),
            userEmail: localStorage.getItem('userEmail')
          })
          
          console.log('=== REGISTRATION COMPLETED ===')
          
          // Перенаправляем на главную страницу
          console.log('Redirecting to /pages/operations...')
          setTimeout(() => {
            window.location.href = '/pages/operations'
          }, 100)
        } else {
          console.error('❌ Token not found in response!')
          console.log('Response structure:', JSON.stringify(response, null, 2))
          throw new Error('Токен не получен от сервера')
        }
      }
    } catch (error) {
      console.error('=== AUTH ERROR ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      const errorMessage = error.message || (fromType === 'login' ? 'Ошибка при входе' : 'Ошибка при регистрации')
      setError(errorMessage)
    }
  }

  const toggleFormType = () => {
    setFromType(prev => prev === 'login' ? 'register' : 'login')
    setError('')
    setFieldErrors({})
    setFormData({ email: '', password: '', name: '', phone: '+998', branchName: '', checked: false })
    setConfirmPassword('')
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.logoContainer}>
        <AuthLogo color="#ffffff" width="114" height="27" />
      </div>
      {/* Login Card */}
      <div className={styles.cardWrapper}>
        <div className={styles.card}>

          {/* Logo/Title */}
          <div className={styles.cardLogo}>
            <AuthLogo color="#000000" width="150" height="36" />
          </div>

          <h1 className={styles.cardTitle}>
            {fromType === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {fromType === 'register' && (
              <>
                {/* Branch Name */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="text"
                      value={formData.branchName}
                      onChange={(e) => {
                        setFormData({ ...formData, branchName: e.target.value })
                        setFieldErrors({ ...fieldErrors, branchName: '' })
                      }}
                      onFocus={() => setFocusedField('branchName')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'branchName' && styles.focused,
                        fieldErrors.branchName && styles.error
                      )}
                      placeholder="Название организации"
                    />
                  </div>
                  {fieldErrors.branchName && (
                    <div className={styles.fieldError}>{fieldErrors.branchName}</div>
                  )}
                </div>

                {/* Name */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        setFieldErrors({ ...fieldErrors, name: '' })
                      }}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'name' && styles.focused,
                        fieldErrors.name && styles.error
                      )}
                      placeholder="ФИО пользователя"
                    />
                  </div>
                  {fieldErrors.name && (
                    <div className={styles.fieldError}>{fieldErrors.name}</div>
                  )}
                </div>

                {/* Email */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setFieldErrors({ ...fieldErrors, email: '' })
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'email' && styles.focused,
                        fieldErrors.email && styles.error
                      )}
                      placeholder="Email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className={styles.fieldError}>{fieldErrors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      ref={phoneInputRef}
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'phone' && styles.focused,
                        fieldErrors.phone && styles.error
                      )}
                      placeholder="+998 XX XXX XX XX"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <div className={styles.fieldError}>{fieldErrors.phone}</div>
                  )}
                </div>
              </>
            )}

            {/* Email (Only on login) */}
            {fromType === 'login' && (
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setFieldErrors({ ...fieldErrors, email: '' })
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      styles.inputField,
                      focusedField === 'email' && styles.focused,
                      fieldErrors.email && styles.error
                    )}
                    placeholder="Email"
                  />
                </div>
                {fieldErrors.email && (
                  <div className={styles.fieldError}>{fieldErrors.email}</div>
                )}
              </div>
            )}

            {/* Password */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e, 'password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    styles.inputField,
                    styles.passwordField,
                    focusedField === 'password' && styles.focused,
                    fieldErrors.password && styles.error
                  )}
                  placeholder={fromType === 'register' ? "Создать пароль" : "Пароль"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className={styles.fieldError}>{fieldErrors.password}</div>
              )}
            </div>

            {/* Confirm Password (Only on register) */}
            {fromType === 'register' && (
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => handlePasswordChange(e, 'confirmPassword')}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      styles.inputField,
                      styles.passwordField,
                      focusedField === 'confirmPassword' && styles.focused,
                      fieldErrors.confirmPassword && styles.error
                    )}
                    placeholder="Подтвердить пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.eyeButton}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <div className={styles.fieldError}>{fieldErrors.confirmPassword}</div>
                )}
              </div>
            )}

            {/* Checkbox (Only on register) */}
            {fromType === 'register' && (
              <div className={styles.checkboxGroup}>
                <OperationCheckbox
                  id="terms"
                  checked={formData.checked}
                  onChange={() => {
                    setFormData({ ...formData, checked: !formData.checked })
                    setFieldErrors({ ...fieldErrors, terms: '' })
                  }}
                />
                <label htmlFor="terms" className={styles.checkboxLabel}>
                  Я <span className={styles.highlight}>соглашаюсь</span> на получение информационных и справочных материалов
                </label>
              </div>
            )}
            {fieldErrors.terms && (
              <div className={styles.fieldError}>{fieldErrors.terms}</div>
            )}

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Action Links */}
            <div className={styles.actionLinks}>
              <span>
                {fromType === 'login' ? 'Нет учётной записи? ' : 'Есть учётная запись? '}
                <span
                  onClick={toggleFormType}
                  className={styles.actionToggle}
                >
                  {fromType === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </span>
              </span>
            </div>

            {/* Submit Button */}
            <div className={styles.submitWrapper}>
              <button
                type="submit"
                disabled={fromType === 'login' ? loginMutation.isPending : isRegistering}
                className={cn(
                  styles.submitButton,
                  fromType === 'login' && styles.loginButton
                )}
              >
                {fromType === 'login'
                  ? (loginMutation.isPending ? 'Вход...' : 'Войти')
                  : (isRegistering ? 'Регистрация...' : 'Зарегистрироваться')}
              </button>
            </div>

            <div className={styles.termsText}>
              Нажав кнопку «{fromType === 'login' ? 'Войти' : 'Зарегистрироваться'}», вы подтверждаете{' '}
              <a href="#">Политика конфеденциальности</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
