'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Settings as SettingsIcon,
  GitBranch,
} from 'lucide-react'
import styles from './settings.module.scss'

const sidebarItems = [
  { id: 'general', label: 'Общие настройки', icon: SettingsIcon, href: '/pages/settings' },
  { id: 'branches', label: 'Филиалы', icon: GitBranch, href: '/pages/settings/branches' },
]

export default function SettingLayouts({ children }) {
  const pathname = usePathname()

  return (
    <div className={styles.container}>
      {/* Left sidebar */}
      <aside className={styles.sidebar}>
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
      {children}
    </div>
  )
}