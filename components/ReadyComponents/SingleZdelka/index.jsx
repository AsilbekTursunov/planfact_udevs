'use client'
import React, { useMemo } from 'react'
import { useUcodeRequestQuery } from '@/hooks/useDashboard'
import SingleSelect from '../../shared/Selects/SingleSelect'
import { cn } from '@/lib/utils'

const SingleZdelka = ({
  value,
  onChange,
  placeholder = 'Выберите сделку',
  className,
  dropdownClassName,
  hasError
}) => {
  const { data: deals, isLoading } = useUcodeRequestQuery({
    method: "get_sales_list_simple",
    data: {
      page: 1,
      limit: 100,
    },
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  console.log('deals', deals)

  const options = useMemo(() => {
    if (!deals || !Array.isArray(deals)) return []

    return deals.map(deal => ({
      value: deal.guid,
      label: deal?.name|| 'Без названия'
    }))
  }, [deals])

  return (
    <SingleSelect
      data={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Загрузка..." : placeholder}
      className={cn(className, hasError && 'border-red-500!')}
      dropdownClassName={dropdownClassName}
    />
  )
}

export default SingleZdelka;