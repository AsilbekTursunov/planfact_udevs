import React, { useEffect, useMemo } from 'react'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import { currencyInfo } from '../../../constants/globalCurrency'
import SingleSelect from '../../shared/Selects/SingleSelect'

const MyAccountCurrensies = ({ value, onChange, guid, withSearch = false, className, dropDownClassName, placeholder = 'Выберите валюту', wrapperClassName, isClearable = true }) => {

  const { data: myAccounts, isLoading } = useUcodeRequestQuery({
    method: 'get_my_accounts',
    data: {
      legal_entity_id: guid
    },
    querySetting: {
      enabled: !!guid,
      select: (data) => data?.data?.data?.data,
      slateTime: 0,
    }
  })



  const selectOptions = useMemo(() => {
    if (!myAccounts) return []
    const unique = new Map();
    myAccounts.forEach((account) => {
      const label = currencyInfo[account.currenies_kod] || account.currenies_kod;
      if (label && !unique.has(label)) {
        unique.set(label, {
          value: account.currenies_id,
          label: label,
        });
      }
    });
    return Array.from(unique.values());
  }, [myAccounts])


  useEffect(() => {
    if (selectOptions?.length === 1 && value !== selectOptions[0].value) {
      onChange(selectOptions[0].value)
    } else if (selectOptions?.length === 0 && value !== '') {
      onChange('')
    }
  }, [selectOptions, onChange, value])

  if (!guid || selectOptions?.length < 2) return null

  const actualPlaceholder = isLoading ? "Загрузка..." : placeholder;

  return (
    <SingleSelect
      data={selectOptions}
      value={value}
      withSearch={withSearch}
      onChange={onChange}
      isClearable={isClearable}
      className={className}
      dropDownClassName={dropDownClassName}
      placeholder={actualPlaceholder}
      wrapperClassName={wrapperClassName}
      loading={isLoading}
    />
  )
}

export default MyAccountCurrensies