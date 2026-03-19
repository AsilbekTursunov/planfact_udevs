import { useMemo } from 'react'
import { useUcodeRequestQuery } from '@/hooks/useDashboard'
import TreeSelect from '../../shared/Selects/TreeSelect'

const NOT_SELECTABLE = new Set([
  'Доходы',
  'Расходы',
  'Актив',
  'Оборотные активы',
  'Другие оборотные',
  'Внеоборотные активы',
  'Основные средства',
  'Другие внеоборотные',
  'Обязательства',
  'Краткосрочные обязательства',
  'Другие краткосрочные',
  'Долгосрочные обязательства',
  'Другие долгосрочные',
  'Капитал',
  'Другие статьи капитала'
])

const mapNode = (item, type) => {
  const isDisabled = NOT_SELECTABLE.has(item.nazvanie)

  return item?.nazvanie === type ? null : {
    value: item.guid || item.chart_of_accounts_id_2,
    label: item.nazvanie,
    bold: isDisabled,
    children: item.children?.map(child => mapNode(child, type)) || []
  }
}

const mapTree = (data, type) => {
  if (!data) return []
  return data
    ?.filter(item => !type || item.nazvanie !== type)
    .map(item => mapNode(item, type))
}

const MultiSelectStatiya = ({ value = [], onChange, placeholder = 'Выберите статьи', className, type = "", dropdownClassName }) => {

  const { data: chartOfAccountsData } = useUcodeRequestQuery({
    method: "get_chart_of_accounts",
    data: {
      page: 1,
      limit: 100,
    },
    querySetting: {
      select: (res) => res?.data?.data?.data
    }
  })

  const result = useMemo(() => {
    return mapTree(chartOfAccountsData, type)
  }, [chartOfAccountsData, type])

  return (
    <TreeSelect
      data={result}
      multi={true}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      dropdownClassName={dropdownClassName}
    />
  )
}

export default MultiSelectStatiya;