"use client"

import { useState } from 'react'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { DateRangePickerModal } from '@/components/common/DateRangePickerModal/DateRangePickerModal'
import styles from './ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'

export function ReportFilterSidebar({
  isOpen,
  onClose,
  // Period filter
  periodOptions,
  selectedPeriod,
  onPeriodChange,
  // Legal entity filter
  entityOptions,
  selectedEntity,
  onEntityChange,
  // Date range filter
  dateRange,
  onDateRangeChange,
  // Grouping filter (optional)
  groupingOptions,
  selectedGrouping,
  onGroupingChange,
  // Profit types filter (optional)
  profitTypes,
  onProfitTypesChange
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
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            {/* Период */}
            {periodOptions && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Период
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </h3>
                <GroupedSelect
                  data={periodOptions}
                  value={selectedPeriod}
                  onChange={onPeriodChange}
                  placeholder="Весь период"
                />
              </div>
            )}

            {/* Юридическое лицо */}
            {entityOptions && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Юридическое лицо
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </h3>
                <GroupedSelect
                  data={entityOptions}
                  value={selectedEntity}
                  onChange={onEntityChange}
                  placeholder="Все организации"
                />
              </div>
            )}

            {/* Диапазон дат */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>
                Диапазон дат
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </h3>
              <DateRangePickerModal
                selectedRange={dateRange}
                onChange={onDateRangeChange}
                placeholder="Выберите период"
              />
            </div>

            {/* Группировка (опционально) */}
            {groupingOptions && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Группировка
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </h3>
                <GroupedSelect
                  data={groupingOptions}
                  value={selectedGrouping}
                  onChange={onGroupingChange}
                  placeholder="Способ построения"
                />
              </div>
            )}

            {/* Виды прибыли (опционально) */}
            {profitTypes && onProfitTypesChange && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Виды прибыли
                </h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={profitTypes.operational}
                      onChange={() => onProfitTypesChange('operational')}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}>
                      {profitTypes.operational && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className={styles.checkboxText}>Операционная</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={profitTypes.ebitda}
                      onChange={() => onProfitTypesChange('ebitda')}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}>
                      {profitTypes.ebitda && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className={styles.checkboxText}>EBITDA</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={profitTypes.ebit}
                      onChange={() => onProfitTypesChange('ebit')}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}>
                      {profitTypes.ebit && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className={styles.checkboxText}>EBIT</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={profitTypes.ebt}
                      onChange={() => onProfitTypesChange('ebt')}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}>
                      {profitTypes.ebt && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className={styles.checkboxText}>EBT</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
