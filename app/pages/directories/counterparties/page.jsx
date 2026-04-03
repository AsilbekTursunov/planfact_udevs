"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSidebar, FilterSection } from '@/components/directories/FilterSidebar/FilterSidebar'
import SelectCounterParties from '@/components/ReadyComponents/SelectCounterParties'
import MultiSelectStatiya from '@/components/ReadyComponents/MultiSelectStatiya'
import { SearchBar } from '@/components/directories/SearchBar/SearchBar'
import { useDeleteCounterparties, useDeleteCounterpartiesGroups, useCounterpartiesPlanFact } from '@/hooks/useDashboard'
import CreateCounterpartyModal from '@/components/directories/CreateCounterpartyModal/CreateCounterpartyModal'
import EditCounterpartyGroupModal from '@/components/directories/EditCounterpartyGroupModal/EditCounterpartyGroupModal'
import { CounterpartyMenu } from '@/components/directories/CounterpartyMenu/CounterpartyMenu'
import { GroupMenu } from '@/components/directories/GroupMenu/GroupMenu'
import { DeleteCounterpartyConfirmModal } from '@/components/directories/DeleteCounterpartyConfirmModal/DeleteCounterpartyConfirmModal'
import { DeleteGroupConfirmModal } from '@/components/directories/DeleteGroupConfirmModal/DeleteGroupConfirmModal'
import { cn } from '@/app/lib/utils'
import styles from './counterparties.module.scss'
import { BsList } from 'react-icons/bs'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { LuListTree } from 'react-icons/lu'
import { ExpendClose, ExpendOpen } from '@/constants/icons'
import { formatDate } from '@/utils/formatDate'
import Select from '@/components/common/Select'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'

const calculationOptions = [
  { value: "Cashflow", label: 'Учет по денежному потоку' },
  { value: "Cash", label: 'Учет кассовым методом' },
  { value: "Calculation", label: 'Учет методом начисления' },
]

const tipOptions = [
  { value: "Плательщик", label: 'Плательщик' },
  { value: "Получатель", label: 'Получатель' },
  { value: "Смешанный", label: 'Смешанный' },
]

import counterpartiesStore from '@/store/counterparties.store'
import { observer } from 'mobx-react-lite'
import MultiSelectZdelka from '../../../../components/ReadyComponents/MultiZdelka'
import SelectLegelEntitties from '../../../../components/ReadyComponents/SelectLegelEntitties'
import { GlobalCurrency } from '../../../../constants/globalCurrency'
import { formatAmount } from '../../../../utils/helpers'
import { ChevronDown } from 'lucide-react'
import ScreenLoader from '../../../../components/shared/ScreenLoader'

