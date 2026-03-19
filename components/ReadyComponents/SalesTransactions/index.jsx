import React, { useMemo } from 'react'
import MultiSelect from '@/components/shared/Selects/MultiSelect'
import { useUcodeDefaultApiQuery } from '@/hooks/useDashboard'

const SalesTransactions = ({ value = [], onChange, placeholder = "Выберите сделки", dropdownClassName }) => {
  const { data: dealsData, isLoading } = useUcodeDefaultApiQuery({
    queryKey: 'deals',
    urlMethod: 'GET',
    urlParams: '/items/sales_transactions?from-ofs=true&offset=0&limit=100'
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
    />
  )
}

export default SalesTransactions;