import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

class AccountsStore {
  searchQuery = ''
  selectedTypes =
    ["Карта физлица", "Безналичный", "Наличный", "Электронный"]
  selectedEntity = []
  selectedAccounts = []
  selectedGrouping = 'none'
  accountingMethod = 'cash'
  isFilterOpen = true

  constructor() {
    makeAutoObservable(this)

    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "accounts_filters",
        properties: [
          "searchQuery",
          "selectedTypes",
          "selectedEntity",
          "selectedAccounts",
          "selectedGrouping",
          "accountingMethod",
          "isFilterOpen"
        ],
        storage: window.localStorage,
        debugMode: false,
      })
    }
  }

  setSearchQuery = (val) => {
    this.searchQuery = typeof val === 'object' && val?.target ? val.target.value : val
  }

  setSelectedTypes = (types) => {
    this.selectedTypes = types
  }

  toggleType = (type) => {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type)
    } else {
      this.selectedTypes.push(type)
    }
  }

  setSelectedEntity = (entities) => {
    this.selectedEntity = entities
  }

  setSelectedAccounts = (accounts) => {
    this.selectedAccounts = accounts
  }

  setSelectedGrouping = (grouping) => {
    this.selectedGrouping = grouping
  }

  setAccountingMethod = (method) => {
    this.accountingMethod = method
  }

  setIsFilterOpen = (isOpen) => {
    this.isFilterOpen = isOpen
  }

  resetFilters = () => {
    this.searchQuery = ''
    this.selectedTypes = []
    this.selectedEntity = []
    this.selectedAccounts = []
    this.selectedGrouping = 'none'
    this.accountingMethod = 'cash'
  }
}

export const accountsStore = new AccountsStore()
