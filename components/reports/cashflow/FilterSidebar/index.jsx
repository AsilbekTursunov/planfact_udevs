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
import { ChevronLeft } from 'lucide-react'

const CashFlowFilterSidebar = observer(({ isOpen, onClose }) => {
  // Data fetching is now handled inside SelectMyAccounts and SelectCounterParties components

  // ── Fetch report reactively on filter changes ──────────────────────────────
  useEffect(() => {
    const dispose = autorun(() => {
      void cashFlowStore.filters.periodStartDate
      void cashFlowStore.filters.periodEndDate
      void cashFlowStore.filters.periodType
      void cashFlowStore.filters.currencyCode
      void cashFlowStore.filters.sellingDealId
      void cashFlowStore.filters.contrAgentId
      void cashFlowStore.filters.accountId
      cashFlowStore.fetchReport()
    })
    return dispose
  }, [])

  if (!isOpen) return null

  const { filters } = cashFlowStore

  return (
    <div className={`${styles.sidebar}`}>
      <div className="p-2 pt-5 overflow-auto pb-14">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-ucode-800 text-xl font-semibold">Фильтры</h2>
            <button
              onClick={onClose}
              className="cursor-pointer"
            >
              <ChevronLeft size={20} className='text-primary-dark' />
            </button>
          </div>

          {/* Tabs */}
          {/* <div className="filterTabWrapper">
            <button className={`filterTab active`}>Общие</button>
            <button className={`filterTab inactive`}>
              Быстрые
            </button>
          </div> */}

          {/* Content */}
          <div className="">
            {/* Date range */}
            <div className="mb-2">
              <h3 className="text-neutral-400 text-sm mb-2">Период</h3>
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
                value={filters.accountId}
                onChange={(val) => cashFlowStore.setAccounts(val)}
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
    </div>
  )
})

export default CashFlowFilterSidebar
