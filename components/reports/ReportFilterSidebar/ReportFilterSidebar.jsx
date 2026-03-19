"use client"

import { useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import styles from './ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'
import { GroupedSelect } from '../../common/GroupedSelect/GroupedSelect'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import { useUcodeRequestQuery } from '@/hooks/useDashboard'
import { reportsStore } from '@/store/reports.store'

export const ReportFilterSidebar = observer(({
  isOpen,
  onClose,
  // Account filter
  accountOptions: propsAccountOptions,
  selectedAccounts: propsSelectedAccounts,
  onAccountsChange,
  // Counterparty filter
  counterpartyOptions: propsCounterpartyOptions,
  selectedCounterparties: propsSelectedCounterparties,
  onCounterpartiesChange,
  // Date range filter
  dateRange: propsDateRange,
  onDateRangeChange,
  // Grouping filter (optional)
  groupingOptions,
  selectedGrouping: propsSelectedGrouping,
  onGroupingChange,
  // Profit types filter (optional)
  profitTypes: propsProfitTypes,
  onProfitTypesChange
}) => {
  const [activeTab, setActiveTab] = useState('general')

  const { data: counterpartiesGroupData } = useUcodeRequestQuery({
    method: 'get_counterparties_group',
    data: { limit: 1000, page: 1 },
    skip: !!propsCounterpartyOptions
  })

  const { data: myAccountsData } = useUcodeRequestQuery({
    method: 'get_my_accounts',
    data: { limit: 1000, page: 1 },
    skip: !!propsAccountOptions
  })

  const accountOptions = propsAccountOptions || useMemo(() => {
    if (!myAccountsData) return []
    const chartOfAccountsRaw = myAccountsData?.data?.data?.data || []
    const flatten = (items) => {
      let result = []
      items.forEach(item => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          result = result.concat(flatten(item.children))
        }
      })
      return result
    }
    const myAccounts = Array.isArray(chartOfAccountsRaw) ? flatten(chartOfAccountsRaw) : []
    return myAccounts.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия',
      group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
    }))
  }, [myAccountsData])

  const counterpartyOptions = propsCounterpartyOptions || useMemo(() => {
    if (!counterpartiesGroupData) return []
    const groups = counterpartiesGroupData?.data?.data?.data || []
    const hasChildren = groups.filter(item => item.children && item.children.length > 0)
    return hasChildren.map(item => [
      { value: '', label: item.nazvanie_gruppy, group: item.nazvanie_gruppy },
      ...(item.children || []).map(child => ({
        value: child.guid,
        label: child.nazvanie || '',
        group: item.nazvanie_gruppy
      }))
    ]).flat()
  }, [counterpartiesGroupData])

  const currentDateRange = propsDateRange !== undefined ? propsDateRange : reportsStore.dateRange
  const handleDateRangeChange = (val) => onDateRangeChange ? onDateRangeChange(val) : reportsStore.setFilter('dateRange', val)

  const currentAccounts = propsSelectedAccounts !== undefined ? propsSelectedAccounts : reportsStore.selectedAccounts
  const handleAccountsChange = (val) => onAccountsChange ? onAccountsChange(val) : reportsStore.setFilter('selectedAccounts', val)

  const currentCounterparties = propsSelectedCounterparties !== undefined ? propsSelectedCounterparties : reportsStore.selectedCounterparties
  const handleCounterpartiesChange = (val) => onCounterpartiesChange ? onCounterpartiesChange(val) : reportsStore.setFilter('selectedCounterparties', val)

  const currentGrouping = propsSelectedGrouping !== undefined ? propsSelectedGrouping : reportsStore.selectedGrouping
  const handleGroupingChange = (val) => onGroupingChange ? onGroupingChange(val) : reportsStore.setFilter('selectedGrouping', val)

  const currentProfitTypes = propsProfitTypes !== undefined ? propsProfitTypes : reportsStore.profitTypes
  const handleProfitTypesChange = (val) => onProfitTypesChange ? onProfitTypesChange(val) : reportsStore.toggleProfitType(val)

  // Show profit types if we are not getting explicit props (i.e. used dynamically via mobx for P&L)
  const showProfitTypes = !propsCounterpartyOptions

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
                value={currentDateRange}
                onChange={handleDateRangeChange}
              />
            </div>

            {/* Счет - всегда показываем */}
            <div className={styles.filterSection}>
              {accountOptions && accountOptions.length > 0 ? (
                <MultiSelect
                  data={accountOptions}
                  value={currentAccounts}
                  onChange={handleAccountsChange}
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
                  value={currentCounterparties}
                  onChange={handleCounterpartiesChange}
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
                  value={currentGrouping}
                  onChange={handleGroupingChange}
                  placeholder="Способ построения"
                />
              </div>
            )}

            {/* Виды прибыли (опционально) */}


            {showProfitTypes && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle}>
                  Виды прибыли
                </h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={currentProfitTypes?.operational}
                      onChange={() => handleProfitTypesChange('operational')}
                      label="Операционная"
                    />
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={currentProfitTypes?.ebitda}
                      onChange={() => handleProfitTypesChange('ebitda')}
                      label="EBITDA"
                    />
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={currentProfitTypes?.ebit}
                      onChange={() => handleProfitTypesChange('ebit')}
                      label="EBIT"
                    />
                  </label>

                  <label className={styles.checkboxLabel}>
                    <OperationCheckbox
                      checked={currentProfitTypes?.ebt}
                      onChange={() => handleProfitTypesChange('ebt')}
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
})
