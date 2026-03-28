"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { accountsStore } from '@/store/accounts.store'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSidebar, FilterSection } from '@/components/directories/FilterSidebar/FilterSidebar'
import { useDeleteMyAccounts } from '@/hooks/useDashboard'
import CreateMyAccountModal from '@/components/directories/CreateMyAccountModal/CreateMyAccountModal'
import CreateLegalEntityModal from '@/components/directories/CreateLegalEntityModal/CreateLegalEntityModal'
import { AccountMenu } from '@/components/directories/AccountMenu/AccountMenu'
import { DeleteAccountConfirmModal } from '@/components/directories/DeleteAccountConfirmModal/DeleteAccountConfirmModal'
import DeleteAccountGroupModal from '@/components/directories/DeleteAccountGroupModal/DeleteAccountGroupModal'
import { cn } from '@/app/lib/utils'
import styles from './accounts.module.scss'
import OperationCheckbox from '../../../../components/shared/Checkbox/operationCheckbox'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import CreateAccountGroupModal from '@/components/directories/CreateAccountGroupModal/CreateAccountGroupModal'
import SelectLegelEntitties from '../../../../components/ReadyComponents/SelectLegelEntitties'
import SingleSelect from '../../../../components/shared/Selects/SingleSelect'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import Input from '../../../../components/shared/Input'
import GroupMyAccounts from '../../../../components/ReadyComponents/GroupMyAccouts'
import ScreenLoader from '../../../../components/shared/ScreenLoader'

