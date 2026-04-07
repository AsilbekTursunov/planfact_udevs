import { makeAutoObservable, runInAction } from 'mobx'
import { getBalanceReport } from '@/lib/api/ucode/balance'
import { legalEntitiesAPI } from '@/lib/api/ucode/legalEntities'
import { GlobalCurrency } from '../../../constants/globalCurrency'
import moment from 'moment'

class BalanceStore {
  // ── Filter state ────────────────────────────────────────────────────────────
  dateRange = (() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()
    let qStartMonth;
    let qYear = y;
    if (m === 11 || m === 0 || m === 1) { // Winter
      qStartMonth = 11;
      if (m < 2) qYear -= 1;
    } else if (m >= 2 && m <= 4) qStartMonth = 2; // Spring
    else if (m >= 5 && m <= 7) qStartMonth = 5; // Summer
    else qStartMonth = 8; // Autumn

    return {
      start: new Date(qYear, qStartMonth, 1),
      end: new Date(qYear, qStartMonth + 3, 0)
    };
  })();
  selectedEntity = ''
  selectedCurrency = GlobalCurrency.code || 'UZS'
  selectedCounterparties = []
  selectedAccount = ''

  // ── Legal entities (loaded once in sidebar) ─────────────────────────────────
  legalEntities = []
  legalEntitiesLoading = false

  // ── Balance report data ─────────────────────────────────────────────────────
  balanceData = { assets: [], liabilities: [], equity: [], currencies: [] }
  isLoading = false
  error = null

  constructor() {
    makeAutoObservable(this)
  }

  // ── Setters ─────────────────────────────────────────────────────────────────
  setDateRange(range) {
    this.dateRange = range
  }

  setSelectedEntity(entity) {
    this.selectedEntity = entity
  }

  setSelectedCurrency(currency) {
    this.selectedCurrency = currency
  }

  setSelectedCounterparties(items) {
    this.selectedCounterparties = items
  }

  setSelectedAccount(account) {
    this.selectedAccount = account
  }

  // ── Fetch legal entities ────────────────────────────────────────────────────
  async fetchLegalEntities() {
    if (this.legalEntities.length > 0) return // already loaded
    runInAction(() => { this.legalEntitiesLoading = true })
    try {
      const response = await legalEntitiesAPI.getLegalEntitiesInvokeFunction({ page: 1, limit: 100 })
      const raw = response?.data?.data?.data
      runInAction(() => {
        if (Array.isArray(raw)) {
          this.legalEntities = raw.map(e => ({
            guid: e.guid,
            label: e.nazvanie || e.polnoe_nazvanie || 'Неизвестно'
          }))
        }
        this.legalEntitiesLoading = false
      })
    } catch (err) {
      console.error('Error fetching legal entities:', err)
      runInAction(() => { this.legalEntitiesLoading = false })
    }
  }

  // ── Fetch balance report ────────────────────────────────────────────────────
  async fetchBalance() {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })
    try {
      const response = await getBalanceReport({
        as_of: moment(this.dateRange.end).format('YYYY-MM-DD'),
        account_ids: this.selectedAccount ? [this.selectedAccount] : [],
				legal_entity_id: this.selectedEntity,
				user_currency_code: this.selectedCurrency,
				contr_agent_ids: this.selectedCounterparties,
			})

      const apiData = response?.data?.data
      if (!apiData) throw new Error('Пустой ответ от сервера')

      const transformItems = (items, level = 0) => {
        if (!Array.isArray(items)) return []
        return items.map(item => {
          const value = typeof item.value === 'number' ? item.value : 0
          return {
            id: item.id || `item-${Math.random()}`,
            name: item.name || 'Неизвестно',
            level,
            value,
            totalValue: value,
            isSubtotal: Boolean(item.isSubtotal),
            details: item.children ? transformItems(item.children, level + 1) : []
          }
        })
      }

      runInAction(() => {
        this.balanceData = {
          assets: transformItems(apiData.assets || []),
          liabilities: transformItems(apiData.liabilities || []),
          equity: transformItems(apiData.equity || []),
          currencies: apiData.currencies || []
        }
        this.isLoading = false
      })
    } catch (err) {
      console.error('Error fetching balance report:', err)
      runInAction(() => {
        this.error = err
        this.isLoading = false
      })
    }
  }
}

export const balanceStore = new BalanceStore()
