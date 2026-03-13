
const operationsDto = (operations) => {
  return operations?.map(item => ({
    guid: item?.guid,
    data_nachisleniya: item?.data_nachisleniya,
    data_obnovleniya: item?.data_obnovleniya,
    data_operatsii: item?.data_operatsii,
    data_sozdaniya: item?.data_sozdaniya,
    tip: item?.tip?.[0],
    my_account_name: item?.my_account_name,
    my_account_name2: item?.my_account_name2,
    payment_accrual: item?.payment_accrual,
    payment_confirmed: item?.payment_confirmed,
    chart_of_accounts_id: item?.chart_of_accounts_id,
    chart_of_accounts_name: item?.chart_of_accounts_name,
    my_accounts_id: item?.my_accounts_id,
    my_accounts_id_2: item?.my_accounts_id_2,
    summa: item?.summa,
    operationParts: item?.operationParts?.map(child => ({
      guid: child?.guid,
      data_nachisleniya: child?.data_nachisleniya,
      data_obnovleniya: child?.data_obnovleniya,
      data_operatsii: child?.data_operatsii,
      data_sozdaniya: child?.data_sozdaniya,
      tip: child?.tip?.[0],
      my_account_name: child?.my_account_name,
      my_account_name2: child?.my_account_name2,
      payment_accrual: child?.payment_accrual,
      payment_confirmed: child?.payment_confirmed,
      chart_of_accounts_id: child?.chart_of_accounts_id,
      chart_of_accounts_name: child?.chart_of_accounts_name,
      my_accounts_id: child?.my_accounts_id,
      my_accounts_id_2: child?.my_accounts_id_2,
      summa: child?.summa,
    }))
  }))
}

export default operationsDto