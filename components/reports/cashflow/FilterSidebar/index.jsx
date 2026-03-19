'use client'

import { useEffect, useMemo } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import styles from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar.module.scss'
import '@/styles/report-filters.css'
import { useUcodeRequestQuery } from '@/hooks/useDashboard'
import SalesTransactions from '@/components/ReadyComponents/SalesTransactions'

const CashFlowFilterSidebar = observer(({ isOpen, onClose }) => {
  const accountQuery = useUcodeRequestQuery({
    method: 'get_my_accounts',
    data: { limit: 1000, page: 1 }
  })

  const { data: counterpartiesGroupData, isLoading: loadingCounterparties } = useUcodeRequestQuery({
    method: 'get_counterparties_group',
    data: { limit: 1000, page: 1 }
  })

  // ── Build options ─────────────────────────────────────────────────────────
  const accountOptions = useMemo(() => {
    const data = accountQuery.data
    if (!data) return []
    const raw = data?.data?.data?.data || []
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
  }, [accountQuery.data])

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
                start: filters.periodStartDate ? new Date(filters.periodStartDate) : null,
                end: filters.periodEndDate ? new Date(filters.periodEndDate) : null
              }}
              onChange={(val) => {
                cashFlowStore.setPeriodStartDate(val?.start)
                cashFlowStore.setPeriodEndDate(val?.end)
              }}
            />
          </div>

          {/* Accounts */}
          <div className={styles.filterSection}>
            {accountOptions.length > 0 ? (
              <MultiSelect
                data={accountOptions}
                value={filters.deals}
                onChange={(val) => cashFlowStore.setDeals(val)}
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
                loading={accountQuery.isLoading}
              />
            )}
          </div>

          {/* Counterparties */}
          <div className={styles.filterSection}>
            {counterpartyOptions.length > 0 ? (
              <MultiSelect
                data={counterpartyOptions}
                value={filters.contrAgentId}
                onChange={(val) => cashFlowStore.setCounterparties(val)}
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
                loading={loadingCounterparties}
              />
            )}
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
