'use client'
import React, { useMemo } from 'react'
import { useCounterpartiesGroupsPlanFact } from '@/hooks/useDashboard'
import TreeSelect from '../../shared/Selects/TreeSelect'

const SingleCounterParty = ({
  value,
  onChange,
  placeholder = 'Выберите контрагента',
  className,
  disabled,
  dropdownClassName
}) => {
  const { data: counterpartiesGroupsData, isLoading } = useCounterpartiesGroupsPlanFact({
    page: 1,
    limit: 100,
  })

  const result = useMemo(() => {
    const groups = counterpartiesGroupsData?.data?.data?.data || []
    if (groups.length === 0) return []

    const buildTree = item => {
      // Check if this is a group with children
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        return {
          value: item.guid,
          label: item.nazvanie_gruppy || 'Без названия',
          bold: true,
          isSelectable: false, // Groups are not selectable
          children: item.children.map(child => ({
            value: child.guid,
            label: child.nazvanie || 'Без названия',
            isSelectable: true,
          }))
        }
      }

      // This is a standalone item (no children)
      return {
        value: item.guid,
        label: item.nazvanie_gruppy || item.nazvanie || 'Без названия',
        isSelectable: true,
      }
    }

    return groups.map(buildTree)
  }, [counterpartiesGroupsData])

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none w-full' : 'w-full'}>
      <TreeSelect
        data={result}
        multi={false}
        placeholder={isLoading ? "Загрузка..." : placeholder}
        value={value}
        onChange={onChange}
        className={className}
        dropdownClassName={dropdownClassName}
      />
    </div>
  )
}

export default SingleCounterParty;
