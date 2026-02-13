"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSidebar, FilterSection, FilterCheckbox } from '@/components/directories/FilterSidebar/FilterSidebar'
import { DropdownFilter } from '@/components/directories/DropdownFilter/DropdownFilter'
import { SearchBar } from '@/components/directories/SearchBar/SearchBar'
import { DateRangePicker } from '@/components/directories/DateRangePicker/DateRangePicker'
import { useCounterpartiesV2, useCounterpartiesGroupsV2, useDeleteCounterparties, useDeleteCounterpartiesGroups, useChartOfAccountsPlanFact, useCounterpartiesPlanFact, useCounterpartiesGroupsPlanFact } from '@/hooks/useDashboard'
import CreateCounterpartyModal from '@/components/directories/CreateCounterpartyModal/CreateCounterpartyModal'
import EditCounterpartyModal from '@/components/directories/EditCounterpartyModal/EditCounterpartyModal'
import EditCounterpartyGroupModal from '@/components/directories/EditCounterpartyGroupModal/EditCounterpartyGroupModal'
import { CounterpartyMenu } from '@/components/directories/CounterpartyMenu/CounterpartyMenu'
import { GroupMenu } from '@/components/directories/GroupMenu/GroupMenu'
import { DeleteCounterpartyConfirmModal } from '@/components/directories/DeleteCounterpartyConfirmModal/DeleteCounterpartyConfirmModal'
import { DeleteGroupConfirmModal } from '@/components/directories/DeleteGroupConfirmModal/DeleteGroupConfirmModal'
import { cn } from '@/app/lib/utils'
import styles from './counterparties.module.scss'

