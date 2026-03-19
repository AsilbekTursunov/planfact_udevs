import { makeAutoObservable, runInAction } from 'mobx'
import { ucodeRequest } from '@/lib/api/ucode/base'

const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 6)
  return { start, end }
}

class PnLStore {
  // ── Filter state ────────────────────────────────────────────────────────────
  dateRange = getDefaultDateRange()
  selectedPeriod = 'all'
  selectedGrouping = 'monthly'
  isCalculation = true
  profitTypes = {
    operational: true,
    ebitda: true,
    ebit: true,
    ebt: true
  }
  selectedAccounts = []
  selectedCounterparties = []

  // ── Report state ────────────────────────────────────────────────────────────
  reportData = null
  isLoading = false
  isFetching = false
  error = null

  constructor() {
    makeAutoObservable(this)
  }

  // ── Setters ─────────────────────────────────────────────────────────────────
  setDateRange(val) { this.dateRange = val }
  setSelectedPeriod(val) { this.selectedPeriod = val }
  setSelectedGrouping(val) { this.selectedGrouping = val }
  setIsCalculation(val) { this.isCalculation = val }
  setSelectedAccounts(val) { this.selectedAccounts = val }
  setSelectedCounterparties(val) { this.selectedCounterparties = val }

  toggleProfitType(type) {
    this.profitTypes[type] = !this.profitTypes[type]
  }

  // ── Computed query params ────────────────────────────────────────────────────
  get queryParams() {
    if (!this.dateRange?.start || !this.dateRange?.end) return null

    const endDateAdjusted = new Date(this.dateRange.end)
    endDateAdjusted.setDate(endDateAdjusted.getDate() + 1)

    const startDate = formatDate(this.dateRange.start)
    const endDate = formatDate(endDateAdjusted)

    const getPeriodType = () => {
      switch (this.selectedPeriod) {
        case 'day': return 'daily'
        case 'week': return 'weekly'
        case 'month': return 'monthly'
        case 'all':
        default: return this.selectedGrouping
      }
    }

    const params = {
      periodStartDate: startDate,
      periodEndDate: endDate,
      periodType: getPeriodType(),
      currencyCode: 'RUB',
      isCalculation: this.isCalculation,
      isGrossProfit: false,
      isOperatingProfit: this.profitTypes.operational,
      isEbitda: this.profitTypes.ebitda,
      isEbit: this.profitTypes.ebit,
      isEbt: this.profitTypes.ebt,
      reportGenMethod: 0,
      includeTrendData: true,
      aggregationMode: 'detailedByCounterparty',
      limit: 1000,
      page: 1
    }

    if (this.selectedAccounts.length > 0) params.accountId = this.selectedAccounts
    if (this.selectedCounterparties.length > 0) params.contrAgentId = this.selectedCounterparties

    return params
  }

  // ── Fetch report ─────────────────────────────────────────────────────────────
  async fetchReport() {
    const params = this.queryParams
    if (!params) return

    runInAction(() => {
      this.isFetching = true
      this.isLoading = !this.reportData
      this.error = null
    })
    try {
      const result = await ucodeRequest({ method: 'profit_and_loss', data: params })
      const apiData = result?.data?.data?.data || result?.data?.data || result?.data
      runInAction(() => {
        if (apiData) {
          this.reportData = {
            ...apiData,
            rows: [...(apiData.revenue || []), ...(apiData.rows || [])]
          }
        }
        this.isLoading = false
        this.isFetching = false
      })
    } catch (err) {
      console.error('Error fetching P&L report:', err)
      runInAction(() => {
        this.error = err
        this.isLoading = false
        this.isFetching = false
      })
    }
  }
}

export const pnlStore = new PnLStore()
