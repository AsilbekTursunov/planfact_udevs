"use client"

import { useState } from 'react'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import styles from './ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'
import { GroupedSelect } from '../../common/GroupedSelect/GroupedSelect'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'

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
  // Account filter
  accountOptions,
  selectedAccounts,
  onAccountsChange,
  // Counterparty filter
  counterpartyOptions,
  selectedCounterparties,
  onCounterpartiesChange,
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

  console.log('counterpartyOptions', counterpartyOptions) 

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
            {/* Период / Диапазон дат */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>
                Период
                {/* <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg> */}
              </h3>
              <NewDateRangeComponent
                value={dateRange}
                onChange={onDateRangeChange}
              />
            </div>

            {/* Счет - всегда показываем */}
            <div className={styles.filterSection}> 
              {accountOptions && accountOptions.length > 0 ? (
                <MultiSelect
                  data={accountOptions}
                  value={selectedAccounts}
                  onChange={(value) => {
                    onAccountsChange(value)
                  }}
                  placeholder="Юрлица и счета"
                  hideSelectAll={true}
                  valueKey="value"

                />
              ) : (
                <MultiSelect
                  data={[]}
                  value={[]}
                  onChange={() => { }}
                  placeholder="Загрузка..."
                  loading={true}
                />
              )}
            </div>

            {/* Контрагент - всегда показываем */}
            <div className={styles.filterSection}> 
              {counterpartyOptions && counterpartyOptions.length > 0 ? (
                <MultiSelect
                  data={counterpartyOptions}
                  value={selectedCounterparties}
                  onChange={onCounterpartiesChange}
                  hideSelectAll={true}
                  placeholder="Все контрагенты"
                  valueKey="value"
                />
              ) : (
                <MultiSelect
                  data={[]}
                  value={[]}
                  onChange={() => { }}
                  placeholder="Загрузка..."
                  loading={true}
                />
              )}
            </div>



            {/* Группировка (опционально) */}
            {groupingOptions && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Группировка
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                    <OperationCheckbox
                      checked={profitTypes.operational}
                      onChange={() => onProfitTypesChange('operational')}
                      label="Операционная"
                    /> 
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={profitTypes.ebitda}
                      onChange={() => onProfitTypesChange('ebitda')}
                      label="EBITDA"
                    /> 
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={profitTypes.ebit}
                      onChange={() => onProfitTypesChange('ebit')}
                      label="EBIT"
                    /> 
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={profitTypes.ebt}
                      onChange={() => onProfitTypesChange('ebt')}
                      label="EBT"
                    /> 
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
