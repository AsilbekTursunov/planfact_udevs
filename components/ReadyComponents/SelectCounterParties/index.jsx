import React, { useMemo } from 'react'
import MultiSelect from '@/components/shared/Selects/MultiSelect'
import { useCounterpartiesPlanFact } from '@/hooks/useDashboard'

const SelectCounterParties = ({ value = [], onChange, placeholder = "Выберите контрагентов", dropdownClassName, className }) => {
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

  return (
    <MultiSelect
      data={counterpartiesOptions}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={isLoading ? "Загрузка..." : placeholder}
      dropdownClassName={dropdownClassName}
    />
  )
}

export default SelectCounterParties;