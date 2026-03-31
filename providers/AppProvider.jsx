'use client'

import { useEffect } from "react"
import { useUcodeRequestQuery } from "../hooks/useDashboard"
import { appStore } from "../store/app.store"

const AppProvider = ({ children }) => {
  const { data } = useUcodeRequestQuery({
    method: 'get_general_settings',
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })
  const { data: currencies } = useUcodeRequestQuery({
    method: 'get_currencies',
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  useEffect(() => {
    if (currencies) {
      appStore.setCurrencies(currencies)
      const currency = currencies.find(c => c.guid === data?.default_currency_id)
      if (currency) {
        appStore.setCurrency({ name: currency.icon, guid: currency.guid, code: currency.kod })
      }
    }
  }, [currencies, data])


  return (
    <div>{children}</div>
  )
}

export default AppProvider