export default observer(function AccountsPage() {
  // Block body scroll for this page only
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'

    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    searchQuery, setSearchQuery,
    selectedTypes, toggleType,
    selectedEntity, setSelectedEntity,
    selectedAccounts, setSelectedAccounts,
    selectedGrouping, setSelectedGrouping,
    isFilterOpen, setIsFilterOpen
  } = accountsStore

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const [editingAccount, setEditingAccount] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [editingLegalEntity, setEditingLegalEntity] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)
  const deleteMutation = useDeleteMyAccounts()
  const queryClient = useQueryClient()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])



  const [expandedGroups, setExpandedGroups] = useState(new Set())

  const toggleGroup = (id) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }



  const requestBankAccounts = useMemo(() => {
    return {
      page: 1,
      limit: 100,
      search: debouncedSearchQuery.toLowerCase() || "",
      groupBy: selectedGrouping,
      nalichnye: selectedTypes.length === 0 || selectedTypes.includes('Наличный'),
      beznalichnye: selectedTypes.length === 0 || selectedTypes.includes('Безналичный'),
      kartaFizlica: selectedTypes.length === 0 || selectedTypes.includes('Карта физлица'),
      elektronnye: selectedTypes.length === 0 || selectedTypes.includes('Электронный'),
      legal_entity_ids: selectedEntity,
      accounts_and_groups_ids: selectedAccounts,
    }
  }, [debouncedSearchQuery, selectedGrouping, selectedTypes, selectedEntity, selectedAccounts])

  // Fetch bank accounts using new invoke_function API
  const { data: bankAccountsData, isLoading: isLoadingBankAccounts } = useUcodeRequestQuery({
    method: "get_my_accounts",
    data: requestBankAccounts,
    querySetting: {
      select: (response) => response?.data,
    }
  })

  const { mutateAsync: deleteGroupMutate, isPending: isPendingDeleteGroup } = useUcodeRequestMutation({
    mutationSetting: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
        queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
        setDeletingGroup(null)
        setIsCreateGroupModalOpen(false)
      }
    }
  })

  const handleDeleteGroup = async () => {
    try {
      await deleteGroupMutate({
        method: "delete_account_group",
        data: {
          guid: deletingGroup.guid
        }
      })

    } catch (error) {
      console.log(error)
    }
  }

  const toggleFilter = (key) => {
    toggleType(key)
  }

  const isAllExpanded = useMemo(() => {
    const groupCount = bankAccountsData?.data?.length || 0
    return groupCount > 0 && expandedGroups.size === groupCount
  }, [expandedGroups, bankAccountsData])

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedGroups(new Set())
    } else {
      const allGroupIds = bankAccountsData?.data?.map(g => g.guid) || []
      setExpandedGroups(new Set(allGroupIds))
    }
  }

  // Unify data extraction from API response
  const dataArray = useMemo(() => {
    const rawData = bankAccountsData?.data
    if (Array.isArray(rawData)) return rawData
    if (Array.isArray(rawData?.data)) return rawData.data
    return []
  }, [bankAccountsData])
  // Filter bank accounts on frontend if needed
  const filteredBankAccountsItems = useMemo(() => {
    if (selectedGrouping !== 'none') return dataArray // Grouping handled by backend

    return dataArray.filter(item => {
      // Filter by selected accounts
      if (selectedAccounts.length > 0) {
        if (!selectedAccounts.includes(item.guid)) return false
      }
      return true
    })
  }, [dataArray, selectedAccounts, selectedGrouping])

  const accountsList = useMemo(() => {
    if (selectedGrouping === 'none') {
      return filteredBankAccountsItems
    }

    // For 'groups' or 'legal_entities', the backend returns a hierarchical structure
    return dataArray.map(group => ({
      ...group,
      isGroup: true,
      guid: group.id || group.guid,
      name: group.name || group.legal_entity_name || 'Без названия',
    }))
  }, [dataArray, filteredBankAccountsItems, selectedGrouping])

  // Get all field keys from API response - only show needed fields
  const allFields = useMemo(() => {
    // Define only the fields we want to display
    const standardFields = [
      'nazvanie',
      'nachalьnyy_ostatok',
      'balans',
      "tip",
      "legal_entity_id",
      "requisites",
    ]

    return standardFields
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return

    try {
      await deleteMutation.mutateAsync([deletingAccount.guid])
      setDeletingAccount(null)
      queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
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
      case 'requisites':
        // Remove HTML tags if present
        const requisitesValue = (item?.tip?.[0] === "Безналичный" || item?.tip?.[0] === "Карта физлица") ? <div className='flex flex-col'>
          <span className='text-xs'>{item?.bank_name}</span>
          <span className='text-xs'>{item?.nomer}</span>
        </div> : item?.tip?.[0] === 'Электронный' ? <div className='flex flex-col'>
          <span className='text-xs'>{item?.nomer}</span>
        </div> : '–'
        if (typeof requisitesValue === 'string') {
          return requisitesValue.replace(/<[^>]*>/g, '').trim() || '–'
        }
        return requisitesValue || '–'
      default:
        if (value === null || value === undefined) return '–'
        return value
    }
  }

  const totalCurrentBalance = useMemo(() => {
    return filteredBankAccountsItems.reduce((sum, item) => {
      // For grouped data, sum total_balance. For individual items, sum current_balance.
      if (item.isGroup) {
        return sum + (item.total_balance != null ? Number(item.total_balance) : 0)
      }
      const balance = item.current_balance ?? item.balans ?? item.nachalьnyy_ostatok
      return sum + (balance != null ? Number(balance) : 0)
    }, 0)
  }, [filteredBankAccountsItems])

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Prevent hydration mismatch
  if (!mounted) return null

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleCreateSingle = () => {
    setIsCreateModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true)
    setIsMenuOpen(false)
  }


  console.log('deletingAccount', deletingAccount)
  console.log('editingGroup', editingGroup)

  return (
    <div className={styles.container}>
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterSection title="Тип">
          <div className="space-y-2.5 flex flex-col items-start">
            <OperationCheckbox
              checked={selectedTypes.includes('Наличный')}
              onChange={() => toggleFilter('Наличный')}
              label="Наличный"
            />
            <OperationCheckbox
              checked={selectedTypes.includes('Безналичный')}
              onChange={() => toggleFilter('Безналичный')}
              label="Безналичный"
            />
            <OperationCheckbox
              checked={selectedTypes.includes('Карта физлица')}
              onChange={() => toggleFilter('Карта физлица')}
              label="Карта физлица"
            />
            <OperationCheckbox
              checked={selectedTypes.includes('Электронный')}
              onChange={() => toggleFilter('Электронный')}
              label="Электронный"
            />
          </div>
        </FilterSection>

        <FilterSection title="Параметры">
          <div className="space-y-3">
            <GroupMyAccounts
              value={selectedAccounts}
              onChange={setSelectedAccounts}
              placeholder="Выберите счета"
              multi={true}
            />

            <SelectLegelEntitties
              value={selectedEntity}
              onChange={setSelectedEntity}
              placeholder="Выберите юрлицо"
              multi={true}
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
              <div ref={menuRef} className="flex items-center gap-2 relative">
                <button onClick={handleMenuClick} className={cn('primary-btn', "flex items-center gap-2")}>
                  Создать
                  {isMenuOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {isMenuOpen && (
                  <div className="absolute top-full w-40 p-2 flex flex-col justify-start items-start left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      className="text-neutral-700 font-normal hover:bg-neutral-100 w-full text-start text-sm p-1 cursor-pointer rounded-sm"
                      onClick={handleCreateSingle}
                    >
                      Создать
                    </button>
                    <button
                      className="text-neutral-700 font-normal hover:bg-neutral-100 w-full text-start text-sm p-1 cursor-pointer rounded-sm"
                      onClick={handleCreateGroup}
                    >
                      Создать группу
                    </button>
                  </div>
                )}
              </div>

              {/* Search - pushed to the right */}
              <div className={styles.headerActionsRight}>
                {/* Search */}
                <SingleSelect
                  data={[
                    { value: 'none', label: 'Без группировки' },
                    { value: 'groups', label: 'По группам' },
                    { value: 'legal_entities', label: 'По юрлицам' },
                  ]}
                  value={selectedGrouping}
                  withSearch={false}
                  className={'bg-white w-44'}
                  onChange={setSelectedGrouping} />
                <Input
                  leftIcon={<Search size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию"
                  className="bg-white w-56"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 relative bg-white pb-20">
          <div className="z-50">
            <table className={styles.table}>
              <thead className="bg-neutral-100 sticky top-0 z-20 text-neutral-500 font-normal text-xs w-full border-b border-gray-300">
                <tr className=''>
                  <th className='w-12'>
                    <div className='flex items-center justify-center p-2'>
                      {/* Checkbox for all selection */}
                      <OperationCheckbox onChange={() => { }} />
                    </div>
                  </th>
                  <th className='p-2 text-start font-medium'>
                    <div className="flex items-center gap-2">
                      {selectedGrouping !== 'none' && (
                        <button
                          onClick={toggleExpandAll}
                          className="p-1 hover:bg-neutral-200 rounded cursor-pointer transition-colors"
                        >
                          {isAllExpanded ? <ExpendClose /> : <ExpendOpen />}
                        </button>
                      )}
                      <span>Название</span>
                    </div>
                  </th>
                  <th className='p-2 text-start font-medium'>Начальный остаток</th>
                  <th className='p-2 text-start font-medium'>Текущий остаток</th>
                  <th className='p-2 text-start font-medium'>Тип</th>
                  <th className='p-2 text-start font-medium text-nowrap'>Юрлицо</th>
                  <th className='p-2 text-start font-medium'>Реквизиты</th>
                  <th className='p-2 text-end w-12 pr-4'>&nbsp;</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {accountsList.length === 0 ? (
                  <tr>
                    <td colSpan={allFields.length + 2} className="p-8 text-center text-neutral-400">
                      Нет данных
                    </td>
                  </tr>
                ) : (
                    accountsList.map((item) => {
                      if (item.isGroup) {
                        const isExpanded = expandedGroups.has(item.guid)
                        return (
                          <React.Fragment key={item.guid}>
                            <tr
                              className="hover:bg-neutral-50 bg-neutral-50/50 font-medium cursor-pointer border-b border-gray-200 h-12"
                              onClick={() => toggleGroup(item.guid)}
                            >
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center">
                                  <OperationCheckbox onChange={() => { }} />
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleGroup(item.guid); }}
                                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                                  >
                                    {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                                  </button>
                                  <span className="text-sm font-medium text-slate-900">{item.name}</span>
                                  {item.items_count !== undefined ? (
                                    <span className="ml-1 text-xs text-neutral-400 font-normal">({item.items_count})</span>
                                  ) : item.items?.length > 0 && (
                                    <span className="ml-1 text-xs text-neutral-400 font-normal">({item.items.length})</span>
                                  )}
                                </div>
                              </td>
                              {/* Group summary columns if needed, else empty */}
                              <td className="p-2 text-sm text-[#0f172a] font-medium text-nowrap">
                                {item.total_balance !== undefined ? `${item.total_balance.toLocaleString('ru-RU')} ₽` : ''}
                              </td>
                              <td className="p-2 text-sm text-[#0f172a] font-medium text-nowrap">
                                {item.total_balance !== undefined ? `${item.total_balance.toLocaleString('ru-RU')} ₽` : ''}
                              </td>
                              <td className="p-2"></td>
                              <td className="p-2"></td>
                              <td className="p-2"></td>
                              <td className="p-2 text-end" onClick={(e) => e.stopPropagation()}>
                                <AccountMenu
                                  onEdit={() => {
                                    if (selectedGrouping === 'legal_entities') {
                                      setEditingLegalEntity(item)
                                    } else {
                                      setIsCreateGroupModalOpen(true)
                                      setEditingGroup(item)
                                    }
                                  }}
                                  onDelete={() => { setDeletingGroup(item) }}
                                  isGroup={true}
                                />
                              </td>
                            </tr>
                            {isExpanded && (item.children || []).map((account) => (
                              <tr key={account.guid} className="hover:bg-neutral-50 border-b border-gray-100 transition-colors h-14">
                                <td className="p-2">
                                  <div className="flex items-center justify-center">
                                    <OperationCheckbox onChange={() => { }} />
                                  </div>
                                </td>
                                <td className="p-2 text-sm text-[#0f172a] pl-10 font-medium">
                                  {account.nazvanie}
                                </td>
                                {allFields.slice(1).map((field) => (
                                <td key={field} className="p-2 text-sm text-[#0f172a]">
                                  {formatFieldValue(account, field)}
                                </td>
                              ))}
                              <td className="p-2 text-end" onClick={(e) => e.stopPropagation()}>
                                <AccountMenu
                                  onEdit={() => setEditMyAccount(account)}
                                  onDelete={() => setDeletingAccount(account)}
                                />
                              </td>
                            </tr>
                          ))}
                          </React.Fragment>
                        )
                      }

                    // Non-grouped (flat list)
                    return (
                      <tr key={item.guid} className="hover:bg-neutral-50 border-b  border-gray-100 transition-colors h-14">
                        <td className="p-2 text-center text-xs text-neutral-400">
                          <div className="flex items-center justify-center">
                            <OperationCheckbox onChange={() => { }} />
                          </div>
                        </td>
                        {allFields.map((field) => (
                          <td key={field} className="p-2 text-xs text-[#0f172a] ">
                            {formatFieldValue(item, field)}
                          </td>
                        ))}
                        <td className="p-2 text-end" onClick={(e) => e.stopPropagation()}>
                          <AccountMenu
                            onEdit={() => setEditingAccount(item)}
                            onDelete={() => setDeletingAccount(item)}
                          />
                        </td>
                      </tr>
                    )
                  })
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
        {isLoadingBankAccounts && <ScreenLoader />}
      </div>

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <CreateMyAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
          }}
        />
      )}

      {/* Create Account Group Modal */}
      {isCreateGroupModalOpen && (
        <CreateAccountGroupModal
          isOpen={isCreateGroupModalOpen}
          editingGroup={editingGroup}
          onClose={() => {
            setIsCreateGroupModalOpen(false)
            setEditingGroup(null)
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
          }}
        />
      )}


      {/* Edit Account Modal */}
      {editingAccount && (
        <CreateMyAccountModal
          isOpen={!!editingAccount}
          onClose={() => {
            setEditingAccount(null)
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
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
      {/* delelet group modal by customModal if children show other modal  */}
      {deletingGroup && (
        <DeleteAccountGroupModal
          isOpen={!!deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onConfirm={handleDeleteGroup}
          groupName={deletingGroup.name}
          isDeleting={isPendingDeleteGroup}
        />
      )}

      {/* Edit Legal Entity Modal */}
      {editingLegalEntity && (
        <CreateLegalEntityModal
          isOpen={!!editingLegalEntity}
          onClose={() => {
            setEditingLegalEntity(null)
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['bankAccountsPlanFact'] })
            queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
          }}
          legalEntity={editingLegalEntity}
        />
      )}
    </div>
  )
})
