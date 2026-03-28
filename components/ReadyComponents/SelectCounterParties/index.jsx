import React, { useMemo } from 'react'
import MultiSelect from '@/components/shared/Selects/MultiSelect'
import { useCounterpartiesPlanFact } from '@/hooks/useDashboard'

const SelectCounterParties = ({ value = [], onChange, placeholder = "Выберите контрагентов", dropdownClassName, className, hasError }) => {
  const { data: counterpartiesFilterData, isLoading } = useCounterpartiesPlanFact({
    page: 1,
    limit: 1000,
  })

  const counterpartiesOptions = useMemo(() => {
    const items = counterpartiesFilterData?.data?.data?.data || []
    if (!items || items.length === 0) return []
    return items.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия'
    }))
  }, [counterpartiesFilterData])

  const actualPlaceholder = isLoading ? "Загрузка..." : placeholder;

  return (
    <MultiSelect
      data={counterpartiesOptions}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={actualPlaceholder}
      dropdownClassName={dropdownClassName}
      hasError={hasError}
    />
  )
}

export default SelectCounterParties;