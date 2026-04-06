'use client'

import { useEffect } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { balanceStore } from '@/components/reports/balance/balance.store'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import SelectMyAccounts from '@/components/ReadyComponents/SelectMyAccounts'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { FilterSidebar } from '@/components/directories/FilterSidebar/FilterSidebar'
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

   
  // ── Date range adapter for NewDateRangeComponent ───────────────────────────
  const dateRangeValue = { start: balanceStore.selectedDate, end: balanceStore.selectedDate }
  const handleDateRangeChange = (range) => {
    if (range?.start) {
      const d = range.start instanceof Date ? range.start : new Date(range.start)
      // Use local date components to avoid UTC timezone shift
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      balanceStore.setSelectedDate(`${year}-${month}-${day}`)
    }
  }

  return (
    <FilterSidebar
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pt-4">
        {/* Date */}
        <div>
          <NewDateRangeComponent
            value={dateRangeValue}
            onChange={handleDateRangeChange}
            singleDateMode
          />
        </div>

        {/* Accounts */}
        <div>
          <SelectMyAccounts
            value={balanceStore.selectedAccount}
            onSelect={(val) => balanceStore.setSelectedAccount(val)}
            className="bg-gray-ucode-25"
          />
        </div>

        {/* Counterparties */}
        <div>
          <SelectCounterParties
            value={balanceStore.selectedCounterparties}
            onChange={(val) => balanceStore.setSelectedCounterparties(val)}
            className="bg-gray-ucode-25"
          />
        </div>
      </div>
    </FilterSidebar>
  )
})

export default BalanceFilterSidebar