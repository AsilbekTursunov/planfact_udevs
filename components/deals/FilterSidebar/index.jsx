import { ArrowLeftToLine, Trash } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/app/lib/utils"
import { observer } from 'mobx-react-lite'
import { sealDeal } from '@/store/saleDeal.store'
import debounce from 'lodash/debounce'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { formatDate } from '@/utils/formatDate'
import Input from "../../shared/Input"
import SingleSelect from "../../shared/Selects/SingleSelect"
import SelectCounterParties from "../../ReadyComponents/SelectCounterParties"
import { formatAmount } from "../../../utils/helpers"

const statusOptions = [
  { value: 'Новая', label: 'Новая' },
  { value: 'В работе', label: 'В работе' },
  { value: 'Завершена', label: 'Завершена' }
]

const FilterSidebar = observer(() => {
  const [isOpen, setIsOpen] = useState(true)


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
    <div className={cn("bg-neutral-100 transition-all duration-300 h-screen overflow-hidden border-r border-neutral-200", isOpen ? "w-64 p-3" : " px-2 pt-3")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className={cn("text-lg font-bold text-neutral-800", isOpen ? "" : "hidden")}>Фильтры</h2>
          {isOpen && activeFilterCount > 0 && (
            <div className="relative flex items-center bg-gray-200 px-2 py-0.5 rounded-lg gap-1 ml-1.5 h-6">
              {/* Bubble tail */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-200 transform rotate-45"></div>
              <span className="text-neutral-800 font-bold text-sm relative z-10 pl-0.5">{activeFilterCount}</span>
              <button
                onClick={(e) => { e.stopPropagation(); sealDeal.resetFilters(); }}
                className="text-neutral-500 hover:text-red-500 cursor-pointer relative z-10 flex items-center justify-center p-0.5"
                title="Сбросить фильтры"
              >
                <Trash size={14} className="stroke-2" />
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className={cn("text-neutral-600 cursor-pointer hover:text-neutral-900", isOpen ? "" : "transform rotate-180 transition-all duration-300")}>
          <ArrowLeftToLine size={18} className="text-primary" />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-4">

          {/* status filter with singleSelect component */}
          <div className="flex flex-col gap-1.5">
            {/* <p className="text-neutral-600 text-xs font-medium">Статус сделки</p> */}
            <SingleSelect
              data={statusOptions}
              value={filters.status?.[0] || ''}
              onChange={(val) => updateFilters('status', val ? [val] : [])}
              placeholder="Статус сделки"
            />
          </div>

          {/* Counterparty Selection */}
          <div className="flex flex-col gap-1.5">
            {/* <p className="text-neutral-600 text-xs font-medium">Контрагенты</p> */}
            <SelectCounterParties
              onChange={(values) => sealDeal.setState('filters', { ...filters, selectedCounterparties: values })}
              placeholder="Выберите контрагентов"
              value={filters.selectedCounterparties}
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-col gap-1.5">
            {/* <p className="text-neutral-600 text-xs font-medium">Период аналитики</p> */}
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
      )}
    </div>
  )
})

export default FilterSidebar;