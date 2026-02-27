"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLogo } from '@/constants/icons'
import styles from './styles.module.scss'
import Input from '@/components/shared/Input'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'

export default function LoginPage() {
  const router = useRouter()
  const [fromType, setFromType] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: '',
    phone: '',
    checked: false, // Explicitly set to false to avoid uncontrolled->controlled warning
  })
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login & Register mutations
  const loginMutation = useLogin()
  const { mutateAsync: registerAsync, isPending: isRegistering } = useRegister()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (fromType === 'login') {
        if (!formData.email || !formData.password) {
          setError('Заполните все поля')
          return
        }
        await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        })
      } else {
        if (!formData.fullname || !formData.email || !formData.phone || !formData.password || !confirmPassword) {
          setError('Заполните все поля')
          return
        }
        if (!formData.checked) {
          setError('Вы должны согласиться с условиями')
          return
        }
        if (formData.password !== confirmPassword) {
          setError('Пароли не совпадают')
          return
        }
        await registerAsync({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        })
      }

      // Redirect immediately after successful auth
      router.push('/pages/operations')
    } catch (error) {
      console.error('Auth error:', error)
      const errorMessage = error.message || (fromType === 'login' ? 'Ошибка при входе' : 'Ошибка при регистрации')
      setError(errorMessage)
    }
  }

  const toggleFormType = () => {
    setFromType(prev => prev === 'login' ? 'register' : 'login')
    setError('')
    setFormData({ email: '', password: '', fullname: '', phone: '', checked: false })
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
                {/* Fullname */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => {
                        setFormData({ ...formData, fullname: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('fullname')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'fullname' && styles.focused
                      )}
                      placeholder="ФИО пользователя"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'email' && styles.focused
                      )}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        styles.inputField,
                        focusedField === 'phone' && styles.focused
                      )}
                      placeholder="Телефон номер"
                      required
                    />
                  </div>
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
                      setError('')
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      styles.inputField,
                      focusedField === 'email' && styles.focused
                    )}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setError('')
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    styles.inputField,
                    styles.passwordField,
                    focusedField === 'password' && styles.focused
                  )}
                  placeholder={fromType === 'register' ? "Создать пароль" : "Пароль"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only on register) */}
            {fromType === 'register' && (
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      styles.inputField,
                      styles.passwordField,
                      focusedField === 'confirmPassword' && styles.focused
                    )}
                    placeholder="Подтвердить пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.eyeButton}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox (Only on register) */}
            {fromType === 'register' && (
              <div className={styles.checkboxGroup}>
                <OperationCheckbox id="terms" checked={formData.checked} onChange={() => setFormData({ ...formData, checked: !formData.checked })} />
                <label htmlFor="terms" className={styles.checkboxLabel}>
                  Я <span className={styles.highlight}>соглашаюсь</span> на получение информационных и справочных материалов
                </label>
              </div>
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
