"use client"

import { cn } from '@/app/lib/utils'
import styles from './OperationsHeader.module.scss'

export function OperationsHeader({ 
  isFilterOpen, 
  onFilterToggle, 
  onCreateClick, 
  selectedCount = 0,
  searchQuery = '',
  onSearchChange
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Операции</h1>
          <button 
            onClick={onCreateClick}
            className={styles.headerCreateButton}
          >
            Создать
          </button> 
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerSearch}>
            <input
              type="text"
              placeholder="По счету, контрагенту, или статья"
              className={styles.headerSearchInput}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <svg className={styles.headerSearchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div> 
          <button className={styles.headerMoreButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="10" r="1.5" fill="#98A2B3"/>
              <circle cx="10" cy="10" r="1.5" fill="#98A2B3"/>
              <circle cx="16" cy="10" r="1.5" fill="#98A2B3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
