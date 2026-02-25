"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSidebar, FilterSection, FilterCheckbox } from '@/components/directories/FilterSidebar/FilterSidebar'
import { DropdownFilter } from '@/components/directories/DropdownFilter/DropdownFilter'
import { useDeleteMyAccounts, useBankAccountsPlanFact, useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import CreateMyAccountModal from '@/components/directories/CreateMyAccountModal/CreateMyAccountModal'
import { AccountMenu } from '@/components/directories/AccountMenu/AccountMenu'
import { DeleteAccountConfirmModal } from '@/components/directories/DeleteAccountConfirmModal/DeleteAccountConfirmModal'
import Input from '@/components/shared/Input'
import { cn } from '@/app/lib/utils'
import styles from './accounts.module.scss'
import { SearchBar } from '../../../../components/directories/SearchBar/SearchBar'
import OperationCheckbox from '../../../../components/shared/Checkbox/operationCheckbox'

export default function AccountsPage() {
  // Block body scroll for this page only
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'

    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])

  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)
  const deleteMutation = useDeleteMyAccounts()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const [accountingMethod, setAccountingMethod] = useState('cash')
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false)
  const methodDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target)) {
        setIsMethodDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [filters, setFilters] = useState([])

  const [selectedEntity, setSelectedEntity] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState([])

  // Fetch legal entities using new invoke_function API
  const { data: legalEntitiesData, isLoading: isLoadingLegalEntities } = useLegalEntitiesPlanFact({
    page: 1,
    limit: 100,
  })

  const legalEntitiesItems = useMemo(() => {
    const items = legalEntitiesData?.data?.data?.data || []
    return Array.isArray(items) ? items : []
  }, [legalEntitiesData])


  const requestBankAccounts = useMemo(() => {
    return {
      page: 1,
      limit: 100,
      ...(debouncedSearchQuery && { search: debouncedSearchQuery.toLowerCase() }),
      ...(filters.length > 0 && { tip: filters }),
      ...(selectedAccounts.length > 0 && { my_accounts_ids: selectedAccounts }),
      ...(selectedEntity.length > 0 && { legal_entity_ids: selectedEntity }),
    }
  }, [debouncedSearchQuery, filters, selectedAccounts, selectedEntity])

  // Fetch bank accounts using new invoke_function API
  const { data: bankAccountsData, isLoading: isLoadingBankAccounts } = useBankAccountsPlanFact(requestBankAccounts)


  // Extract bank accounts from response - correct path is data.data.data
  const bankAccountsItems = useMemo(() => {
    const items = bankAccountsData?.data?.data?.data || []
    return Array.isArray(items) ? items : []
  }, [bankAccountsData])

  const queryClient = useQueryClient()

  // Transform legal entities data for dropdown
  const entities = useMemo(() => {
    return legalEntitiesItems.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия'
    }))
  }, [legalEntitiesItems])

  // Transform accounts data for dropdown
  const accountsOptions = useMemo(() => {
    if (!bankAccountsItems || bankAccountsItems.length === 0) return []
    return bankAccountsItems.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия'
    }))
  }, [bankAccountsItems])

  const accountingMethods = [
    { value: 'cash', label: 'Кассовый метод' },
    { value: 'accrual', label: 'Метод начисления' }
  ]

  const toggleFilter = (key) => {
    setFilters(prev => prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key])
  }

  // Filter bank accounts on frontend based on selected filters
  const filteredBankAccountsItems = useMemo(() => {
    if (!bankAccountsItems || bankAccountsItems.length === 0) return []

    return bankAccountsItems.filter(item => {
      // Note: Search is now handled by API via searchString parameter

      // Filter by selected accounts
      if (selectedAccounts.length > 0) {
        if (!selectedAccounts.includes(item.guid)) return false
      }

      // Note: New API doesn't return 'legal_entity_id' field
      // Legal entity filtering is disabled for now

      return true
    })
  }, [bankAccountsItems, selectedAccounts])
  const [selectedRows, setSelectedRows] = useState([])

  // Get all field keys from API response - only show needed fields
  const allFields = useMemo(() => {
    // Define only the fields we want to display
    const standardFields = [
      'nazvanie',
      'nachalьnyy_ostatok',
      'balans',
      "tip",
      "legal_entity_id",
      'currenies_kod'
    ]

    return standardFields
  }, [])

  const isRowSelected = (id) => selectedRows.includes(id)

  const getAllSelectableIds = () => {
    return filteredBankAccountsItems.map(item => item.guid)
  }

  const allSelected = () => {
    const allIds = getAllSelectableIds()
    return allIds.length > 0 && allIds.every(id => selectedRows.includes(id))
  }

  const toggleSelectAll = () => {
    if (allSelected()) {
      setSelectedRows([])
    } else {
      setSelectedRows(getAllSelectableIds())
    }
  }

  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(prev => prev.filter(rid => rid !== id))
    } else {
      setSelectedRows(prev => [...prev, id])
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return

    try {
      await deleteMutation.mutateAsync([deletingAccount.guid])
      setDeletingAccount(null)
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
      queryClient.invalidateQueries({ queryKey: ['myAccountsV2'] })
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingAccount(null)
  }

  const formatFieldValue = (item, field) => {
    const value = item[field]


    switch (field) {
      case 'nazvanie':
        return value || '–'
      case 'nomer_scheta':
        return value || '–'
      case 'balans':
        // Use current_balance from API, but if it's 0 and nachalьnyy_ostatok exists, use that
        const currentBalance = item.current_balance
        const initialBalance = item.nachalьnyy_ostatok

        // If current_balance is 0 or null/undefined, fallback to initial balance
        const balance = (currentBalance !== null && currentBalance !== undefined && currentBalance !== 0)
          ? currentBalance
          : (initialBalance ?? 0)

        return typeof balance === 'number' ? balance.toLocaleString('ru-RU') : '–'
      case 'nachalьnyy_ostatok':
        // Display initial balance from nachalьnyy_ostatok field
        return typeof value === 'number' ? value.toLocaleString('ru-RU') : '–'
      case 'currenies_kod':
        return value || '–'
      case 'tip':
        return Array.isArray(value) ? value.join(', ') : value
      case 'data_sozdaniya':
        if (value) {
          const date = new Date(value)
          return date?.toLocaleDateString('ru-RU')
        }
        return '–'
      case 'currenies_id':
        return item.currenies_id_data
          ? `${item.currenies_id_data.kod || ''} (${item.currenies_id_data.nazvanie || ''})`.trim()
          : value
      case 'legal_entity_id':
        return item.legal_entity_id
          ? item.legal_entity_name || value
          : '–'
      case 'komentariy':
        // Remove HTML tags if present
        if (typeof value === 'string') {
          return value.replace(/<[^>]*>/g, '').trim() || '–'
        }
        return value || '–'
      default:
        if (value === null || value === undefined) return '–'
        return value
    }
  }

  const totalCurrentBalance = filteredBankAccountsItems.reduce((sum, item) => {
    const balance = item.current_balance ?? item.balans ?? item.nachalьnyy_ostatok
    return sum + (balance != null ? Number(balance) : 0)
  }, 0)

  return (
    <div className={styles.container}>
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterSection title="Тип">
          <div className="space-y-2.5 flex flex-col items-start">
            <OperationCheckbox
              checked={filters.includes('Наличный')}
              onChange={() => toggleFilter('Наличный')}
              label="Наличный"
            />
            <OperationCheckbox
              checked={filters.includes('Безналичный')}
              onChange={() => toggleFilter('Безналичный')}
              label="Безналичный"
            />
            <OperationCheckbox
              checked={filters.includes('Карта физлица')}
              onChange={() => toggleFilter('Карта физлица')}
              label="Карта физлица"
            />
            <OperationCheckbox
              checked={filters.includes('Электронный')}
              onChange={() => toggleFilter('Электронный')}
              label="Электронный"
            />
          </div>
        </FilterSection>

        <FilterSection title="Параметры">
          <div className="space-y-3">
            <DropdownFilter
              label="Мои счета"
              options={accountsOptions}
              selectedValues={selectedAccounts}
              onChange={setSelectedAccounts}
              placeholder="Выберите счета"
              disabled={accountsOptions.length === 0}
            />

            <DropdownFilter
              label="Юрлица"
              options={entities}
              selectedValues={selectedEntity}
              onChange={setSelectedEntity}
              placeholder="Выберите юрлицо"
              disabled={entities.length === 0 || isLoadingLegalEntities}
            />
          </div>
        </FilterSection>
      </FilterSidebar>

      {/* Filter Toggle Bar */}
      {!isFilterOpen && (
        <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
          <button className={styles.filterToggleButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <div className={cn(styles.content, isFilterOpen && styles.contentWithFilter)}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Мои счета</h1>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.createButton}
              >
                Создать
              </button>

              {/* Search - pushed to the right */}
              <div className={styles.headerActionsRight}>
                {/* Search */}
                <div className={styles.searchContainer}>
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Поиск по названию"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellIndex)}>
                    №
                  </th>
                  {allFields.map((field) => (
                    <th key={field} className={styles.tableHeaderCell}>
                      <button className={styles.tableHeaderButton}>
                        {field === 'nazvanie' ? 'Название' :
                          field === 'nachalьnyy_ostatok' ? 'Начальный остаток' :
                            field === 'balans' ? 'Текущий остаток' :
                              field === 'currenies_kod' ? 'Валюта' :
                                field === 'tip' ? 'Тип' :
                                  field === 'legal_entity_id' ? 'Юрлицо' :
                                    field}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </th>
                  ))}
                  <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingBankAccounts ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={allFields.length + 2} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredBankAccountsItems.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={allFields.length + 2} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  filteredBankAccountsItems.map((item, index) => (
                    <tr
                      key={item.guid}
                      className={styles.tableRow}
                    >
                      <td className={cn(styles.tableCell, styles.tableCellIndex)}>
                        {index + 1}
                      </td>
                      {allFields.map((field) => (
                        <td key={field} className={cn(styles.tableCell, field === 'komentariy' && styles.commentCell)}>
                          {formatFieldValue(item, field)}
                        </td>
                      ))}
                      <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={(e) => e.stopPropagation()}>
                        <AccountMenu
                          account={item}
                          onEdit={(account) => setEditingAccount(account)}
                          onDelete={(account) => setDeletingAccount(account)}
                        />
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Always visible at bottom */}
        <div className={cn(styles.footer, isFilterOpen && styles.footerWithFilter)}>
          <div className={styles.footerText}>
            <span className={styles.footerTextBold}>
              {filteredBankAccountsItems.length} {filteredBankAccountsItems.length === 1 ? 'счет' : filteredBankAccountsItems.length < 5 ? 'счета' : 'счетов'}
            </span>
          </div>
          <div className={styles.footerTextMuted}>
            {isLoadingBankAccounts ? (
              'Загрузка...'
            ) : (
              <>
                Текущий остаток: <span className={styles.footerTextBold}>
                  {totalCurrentBalance.toLocaleString('ru-RU')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <CreateMyAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['myAccountsV2'] })
          }}
        />
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <CreateMyAccountModal
          isOpen={!!editingAccount}
          onClose={() => {
            setEditingAccount(null)
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['myAccountsV2'] })
          }}
          account={editingAccount}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingAccount && (
        <DeleteAccountConfirmModal
          isOpen={!!deletingAccount}
          account={deletingAccount}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
