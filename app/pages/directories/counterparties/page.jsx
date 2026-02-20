"use client"
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSidebar, FilterSection } from '@/components/directories/FilterSidebar/FilterSidebar'
import { DropdownFilter } from '@/components/directories/DropdownFilter/DropdownFilter'
import { SearchBar } from '@/components/directories/SearchBar/SearchBar'
import { DateRangePicker } from '@/components/directories/DateRangePicker/DateRangePicker'
import { useDeleteCounterparties, useDeleteCounterpartiesGroups, useChartOfAccountsPlanFact, useCounterpartiesPlanFact, useCounterpartiesGroupsPlanFact } from '@/hooks/useDashboard'
import CreateCounterpartyModal from '@/components/directories/CreateCounterpartyModal/CreateCounterpartyModal'
import EditCounterpartyModal from '@/components/directories/EditCounterpartyModal/EditCounterpartyModal'
import EditCounterpartyGroupModal from '@/components/directories/EditCounterpartyGroupModal/EditCounterpartyGroupModal'
import { CounterpartyMenu } from '@/components/directories/CounterpartyMenu/CounterpartyMenu'
import { GroupMenu } from '@/components/directories/GroupMenu/GroupMenu'
import { DeleteCounterpartyConfirmModal } from '@/components/directories/DeleteCounterpartyConfirmModal/DeleteCounterpartyConfirmModal'
import { DeleteGroupConfirmModal } from '@/components/directories/DeleteGroupConfirmModal/DeleteGroupConfirmModal'
import { cn } from '@/app/lib/utils'
import styles from './counterparties.module.scss'
import { BsList } from 'react-icons/bs'
import { TbCurrencyRubel } from 'react-icons/tb'
import OperationCheckbox from '../../../../components/shared/Checkbox/operationCheckbox'
import { LuListTree } from 'react-icons/lu'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'

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
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' | 'nested' | 'groups'
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [allCounterparties, setAllCounterparties] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const contentRef = useRef(null)
  const tableWrapperRef = useRef(null)
  const isLoadingRef = useRef(false) // Prevent duplicate requests
  const lastPageRef = useRef(1) // Track last loaded page

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

  // Fetch counterparties using new invoke_function API with pagination
  const { data: counterpartiesData, isLoading: isLoadingCounterparties, isFetching } = useCounterpartiesPlanFact({
    page: page,
    limit: 20,
  }, true) // Always enable the query

  // Update counterparties when new data arrives
  useEffect(() => {
    console.log('📦 counterpartiesData changed:', {
      hasData: !!counterpartiesData,
      page,
      dataPath: counterpartiesData?.data?.data?.data?.length,
      allCounterpartiesLength: allCounterparties.length,
      isFetching
    })
    
    // Skip if still fetching or no data
    if (isFetching || !counterpartiesData?.data?.data?.data) {
      console.log('⏳ Skipping update - still fetching or no data')
      return
    }
    
    const newItems = counterpartiesData.data.data.data
    
    console.log('✅ New items received:', newItems.length, 'for page', page)
    
    // Only update if we actually have new data
    if (newItems.length === 0) {
      console.log('⚠️ No new items, stopping pagination')
      setHasMore(false)
      setIsLoadingMore(false)
      isLoadingRef.current = false
      return
    }
    
    if (page === 1) {
      // First page - replace all
      console.log('🔄 First page - setting items')
      setAllCounterparties(newItems)
      // Reset refs for fresh start
      lastPageRef.current = 1
      isLoadingRef.current = false
    } else {
      // Subsequent pages - append
      console.log('➕ Appending to existing list')
      setAllCounterparties(prev => {
        // If prev is empty but we're on page > 1, something went wrong - reset to page 1
        if (prev.length === 0) {
          console.log('⚠️ Empty list on page', page, '- resetting to page 1')
          setPage(1)
          return prev
        }
        
        const existingGuids = new Set(prev.map(item => item.guid))
        const uniqueNewItems = newItems.filter(item => !existingGuids.has(item.guid))
        
        console.log('  - Existing:', prev.length, 'New unique:', uniqueNewItems.length)
        
        // Only append if we have new unique items
        if (uniqueNewItems.length > 0) {
          return [...prev, ...uniqueNewItems]
        }
        return prev
      })
    }
    
    // Check if there are more items
    if (newItems.length < 20) {
      console.log('📊 Last page reached (received', newItems.length, '< 20)')
      setHasMore(false)
    } else {
      console.log('📊 More pages available')
    }
    
    // Reset loading flags with a small delay to prevent immediate re-trigger
    console.log('✓ Resetting loading flags')
    setIsLoadingMore(false)
    
    // Add delay before allowing next load to prevent double-trigger on fast scroll
    setTimeout(() => {
      isLoadingRef.current = false
    }, 300)
  }, [counterpartiesData, page, isFetching])

  // Reset state when component mounts (e.g., when returning from detail page)
  useEffect(() => {
    console.log('🔄 CounterpartiesPage mounted - resetting state')
    setPage(1)
    setAllCounterparties([])
    setHasMore(true)
    setIsLoadingMore(false)
    isLoadingRef.current = false
    lastPageRef.current = 1
    
    // Invalidate queries to force fresh data fetch
    queryClient.invalidateQueries({ queryKey: ['counterpartiesPlanFact'] })
  }, [queryClient]) // Empty dependency array - runs only on mount

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
    setAllCounterparties([])
    setHasMore(true)
    setIsLoadingMore(false)
    isLoadingRef.current = false
    lastPageRef.current = 1
  }, [filtersForAPI])

  // Infinite scroll handler
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current
    if (!tableWrapper) return

    let scrollTimeout = null

    const handleScroll = () => {
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Debounce scroll events
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = tableWrapper
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        
        // Load more when scrolled near bottom (with 10px threshold)
        if (distanceFromBottom < 10 && hasMore && !isLoadingRef.current) {
          const nextPage = lastPageRef.current + 1
          console.log('🚀 TRIGGERING LOAD - Next page:', nextPage)
          isLoadingRef.current = true
          lastPageRef.current = nextPage
          setIsLoadingMore(true)
          setPage(nextPage)
        }
      }, 100) // 100ms debounce
    }

    tableWrapper.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      tableWrapper.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore])

  // Extract counterparties from accumulated data
  const counterpartiesItems = useMemo(() => {
    return Array.isArray(allCounterparties) ? allCounterparties : []
  }, [allCounterparties])


  // Fetch counterparties groups using new invoke_function API
  const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({
    page: 1,
    limit: 100,
  })


  const counterpartiesGroupsItems = useMemo(() => {
    const items = counterpartiesGroupsData?.data?.data?.data || []
    return Array.isArray(items) ? items : []
  }, [counterpartiesGroupsData])

  console.log('counterpartiesGroupsData', counterpartiesGroupsData)

  // Fetch chart of accounts for filter
  const { data: chartOfAccountsData } = useChartOfAccountsPlanFact({ page: 1, limit: 100 })
  // Flatten hierarchical structure to array
  const chartOfAccounts = useMemo(() => {
    const chartOfAccountsRaw = chartOfAccountsData?.data?.data?.data || []
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
  }, [chartOfAccountsData])


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
    // For flat list view - use counterpartiesItems
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
        receivables: item.receivables || 0,
        payables: item.payables || 0,
        debitorka: item.debitorka || 0,
        kreditorka: item.kreditorka || 0,
        profit: item.profit || 0,
        rawData: item
      }
    })

    // For nested view - use counterpartiesGroupsItems with children
    const groupedFromAPI = counterpartiesGroupsItems
      .filter(group => group.children && group.children.length > 0) // Only groups with children
      .map(group => {
        const children = group.children.map((item, index) => ({
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
          receivables: item.receivables || 0,
          payables: item.payables || 0,
          debitorka: item.debitorka || 0,
          kreditorka: item.kreditorka || 0,
          profit: item.profit || 0,
          rawData: item
        }))

        return {
          id: `group-${group.guid}`,
          guid: group.guid,
          nazvanie: group.nazvanie_gruppy || 'Без названия группы',
          data_sozdaniya: group.data_sozdaniya ? new Date(group.data_sozdaniya).toLocaleDateString('ru-RU') : null,
          isGroup: true,
          items: children
        }
      })

    return {
      groupedCounterparties: groupedFromAPI,
      flatCounterparties: items
    }
  }, [counterpartiesItems, counterpartiesGroupsItems])

  // Create array of only groups for 'groups' view mode
  const counterpartiesGroups = useMemo(() => {
    return counterpartiesGroupsItems.map((group, index) => ({
      id: `group-${group.guid}`,
      guid: group.guid,
      nazvanie: group.nazvanie_gruppy || 'Без названия',
      opisanie_gruppy: group.opisanie_gruppy || null,
      data_sozdaniya: group.data_sozdaniya ? new Date(group.data_sozdaniya).toLocaleDateString('ru-RU') : null,
      isGroup: true,
      items: [] // Empty for groups-only view
    }))
  }, [counterpartiesGroupsItems])


  const totalCounterparties = flatCounterparties.length

  // Calculate totals for footer
  const { totalReceivables, totalPayables, totalIncome, totalExpenses, totalDifference } = useMemo(() => {
    return flatCounterparties.reduce((acc, item) => {
      acc.totalReceivables += (item.receivables || 0)
      acc.totalPayables += (item.payables || 0)
      acc.totalIncome += (item.debitorka || 0)
      acc.totalExpenses += (item.kreditorka || 0)
      return acc
    }, {
      totalReceivables: 0,
      totalPayables: 0,
      totalIncome: 0,
      totalExpenses: 0
    })
  }, [flatCounterparties])

  const difference = totalIncome - totalExpenses

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
          <div className="space-y-2.5 flex flex-col items-start">
            <OperationCheckbox
              checked={filters.client}
              onChange={() => toggleFilter('client')}
              label="Клиент"
            />
            <OperationCheckbox
              checked={filters.employee}
              onChange={() => toggleFilter('employee')}
              label="Сотрудник"
            />
            <OperationCheckbox
              checked={filters.supplier}
              onChange={() => toggleFilter('supplier')}
              label="Поставщик"
            />
          </div>
        </FilterSection>

        <FilterSection title="Группы контрагентов">
          <div className="space-y-2.5 flex flex-col items-start">
            {counterpartiesGroupsItems.map((group) => (
              <OperationCheckbox
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

      <div ref={contentRef} className={cn(styles.content, isFilterOpen && styles.contentWithFilter)}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <div className='flex gap-5 flex-1'>
                <h1 className={styles.title}>Контрагенты</h1>
                <button
                  className={styles.createButton}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Создать
                </button>
              </div>
              <div className={styles.headerSearchContainer}>
                <div className={styles.filterBox}>
                  <button
                    className={cn(styles.filterIcon, viewMode === 'list' && styles.active)}
                    onClick={() => setViewMode('list')}
                    title="Список"
                  >
                    <BsList size={18} />
                  </button>
                  <button
                    className={cn(styles.filterIcon, viewMode === 'nested' && styles.active)}
                    onClick={() => setViewMode('nested')}
                    title="Вложенный вид"
                  >
                    <LuListTree size={18} />
                  </button>
                  {/* <button
                    className={cn(styles.filterIcon, viewMode === 'groups' && styles.active)}
                    onClick={() => setViewMode('groups')}
                    title="Только группы"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button> */}
                </div>
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
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer}>
          <div ref={tableWrapperRef} className={styles.tableWrapper}>
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
                {isLoadingCounterparties && page === 1 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={10} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Загрузка...
                    </td>
                  </tr>
                ) : (viewMode === 'groups' ? counterpartiesGroups : viewMode === 'nested' ? groupedCounterparties : flatCounterparties).length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={10} className={cn(styles.tableCell, styles.textCenter, styles.emptyCell)}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                      (viewMode === 'groups' ? counterpartiesGroups : viewMode === 'nested' ? groupedCounterparties : flatCounterparties).map((item, itemIndex) => {
                    if (item.isGroup) {
                      const isExpanded = expandedGroups.has(item.guid)
                      const isLastChild = (index) => index === item.items.length - 1
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={cn(styles.tableRow, styles.groupRow)} onClick={() => toggleGroup(item.guid)}>
                            <td className={cn(styles.tableCell, styles.tableCellIndex)}>
                              {itemIndex + 1}
                            </td>
                            <td className={cn(styles.tableCell, styles.text)}>
                              <div className={styles.groupCell}>
                                <button
                                  className={styles.expandButton}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleGroup(item.guid)
                                  }}
                                >
                                  {isExpanded ? (
                                    <ExpendClose />
                                  ) : (
                                      <ExpendOpen />
                                  )}
                                </button>
                                <span className={styles.groupNameText}>
                                  {`${item.nazvanie} (${item.items.length})`}
                                </span>
                              </div>
                            </td>
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
          
          {/* Loading indicator */}
          {isFetching && hasMore && page > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: '20px',
              color: '#6b7280'
            }}>
              <svg 
                style={{ animation: 'spin 1s linear infinite' }} 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="#e5e7eb" />
                <path 
                  d="M12 2a10 10 0 0 1 10 10" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              </svg>
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(styles.footer, isFilterOpen && styles.footerWithFilter)}>
          <div className={styles.footerText}>
            <span className={styles.footerTextBold}>
              {totalCounterparties} {totalCounterparties === 1 ? 'контрагент' : totalCounterparties < 5 ? 'контрагента' : 'контрагентов'}
            </span>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Дебиторка</span>
            <div className={styles.footerValueContainer}>
              <span className={styles.footerValue}>{totalReceivables.toLocaleString('ru-RU')}</span>
              <TbCurrencyRubel className={styles.footerCurrencyIcon} />
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Кредиторка</span>
            <div className={styles.footerValueContainer}>
              <span className={styles.footerValue}>{totalPayables.toLocaleString('ru-RU')}</span>
              <TbCurrencyRubel className={styles.footerCurrencyIcon} />
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Поступления</span>
            <div className={styles.footerValueContainer}>
              <span className={styles.footerValue}>{totalIncome.toLocaleString('ru-RU')}</span>
              <TbCurrencyRubel className={styles.footerCurrencyIcon} />
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Выплаты</span>
            <div className={styles.footerValueContainer}>
              <span className={styles.footerValue}>{totalExpenses.toLocaleString('ru-RU')}</span>
              <TbCurrencyRubel className={styles.footerCurrencyIcon} />
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Разница</span>
            <div className={styles.footerValueContainer}>
              <span className={cn(styles.footerValue, difference > 0 ? styles.positive : difference < 0 ? styles.negative : '')}>
                {difference > 0 ? '+' : ''}{difference.toLocaleString('ru-RU')}
              </span>
              <TbCurrencyRubel className={cn(styles.footerCurrencyIcon, difference > 0 ? styles.positive : difference < 0 ? styles.negative : '')} />
            </div>
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
