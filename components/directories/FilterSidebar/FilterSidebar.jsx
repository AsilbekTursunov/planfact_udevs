"use client"

import { useState } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './FilterSidebar.module.scss'

export function FilterSidebar({ isOpen, onClose, children }) {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className={cn(styles.sidebar, isOpen ? styles.open : styles.closed)}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Фильтры</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Табы фильтров */}
        <div className={styles.filterTabs}>
          <button 
            className={cn(styles.filterTab, activeTab === 'general' ? styles.active : styles.inactive)}
            onClick={() => setActiveTab('general')}
          >
            Общие
          </button>
          <button 
            className={cn(styles.filterTab, activeTab === 'quick' ? styles.inactive : styles.inactive)}
            onClick={() => setActiveTab('quick')}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Быстрые
          </button>
        </div>

        {activeTab === 'general' && (
          <div className={styles.childrenContainer}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export function FilterSection({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

export function FilterCheckbox({ checked, onChange, label }) {
  return (
    <label className={styles.checkboxLabel}>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={styles.checkboxInput}
        />
        <div className={cn(styles.checkbox, checked ? styles.checked : styles.unchecked)}>
          {checked && (
            <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className={styles.checkboxText}>{label}</span>
    </label>
  )
}
