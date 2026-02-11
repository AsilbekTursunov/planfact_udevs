import axiosInstance from '../axios'

// Dashboard API endpoints
export const dashboardAPI = {
  // Get dashboard data
  getDashboardData: async (params) => {
    const response = await axiosInstance.post('/proxy', params)
    return response.data
  },

  // Get operations
  getOperations: async (params) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'get_operations',
      ...params
    })
    return response.data
  },

  // Get products
  getProducts: async (params) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'get_products',
      ...params
    })
    return response.data
  },

  // Get accounts
  getAccounts: async (params) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'get_accounts',
      ...params
    })
    return response.data
  },

  // Get transaction categories
  getTransactionCategories: async (params) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'get_transaction_categories',
      ...params
    })
    return response.data
  },

  // Create operation
  createOperation: async (data) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'create_operation',
      ...data
    })
    return response.data
  },

  // Update operation
  updateOperation: async (id, data) => {
    const response = await axiosInstance.post('/proxy', {
      action: 'update_operation',
      id,
      ...data
    })
    return response.data
  },

  // Delete operation using v2/items/operations endpoint (DELETE)
  deleteOperation: async (ids) => {
    const response = await axiosInstance.delete('/operations/delete', { data: { ids } })
    return response.data
  },

  // Get chart of accounts (План счетов)
  // @deprecated Use chartOfAccountsAPI.getList() instead
  getChartOfAccounts: async (params) => {
    const { chartOfAccountsAPI } = await import('./ucode/chartOfAccounts')
    return chartOfAccountsAPI.getList(params)
  },

  // Get chart of accounts using v2/items/chart_of_accounts endpoint (GET)
  getChartOfAccountsV2: async (params = {}) => {
    const queryParams = new URLSearchParams()
    const data = params.data || {}
    
    // Add pagination
    const requestData = {
      ...data,
      limit: 1000,
      offset: 0
    }
    
    queryParams.append('data', JSON.stringify(requestData))
    
    const response = await axiosInstance.get(`/chart-of-accounts?${queryParams.toString()}`)
    return response.data
  },

  // Create chart of accounts item using v2/items/chart_of_accounts endpoint (POST)
  createChartOfAccounts: async (data) => {
    const response = await axiosInstance.post('/chart-of-accounts/create', { data })
    return response.data
  },

  // Update chart of accounts item using v2/items/chart_of_accounts endpoint (PUT)
  updateChartOfAccounts: async (data) => {
    const response = await axiosInstance.put('/chart-of-accounts/update', { data })
    return response.data
  },

  // Delete chart of accounts items using v2/items/chart_of_accounts endpoint (DELETE)
  deleteChartOfAccounts: async (ids) => {
    const response = await axiosInstance.delete('/chart-of-accounts', { data: { ids } })
    return response.data
  },

  // Get bank accounts (Мои счета)
  // @deprecated Use bankAccountsAPI.getList() instead
  getBankAccounts: async (params) => {
    const { bankAccountsAPI } = await import('./ucode/bankAccounts')
    return bankAccountsAPI.getList(params)
  },

  // Get counterparties (Контрагенты)
  getCounterparties: async (params) => {
    const { counterpartiesAPI } = await import('./ucode/counterparties')
    return counterpartiesAPI.getList(params)
  },

  // Get counterparties using v2/items/counterparties endpoint (GET)
  getCounterpartiesV2: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.data) {
      queryParams.append('data', JSON.stringify(params.data))
    } else {
      queryParams.append('data', JSON.stringify({}))
    }
    const response = await axiosInstance.get(`/counterparties?${queryParams.toString()}`)
    return response.data
  },

  // Create counterparty using v2/items/counterparties endpoint (POST)
  createCounterparty: async (data) => {
    const response = await axiosInstance.post('/counterparties', { data })
    return response.data
  },

  // Update counterparty using v2/items/counterparties endpoint (PUT)
  updateCounterparty: async (data) => {
    const response = await axiosInstance.put('/counterparties', { data })
    return response.data
  },

  // Delete counterparties using v2/items/counterparties endpoint (DELETE)
  deleteCounterparties: async (ids) => {
    const response = await axiosInstance.delete('/counterparties', { data: { ids } })
    return response.data
  },

  // Get counterparties groups using v2/items/counterparties_group endpoint (GET)
  getCounterpartiesGroupsV2: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.data) {
      queryParams.append('data', JSON.stringify(params.data))
    } else {
      queryParams.append('data', JSON.stringify({}))
    }
    const response = await axiosInstance.get(`/counterparties-group?${queryParams.toString()}`)
    return response.data
  },

  // Create counterparties group using v2/items/counterparties_group endpoint (POST)
  createCounterpartiesGroup: async (data) => {
    const response = await axiosInstance.post('/counterparties-group/create', { data })
    return response.data
  },

  // Update counterparties group using v2/items/counterparties_group endpoint (PUT)
  updateCounterpartiesGroup: async (data) => {
    const response = await axiosInstance.put('/counterparties-group/update', { data })
    return response.data
  },

  // Delete counterparties groups using v2/items/counterparties_group endpoint (DELETE)
  deleteCounterpartiesGroups: async (ids) => {
    const response = await axiosInstance.delete('/counterparties-group', { data: { ids } })
    return response.data
  },

  // Get operations list (Список операций)
  getOperationsList: async (params) => {
    const { operationsAPI } = await import('./ucode/operations')
    return operationsAPI.getNewList(params)
  },

  // Get my accounts (Мои счета) - v2/items/my_accounts
  getMyAccountsV2: async (params = {}) => {
    const response = await axiosInstance.get('/my-accounts', {
      params: {
        data: JSON.stringify(params.data || {})
      }
    })
    return response.data
  },

  // Create my account
  createMyAccount: async (data) => {
    const response = await axiosInstance.post('/my-accounts', { data })
    return response.data
  },

  // Update my account
  updateMyAccount: async (data) => {
    const response = await axiosInstance.put('/my-accounts', { data })
    return response.data
  },

  // Delete my accounts
  deleteMyAccounts: async (ids) => {
    const response = await axiosInstance.delete('/my-accounts', { data: { ids } })
    return response.data
  },

  // Get legal entities (Юрлица) - v2/items/legal_entities
  getLegalEntitiesV2: async (params = {}) => {
    const response = await axiosInstance.get('/legal-entities', {
      params: {
        data: JSON.stringify(params.data || {})
      }
    })
    return response.data
  },

  // Get accounts groups (Группы счетов) - v2/items/accounts_group
  getAccountsGroupsV2: async (params = {}) => {
    const response = await axiosInstance.get('/accounts-group', {
      params: {
        data: JSON.stringify(params.data || {})
      }
    })
    return response.data
  },

  // Create legal entity
  createLegalEntity: async (data) => {
    const response = await axiosInstance.post('/legal-entities/create', { data })
    return response.data
  },

  // Update legal entity
  updateLegalEntity: async (data) => {
    const response = await axiosInstance.put('/legal-entities/update', { data })
    return response.data
  },

  // Delete legal entities
  deleteLegalEntities: async (ids) => {
    const response = await axiosInstance.delete('/legal-entities', { data: { ids } })
    return response.data
  },

  // Get finance summary (Финансовая сводка)
  getFinanceSummary: async (params = {}) => {
    const response = await axiosInstance.post('/proxy', {
      data: params.data || {}
    })
    return response.data
  }
}
