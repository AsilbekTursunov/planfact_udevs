import { ArrowLeftToLine, Trash } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/app/lib/utils"
import { observer } from 'mobx-react-lite'
import { sealDeal } from '@/store/saleDeal.store'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { useCounterpartiesPlanFact } from '@/hooks/useDashboard'
import { formatDate } from '@/utils/formatDate'
import Input from "../../shared/Input"
import { returnNumber } from "../../../utils/helpers"

const FilterSidebar = observer(() => {
  const [isOpen, setIsOpen] = useState(true)

  // Fetch counterparties specifically for filter dropdowns (unfiltered)
  const { data: counterpartiesFilterData } = useCounterpartiesPlanFact({
    page: 1,
    limit: 1000,
  })

  // Prepare options for filters using unfiltered counterparties
  const counterpartiesOptions = useMemo(() => {
    const items = counterpartiesFilterData?.data?.data?.data || []
    if (!items || items.length === 0) return []
    return items.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия'
    }))
  }, [counterpartiesFilterData])

  const filters = sealDeal.filters

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
    <div className={cn("bg-neutral-100 transition-all duration-300 min-h-dvh border-r border-neutral-200", isOpen ? "w-64 p-3" : " px-2 pt-3")}>
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
          {/* Counterparty Selection */}
          <div className="flex flex-col gap-1.5">
            <p className="text-neutral-600 text-xs font-medium">Контрагенты</p>
            <MultiSelect
              data={counterpartiesOptions}
              value={filters.selectedCounterparties || []}
              onChange={(values) => updateFilters('selectedCounterparties', values)}
              placeholder="Выберите контрагентов"
              valueKey="value"
              hideSelectAll={true}
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-col gap-1.5">
            <p className="text-neutral-600 text-xs font-medium">Период аналитики</p>
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
                value={returnNumber(filters.amountFrom) || ''}
                onChange={e => updateFilters('amountFrom', (e.target.value))}
              />
              <span className="text-neutral-400 font-light">-</span>
              <Input
                type="text"
                placeholder="До"
                value={returnNumber(filters.amountTo) || ''}
                onChange={e => updateFilters('amountTo', (e.target.value))}

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
                value={returnNumber(filters.profitFrom) || ''}
                onChange={e => updateFilters('profitFrom', (e.target.value))}
              />
              <span className="text-neutral-400 font-light">-</span>
              <Input
                type="text"
                placeholder="До"
                value={returnNumber(filters.profitTo) || ''}
                onChange={e => updateFilters('profitTo', (e.target.value))}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  )
})

export default FilterSidebar;