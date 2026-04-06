'use client'

import { useRouter } from 'next/navigation'
import { Plus, Shield, Trash2, Pencil } from 'lucide-react'

const MOCK_ROLES = [
  { id: 1, name: 'Владелец', description: 'Полный доступ ко всем функциям', usersCount: 1, createdAt: '15.03.2026' },
  { id: 2, name: 'Администратор', description: 'Управление пользователями и настройками', usersCount: 0, createdAt: '15.03.2026' },
  { id: 3, name: 'Бухгалтер', description: 'Доступ к операциям и отчётам', usersCount: 0, createdAt: '15.03.2026' },
  { id: 4, name: 'Менеджер', description: 'Просмотр и создание операций', usersCount: 0, createdAt: '15.03.2026' },
]

export default function RolePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Роли</h1>
        <button
          onClick={() => router.push('/pages/settings/role/create')}
          className="primary-btn flex items-center gap-1.5"
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {/* Table container — only tbody scrolls */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-12">#</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Название</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Описание</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-36">Пользователей</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-36">Дата создания</th>
              <th className="w-24 px-6 py-3"></th>
            </tr>
          </thead>
        </table>

        {/* Scrollable tbody section */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full table-fixed">
            <tbody className="divide-y divide-gray-50">
              {MOCK_ROLES.map((role, index) => (
                <tr
                  key={role.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/pages/settings/role/${role.id}`)}
                >
                  <td className="px-6 py-4 text-sm text-gray-400 w-12">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Shield size={15} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate">{role.description}</td>
                  <td className="px-6 py-4 w-36">
                    <span className="text-sm text-gray-700">{role.usersCount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 w-36">{role.createdAt}</td>
                  <td className="px-6 py-4 w-24">
                    <div
                      className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        onClick={() => router.push(`/pages/settings/role/${role.id}/edit`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {MOCK_ROLES.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">
                    Нет ролей
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}