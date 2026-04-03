'use client'

import { useEffect, useMemo } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { pnlStore } from '@/components/reports/profit-and-loss/pnl.store'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { FilterSidebar } from '@/components/directories/FilterSidebar/FilterSidebar'
import { useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import { FilterSection } from '../../../directories/FilterSidebar/FilterSidebar'

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

  return (
    <FilterSidebar
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pt-4">
        {/* Date range */}
        <FilterSection title="Период">
          <NewDateRangeComponent
            value={pnlStore.dateRange}
            onChange={(val) => pnlStore.setDateRange(val)}
          />
        </FilterSection>

        {/* Accounts */}
        <div>
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
              onChange={() => { }}
              placeholder="Загрузка..."
              loading={true}
            />
          )}
        </div>

        {/* Counterparties */}
        <div>
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
              onChange={() => { }}
              placeholder="Загрузка..."
              loading={true}
            />
          )}
        </div>

        {/* Profit types */}
        <FilterSection title="Виды прибыли">
          <div className="space-y-2">
            {[
              { key: 'operational', label: 'Операционная' },
              { key: 'ebitda', label: 'EBITDA' },
              { key: 'ebit', label: 'EBIT' },
              { key: 'ebt', label: 'EBT' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <OperationCheckbox
                  checked={pnlStore.profitTypes[key]}
                  onChange={() => pnlStore.toggleProfitType(key)}
                  label={label}
                />
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </FilterSidebar>
  )
})

export default PnLFilterSidebar
