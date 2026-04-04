import { useState, useMemo, useEffect } from "react"
import { FilterSidebar as FilterSidebarComponent } from "@/components/directories/FilterSidebar/FilterSidebar"
import { observer } from 'mobx-react-lite'
import { sealDeal } from '@/store/saleDeal.store'
import debounce from 'lodash/debounce'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { formatDate } from '@/utils/formatDate'
import Input from "../../shared/Input" 
import SelectCounterParties from "../../ReadyComponents/SelectCounterParties"
import { formatAmount } from "../../../utils/helpers"
import { useUcodeDefaultApiQuery } from "../../../hooks/useDashboard"
import { keepPreviousData } from "@tanstack/react-query"
import MultiSelect from "../../shared/Selects/MultiSelect"

const FilterSidebar = observer(({ onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleOpen = (val) => {
    setIsOpen(val)
    onOpenChange?.(val)
  }

  // Fetch statuses
  const { data: fetchedData } = useUcodeDefaultApiQuery({
    queryKey: 'sales_status',
    urlMethod: 'GET',
    urlParams: '/items/sales_status?from-ofs=true',
    data: {},
    querySetting: {
      select: (response) => response?.data?.data?.response,
      staleTime: 1000 * 60 * 60,
      placeholder: keepPreviousData,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  })

  const statuses = useMemo(() => {
    return fetchedData?.map(status => ({
      value: status.guid,
      label: status.name
    }))
  }, [fetchedData])

  const filters = sealDeal.filters

  const [localAmountFrom, setLocalAmountFrom] = useState(filters.amountFrom || '')
  const [localAmountTo, setLocalAmountTo] = useState(filters.amountTo || '')
  const [localProfitFrom, setLocalProfitFrom] = useState(filters.profitFrom || '')
  const [localProfitTo, setLocalProfitTo] = useState(filters.profitTo || '')

  useEffect(() => {
    setLocalAmountFrom(filters.amountFrom || '')
    setLocalAmountTo(filters.amountTo || '')
    setLocalProfitFrom(filters.profitFrom || '')
    setLocalProfitTo(filters.profitTo || '')
  }, [filters.amountFrom, filters.amountTo, filters.profitFrom, filters.profitTo])

  const debouncedUpdateFilters = useMemo(
    () => debounce((field, value) => {
      sealDeal.filters = {
        ...sealDeal.filters,
        [field]: value
      }
    }, 200),
    []
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.selectedCounterparties?.length > 0) count++
    if (filters.operationDateStart || filters.operationDateEnd) count++
    if (filters.amountFrom || filters.amountTo) count++
    if (filters.profitFrom || filters.profitTo) count++
    return count
  }, [filters])

  const updateFilters = (field, value) => {
    sealDeal.filters = {
      ...sealDeal.filters,
      [field]: value
    }
  }

  return (
    <FilterSidebarComponent
      isOpen={isOpen}
      onClose={() => toggleOpen(!isOpen)}
      clearCount={activeFilterCount}
      onClear={() => sealDeal.resetFilters()}
    >
      <div className="flex flex-col gap-4">
        {/* status filter with singleSelect component */}
        <div className="flex flex-col gap-1.5 mt-2">
          <MultiSelect
            data={statuses}
            value={filters.status || []}
            onChange={(val) => updateFilters('status', val)}
            placeholder="Статус сделки"
          />
        </div>

        {/* Counterparty Selection */}
        <div className="flex flex-col gap-1.5">
          <SelectCounterParties
            onChange={(values) => sealDeal.setState('filters', { ...filters, selectedCounterparties: values })}
            placeholder="Выберите контрагентов"
            value={filters.selectedCounterparties}
          />
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col gap-1.5">
          <NewDateRangeComponent
            value={filters.dateRange}
            onChange={(range) => {
              const startDate = range?.start ? formatDate(new Date(range.start)) : ''
              const endDate = range?.end ? formatDate(new Date(range.end)) : ''
              sealDeal.filters = {
                ...sealDeal.filters,
                dateRange: range,
                operationDateStart: startDate,
                operationDateEnd: endDate
              }
            }}
          />
        </div>

        {/* Amount Borders Selectors */}
        <div className="flex flex-col gap-1.5">
          <p className="text-neutral-600 text-xs font-medium">Сумма сделки</p>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              placeholder="От"
              value={localAmountFrom ? formatAmount(localAmountFrom) : localAmountFrom}
              onChange={e => {
                setLocalAmountFrom(e.target.value)
                debouncedUpdateFilters('amountFrom', e.target.value)
              }}
              className="h-8!"
            />
            <span className="text-neutral-400 font-light">-</span>
            <Input
              type="text"
              placeholder="До"
              value={localAmountTo ? formatAmount(localAmountTo) : localAmountTo}
              onChange={e => {
                setLocalAmountTo(e.target.value)
                debouncedUpdateFilters('amountTo', e.target.value)
              }}
              className="h-8!"
            />
          </div>
        </div>

        {/* Profit Borders Selectors */}
        <div className="flex flex-col gap-1.5">
          <p className="text-neutral-600 text-xs font-medium">Прибыль сделки</p>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              placeholder="От"
              value={localProfitFrom ? formatAmount(localProfitFrom) : localProfitTo}
              onChange={e => {
                setLocalProfitFrom(e.target.value)
                debouncedUpdateFilters('profitFrom', e.target.value)
              }}
              className="h-8!"
            />
            <span className="text-neutral-400 font-light">-</span>
            <Input
              type="text"
              placeholder="До"
              value={localProfitTo ? formatAmount(localProfitTo) : localProfitTo}
              onChange={e => {
                setLocalProfitTo(e.target.value)
                debouncedUpdateFilters('profitTo', e.target.value)
              }}
              className="h-8!"
            />
          </div>
        </div>

      </div>
    </FilterSidebarComponent>
  )
})

export default FilterSidebar;