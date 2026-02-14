"use client"

import { cn } from '@/app/lib/utils'
import styles from './OperationsHeader.module.scss'

export function OperationsHeader({ isFilterOpen, onFilterToggle, onCreateClick, selectedCount = 0 }) {
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
          <button className={styles.headerActionButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 6.66667L10 2.5M10 2.5L5.83333 6.66667M10 2.5V12.5" stroke="#1D2939" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Импортировать</span>
          </button>
          <button className={styles.headerActionButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.1665 4.1665L14.9998 4.1665" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.33325 8.33325L12.0833 12.0833" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.1665 9.1665L4.1665 14.9998" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5.37021" cy="5.37021" r="3.7037" stroke="#141B34"/>
              <circle cx="4.16667" cy="16.6667" r="1.66667" stroke="#141B34"/>
              <circle cx="13.3332" cy="13.3332" r="1.66667" stroke="#141B34"/>
              <circle cx="16.6667" cy="4.16667" r="1.66667" stroke="#141B34"/>
            </svg>
            <span>Распределить</span>
            {selectedCount > 0 && (
              <span className={styles.headerActionBadge}>{selectedCount}</span>
            )}
          </button>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerSearch}>
            <input
              type="text"
              placeholder="Поиск по операциям"
              className={styles.headerSearchInput}
            />
            <svg className={styles.headerSearchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <button className={styles.headerDownloadButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>.xls</span>
          </button>
          <button 
            onClick={onFilterToggle}
            className={cn(styles.headerFilterButton, isFilterOpen && styles.active)}
            title="Фильтры"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.83333H17.5M5 10H15M7.91667 14.1667H12.0833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
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
