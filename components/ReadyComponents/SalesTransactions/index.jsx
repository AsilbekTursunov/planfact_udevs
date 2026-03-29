import React, { useMemo } from 'react'
import MultiSelect from '@/components/shared/Selects/MultiSelect'
import { useUcodeDefaultApiQuery } from '@/hooks/useDashboard'
import { keepPreviousData } from '@tanstack/react-query'

const SalesTransactions = ({ value = [], onChange, placeholder = "Выберите сделки", dropdownClassName, hasError }) => {
  const { data: dealsData, isLoading } = useUcodeDefaultApiQuery({
    queryKey: 'deals',
    urlMethod: 'GET',
    urlParams: '/items/sales_transactions?from-ofs=true&offset=0&limit=100',
    querySetting: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      placeholder: keepPreviousData
    }
  });

  const formattedDeals = useMemo(() => {
    const items = dealsData?.data?.data?.response || [];
    return items.map(deal => ({
      value: deal.guid,
      label: deal.name || 'Без названия',
    }));
  }, [dealsData]);

  return (
    <MultiSelect
      data={formattedDeals}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Загрузка..." : placeholder}
      dropdownClassName={dropdownClassName}
      hasError={hasError}
    />
  )
}

export default SalesTransactions;