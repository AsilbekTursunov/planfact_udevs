import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

class CounterpartiesStore {
  filters = {
    debitPaymentTypes: [],
    creditPaymentTypes: [],
    selectedGroups: [],
    selectedCounterparties: [],
    selectedChartOfAccounts: [],
    operationDateStart: "",
    calculationMethod: "Cashflow", 
    dateRange: null,
    deals: []
  }

  filtersingleCounterparty = {
    operationDateStart: "",
    calculationMethod: "Cashflow",
    dateRange: null,
    deals: []
  }

  constructor() {
    makeAutoObservable(this)

    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "counterparties",
        properties: ["filters", "filtersingleCounterparty"],
        storage: window.localStorage,
        debugMode: true,
      })
    }
  }

  setFilters = (newFilters) => {
    this.filters = { ...this.filters, ...newFilters }
    if (typeof window !== 'undefined') {
      localStorage.setItem('counterpartiesFilters', JSON.stringify(this.filters))
    }
  }

  setSingleCounterpartyFilters = (newFilters) => {
    this.filtersingleCounterparty = { ...this.filtersingleCounterparty, ...newFilters }
  }

  resetFilters = () => {
    this.filters = {
      debitPaymentTypes: [],
      creditPaymentTypes: [],
      selectedGroups: [],
      selectedCounterparties: [],
      selectedChartOfAccounts: [],
      operationDateStart: "",
      operationDateEnd: "",
      calculationMethod: "Cashflow",
      dateRange: null,
      deals: []
    }
  }

  get activeFilterCount() {
    let count = 0
    if (this.filters.debitPaymentTypes && this.filters.debitPaymentTypes.length > 0) count++
    if (this.filters.creditPaymentTypes && this.filters.creditPaymentTypes.length > 0) count++
    if (this.filters.selectedGroups && this.filters.selectedGroups.length > 0) count++
    if (this.filters.selectedCounterparties && this.filters.selectedCounterparties.length > 0) count++
    if (this.filters.selectedChartOfAccounts && this.filters.selectedChartOfAccounts.length > 0) count++
    if (this.filters.operationDateStart || this.filters.operationDateEnd || this.filters.dateRange) count++
    if (this.filters.calculationMethod !== 'Cashflow') count++
    return count
  }
}

const counterpartiesStore = new CounterpartiesStore()
export default counterpartiesStore
