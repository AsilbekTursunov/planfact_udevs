import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

class SealDeal {
  // single deal Методом начисления || Кассовым методом
  accounting = 'accrual' // accrual || cash
  // deals list page filter my method
  dealsMethod = 'accrual_method' // accrual_method || cash_method

  // deals page filters
  filters = {
    selectedCounterparties: [],
    dateRange: { start: null, end: null },
    operationDateStart: '',
    operationDateEnd: '',
    amountFrom: '',
    amountTo: '',
    profitFrom: '',
    profitTo: '',
    status: [],
    isCalculation: false,
  }

  constructor() {
    makeAutoObservable(this)

    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "sale_deal",
        properties: [
          "accounting", 
          "filters",
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
    this.filters = {
      selectedCounterparties: [],
      dateRange: { start: null, end: null },
      operationDateStart: '',
      operationDateEnd: '',
      amountFrom: '',
      amountTo: '',
      profitFrom: '',
      profitTo: '',
      status: [],
      isCalculation: false,
    }
  }
}

export const sealDeal = new SealDeal()
