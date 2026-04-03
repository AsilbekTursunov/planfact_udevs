'use client'

import { useEffect } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import SelectMyAccounts from '@/components/ReadyComponents/SelectMyAccounts'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import '@/styles/report-filters.css'
import SalesTransactions from '@/components/ReadyComponents/SalesTransactions'
import { FilterSidebar } from '@/components/directories/FilterSidebar/FilterSidebar'
import { FilterSection } from '../../../directories/FilterSidebar/FilterSidebar'

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


  const { filters } = cashFlowStore

  return (
    <FilterSidebar
      isOpen={isOpen}
      onClose={onClose}
    >

      {/* Date range */}
      <FilterSection title="Период">
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
      </FilterSection>

      {/* Accounts */}
      <div className='space-y-2'>
        <SelectMyAccounts
          value={filters.accountId}
          onChange={(val) => cashFlowStore.setAccounts(val)}
          className="bg-gray-ucode-25"
        />

        {/* Counterparties */}
        <SelectCounterParties
          value={filters.contrAgentId}
          onChange={(val) => cashFlowStore.setCounterparties(val)}
          className="bg-gray-ucode-25"
        />

        {/* Sales transtions */}
        <SalesTransactions
          value={filters.sellingDealId}
          onChange={(val) => cashFlowStore.setDeals(val)}
          placeholder="Все сделки"
          dropdownClassName="w-56"
        />
      </div>
    </FilterSidebar>
  )
})

export default CashFlowFilterSidebar
