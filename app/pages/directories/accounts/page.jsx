"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FilterSidebar, FilterSection, FilterCheckbox } from '@/components/directories/FilterSidebar/FilterSidebar'
import { DropdownFilter } from '@/components/directories/DropdownFilter/DropdownFilter'
import { useDeleteMyAccounts, useBankAccountsPlanFact, useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import CreateMyAccountModal from '@/components/directories/CreateMyAccountModal/CreateMyAccountModal'
import { AccountMenu } from '@/components/directories/AccountMenu/AccountMenu'
import { DeleteAccountConfirmModal } from '@/components/directories/DeleteAccountConfirmModal/DeleteAccountConfirmModal'
import { cn } from '@/app/lib/utils'
import styles from './accounts.module.scss'

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)
  const deleteMutation = useDeleteMyAccounts()
  
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
  
  const [filters, setFilters] = useState({
    nalichnye: true,
    beznalichnye: true,
    kartaFizlica: true,
    elektronnye: true,
    showActive: true,
    showArchived: true
  })

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
  
  // Fetch bank accounts using new invoke_function API
  const { data: bankAccountsData, isLoading: isLoadingBankAccounts } = useBankAccountsPlanFact({
    page: 1,
    limit: 100,
  })
  
  console.log('Bank accounts data:', bankAccountsData)
  
  // Extract bank accounts from response - correct path is data.data.data
  const bankAccountsItems = useMemo(() => {
    const items = bankAccountsData?.data?.data?.data || []
    console.log('Bank accounts items:', items)
    return Array.isArray(items) ? items : []
  }, [bankAccountsData])

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
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Filter bank accounts on frontend based on selected filters
  const filteredBankAccountsItems = useMemo(() => {
    if (!bankAccountsItems || bankAccountsItems.length === 0) return []
    
    return bankAccountsItems.filter(item => {
      // Note: New API doesn't return 'tip' field, so type filtering is disabled
      // If you need type filtering, it should be added to the API
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const name = (item.nazvanie || '').toLowerCase()
        const accountNumber = (item.nomer_scheta || '').toLowerCase()
        if (!name.includes(query) && !accountNumber.includes(query)) return false
      }
      
      // Filter by selected accounts
      if (selectedAccounts.length > 0) {
        if (!selectedAccounts.includes(item.guid)) return false
      }
      
      // Note: New API doesn't return 'legal_entity_id' field
      // Legal entity filtering is disabled for now
      
      return true
    })
  }, [bankAccountsItems, searchQuery, selectedAccounts])
  const [selectedRows, setSelectedRows] = useState([])

  // Get all field keys from API response - only show needed fields
  const allFields = useMemo(() => {
    // Define only the fields we want to display
    const standardFields = [
      'nazvanie',
      'nomer_scheta',
      'nachalьnyy_ostatok',
      'balans',
      'currenies_kod',
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
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingAccount(null)
  }

  const formatFieldValue = (item, field) => {
    const value = item[field]
    
    if (value === null || value === undefined) return '–'
    
    switch (field) {
      case 'nazvanie':
        return value || '–'
      case 'nomer_scheta':
        return value || '–'
      case 'balans':
        return typeof value === 'number' ? value.toLocaleString('ru-RU') : value
      case 'currenies_kod':
        return value || '–'
      case 'tip':
        return Array.isArray(value) ? value.join(', ') : value
      case 'nachalьnyy_ostatok':
        return typeof value === 'number' ? value.toLocaleString('ru-RU') : value
      case 'data_sozdaniya':
        if (value) {
          const date = new Date(value)
          return date.toLocaleDateString('ru-RU')
        }
        return '–'
      case 'currenies_id':
        return item.currenies_id_data 
          ? `${item.currenies_id_data.kod || ''} (${item.currenies_id_data.nazvanie || ''})`.trim()
          : value
      case 'legal_entity_id':
        return item.legal_entity_id_data 
          ? item.legal_entity_id_data.nazvanie || value
          : '–'
      case 'komentariy':
        // Remove HTML tags if present
        if (typeof value === 'string') {
          return value.replace(/<[^>]*>/g, '').trim() || '–'
        }
        return value || '–'
      default:
        return value
    }
  }

  const totalCurrentBalance = filteredBankAccountsItems.reduce((sum, item) => {
    const balance = item.balans || item.nachalьnyy_ostatok
    return sum + (balance != null ? Number(balance) : 0)
  }, 0)

  return (
    <div className={styles.container}>
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterSection title="Тип">
          <div className="space-y-2.5">
            <FilterCheckbox 
              checked={filters.nalichnye} 
              onChange={() => toggleFilter('nalichnye')} 
              label="Наличный" 
            />
            <FilterCheckbox 
              checked={filters.beznalichnye} 
              onChange={() => toggleFilter('beznalichnye')} 
              label="Безналичный" 
            />
            <FilterCheckbox 
              checked={filters.kartaFizlica} 
              onChange={() => toggleFilter('kartaFizlica')} 
              label="Карта физлица" 
            />
            <FilterCheckbox 
              checked={filters.elektronnye} 
              onChange={() => toggleFilter('elektronnye')} 
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

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <button
                className={cn(styles.filterToggleButton, isFilterOpen && styles.filterToggleButtonActive)}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg className={styles.filterToggleIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
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
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию"
                  className={styles.searchInput}
                />
                <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
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
                         field === 'nomer_scheta' ? 'Номер счета' :
                         field === 'nachalьnyy_ostatok' ? 'Начальный остаток' :
                         field === 'balans' ? 'Текущий баланс' :
                         field === 'currenies_kod' ? 'Валюта' :
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
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <CreateMyAccountModal
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
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
