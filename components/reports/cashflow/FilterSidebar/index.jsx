'use client'

import { useEffect } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import SelectMyAccounts from '@/components/ReadyComponents/SelectMyAccounts'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import styles from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import SalesTransactions from '@/components/ReadyComponents/SalesTransactions'

const CashFlowFilterSidebar = observer(({ isOpen, onClose }) => {
  // Data fetching is now handled inside SelectMyAccounts and SelectCounterParties components

  // ── Fetch report reactively on filter changes ──────────────────────────────
  useEffect(() => {
    const dispose = autorun(() => {
      void cashFlowStore.filters.periodStartDate
      void cashFlowStore.filters.periodEndDate
      void cashFlowStore.filters.periodType
      void cashFlowStore.filters.currencyCode
      void cashFlowStore.filters.counterparty_id
      void cashFlowStore.filters.deals
      void cashFlowStore.filters.counterparties
      cashFlowStore.fetchReport()
    })
    return dispose
  }, [])

  if (!isOpen) return null

  const { filters } = cashFlowStore

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
        <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${styles.active}`}>Общие</button>
          <button className={`${styles.filterTab} ${styles.inactive}`} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Быстрые
          </button>
        </div>

        {/* Content */}
        <div className={styles.filterContent}>
          {/* Date range */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterSectionTitle}>Период</h3>
            <NewDateRangeComponent
              value={{
                start: filters.periodStartDate ? new Date(filters.periodStartDate) : '',
                end: filters.periodEndDate ? new Date(filters.periodEndDate) : ''
              }}
              onChange={(val) => { 
                cashFlowStore.setPeriodStartDate(val?.start)
                cashFlowStore.setPeriodEndDate(val?.end)
              }}
            />
          </div>

          {/* Accounts */}
          <div className={styles.filterSection}>
            <SelectMyAccounts
              value={filters.accountId?.[0] || ''}
              onSelect={(val) => cashFlowStore.setAccounts(val ? [val] : [])}
              className="bg-gray-ucode-25"
            />
          </div>

          {/* Counterparties */}
          <div className={styles.filterSection}>
            <SelectCounterParties
              value={filters.contrAgentId}
              onChange={(val) => cashFlowStore.setCounterparties(val)}
              className="bg-gray-ucode-25"
            />
          </div>

          {/* Sales transtions */}
          <div className={styles.filterSection}>
            <SalesTransactions
              value={filters.sellingDealId}
              onChange={(val) => cashFlowStore.setDeals(val)}
              placeholder="Все сделки"
              dropdownClassName="w-56"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default CashFlowFilterSidebar
