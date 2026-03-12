"use client"

import { useState } from 'react'
import styles from './ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'
import { GroupedSelect } from '../../common/GroupedSelect/GroupedSelect'

export function ReportFilterSidebar({
  isOpen,
  onClose,
  // Legal entity filter
  entityOptions,
  selectedEntity,
  onEntityChange,
  // Date range filter
  dateRange,
  onDateRangeChange,
  // Single date mode
  singleDateMode = false
}) {
  const [activeTab, setActiveTab] = useState('general')

  if (!isOpen) return null

  return (
    <div className={`${styles.sidebar} report-filter-sidebar`}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Фильтры</h2>
          <button
            onClick={onClose}
            className={styles.sidebarCloseButton}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Табы фильтров */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${activeTab === 'general' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('general')}
          >
            Общие
          </button>
          <button
            className={`${styles.filterTab} ${activeTab === 'quick' ? styles.inactive : styles.inactive}`}
            onClick={() => setActiveTab('quick')}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Быстрые
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'general' && (
          <div className={styles.filterContent}>
            {/* Период / Дата */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>
                {singleDateMode ? 'Дата' : 'Период'}
              </h3>
              <NewDateRangeComponent
                value={dateRange}
                onChange={onDateRangeChange}
                singleDateMode={singleDateMode}
              />
            </div>

            {/* Юридическое лицо / Счета */}
            {entityOptions && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Счета
                </h3>
                <GroupedSelect
                  data={entityOptions}
                  value={selectedEntity}
                  onChange={onEntityChange}
                  placeholder="Выберите счет"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
