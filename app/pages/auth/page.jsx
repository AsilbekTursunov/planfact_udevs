"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { AuthLogo } from '@/constants/icons'


export default function LoginPage() {
  const router = useRouter()
  const [fromType, setFromType] = useState('login')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    email: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  // Login & Register mutations
  const loginMutation = useLogin()
  const { mutateAsync: registerAsync, isPending: isRegistering } = useRegister()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (fromType === 'login') {
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        })
      } else {
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
    setFormData({ username: '', password: '', fullname: '', email: '', phone: '' })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(to top, rgba(2, 37, 101, 1), #456fad)',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <div className="absolute left-10 top-10">
        <AuthLogo color="#ffffff" width="114" height="27" />
      </div>
      {/* Login Card */}
      <div className="w-full max-w-[480px]">
        <div
          className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl"
        >

          {/* Logo/Title */}
          <div className="mb-6 text-center justify-center items-center flex">
            <AuthLogo color="#000000" width="150" height="36" />
          </div>

          <h1 className="text-[24px] font-bold mb-3 text-black leading-6 scale-y-110">
            {fromType === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {fromType === 'register' && (
              <>
                {/* Fullname */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    ФИО
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => {
                        setFormData({ ...formData, fullname: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('fullname')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full px-4 py-3.5 border rounded-xl focus:outline-none transition-all text-slate-900 bg-white",
                        focusedField === 'fullname'
                          ? "border-[#104CA2] ring-1 ring-[#104CA2]/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      placeholder="Введите ФИО"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full px-4 py-3.5 border rounded-xl focus:outline-none transition-all text-slate-900 bg-white",
                        focusedField === 'email'
                          ? "border-[#104CA2] ring-1 ring-[#104CA2]/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      placeholder="Введите email"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    Телефон
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        setError('')
                      }}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full px-4 py-3.5 border rounded-xl focus:outline-none transition-all text-slate-900 bg-white",
                        focusedField === 'phone'
                          ? "border-[#104CA2] ring-1 ring-[#104CA2]/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      placeholder="Введите телефон"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Username/Login (Only on login) */}
            {fromType === 'login' && (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                  Имя пользователя
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value })
                      setError('')
                    }}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "w-full px-4 py-3.5 border rounded-xl focus:outline-none transition-all text-slate-900 bg-white",
                      focusedField === 'username'
                        ? "border-[#104CA2] ring-1 ring-[#104CA2]/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    placeholder="Введите username"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Пароль
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setError('')
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl focus:outline-none transition-all text-slate-900 bg-white",
                    focusedField === 'password'
                      ? "border-[#104CA2] ring-1 ring-[#104CA2]/20"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Action Links */}
            <div className="flex justify-center items-center text-sm mt-10">
              <span className="text-slate-500">
                {fromType === 'login' ? 'Нет учётной записи? ' : 'Уже есть аккаунт? '}
                <span
                  onClick={toggleFormType}
                  className="text-[#0E73F6] text-base font-medium cursor-pointer hover:underline"
                >
                  {fromType === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={fromType === 'login' ? loginMutation.isPending : isRegistering}
              className="w-full bg-[#0E73F6] text-white py-3.5 rounded-lg font-bold text-lg hover:bg-[#7aa0e0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {fromType === 'login'
                ? (loginMutation.isPending ? 'Вход...' : 'Войти')
                : (isRegistering ? 'Регистрация...' : 'Зарегистрироваться')}
            </button>

            <div className="mt-8 text-center tracking-[1px] text-xs text-slate-900 max-w-[280px] mx-auto leading-tight">
              Нажав кнопку «{fromType === 'login' ? 'Войти' : 'Зарегистрироваться'}», вы подтверждаете <a href="#" className="underline font-semibold text-[#0E73F6] decoration-[#0E73F6] hover:text-slate-700">Политика конфеденциальности</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
