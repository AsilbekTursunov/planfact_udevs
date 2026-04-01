'use client'

import { useEffect } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { pnlStore } from '@/components/reports/profit-and-loss/pnl.store'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import styles from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import { useUcodeRequestQuery } from '@/hooks/useDashboard'
import { useMemo } from 'react'

const PnLFilterSidebar = observer(({ isOpen, onClose }) => {
  // ── Load accounts & counterparties via React Query (cached) ─────────────────
  const { data: myAccountsData } = useUcodeRequestQuery({
    method: 'get_my_accounts',
    data: { limit: 1000, page: 1 }
  })

  const { data: counterpartiesGroupData } = useUcodeRequestQuery({
    method: 'get_counterparties_group',
    data: { limit: 1000, page: 1 }
  })

  // ── Build options ─────────────────────────────────────────────────────────
  const accountOptions = useMemo(() => {
    if (!myAccountsData) return []
    const raw = myAccountsData?.data?.data?.data || []
    const flatten = (items) => {
      let result = []
      items.forEach(item => {
        result.push(item)
        if (item.children?.length > 0) result = result.concat(flatten(item.children))
      })
      return result
    }
    return flatten(Array.isArray(raw) ? raw : []).map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия',
      group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
    }))
  }, [myAccountsData])

  const counterpartyOptions = useMemo(() => {
    if (!counterpartiesGroupData) return []
    const groups = counterpartiesGroupData?.data?.data?.data || []
    return groups
      .filter(item => item.children?.length > 0)
      .flatMap(item => [
        { value: '', label: item.nazvanie_gruppy, group: item.nazvanie_gruppy },
        ...item.children.map(child => ({
          value: child.guid,
          label: child.nazvanie || '',
          group: item.nazvanie_gruppy
        }))
      ])
  }, [counterpartiesGroupData])

  // ── Fetch report reactively on filter changes ──────────────────────────────
  useEffect(() => {
    const dispose = autorun(() => {
      void pnlStore.dateRange
      void pnlStore.selectedPeriod
      void pnlStore.selectedGrouping
      void pnlStore.isCalculation
      void pnlStore.profitTypes
      void pnlStore.selectedAccounts
      void pnlStore.selectedCounterparties
      void pnlStore.selectedCurrency
      pnlStore.fetchReport()
    })
    return dispose
  }, [])

  if (!isOpen) return null

  return (
    <div className={`${styles.sidebar} report-filter-sidebar`}>
      <div className={styles.sidebarContent}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Фильтры</h2>
          <button onClick={onClose} className={styles.sidebarCloseButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {/* <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${styles.active}`}>Общие</button>
          <button className={`${styles.filterTab} ${styles.inactive}`} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Быстрые
          </button>
        </div> */}

        {/* Content */}
        <div className={styles.filterContent}>
          {/* Date range */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterSectionTitle}>Период</h3>
            <NewDateRangeComponent
              value={pnlStore.dateRange}
              onChange={(val) => pnlStore.setDateRange(val)}
            />
          </div>

          {/* Accounts */}
          <div className={styles.filterSection}>
            {accountOptions.length > 0 ? (
              <MultiSelect
                data={accountOptions}
                value={pnlStore.selectedAccounts}
                onChange={(val) => pnlStore.setSelectedAccounts(val)}
                placeholder="Юрлица и счета"
                hideSelectAll={true}
                valueKey="value"
              />
            ) : (
              <MultiSelect
                data={[]}
                value={[]}
                onChange={() => {}}
                placeholder="Загрузка..."
                loading={true}
              />
            )}
          </div>

          {/* Counterparties */}
          <div className={styles.filterSection}>
            {counterpartyOptions.length > 0 ? (
              <MultiSelect
                data={counterpartyOptions}
                value={pnlStore.selectedCounterparties}
                onChange={(val) => pnlStore.setSelectedCounterparties(val)}
                hideSelectAll={true}
                placeholder="Все контрагенты"
                valueKey="value"
              />
            ) : (
              <MultiSelect
                data={[]}
                value={[]}
                onChange={() => {}}
                placeholder="Загрузка..."
                loading={true}
              />
            )}
          </div>

          {/* Profit types */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterSectionTitle}>Виды прибыли</h3>
            <div className={styles.checkboxGroup}>
              {[
                { key: 'operational', label: 'Операционная' },
                { key: 'ebitda', label: 'EBITDA' },
                { key: 'ebit', label: 'EBIT' },
                { key: 'ebt', label: 'EBT' }
              ].map(({ key, label }) => (
                <label key={key} className={styles.checkboxLabel}>
                  <OperationCheckbox
                    checked={pnlStore.profitTypes[key]}
                    onChange={() => pnlStore.toggleProfitType(key)}
                    label={label}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default PnLFilterSidebar
