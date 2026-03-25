import React, { useMemo } from 'react'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import MultiSelect from '../../shared/Selects/MultiSelect'

const SelectMyAccounts = ({ value = [], onChange, placeholder = "Выберите счет", className, dropdownClassName }) => {

  const { data: accountsData, isLoading } = useUcodeRequestQuery({
    method: "get_my_accounts",
    querySetting: {
      select: (response) => response?.data?.data?.data || []
    }
  })

  const mappedData = useMemo(() => {
    return (accountsData || []).map(item => ({
      value: item.guid,
      label: item.nazvanie
    }))
  }, [accountsData])

  if (isLoading) {
    return <div className="text-xs text-neutral-400 flex items-center h-10 px-3 border border-neutral-200 rounded-md bg-neutral-50">Загрузка...</div>
  }

  return (
    <MultiSelect
      data={mappedData}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      dropdownClassName={dropdownClassName}
    />
  )
}

export default SelectMyAccounts;