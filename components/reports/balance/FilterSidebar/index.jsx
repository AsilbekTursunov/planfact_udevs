'use client'

import { useEffect } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { balanceStore } from '@/components/reports/balance/balance.store'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import SelectMyAccounts from '@/components/ReadyComponents/SelectMyAccounts'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import styles from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'

const BalanceFilterSidebar = observer(({ isOpen, onClose }) => {
  // ── Load legal entities once on mount ─────────────────────────────────────
  useEffect(() => {
    balanceStore.fetchLegalEntities()
  }, [])

  // ── Fetch balance reactively whenever filter state changes (MobX autorun) ──
  useEffect(() => {
    // autorun tracks observable reads inside, so it re-runs on any filter change
    const dispose = autorun(() => {
      // Read observables to register MobX dependencies
      void balanceStore.selectedDate
      void balanceStore.selectedEntity
      void balanceStore.selectedCurrency
      void balanceStore.selectedCounterparties
      void balanceStore.selectedAccount
      balanceStore.fetchBalance()
    })
    return dispose
  }, [])

  if (!isOpen) return null

  // ── Build entity options ───────────────────────────────────────────────────
  const entityOptions = [
    { guid: '', label: 'Все счета' },
    ...balanceStore.legalEntities
  ]

  // ── Date range adapter for NewDateRangeComponent ───────────────────────────
  const dateRangeValue = { start: balanceStore.selectedDate, end: balanceStore.selectedDate }
  const handleDateRangeChange = (range) => {
    if (range?.start) {
      const dateStr =
        range.start instanceof Date
          ? range.start.toISOString().split('T')[0]
          : range.start
      balanceStore.setSelectedDate(dateStr)
    }
  }

  return (
    <div className={`${styles.sidebar} report-filter-sidebar`}>
      <div className={styles.sidebarContent}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Фильтры</h2>
          <button onClick={onClose} className={styles.sidebarCloseButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs (visual only, "Общие" active) */}
        {/* <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${styles.active}`}>Общие</button>
          <button
            className={`${styles.filterTab} ${styles.inactive}`}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Быстрые
          </button>
        </div> */}

        {/* Filter content */}
        <div className={styles.filterContent}>
          {/* Date */}
          <div className={styles.filterSection}>
            {/* <h3 className={styles.filterSectionTitle}>Период</h3> */}
            <NewDateRangeComponent
              value={dateRangeValue}
              onChange={handleDateRangeChange}
              singleDateMode
            />
          </div>

          {/* Legal entity */}
          {/* <div className={styles.filterSection}>
            <h3 className={styles.filterSectionTitle}>Юридическое лицо</h3>
            {balanceStore.legalEntitiesLoading ? (
              <GroupedSelect
                data={[]}
                value=""
                onChange={() => {}}
                placeholder="Загрузка..."
              />
            ) : (
              <GroupedSelect
                data={entityOptions}
                value={balanceStore.selectedEntity}
                onChange={(val) => balanceStore.setSelectedEntity(val)}
                placeholder="Все счета"
              />
            )}
          </div> */}

          {/* Accounts */}
          <div className={styles.filterSection}>
            <SelectMyAccounts
              value={balanceStore.selectedAccount}
              onSelect={(val) => balanceStore.setSelectedAccount(val)}
              className="bg-gray-ucode-25"
            />
          </div>

          {/* Counterparties */}
          <div className={styles.filterSection}>
            {/* <h3 className={styles.filterSectionTitle}>Контрагенты</h3> */}
            <SelectCounterParties
              value={balanceStore.selectedCounterparties}
              onChange={(val) => balanceStore.setSelectedCounterparties(val)}
              className="bg-gray-ucode-25"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default BalanceFilterSidebar