const CounterpartiesPage = observer(() => {

  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' | 'nested' | 'groups'
  const [tip, setTip] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [allCounterparties, setAllCounterparties] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalFromAPI, setTotalFromAPI] = useState(0)
  const contentRef = useRef(null)
  const tableWrapperRef = useRef(null)
  const isLoadingRef = useRef(false) // Prevent duplicate requests
  const lastPageRef = useRef(1) // Track last loaded page

  const filters = counterpartiesStore.filters
  const setFilters = (updater) => {
    if (typeof updater === 'function') {
      counterpartiesStore.setFilters(updater(counterpartiesStore.filters))
    } else {
      counterpartiesStore.setFilters(updater)
    }
  }

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build filters object for API request
  const filtersForAPI = useMemo(() => {
    const apiFilters = {}

    // Дебиторка filter
    if (filters.debitorka && filters.debitorka.length > 0 && filters.debitorka.length < 3) {
      apiFilters.debitorka = filters.debitorka
    }

    // Кредиторка filter
    if (filters.kreditorka && filters.kreditorka.length > 0 && filters.kreditorka.length < 3) {
      apiFilters.kreditorka = filters.kreditorka
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

    if (filters.calculationMethod) {
      apiFilters.calculationMethod = filters.calculationMethod
    }

    if (filters.deals && filters.deals.length > 0) {
      apiFilters.sellingDealId = filters.deals
    }

    if (filters.selectedLegalEntities && filters.selectedLegalEntities.length > 0) {
      apiFilters.legal_entities_ids = filters.selectedLegalEntities
    }

    return apiFilters
  }, [filters])

  // Fetch counterparties using new invoke_function API with pagination
  const { data: counterpartiesData, isLoading: isLoadingCounterparties, isFetching } = useCounterpartiesPlanFact({
    page: page,
    limit: 50,
    debitPaymentTypes: filters.debitPaymentTypes,
    creditPaymentTypes: filters.creditPaymentTypes,
    operationDateStart: filters.operationDateStart,
    operationDateEnd: filters.operationDateEnd,
    calculationMethod: filters.calculationMethod,
    contrAgentId: filters.selectedCounterparties,
    operationCategoryId: filters.selectedChartOfAccounts,
    sellingDealId: filters.deals,
    legalEntitiesId: filters.selectedLegalEntities,
    searchString: viewMode === 'list' ? debouncedSearchQuery : '',
  }, true) // Always enable the query


  const SummaryTotal = useMemo(() => {
    if (!counterpartiesData?.data?.data?.data) return {}
    return counterpartiesData.data.data.summary
  }, [counterpartiesData])

  const allCounterpartiesList = useMemo(() => {
    if (!counterpartiesData?.data?.data?.data) return []
    return counterpartiesData.data.data.data
  }, [counterpartiesData])
  console.log('allCounterpartiesList', allCounterpartiesList)


  // Update counterparties when new data arrives
  useEffect(() => {

    // Skip if still fetching or no data
    if (isFetching || !counterpartiesData?.data?.data?.data) {
      return
    }

    const newItems = counterpartiesData.data.data.data
    const total = counterpartiesData.data.data.total

    // Update total from API
    if (total !== undefined) {
      setTotalFromAPI(total)
    }

    console.log('✅ New items received:', newItems.length, 'for page', page)
    console.log('📊 Total from API:', total)

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
    if (newItems.length < 50) {
      console.log('📊 Last page reached (received', newItems.length, '< 50)')
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
    setTotalFromAPI(0)
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
    setTotalFromAPI(0)
    isLoadingRef.current = false
    lastPageRef.current = 1
  }, [filtersForAPI, debouncedSearchQuery])

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


  // Fetch counterparties groups using new invoke_function API




  // Fetch chart of accounts for filter


  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      if (prev?.includes(id)) {
        return prev.filter(rowId => rowId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const isRowSelected = (id) => {
    return selectedRows?.includes(id)
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

  // Convert counterparties API data to component format with grouping
  const { groupedCounterparties, flatCounterparties } = useMemo(() => {
    const items = allCounterpartiesList.map((item, index) => ({
      id: item.guid || `counterparty-${index}`,
      guid: item.guid,
      nazvanie: item.nazvanie || 'Без названия',
      polnoe_imya: item.polnoe_imya || null,
      gruppa: item.group_name || null,
      inn: item.inn || null,
      kpp: item.kpp || null,
      nomer_scheta: item.account_number || null,
      counterparties_group_id: item.counterparties_group_id || null,
      counterparties_group: item.group_name || null,
      komentariy: item.komentariy || null,
      data_sozdaniya: item.data_sozdaniya ? new Date(item.data_sozdaniya)?.toLocaleDateString('ru-RU') : null,
      receivables: item.receivables || 0,
      payables: item.payables || 0,
      debitorka: item.debitorka || 0,
      chart_of_accounts_id: item.chart_of_accounts_id || null,
      chart_of_accounts_id_2: item.chart_of_accounts_id_2 || null,
      primenyatь_statьi_po_umolchaniyu: item.primenyatь_statьi_po_umolchaniyu || false,
      difference: item?.difference,
      kreditorka: item.kreditorka || 0,
      profit: item.profit || 0,
      income: item?.income,
      expenses: item?.expense,
      rawData: item
    }))

    const groupsMap = {}
    items.forEach(item => {
      const groupId = item.counterparties_group_id || 'no-group'
      const groupName = item.counterparties_group || 'Без группы'

      if (!groupsMap[groupId]) {
        groupsMap[groupId] = {
          id: `group-${groupId}`,
          guid: groupId === 'no-group' ? null : groupId,
          nazvanie: groupName,
          items: [],
          operationsCount: 0,
          receivables: 0,
          payables: 0,
          debitorka: 0,
          kreditorka: 0,
          profit: 0,
          income: 0,
          expenses: 0,
          difference: 0
        }
      }

      groupsMap[groupId].items.push(item)
      groupsMap[groupId].receivables += (item.receivables || 0)
      groupsMap[groupId].payables += (item.payables || 0)
      groupsMap[groupId].debitorka += (item.debitorka || 0)
      groupsMap[groupId].kreditorka += (item.kreditorka || 0)
      groupsMap[groupId].profit += (item.profit || 0)
      groupsMap[groupId].income += (item.income || 0)
      groupsMap[groupId].expenses += (item.expenses || 0)
      groupsMap[groupId].difference += (item.difference || 0)
    })

    const groupedData = Object.values(groupsMap).map(group => ({
      ...group,
      isGroup: true
    }))

    return {
      groupedCounterparties: groupedData,
      flatCounterparties: items
    }
  }, [allCounterpartiesList])

  // Create array of only groups for 'groups' view mode
  const counterpartiesGroups = useMemo(() => {
    return groupedCounterparties.map((group, index) => ({
      id: group.id,
      guid: group.guid,
      nazvanie: group.nazvanie,
      opisanie_gruppy: null,
      data_sozdaniya: null,
      isGroup: true,
      items: []
    }))
  }, [groupedCounterparties])



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
    <div className="w-[calc(100%-80px)] flex h-[calc(100%-60px)]  fixed left-[80px] top-[60px]">
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(prev => !prev)}
        clearCount={counterpartiesStore.activeFilterCount}
        onClear={counterpartiesStore.resetFilters}
      >
        <FilterSection title="Параметры">
          <div className="space-y-2.5">
            <SelectCounterParties
              value={filters.selectedCounterparties}
              onChange={(values) => setFilters(prev => ({ ...prev, selectedCounterparties: values }))}
              dropdownClassName="w-56"
            />
            <MultiSelectStatiya
              value={filters.selectedChartOfAccounts}
              onChange={(values) => setFilters(prev => ({ ...prev, selectedChartOfAccounts: values }))}
              placeholder="Выберите статьи учета"
              dropdownClassName="w-64"
            />
            <MultiSelectZdelka
              value={filters.deals}
              onChange={(values) => setFilters(prev => ({ ...prev, deals: values }))}
              dropdownClassName="w-64"
            />
            <SelectLegelEntitties
              value={filters.selectedLegalEntities}
              onChange={(values) => setFilters(prev => ({ ...prev, selectedLegalEntities: values }))}
              placeholder="Выберите юрлицо"
              multi={true}
            />
          </div>
        </FilterSection>

        <FilterSection title="Период аналитики">
          <NewDateRangeComponent
            value={filters.dateRange}
            onChange={(range) => {
              const startDate = range?.start ? formatDate(new Date(range.start)) : ''
              const endDate = range?.end ? formatDate(new Date(range.end)) : ''
              setFilters(prev => ({
                ...prev,
                dateRange: range,
                operationDateStart: startDate,
                operationDateEnd: endDate,
              }))
            }}
          />
        </FilterSection>

        <FilterSection title="Дебиторка">
          <div className="space-y-2.5 flex flex-col items-start">
            {[{ label: 'Денежная', value: 'Cash' }, { label: 'Неденежная', value: 'NonCash' }, { label: 'Без дебиторки', value: 'WithoutCash' }].map(item => (
              <OperationCheckbox
                key={`deb-${item.value}`}
                checked={filters.debitPaymentTypes?.includes(item.value)}
                onChange={() => {
                  setFilters(prev => ({
                    ...prev,
                    debitPaymentTypes: prev.debitPaymentTypes?.includes(item.value)
                      ? prev.debitPaymentTypes?.filter(v => v !== item.value)
                      : [...prev.debitPaymentTypes, item.value]
                  }))
                }}
                label={item.label}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Кредиторка">
          <div className="space-y-2.5 flex flex-col items-start">
            {[{ label: 'Денежная', value: 'Cash' }, { label: 'Неденежная', value: 'NonCash' }, { label: 'Без кредиторки', value: 'WithoutCash' }].map(item => (
              <OperationCheckbox
                key={`kred-${item.value}`}
                checked={filters.creditPaymentTypes?.includes(item.value)}
                onChange={() => {
                  setFilters(prev => ({
                    ...prev,
                    creditPaymentTypes: prev.creditPaymentTypes?.includes(item.value)
                      ? prev.creditPaymentTypes?.filter(v => v !== item.value)
                      : [...prev.creditPaymentTypes, item.value]
                  }))
                }}
                label={item.label}
              />
            ))}
          </div>
        </FilterSection>

      </FilterSidebar>
      {isFetching && !isLoadingCounterparties && <ScreenLoader className={'left-[250px]'} />}

      <div ref={contentRef} className={`p-4 pb-40 w-full h-dvh overflow-y-auto flex-1 bg-white `}>
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
                {/* new filter */}
                <div style={{ width: '250px' }}>
                  <Select
                    instanceId="counterparties-calculation-method"
                    options={calculationOptions}
                    value={calculationOptions.find(opt => opt.value === filters.calculationMethod) || null}
                    onChange={(selected) => setFilters(prev => ({
                      ...prev,
                      calculationMethod: selected ? (prev.calculationMethod === selected.value ? "" : selected.value) : ""
                    }))}
                    placeholder="Выбирать"
                    isSearchable={false}
                    isClearable={true}
                  />
                </div>
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
                </div>
                <div className={styles.searchContainer}>
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={
                      viewMode === 'list'
                        ? "Поиск контрагентов"
                        : viewMode === 'nested'
                          ? "Поиск по группам"
                          : "Поиск групп"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div ref={tableWrapperRef} className="flex-1 w-full overflow-auto relative px-3">
          <table className="w-full relative text-xs text-left">
            <thead className="sticky top-0 bg-neutral-100/95 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 text-neutral-500 font-medium">
              <tr>
                <th className="p-2 border-b border-neutral-200 w-10">
                  <OperationCheckbox checked={allSelected()} onChange={toggleSelectAll} />
                </th>
                <th className="p-2 border-b border-neutral-200 whitespace-nowrap">
                  <button className="flex items-center hover:text-neutral-700">
                    {viewMode === 'nested' ? 'Группа контрагентов' : 'Контрагент'}
                    <ChevronDown className='size-4' />
                  </button>
                </th>
                {/* <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Тип</th> */}
                {viewMode !== 'nested' && (
                  <th className="p-3 border-b border-neutral-200 whitespace-nowrap">Группа</th>
                )}
                {filters.calculationMethod !== 'Cashflow' && (
                  <th className="p-3 border-b border-neutral-200 whitespace-nowrap">ИНН</th>
                )}
                <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Операций</th>
                <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Дебиторка, {GlobalCurrency.name}</th>
                <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Кредиторка, {GlobalCurrency.name}</th>
                {filters.calculationMethod === 'Cashflow' ? (
                  <>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Поступления, {GlobalCurrency.name}</th>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Выплаты, {GlobalCurrency.name}</th>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Разница, {GlobalCurrency.name}</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Доходы, {GlobalCurrency.name}</th>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Расходы, {GlobalCurrency.name}</th>
                    <th className="p-2 border-b border-neutral-200 whitespace-nowrap">Прибыль, {GlobalCurrency.name}</th>
                  </>
                )}
                <th className="p-2 border-b border-neutral-200 w-2"></th>
              </tr>
            </thead>
            <tbody>
              {isLoadingCounterparties && page === 1 ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">

                    </div>
                  </td>
                </tr>
              ) : (viewMode === 'groups' ? counterpartiesGroups : viewMode === 'nested' ? groupedCounterparties : flatCounterparties).length === 0 && !isLoadingCounterparties ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-neutral-500">

                    </td>
                  </tr>
                ) : (
                    (viewMode === 'groups' ? counterpartiesGroups : viewMode === 'nested' ? groupedCounterparties : flatCounterparties).map((item, itemIndex) => {
                    if (item.isGroup) {
                      const isExpanded = expandedGroups.has(item.guid)
                      const styleDifference = item.difference > 0 ? 'text-emerald-500 font-medium' : item.difference < 0 ? 'text-red-500 font-medium' : 'text-neutral-900 font-medium'
                      const styleProfit = item.profit > 0 ? 'text-emerald-500 font-medium' : item.profit < 0 ? 'text-red-500 font-medium' : 'text-neutral-900 font-medium'
                      return (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-neutral-50 border-b border-neutral-100 group cursor-pointer bg-white" onClick={() => toggleGroup(item.guid)}>
                            <td className="p-2" onClick={(e) => e.stopPropagation()}>
                              <OperationCheckbox checked={isRowSelected(item.id)} onChange={(e) => toggleRowSelection(item.id)} />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2 font-medium">
                                <button className="text-neutral-400 hover:text-neutral-600 outline-none flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleGroup(item.guid) }}>
                                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                                </button>
                                <span className="text-slate-900">{item.nazvanie} ({item.items?.length || 0})</span>
                              </div>
                            </td>
                            {/* <td className="p-2 text-neutral-900 font-medium">{item.rawData?.type_name || item.rawData?.tip_kontragenta || 'Смешанный'}</td> */}
                            {filters.calculationMethod !== 'Cashflow' && (
                              <td className="p-2 text-neutral-500">–</td>
                            )}
                            <td className="p-2 text-neutral-900 font-medium">{item.operationsCount > 0 ? item.operationsCount.toLocaleString('ru-RU') : '0'}</td>
                            <td className="p-2 text-neutral-900 font-medium">{item.debitorka > 0 ? item.debitorka.toLocaleString('ru-RU') : '0'}</td>
                            <td className="p-2 text-neutral-900 font-medium">{item.kreditorka > 0 ? item.kreditorka.toLocaleString('ru-RU') : '0'}</td>
                            <td className="p-2 text-neutral-900 font-medium">{filters.calculationMethod === 'Cashflow' ? (item?.income > 0 ? item?.income.toLocaleString('ru-RU') : '0') : (item?.income?.toLocaleString('ru-RU') || '0')}</td>
                            <td className="p-2 text-neutral-900 font-medium">{filters.calculationMethod === 'Cashflow' ? (item.expenses > 0 ? item.expenses.toLocaleString('ru-RU') : '0') : (item?.expenses?.toLocaleString('ru-RU') || '0')}</td>
                            <td className={cn("p-2", filters.calculationMethod === 'Cashflow' ? styleDifference : styleProfit)}>
                              {filters.calculationMethod === 'Cashflow'
                                ? (item.difference === 0 ? '0' : item.difference.toLocaleString('ru-RU'))
                                : (item.profit === 0 ? '0' : item.profit.toLocaleString('ru-RU'))}
                            </td>
                            <td className="p-2" onClick={(e) => e.stopPropagation()}>
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
                          {isExpanded && item.items?.length === 0 && (
                            <tr className="bg-neutral-50/50">
                              <td colSpan={15} className="p-4 text-center text-neutral-400 text-xs text-medium">Нет контрагентов</td>
                            </tr>
                          )}
                          {isExpanded && item.items?.map((counterparty, childIndex) => {
                            const styleDifference = counterparty.difference > 0 ? 'text-emerald-500' : counterparty.difference < 0 ? 'text-red-500' : 'text-neutral-500'
                            const styleProfit = counterparty.profit > 0 ? 'text-emerald-500' : counterparty.profit < 0 ? 'text-red-500' : 'text-neutral-500'
                            return (
                              <tr
                                key={counterparty.id}
                                className={cn(
                                  "hover:bg-neutral-50 border-b border-neutral-100 group cursor-pointer bg-white",
                                  isRowSelected(counterparty.id) && "bg-blue-50/50"
                                )}
                                onClick={() => router.push(`/pages/directories/counterparties/${counterparty.guid}`)}
                              >
                                <td className="p-2 pl-8" onClick={(e) => e.stopPropagation()}>
                                  <OperationCheckbox checked={isRowSelected(counterparty.id)} onChange={(e) => toggleRowSelection(counterparty.id)} />
                                </td>
                                <td className="p-2 text-neutral-600">
                                  <div className="flex flex-col">
                                    <span className="text-slate-900 font-medium">{counterparty.nazvanie}</span>
                                    {counterparty.komentariy && <span className="text-neutral-400 text-xs mt-0.5">{counterparty.komentariy}</span>}
                                  </div>
                                </td>
                                {/* <td className="p-2 text-neutral-500">{counterparty.rawData?.type_name || counterparty.rawData?.tip_kontragenta || '–'}</td> */}
                                {filters.calculationMethod !== 'Cashflow' && (
                                  <td className="p-2 text-neutral-500">{counterparty.inn || '–'}</td>
                                )}
                                <td className="p-2 text-neutral-500">0</td>
                                <td className="p-2 text-neutral-500">{counterparty.debitorka > 0 ? counterparty.debitorka.toLocaleString('ru-RU') : '0'}</td>
                                <td className="p-2 text-neutral-500">{counterparty.kreditorka > 0 ? counterparty.kreditorka.toLocaleString('ru-RU') : '0'}</td>
                                <td className="p-2 text-neutral-500">{counterparty.income > 0 ? counterparty.income.toLocaleString('ru-RU') : '0'}</td>
                                <td className="p-2 text-neutral-500">{counterparty.expenses > 0 ? counterparty.expenses.toLocaleString('ru-RU') : '0'}</td>
                                <td className={cn("p-2", filters.calculationMethod === 'Cashflow' ? styleDifference : styleProfit)}>
                                  {filters.calculationMethod === 'Cashflow'
                                    ? (counterparty.difference === 0 ? '0' : counterparty.difference.toLocaleString('ru-RU'))
                                    : (counterparty.profit === 0 ? '0' : counterparty.profit.toLocaleString('ru-RU'))}
                                </td>
                                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                  <CounterpartyMenu
                                    counterparty={counterparty}
                                    onEdit={(cp) => setEditingCounterparty(cp)}
                                    onDelete={(cp) => setDeletingCounterparty(cp)}
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </React.Fragment>
                      )
                    } else {
                      const styleDifference = item.difference > 0 ? 'text-emerald-500' : item.difference < 0 ? 'text-red-500' : 'text-neutral-500'
                      const styleProfit = item.profit > 0 ? 'text-emerald-500' : item.profit < 0 ? 'text-red-500' : 'text-neutral-500'
                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            "hover:bg-neutral-50 border-b border-neutral-100 group cursor-pointer bg-white",
                            isRowSelected(item.id) && "bg-blue-50/50"
                          )}
                          onClick={() => router.push(`/pages/directories/counterparties/${item.guid}`)}
                        >
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <OperationCheckbox checked={isRowSelected(item.id)} onChange={(e) => toggleRowSelection(item.id)} />
                          </td>
                          <td className="p-2">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-medium">{item.nazvanie}</span>
                              {item.komentariy && <span className="text-neutral-400 text-xs mt-0.5">{item.komentariy}</span>}
                            </div>
                          </td>
                          {/* <td className="p-2 text-neutral-500">{item.rawData?.type_name || item.rawData?.tip_kontragenta || 'Плательщик'}</td> */}
                          <td className="p-2 text-neutral-500">{item.gruppa || '–'}</td>
                          {filters.calculationMethod !== 'Cashflow' && (
                            <td className="p-2 text-neutral-500">{item.inn || '–'}</td>
                          )}
                          <td className="p-2 text-neutral-500">0</td>
                          <td className="p-2 text-neutral-500">{item.debitorka > 0 ? item.debitorka.toLocaleString('ru-RU') : '0'}</td>
                          <td className="p-2 text-neutral-500">{item.kreditorka > 0 ? item.kreditorka.toLocaleString('ru-RU') : '0'}</td>
                          <td className="p-2 text-neutral-500">{item.income > 0 ? item.income.toLocaleString('ru-RU') : '0'}</td>
                          <td className="p-2 text-neutral-500">{item.expenses > 0 ? item.expenses.toLocaleString('ru-RU') : '0'}</td>
                          <td className={cn("p-2", filters.calculationMethod === 'Cashflow' ? styleDifference : styleProfit)}>
                            {filters.calculationMethod === 'Cashflow'
                              ? (item.difference === 0 ? '0' : item.difference.toLocaleString('ru-RU'))
                              : (item.profit === 0 ? '0' : item.profit.toLocaleString('ru-RU'))}
                          </td>
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
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




        {/* Footer */}
        <div className={cn(
          'fixed bottom-0 right-0 bg-neutral-100 p-2 border-t border-neutral-200   flex items-center gap-8 shrink-0 z-10  transition-[left] duration-300',
          isFilterOpen ? 'left-[320px]' : 'left-[110px]'
        )}>
          <div className="text-sm text-slate-900">
            <span className="font-semibold text-slate-900 whitespace-nowrap">
              {totalFromAPI} {totalFromAPI === 1 ? 'контрагент' : totalFromAPI < 5 ? 'контрагента' : 'контрагентов'}
            </span>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Дебиторка</span>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-semibold text-slate-900">{formatAmount(SummaryTotal?.receivables)}</span>
              <span className="text-xs text-gray-400">{GlobalCurrency.name}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Кредиторка</span>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-semibold text-slate-900">{formatAmount(SummaryTotal?.payables)}</span>
              <span className="text-xs text-gray-400">{GlobalCurrency.name}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Поступления</span>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-semibold text-slate-900">{formatAmount(SummaryTotal?.income)}</span>
              <span className="text-xs text-gray-400">{GlobalCurrency.name}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Выплаты</span>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-semibold text-slate-900">{formatAmount(SummaryTotal?.expense)}</span>
              <span className="text-xs text-gray-400">{GlobalCurrency.name}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Разница</span>
            <div className="flex items-center gap-0.5">
              <span className={cn(
                'text-xs font-semibold',
                SummaryTotal?.difference > 0 ? 'text-emerald-500' : SummaryTotal?.difference < 0 ? 'text-red-500' : 'text-slate-900'
              )}>
                {SummaryTotal?.difference === 0 ? '0' : `${SummaryTotal?.difference > 0 ? '+' : ''}${formatAmount(SummaryTotal?.difference)}`}
              </span>
              <span className={cn(
                'text-xs',
                SummaryTotal?.difference > 0 ? 'text-emerald-500' : SummaryTotal?.difference < 0 ? 'text-red-500' : 'text-gray-400'
              )}>{GlobalCurrency.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Create/Edit Modal */}
      <CreateCounterpartyModal
        isOpen={isCreateModalOpen || !!editingCounterparty}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingCounterparty(null)
          setPreselectedGroupId(null)
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
          queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
        }}
        preselectedGroupId={preselectedGroupId}
        counterpartyData={editingCounterparty}
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
              // Reset search to show all groups after deletion
              setSearchQuery('')
              setDebouncedSearchQuery('')
              // Reset local state
              setPage(1)
              setAllCounterparties([])
              setHasMore(true)
              setTotalFromAPI(0)
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesPlanFact'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsPlanFact'] })
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
              // Reset search to show all counterparties after deletion
              setSearchQuery('')
              setDebouncedSearchQuery('')
              // Reset local state
              setPage(1)
              setAllCounterparties([])
              setHasMore(true)
              setTotalFromAPI(0)
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesPlanFact'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsPlanFact'] })
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
})

export default CounterpartiesPage
