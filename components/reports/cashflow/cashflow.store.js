import { makeAutoObservable, runInAction } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import { ucodeRequest } from '@/lib/api/ucode/base'

const formatDate = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultStartDate = () => {
  const currentYear = new Date().getFullYear()
  return `${currentYear - 1}-10-01`
}

const getDefaultEndDate = () => {
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const year = lastDay.getFullYear()
  const month = String(lastDay.getMonth() + 1).padStart(2, '0')
  const day = String(lastDay.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

class CashFlowStore {
  // ── Filter state ────────────────────────────────────────────────────────────
  filters = {
    periodStartDate: getDefaultStartDate(),
    periodEndDate: getDefaultEndDate(),
    periodType: 'monthly',
    currencyCode: 'RUB', // Defaulting to RUB as seen in page
    sellingDealId: [], // these are same values 
    contrAgentId: [],
    accountId: [],
    dealId: [], // these are same values 
  }

  // ── Report state ────────────────────────────────────────────────────────────
  reportData = null
  isLoading = false
  isFetching = false
  error = null

  constructor() {
    makeAutoObservable(this)
    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "cashflow_store_v2",
        properties: ["filters"],
        storage: window.localStorage,
        debugMode: true,
      });
    }
  }

  // ── Fetch Report ─────────────────────────────────────────────────────────────
  async fetchReport() {
    runInAction(() => {
      if (!this.filters.periodStartDate) this.filters.periodStartDate = getDefaultStartDate()
      if (!this.filters.periodEndDate) this.filters.periodEndDate = getDefaultEndDate()

      this.isFetching = true
      this.error = null
      if (!this.reportData) this.isLoading = true
    })


    try {
      const response = await ucodeRequest({
        method: 'cash_flow',
        data: this.filters
      })

      runInAction(() => {
        this.reportData = response?.data?.data?.data || null
        this.isLoading = false
        this.isFetching = false
      })
    } catch (err) {
      console.error('Error fetching cashflow report:', err)
      runInAction(() => {
        this.error = err
        this.isLoading = false
        this.isFetching = false
      })
    }
  }


  // ── Setters ─────────────────────────────────────────────────────────────────
  setPeriodStartDate(value) {
    this.filters.periodStartDate = formatDate(value)
  }

  setPeriodEndDate(value) {
    this.filters.periodEndDate = formatDate(value)
  }

  setPeriodType(value) {
    this.filters.periodType = value
  }

  setCurrencyCode(value) {
    this.filters.currencyCode = value
  }

  setDeals(value) {
    this.filters.sellingDealId = value
  }

  setCounterparties(value) {
    this.filters.contrAgentId = value
  }

  setAccounts(value) {
    this.filters.accountId = value
  }

  resetFilters() {
    this.filters = {
      periodStartDate: getDefaultStartDate(),
      periodEndDate: getDefaultEndDate(),
      periodType: 'monthly',
      currencyCode: 'RUB',
      sellingDealId: [],
      contrAgentId: [],
      accountId: [],
      dealId: []
    }
  }


}

export const cashFlowStore = new CashFlowStore()
