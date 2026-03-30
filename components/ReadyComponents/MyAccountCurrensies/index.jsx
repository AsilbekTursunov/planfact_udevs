import React, { useMemo } from 'react'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import { currencyInfo } from '../../../constants/globalCurrency'
import SingleSelect from '../../shared/Selects/SingleSelect'

const MyAccountCurrensies = ({ value, onChange, guid, withSearch = false, className, dropDownClassName, placeholder = 'Выберите валюту' }) => {

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

  if (!guid || selectOptions?.length < 1) return null

  const actualPlaceholder = isLoading ? "Загрузка..." : placeholder;

  return (
    <SingleSelect
      data={selectOptions}
      value={value}
      withSearch={withSearch}
      onChange={onChange}
      className={className}
      dropDownClassName={dropDownClassName}
      placeholder={actualPlaceholder}
    />
  )
}

export default MyAccountCurrensies