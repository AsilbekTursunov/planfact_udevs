"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useLogin } from '@/hooks/useAuth'
import { AuthLogo } from '@/constants/icons'


export default function LoginPage() {
  const router = useRouter()
  const [fromType, setFromType] = useState('login')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  // Login mutation
  const loginMutation = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
      })

      // Redirect immediately after successful login
      router.push('/pages/operations')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Ошибка при входе'
      setError(errorMessage)
    }
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
            {/* Username/Login */}
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
              <span className="text-slate-500">Нет учётной записи? <span className="text-[#0E73F6] text-base  font-medium cursor-default">Зарегистрироваться</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#8ab4f8] text-white py-3.5 rounded-lg font-bold text-lg hover:bg-[#7aa0e0] transition-colors disabled:opacity-70    disabled:cursor-not-allowed shadow-md"
            >
              {loginMutation.isPending ? 'Вход...' : 'Войти'}
            </button>

            <div className="mt-8 text-center tracking-[1px] text-xs text-slate-900  max-w-[280px] mx-auto leading-tight">
              Нажав кнопку «Войти», вы подтверждаете <a href="#" className="underline font-semibold text-[#0E73F6] decoration-[#0E73F6] underline-offset-2 underline- hover:text-slate-700">Политика конфеденциальности</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
