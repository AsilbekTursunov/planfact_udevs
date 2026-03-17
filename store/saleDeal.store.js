import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

class SealDeal {
  // single deal Методом начисления || Кассовым методом
  accounting = 'accrual' // accrual || cash

  // deals page filters
  

  constructor() {
    makeAutoObservable(this)

    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "sale_deal",
        properties: [
          "accounting", 
        ],
        storage: window.localStorage,
        debugMode: true,
      })
    }
  }

  setState = (fieldName, value) => {
    this[fieldName] = value
  }

  resetFilters = () => {
    this.accounting = 'accrual'
  }
}

export const sealDeal = new SealDeal()
