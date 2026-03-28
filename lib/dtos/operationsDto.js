import { formatDateRu } from "../../utils/helpers"
import { isToday, isFuture, isBefore } from "../../utils/formatDate"

const operationsDto = (operations, type) => {

  return operations?.filter(item => {
    if (type === 'today') return isToday(item?.data_operatsii)
    if (type === 'before') return isBefore(item?.data_operatsii)
    if (type === 'future') return isFuture(item?.data_operatsii)
    return true
  }).map(item => ({
    guid: item?.guid,
    data_nachisleniya: item?.data_nachisleniya,
    data_obnovleniya: item?.data_obnovleniya,
    data_operatsii: item?.data_operatsii,
    data_sozdaniya: item?.data_sozdaniya,
    accrualDate: formatDateRu(item?.data_nachisleniya),
    operationDate: formatDateRu(item?.data_operatsii),
    tip: item?.tip?.[0],
    my_account_name: item?.my_accounts_name,
    my_account_name2: item?.my_accounts_name_2,
    payment_accrual: item?.payment_accrual,
    payment_confirmed: item?.payment_confirmed,
    counterparty: item.counterparties_name || '',
    counterparties_id: item.counterparties_id || null,
    chartOfAccounts: item.chart_of_accounts_id_data?.nazvanie || item.chart_of_accounts_name || '',
    chart_of_accounts_id: item.chart_of_accounts_id || null,
    my_accounts_id: item?.my_accounts_id,
    my_accounts_id_2: item?.my_accounts_id_2,
    summa: item?.summa,
    opisanie: item?.opisanie,
    selling_deal_id: item?.selling_deal_id,
    selling_deal_name: item?.selling_deal_name,
    currency: item?.currenies_kod || item?.currenies_id_data?.nazvanie || '',
    createdAt: item?.created_at,
    legal_entity_id: item?.legal_entity_id,
    currencyId: item?.currenies_id || null,
    product_and_service_data: item?.product_and_service_data,
    operationParts: item?.operationParts?.map(child => ({
      guid: child?.guid,
      data_nachisleniya: child?.data_nachisleniya,
      data_obnovleniya: child?.data_obnovleniya,
      data_operatsii: child?.data_operatsii,
      data_sozdaniya: child?.data_sozdaniya,
      tip: child?.tip?.[0],
      my_account_name: child?.my_accounts_name,
      my_account_name2: child?.my_accounts_name_2,
      payment_accrual: child?.payment_accrual,
      counterparty: child?.counterparties_name || '',
      counterparties_id: child?.counterparties_id || null,
      payment_confirmed: child?.payment_confirmed,
      chartOfAccounts: child?.chart_of_accounts_id_data?.nazvanie || child?.chart_of_accounts_name || '',
      chart_of_accounts_id: child?.chart_of_accounts_id || null,
      my_accounts_id: child?.my_accounts_id,
      my_accounts_id_2: child?.my_accounts_id_2,
      summa: child?.summa,
      legal_entity_id: child?.legal_entity_id,
      tip: child?.tip?.[0],
      selling_deal_id: child?.selling_deal_id,
      selling_deal_name: child?.selling_deal_name,
      currency: child?.currenies_kod || child?.currenies_id_data?.nazvanie || '',
      currencyId: child?.currenies_id || null,
      accrualDate: formatDateRu(child?.data_nachisleniya),
      operationDate: formatDateRu(child?.data_operatsii),
      percent: child?.percent,
    }))
  }))
}

export default operationsDto