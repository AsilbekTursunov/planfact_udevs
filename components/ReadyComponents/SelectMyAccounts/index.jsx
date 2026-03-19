import React, { useMemo } from 'react'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import SingleSelect from '../../shared/Selects/SingleSelect'

const SelectMyAccounts = ({ value, onSelect, placeholder = "Выберите счет", className, dropdownClassName }) => {

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
    <SingleSelect
      data={mappedData}
      value={value}
      onChange={onSelect}
      placeholder={placeholder}
      className={className}
      dropdownClassName={dropdownClassName}
    />
  )
}

export default SelectMyAccounts;