export default function CounterpartiesPage() {
  // Block body scroll for this page only
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])
  
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  
  const [filters, setFilters] = useState({
    // Group filters
    client: true,
    employee: true,
    supplier: true,
    // Counterparties groups filter
    selectedGroups: [],
    // Selected counterparties for filter
    selectedCounterparties: [],
    // Selected chart of accounts for filter
    selectedChartOfAccounts: [],
    // Date range filter
    dateRange: null
  })

  // Build filters object for API request
  const filtersForAPI = useMemo(() => {
    const apiFilters = {}
    
    // Group filter - gruppa is an array in API
    const selectedGroups = []
    if (filters.client) selectedGroups.push('Клиент')
    if (filters.employee) selectedGroups.push('Сотрудник')
    if (filters.supplier) selectedGroups.push('Поставщик')
    
    // Only add gruppa filter if not all groups are selected
    if (selectedGroups.length > 0 && selectedGroups.length < 3) {
      apiFilters.gruppa = selectedGroups
    }
    
    // Counterparties groups filter
    if (filters.selectedGroups && filters.selectedGroups.length > 0) {
      apiFilters.counterparties_group_id = filters.selectedGroups
    }
    
    // Selected counterparties filter - фильтруем по guid (массив GUID)
    if (filters.selectedCounterparties && filters.selectedCounterparties.length > 0) {
      apiFilters.guid = filters.selectedCounterparties
    }
    
    // Selected chart of accounts filter - фильтруем по chart_of_accounts_id
    if (filters.selectedChartOfAccounts && filters.selectedChartOfAccounts.length > 0) {
      apiFilters.chart_of_accounts_id = filters.selectedChartOfAccounts
    }
    
    // Type filter (Плательщик, Получатель, Смешанный) - фильтруем на фронтенде
    // Не добавляем в API фильтр, так как тип определяется на основе статей
    
    return apiFilters
  }, [filters])
  
  // Fetch counterparties using new invoke_function API
  const { data: counterpartiesData, isLoading: isLoadingCounterparties } = useCounterpartiesPlanFact({
    page: 1,
    limit: 100,
  })
  
  console.log('Counterparties data:', counterpartiesData)
  
  // Extract counterparties from response
  const counterpartiesItems = useMemo(() => {
    const items = counterpartiesData?.data?.data?.data || []
    console.log('Counterparties items:', items)
    return Array.isArray(items) ? items : []
  }, [counterpartiesData])
  
  // Fetch counterparties groups using new invoke_function API
  const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({
    page: 1,
    limit: 100,
  })
  
  const counterpartiesGroupsItems = useMemo(() => {
    const items = counterpartiesGroupsData?.data?.data?.data || []
    return Array.isArray(items) ? items : []
  }, [counterpartiesGroupsData])

  // Fetch chart of accounts for filter
  const { data: chartOfAccountsData } = useChartOfAccountsPlanFact({ page: 1, limit: 100 })
  const chartOfAccountsRaw = chartOfAccountsData?.data?.data?.data || []

  // Flatten hierarchical structure to array
  const chartOfAccounts = useMemo(() => {
    const flatten = (items) => {
      let result = []
      items.forEach(item => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          result = result.concat(flatten(item.children))
        }
      })
      return result
    }
    return Array.isArray(chartOfAccountsRaw) ? flatten(chartOfAccountsRaw) : []
  }, [chartOfAccountsRaw])

  // Prepare options for filters
  const counterpartiesOptions = useMemo(() => {
    if (!counterpartiesItems || counterpartiesItems.length === 0) return []
    return counterpartiesItems.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия'
    }))
  }, [counterpartiesItems])

  const chartOfAccountsOptions = useMemo(() => {
    if (!chartOfAccounts || chartOfAccounts.length === 0) return []
    return chartOfAccounts.map(item => ({
      value: item.guid,
      label: item.nazvanie || 'Без названия',
      group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
    }))
  }, [chartOfAccounts])

  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const isRowSelected = (id) => {
    return selectedRows.includes(id)
  }

  const allSelected = () => {
    return flatCounterparties.length > 0 && selectedRows.length === flatCounterparties.length
  }

  const toggleSelectAll = () => {
    if (allSelected()) {
      setSelectedRows([])
    } else {
      setSelectedRows(flatCounterparties.map(item => item.id))
    }
  }

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Convert counterparties API data to component format with grouping
  const { groupedCounterparties, flatCounterparties } = useMemo(() => {
    const items = counterpartiesItems.map((item, index) => {
      return {
        id: item.guid || `counterparty-${index}`,
        guid: item.guid,
        nazvanie: item.nazvanie || 'Без названия',
        polnoe_imya: item.polnoe_imya || null,
        gruppa: item.group_name || null,
        inn: item.inn ? String(item.inn) : null,
        kpp: item.kpp ? String(item.kpp) : null,
        nomer_scheta: item.nomer_scheta ? String(item.nomer_scheta) : null,
        counterparties_group_id: item.counterparties_group_id || null,
        counterparties_group: item.group_name || null,
        komentariy: item.komentariy || null,
        data_sozdaniya: item.data_sozdaniya ? new Date(item.data_sozdaniya).toLocaleDateString('ru-RU') : null,
        // Используем правильные ключи из API
        receivables: item.receivables || 0,  // Дебиторка
        payables: item.payables || 0,        // Кредиторка
        debitorka: item.debitorka || 0,
        kreditorka: item.kreditorka || 0,
        profit: item.profit || 0,
        rawData: item
      }
    })
    
    // Применяем фильтры
    const filteredItems = items

    // Group by counterparties_group_id
    const groupsMap = new Map()
    const ungrouped = []

    filteredItems.forEach(item => {
        if (item.counterparties_group_id) {
          if (!groupsMap.has(item.counterparties_group_id)) {
            // Find the group data from counterpartiesGroupsItems
            const groupData = counterpartiesGroupsItems.find(g => g.guid === item.counterparties_group_id)
            groupsMap.set(item.counterparties_group_id, {
              id: `group-${item.counterparties_group_id}`,
              guid: item.counterparties_group_id,
              nazvanie: item.counterparties_group || 'Без названия группы',
              data_sozdaniya: groupData?.data_sozdaniya ? new Date(groupData.data_sozdaniya).toLocaleDateString('ru-RU') : null,
              isGroup: true,
              items: []
            })
          }
          groupsMap.get(item.counterparties_group_id).items.push(item)
        } else {
          ungrouped.push(item)
        }
      })

      const grouped = Array.from(groupsMap.values())
      
      return {
        groupedCounterparties: [...grouped, ...ungrouped],
        flatCounterparties: filteredItems
      }
    }, [counterpartiesItems, filters.selectedTypes, counterpartiesGroupsItems])

  const totalCounterparties = flatCounterparties.length
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [editingCounterparty, setEditingCounterparty] = useState(null)
  const [deletingCounterparty, setDeletingCounterparty] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(null)
  const [preselectedGroupId, setPreselectedGroupId] = useState(null)
  const deleteMutation = useDeleteCounterparties()
  const deleteGroupMutation = useDeleteCounterpartiesGroups()

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  return (
    <div className={styles.container}>
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterSection title="Параметры">
          <div className="space-y-2.5">
            <DropdownFilter
              label="Контрагенты"
              options={counterpartiesOptions || []}
              selectedValues={filters.selectedCounterparties}
              onChange={(values) => setFilters(prev => ({ ...prev, selectedCounterparties: values }))}
              placeholder="Выберите контрагентов"
            />
            <DropdownFilter
              label="Статьи учета"
              options={chartOfAccountsOptions || []}
              selectedValues={filters.selectedChartOfAccounts}
              onChange={(values) => setFilters(prev => ({ ...prev, selectedChartOfAccounts: values }))}
              placeholder="Выберите статьи учета"
              grouped={true}
            />
          </div>
        </FilterSection>

        <FilterSection title="Период аналитики">
          <DateRangePicker
            selectedRange={filters.dateRange}
            onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
            placeholder="Выберите период"
          />
        </FilterSection>

        <FilterSection title="Группа">
          <div className="space-y-2.5">
            <FilterCheckbox 
              checked={filters.client} 
              onChange={() => toggleFilter('client')} 
              label="Клиент" 
            />
            <FilterCheckbox 
              checked={filters.employee} 
              onChange={() => toggleFilter('employee')} 
              label="Сотрудник" 
            />
            <FilterCheckbox 
              checked={filters.supplier} 
              onChange={() => toggleFilter('supplier')} 
              label="Поставщик" 
            />
          </div>
        </FilterSection>

        <FilterSection title="Группы контрагентов">
          <div className="space-y-2.5">
            {counterpartiesGroupsItems.map((group) => (
              <FilterCheckbox
                key={group.guid}
                checked={filters.selectedGroups.includes(group.guid)}
                onChange={() => {
                  setFilters(prev => {
                    const newGroups = prev.selectedGroups.includes(group.guid)
                      ? prev.selectedGroups.filter(g => g !== group.guid)
                      : [...prev.selectedGroups, group.guid]
                    return { ...prev, selectedGroups: newGroups }
                  })
                }}
                label={group.nazvanie_gruppy || 'Без названия'}
              />
            ))}
          </div>
        </FilterSection>
      </FilterSidebar>

      <div className={styles.content}>
        {/* Header */}
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
            <h1 className={styles.title}>Контрагенты</h1>
              <button 
                className={styles.createButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Создать
              </button>
              <div className={styles.searchContainer}>
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder="Поиск по названию или ИНН" 
              />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableHeaderRow}>
                  <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellIndex)}>
                    №
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Контрагент
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Группа
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      ИНН
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Операций
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Дебиторка
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Кредиторка
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Доход
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.tableHeaderCell}>
                    <button className={styles.tableHeaderButton}>
                      Расход
                      <svg className={styles.tableHeaderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCounterparties ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={10} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Загрузка...
                    </td>
                  </tr>
                ) : groupedCounterparties.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={10} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  groupedCounterparties.map((item, itemIndex) => {
                    if (item.isGroup) {
                      const isExpanded = expandedGroups.has(item.guid)
                      const isLastChild = (index) => index === item.items.length - 1
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={cn(styles.tableRow, styles.groupRow)}>
                            <td className={cn(styles.tableCell, styles.tableCellIndex)}>
                              <button
                                className={styles.expandButton}
                                onClick={() => toggleGroup(item.guid)}
                              >
                                <svg 
                                  className={cn(styles.expandIcon, isExpanded && styles.expanded)} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor" 
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </td>
                            <td className={cn(styles.tableCell, styles.text, styles.groupCell)}>{item.nazvanie}</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                            <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={(e) => e.stopPropagation()}>
                              <GroupMenu
                                group={item}
                                onEdit={(group) => setEditingGroup(group)}
                                onDelete={(group) => setDeletingGroup(group)}
                                onCreateCounterparty={(group) => {
                                  setPreselectedGroupId(group.guid)
                                  setIsCreateModalOpen(true)
                                }}
                              />
                            </td>
                          </tr>
                          {isExpanded && item.items.map((counterparty, childIndex) => (
                            <tr 
                              key={counterparty.id} 
                              className={cn(
                                styles.tableRow,
                                styles.childRow,
                                isRowSelected(counterparty.id) && styles.selected
                              )}
                              onClick={() => router.push(`/pages/directories/counterparties/${counterparty.guid}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className={cn(styles.tableCell, styles.tableCellIndex)} onClick={(e) => e.stopPropagation()}>
                                {childIndex + 1}
                              </td>
                              <td className={cn(styles.tableCell, styles.text)}>{counterparty.nazvanie}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.gruppa || '–'}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.inn || '–'}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.receivables?.toLocaleString('ru-RU') || '0'}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.payables?.toLocaleString('ru-RU') || '0'}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.debitorka?.toLocaleString('ru-RU') || '0'}</td>
                              <td className={cn(styles.tableCell, styles.textMuted)}>{counterparty.kreditorka?.toLocaleString('ru-RU') || '0'}</td>
                              <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={(e) => e.stopPropagation()}>
                                <CounterpartyMenu
                                  counterparty={counterparty}
                                  onEdit={(cp) => setEditingCounterparty(cp)}
                                  onDelete={(cp) => setDeletingCounterparty(cp)}
                                />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    } else {
                      return (
                        <tr 
                          key={item.id} 
                          className={cn(
                            styles.tableRow,
                            isRowSelected(item.id) && styles.selected
                          )}
                          onClick={() => router.push(`/pages/directories/counterparties/${item.guid}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className={cn(styles.tableCell, styles.tableCellIndex)} onClick={(e) => e.stopPropagation()}>
                            {itemIndex + 1}
                          </td>
                          <td className={cn(styles.tableCell, styles.text)}>{item.nazvanie}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.gruppa || '–'}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.inn || '–'}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>–</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.receivables?.toLocaleString('ru-RU') || '0'}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.payables?.toLocaleString('ru-RU') || '0'}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.debitorka?.toLocaleString('ru-RU') || '0'}</td>
                          <td className={cn(styles.tableCell, styles.textMuted)}>{item.kreditorka?.toLocaleString('ru-RU') || '0'}</td>
                          <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={(e) => e.stopPropagation()}>
                            <CounterpartyMenu
                              counterparty={item}
                              onEdit={(cp) => setEditingCounterparty(cp)}
                              onDelete={(cp) => setDeletingCounterparty(cp)}
                            />
                      </td>
                    </tr>
                      )
                    }
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(styles.footer, isFilterOpen && styles.footerWithFilter)}>
          <div className={styles.footerText}>
            <span className={styles.footerTextBold}>
              {totalCounterparties} {totalCounterparties === 1 ? 'контрагент' : totalCounterparties < 5 ? 'контрагента' : 'контрагентов'}
              </span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateCounterpartyModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setPreselectedGroupId(null)
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
          queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
        }}
        preselectedGroupId={preselectedGroupId}
      />
      <EditCounterpartyModal
        isOpen={!!editingCounterparty}
        onClose={() => {
          setEditingCounterparty(null)
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
        }}
        counterparty={editingCounterparty}
      />
      <EditCounterpartyGroupModal
        isOpen={!!editingGroup}
        onClose={() => {
          setEditingGroup(null)
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
          queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
        }}
        group={editingGroup}
      />
      <DeleteGroupConfirmModal
        isOpen={!!deletingGroup}
        group={deletingGroup}
        onConfirm={async () => {
          if (deletingGroup?.guid) {
            try {
              await deleteGroupMutation.mutateAsync([deletingGroup.guid])
              setDeletingGroup(null)
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
            } catch (error) {
              console.error('Error deleting group:', error)
            }
          }
        }}
        onCancel={() => setDeletingGroup(null)}
        isDeleting={deleteGroupMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCounterpartyConfirmModal
        isOpen={!!deletingCounterparty}
        counterparty={deletingCounterparty}
        onConfirm={async () => {
          if (deletingCounterparty?.guid) {
            try {
              await deleteMutation.mutateAsync([deletingCounterparty.guid])
              setDeletingCounterparty(null)
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
            } catch (error) {
              console.error('Error deleting counterparty:', error)
            }
          }
        }}
        onCancel={() => setDeletingCounterparty(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
