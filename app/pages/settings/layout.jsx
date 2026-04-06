'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Settings as SettingsIcon,
  GitBranch,
  Banknote,
} from 'lucide-react'
import styles from './settings.module.scss'

const sidebarItems = [
  { id: 'general', label: 'Общие настройки', icon: SettingsIcon, href: '/pages/settings' },
  { id: 'branches', label: 'Филиалы', icon: GitBranch, href: '/pages/settings/branches' },
  { id: 'currencies', label: 'Валюты', icon: Banknote, href: '/pages/settings/currencies' },
  { id: 'role', label: 'Роли', icon: Banknote, href: '/pages/settings/role' },
  { id: 'users', label: 'Пользователи', icon: Banknote, href: '/pages/settings/users' },
]

export default function SettingLayouts({ children }) {
  const pathname = usePathname()

  return (
    <div className="fixed  top-[60px] flex left-[80px] w-[calc(100%-80px)] h-[calc(100%-60px)] ">
      <aside className=" w-56 bg-white p-3 shadow-2xl shadow-gray-200">
        <h2 className={styles.sidebarTitle}>Настройки</h2>
        <nav className={styles.sidebarNav}>
          {sidebarItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                href={item.href}
                key={item.id}
                className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content child */}
      <div className="flex flex-1 ">
        {children}
      </div>
    </div>
  )
}