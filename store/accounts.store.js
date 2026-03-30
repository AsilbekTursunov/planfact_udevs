import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

class AccountsStore {
  searchQuery = ''
  isCash = true
  isNonCash = true
  isCard = true
  isElectronic = true
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
          "isCash",
          "isNonCash",
          "isCard",
          "isElectronic",
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

  setIsCash = (val) => { this.isCash = val }
  setIsNonCash = (val) => { this.isNonCash = val }
  setIsCard = (val) => { this.isCard = val }
  setIsElectronic = (val) => { this.isElectronic = val }

  toggleType = (type) => {
    switch (type) {
      case 'Наличный': this.isCash = !this.isCash; break;
      case 'Безналичный': this.isNonCash = !this.isNonCash; break;
      case 'Карта физлица': this.isCard = !this.isCard; break;
      case 'Электронный': this.isElectronic = !this.isElectronic; break;
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
    this.isCash = true
    this.isNonCash = true
    this.isCard = true
    this.isElectronic = true
    this.selectedEntity = []
    this.selectedAccounts = []
    this.selectedGrouping = 'none'
    this.accountingMethod = 'cash'
  }
}

export const accountsStore = new AccountsStore()
