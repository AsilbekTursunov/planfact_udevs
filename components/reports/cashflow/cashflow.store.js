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

class CashFlowStore {
  // ── Filter state ────────────────────────────────────────────────────────────
  filters = {
    periodStartDate: '',
    periodEndDate: '',
    periodType: 'monthly',
    currencyCode: 'RUB', // Defaulting to RUB as seen in page
    counterparty_id: '',
    deals: [],
    counterparties: []
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
        name: "cashflow_store",
        properties: ["filters"],
        storage: window.localStorage,
        debugMode: true,
      });
    }
  }

  // ── Fetch Report ─────────────────────────────────────────────────────────────
  async fetchReport() {
    runInAction(() => {
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

  setCounterpartyId(value) {
    this.filters.counterparty_id = value
  }

  setDeals(value) {
    this.filters.deals = value
  }

  setCounterparties(value) {
    this.filters.counterparties = value
  }

  resetFilters() {
    this.filters = {
      periodStartDate: '',
      periodEndDate: '',
      periodType: 'monthly',
      currencyCode: '',
      counterparty_id: '',
      deals: [],
      counterparties: []
    }
  }


}

export const cashFlowStore = new CashFlowStore()
