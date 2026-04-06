'use client'

import { observer } from 'mobx-react-lite'
import { balanceStore } from '@/components/reports/balance/balance.store'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import SelectMyAccounts from '@/components/ReadyComponents/SelectMyAccounts'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { FilterSidebar } from '@/components/directories/FilterSidebar/FilterSidebar'
import '@/styles/report-filters.css'

const BalanceFilterSidebar = observer(({ isOpen, onClose }) => {

  const dateRangeValue = { start: balanceStore.selectedDate, end: balanceStore.selectedDate }
  const handleDateRangeChange = (range) => {
    balanceStore.setSelectedDate(range.end)
    console.log('range', range)
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
            singleDate={false}
          />
        </div>

        {/* Accounts */}
        <div>
          <SelectMyAccounts
            value={balanceStore.selectedAccount}
            onChange={(val) => balanceStore.setSelectedAccount(val)}
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