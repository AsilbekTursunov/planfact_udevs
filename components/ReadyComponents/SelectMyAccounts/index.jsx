import React, { useMemo } from 'react'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import MultiSelect from '../../shared/Selects/MultiSelect'
import SingleSelect from '../../shared/Selects/SingleSelect'
import { formatAmount } from '../../../utils/helpers'

const SelectMyAccounts = ({ value, onChange, placeholder = "Выберите счет", className, dropdownClassName, multi = true, type, selected }) => {

  const { data: accountsData, isLoading } = useUcodeRequestQuery({
    method: "get_my_accounts",
    querySetting: {
      select: (response) => response?.data?.data?.data || []
    }
  })

  const mappedData = useMemo(() => {
    const data = (accountsData || []).map(item => ({
      value: item.guid,
      label: type === "show" ? `${item?.nazvanie} [${item?.legal_entity_name}] ${formatAmount(item?.balans)} ${item?.currenies_kod}` : item.nazvanie
    }))

    if (selected) {
      const selectedArray = Array.isArray(selected) ? selected : [selected];
      return data.filter(item => !selectedArray.includes(item.value));
    }

    return data;
  }, [accountsData, type, selected])

  if (isLoading) {
    return <div className="text-xs text-neutral-400 flex items-center h-10 px-3 border border-neutral-200 rounded-md bg-neutral-50">Загрузка...</div>
  }

  const Component = multi ? MultiSelect : SingleSelect;

  return (
    <Component
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